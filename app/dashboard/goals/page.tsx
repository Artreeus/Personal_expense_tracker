'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineLoader, ButtonLoader } from '@/components/ui/loader';
import { Target, Plus, TrendingUp, Sparkles, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GoalsPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    category: '',
    deadline: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/signin');
    }
    if (isLoaded && isSignedIn) {
      fetchGoals();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/goals');
      
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch goals',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.target_amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name and target amount are required',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingGoal 
        ? `/api/goals/${editingGoal.id}`
        : '/api/goals';
      
      const method = editingGoal ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          target_amount: parseFloat(formData.target_amount),
          current_amount: parseFloat(formData.current_amount || '0'),
          category: formData.category || undefined,
          deadline: formData.deadline || undefined,
          color: formData.color,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save goal');
      }

      toast({
        title: 'Success',
        description: editingGoal ? 'Goal updated successfully' : 'Goal created successfully',
      });

      setIsDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        category: '',
        deadline: '',
        color: '#3b82f6',
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save goal',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      category: goal.category || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      color: goal.color || '#3b82f6',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Goal deleted successfully',
        });
        fetchGoals();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete goal',
      });
    }
  };

  const handleNewGoal = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      category: '',
      deadline: '',
      color: '#3b82f6',
    });
    setIsDialogOpen(true);
  };

  const getDaysRemaining = (deadline: string | Date | undefined) => {
    if (!deadline) return null;
    const today = new Date();
    const target = new Date(deadline);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      '#3b82f6': 'from-blue-500 to-cyan-500',
      '#10b981': 'from-green-500 to-emerald-500',
      '#8b5cf6': 'from-purple-500 to-pink-500',
      '#f59e0b': 'from-orange-500 to-red-500',
      '#ef4444': 'from-red-500 to-orange-500',
    };
    return colorMap[color] || 'from-blue-500 to-cyan-500';
  };

  // Calculate stats
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const activeGoals = goals.filter((g) => g.percentage < 100).length;
  const completedGoals = goals.filter((g) => g.percentage >= 100).length;

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
            <h1 className="text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">Track your savings and investment goals</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewGoal} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_amount">Current Amount</Label>
                    <Input
                      id="current_amount"
                      type="number"
                      step="0.01"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline (Optional)</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeGoals}</div>
              <p className="text-xs text-blue-600 dark:text-blue-500">in progress</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Total Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${totalSaved.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-500">across all goals</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Target Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${totalTarget.toFixed(2)}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-500">total target</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {overallProgress.toFixed(1)}%
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500">overall progress</p>
            </CardContent>
          </Card>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Goals Yet</CardTitle>
              <CardDescription>
                Start by creating your first financial goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Create financial goals to track your savings progress.
                </p>
                <Button onClick={handleNewGoal} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {goals.map((goal) => {
              const daysRemaining = getDaysRemaining(goal.deadline);
              const monthlyRequired = daysRemaining && daysRemaining > 0
                ? (goal.target_amount - goal.current_amount) / (daysRemaining / 30)
                : 0;

              return (
                <Card key={goal.id} className="hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getColorClass(goal.color)} flex items-center justify-center flex-shrink-0`}
                        >
                          <Target className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl truncate">{goal.name}</CardTitle>
                          <CardDescription>{goal.category || 'General'}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(goal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {goal.percentage >= 100 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 text-xs font-medium">
                          <Sparkles className="h-3 w-3" />
                          Completed
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <div className="text-3xl font-bold">
                            ${goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            of ${goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} goal
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {goal.percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">complete</div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${getColorClass(goal.color)} h-3 rounded-full transition-all`}
                          style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Remaining</div>
                          <div className="text-lg font-semibold">
                            ${(goal.target_amount - goal.current_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        {daysRemaining !== null && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Days left</div>
                            <div className="text-lg font-semibold">
                              {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                            </div>
                          </div>
                        )}
                      </div>

                      {daysRemaining && daysRemaining > 0 && monthlyRequired > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Monthly saving needed</span>
                            <span className="font-semibold text-primary">
                              ${monthlyRequired.toFixed(2)}/mo
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const newAmount = prompt('Enter amount to add:', '0');
                          if (newAmount && !isNaN(parseFloat(newAmount))) {
                            handleEdit({
                              ...goal,
                              current_amount: goal.current_amount + parseFloat(newAmount),
                            });
                            // Update via API
                            fetch(`/api/goals/${goal.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                current_amount: goal.current_amount + parseFloat(newAmount),
                              }),
                            }).then(() => fetchGoals());
                          }
                        }}
                      >
                        Add Funds
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(goal)}
                      >
                        Edit
                      </Button>
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
