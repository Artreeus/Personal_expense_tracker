'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineLoader, ButtonLoader } from '@/components/ui/loader';
import { Sparkles, Calendar, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIReport {
  id: string;
  month: string;
  report_content: string;
  financial_data: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  generated_at: string;
  created_at: string;
}

export default function AIReportsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Previous month
    return date.toISOString().slice(0, 7);
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/signin');
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchReports();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ai-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch AI reports',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedMonth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a month',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai-reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to generate report');
      }

      const data = await res.json();
      toast({
        title: 'Success',
        description: data.message || 'AI report generated successfully',
      });

      // Refresh reports list
      fetchReports();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate AI report',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReport = reports.find((r) => r.month === selectedMonth);

  if (!isLoaded || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-500" />
              AI Financial Analysis
            </h1>
            <p className="text-muted-foreground">
              Get AI-powered insights and recommendations for your finances
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Generate Monthly Report</CardTitle>
                <CardDescription>
                  Select a month to generate an AI-powered financial analysis
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="report-month" className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Month:
                </Label>
                <Input
                  id="report-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
                <Button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <ButtonLoader className="h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {selectedReport ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Analysis for {new Date(selectedReport.month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </CardTitle>
                  <CardDescription>
                    Generated on {new Date(selectedReport.generated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([selectedReport.report_content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `financial-report-${selectedReport.month}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${selectedReport.financial_data.totalIncome.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${selectedReport.financial_data.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${
                  selectedReport.financial_data.netBalance >= 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className={`text-2xl font-bold ${
                    selectedReport.financial_data.netBalance >= 0
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    ${selectedReport.financial_data.netBalance.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedReport.financial_data.transactionCount}
                  </p>
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedReport.report_content}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate an AI-powered financial analysis for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <Button onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <ButtonLoader className="mr-2 h-4 w-4" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Reports</CardTitle>
              <CardDescription>View your previously generated AI reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => setSelectedMonth(report.month)}
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(report.month + '-01').toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Generated on {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMonth(report.month);
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

