'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineLoader } from '@/components/ui/loader';
import { Target, Plus, TrendingDown, AlertTriangle, CheckCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/lib/types';
import { ButtonLoader } from '@/components/ui/loader';

export default function BudgetsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/signin');
    }
    if (isLoaded && isSignedIn) {
      fetchCategories();
      fetchBudgets();
    }
  }, [isLoaded, isSignedIn, router, selectedMonth]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?type=expense');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/budgets?month=${selectedMonth}`);
      
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets || []);

        // Calculate stats
        const totalBudget = data.budgets.reduce((sum: number, b: any) => sum + b.amount, 0);
        const totalSpent = data.budgets.reduce((sum: number, b: any) => sum + b.spent, 0);
        const onTrack = data.budgets.filter((b: any) => b.percentage < 80).length;
        const warning = data.budgets.filter((b: any) => b.percentage >= 80 && b.percentage < 100).length;
        const overBudget = data.budgets.filter((b: any) => b.percentage >= 100).length;

        setStats({
          onTrack,
          warning,
          overBudget,
          totalBudget,
          totalSpent,
        });
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch budgets',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingBudget 
        ? `/api/budgets/${editingBudget.id}`
        : '/api/budgets';
      
      const method = editingBudget ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: formData.category_id,
          amount: parseFloat(formData.amount),
          month: formData.month,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save budget');
      }

      toast({
        title: 'Success',
        description: editingBudget ? 'Budget updated successfully' : 'Budget created successfully',
      });

      setIsDialogOpen(false);
      setEditingBudget(null);
      setFormData({
        category_id: '',
        amount: '',
        month: new Date().toISOString().slice(0, 7),
      });
      fetchBudgets();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save budget',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      month: budget.month,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Budget deleted successfully',
        });
        fetchBudgets();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete budget',
      });
    }
  };

  const handleNewBudget = () => {
    setEditingBudget(null);
    setFormData({
      category_id: '',
      amount: '',
      month: selectedMonth,
    });
    setIsDialogOpen(true);
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { label: 'Over Budget', color: 'text-red-500', icon: AlertTriangle };
    if (percentage >= 80) return { label: 'Warning', color: 'text-orange-500', icon: TrendingDown };
    return { label: 'On Track', color: 'text-green-500', icon: CheckCircle };
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#ef4444': 'from-red-500 to-orange-500',
      '#f59e0b': 'from-orange-500 to-yellow-500',
      '#3b82f6': 'from-blue-500 to-cyan-500',
      '#ec4899': 'from-purple-500 to-pink-500',
      '#10b981': 'from-green-500 to-emerald-500',
    };
    return colorMap[color] || 'from-blue-500 to-cyan-500';
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  if (!isLoaded || isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Budget Planning</h1>
            <p className="text-muted-foreground">Track and manage your monthly budgets</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewBudget} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => setFormData({ ...formData, month: value })}
                    disabled={!!editingBudget}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    disabled={!!editingBudget}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <ButtonLoader className="mr-2" />
                      {editingBudget ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingBudget ? 'Update Budget' : 'Create Budget'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Select Month</CardTitle>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                  On Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.onTrack}</div>
                <p className="text-xs text-green-600 dark:text-green-500">budgets</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.warning}</div>
                <p className="text-xs text-orange-600 dark:text-orange-500">budgets</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
                  Over Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overBudget}</div>
                <p className="text-xs text-red-600 dark:text-red-500">budgets</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${stats.totalSpent?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500">this month</p>
              </CardContent>
            </Card>
          </div>
        )}

        {budgets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Budgets Yet</CardTitle>
              <CardDescription>
                Create a budget to start tracking your spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  No budgets found for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
                </p>
                <Button onClick={handleNewBudget} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {budgets.map((budget) => {
              const status = getBudgetStatus(budget.percentage);
              const StatusIcon = status.icon;

              return (
                <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: budget.color + '20' }}
                        >
                          <Target className="h-6 w-6" style={{ color: budget.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">{budget.category}</CardTitle>
                          <CardDescription>Monthly Budget</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 ${status.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="font-medium">{status.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent: ${budget.spent.toFixed(2)}</span>
                        <span className="font-semibold">Budget: ${budget.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${getColorClass(budget.color)} h-3 rounded-full transition-all`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={status.color}>{budget.percentage.toFixed(1)}% used</span>
                        <span className="text-muted-foreground">
                          ${(budget.amount - budget.spent).toFixed(2)} remaining
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
