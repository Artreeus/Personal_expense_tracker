import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import AIReport from '@/lib/models/AIReport';
import Transaction from '@/lib/models/Transaction';
import { generateMonthlyAnalysis, MonthlyFinancialData } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

/**
 * This endpoint can be called by a cron job or scheduled task
 * to automatically generate AI reports for all users at month end.
 * 
 * To set up automatic generation:
 * 1. Use a service like Vercel Cron, GitHub Actions, or a cron job
 * 2. Call this endpoint on the 1st of each month
 * 3. Example cron: 0 0 1 * * (runs at midnight on the 1st of every month)
 * 
 * For Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/ai-reports/auto-generate",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Add authentication/authorization for cron jobs
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.toISOString().slice(0, 7);

    // Get all users
    const users = await User.find({}).lean();
    const results = {
      processed: 0,
      generated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const user of users) {
      try {
        results.processed++;

        // Check if report already exists
        const existingReport = await AIReport.findOne({
          user_id: user._id.toString(),
          month,
        });

        if (existingReport) {
          results.skipped++;
          continue;
        }

        // Get month start and end dates
        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

        // Fetch transactions for the month
        const transactions = await Transaction.find({
          user_id: user._id.toString(),
          transaction_date: {
            $gte: startDate,
            $lte: endDate,
          },
        })
          .populate('category_id', 'name type')
          .lean();

        // Skip if no transactions
        if (transactions.length === 0) {
          results.skipped++;
          continue;
        }

        // Calculate financial data
        const totalIncome = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

        const totalExpenses = transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

        const netBalance = totalIncome - totalExpenses;

        // Category breakdown
        const categoryMap = new Map<string, { amount: number; count: number }>();
        
        transactions.forEach((t: any) => {
          const categoryName = t.category_id?.name || 'Uncategorized';
          const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
          categoryMap.set(categoryName, {
            amount: existing.amount + Number(t.amount),
            count: existing.count + 1,
          });
        });

        const categoryBreakdown = Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            amount: data.amount,
            percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
            count: data.count,
          }))
          .sort((a, b) => b.amount - a.amount);

        // Top expenses and income
        const expenseCategories = Array.from(categoryMap.entries())
          .filter(([_, data]) => {
            const trans = transactions.find((t: any) => 
              (t.category_id?.name || 'Uncategorized') === _[0] && t.type === 'expense'
            );
            return trans;
          })
          .map(([category, data]) => ({ category, amount: data.amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        const incomeCategories = Array.from(categoryMap.entries())
          .filter(([_, data]) => {
            const trans = transactions.find((t: any) => 
              (t.category_id?.name || 'Uncategorized') === _[0] && t.type === 'income'
            );
            return trans;
          })
          .map(([category, data]) => ({ category, amount: data.amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        // Prepare data for AI
        const financialData: MonthlyFinancialData = {
          month: new Date(year, monthNum - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          totalIncome,
          totalExpenses,
          netBalance,
          categoryBreakdown,
          transactionCount: transactions.length,
          topExpenses: expenseCategories,
          topIncome: incomeCategories,
        };

        // Generate AI analysis
        const reportContent = await generateMonthlyAnalysis(financialData);

        // Save report to database
        await AIReport.create({
          user_id: user._id.toString(),
          month,
          report_content: reportContent,
          financial_data: {
            totalIncome,
            totalExpenses,
            netBalance,
            transactionCount: transactions.length,
          },
          generated_at: new Date(),
        });

        results.generated++;
      } catch (error: any) {
        results.errors.push(`User ${user._id}: ${error.message}`);
        console.error(`Error generating report for user ${user._id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Auto-generation completed',
      month,
      results,
    });
  } catch (error: any) {
    console.error('Error in auto-generate:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-generate reports' },
      { status: 500 }
    );
  }
}

