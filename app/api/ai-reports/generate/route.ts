import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import AIReport from '@/lib/models/AIReport';
import { generateMonthlyAnalysis, MonthlyFinancialData } from '@/lib/ai-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoUserId = await getMongoUserIdFromClerk();
    if (!mongoUserId) {
      return NextResponse.json({ 
        error: 'User not found. Please try refreshing the page or contact support if the issue persists.' 
      }, { status: 404 });
    }

    await connectDB();

    const body = await req.json();
    const month = body.month || new Date().toISOString().slice(0, 7);

    // Check if report already exists
    const existingReport = await AIReport.findOne({
      user_id: mongoUserId,
      month,
    });

    if (existingReport) {
      return NextResponse.json({
        report: {
          id: existingReport._id.toString(),
          month: existingReport.month,
          report_content: existingReport.report_content,
          financial_data: existingReport.financial_data,
          generated_at: existingReport.generated_at,
          created_at: existingReport.createdAt,
        },
        message: 'Report already exists for this month',
      });
    }

    // Get month start and end dates
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    // Fetch transactions for the month
    const transactions = await Transaction.find({
      user_id: mongoUserId,
      transaction_date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate('category_id', 'name type')
      .lean();

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
    const report = await AIReport.create({
      user_id: mongoUserId,
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

    return NextResponse.json({
      report: {
        id: report._id.toString(),
        month: report.month,
        report_content: report.report_content,
        financial_data: report.financial_data,
        generated_at: report.generated_at,
        created_at: report.createdAt,
      },
      message: 'AI report generated successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating AI report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI report. Please try again later.' },
      { status: 500 }
    );
  }
}

