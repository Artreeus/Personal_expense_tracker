import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMongoUserIdFromClerk } from '@/lib/clerk-helpers';
import connectDB from '@/lib/mongodb';
import AIReport from '@/lib/models/AIReport';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');

    let query: any = { user_id: mongoUserId };
    if (month) {
      query.month = month;
    }

    const reports = await AIReport.find(query)
      .sort({ month: -1 })
      .lean();

    const formattedReports = reports.map((report) => ({
      id: report._id.toString(),
      month: report.month,
      report_content: report.report_content,
      financial_data: report.financial_data,
      generated_at: report.generated_at,
      created_at: report.createdAt,
      updated_at: report.updatedAt,
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    console.error('Error fetching AI reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

