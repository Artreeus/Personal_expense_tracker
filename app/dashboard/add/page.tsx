'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/lib/types';
import { ArrowUpCircle, ArrowDownCircle, Repeat, Clock } from 'lucide-react';
import { ButtonLoader, InlineLoader } from '@/components/ui/loader';

export default function AddTransactionPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category_id: '',
    note: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/signin');
    }

    if (isLoaded && isSignedIn) {
      fetchCategories();
      fetchRecentTransactions();
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Auto-focus amount input when page loads
    if (amountInputRef.current && isLoaded && isSignedIn) {
      setTimeout(() => amountInputRef.current?.focus(), 100);
    }

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }
      // Escape to go back
      if (e.key === 'Escape') {
        router.back();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLoaded, isSignedIn, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        const allCategories = data.categories || [];
        setCategories(allCategories);
        
        // Get recent categories
        const recent = localStorage.getItem('recentCategories');
        if (recent) {
          const recentIds = JSON.parse(recent);
          const recentCats = allCategories.filter((cat: Category) => 
            recentIds.includes(cat.id) && cat.type === formData.type
          );
          setRecentCategories(recentCats);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await fetch('/api/transactions?limit=5');
      if (res.ok) {
        const data = await res.json();
        setRecentTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid amount',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create transaction');
      }

      // Save to recent categories
      if (formData.category_id) {
        const recent = JSON.parse(localStorage.getItem('recentCategories') || '[]');
        if (!recent.includes(formData.category_id)) {
          recent.unshift(formData.category_id);
          localStorage.setItem('recentCategories', JSON.stringify(recent.slice(0, 5)));
        }
      }

      // Save last transaction
      localStorage.setItem('lastTransaction', JSON.stringify(formData));

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });

      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
        note: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });

      // Auto-focus amount for next entry
      setTimeout(() => {
        amountInputRef.current?.focus();
        fetchRecentTransactions();
      }, 100);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add transaction',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const repeatTransaction = (transaction: any) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category_id: transaction.category_id || '',
      note: transaction.note || '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
    amountInputRef.current?.focus();
  };

  const quickAmounts = [10, 20, 50, 100, 200, 500, 1000];

  const filteredCategories = categories.filter((cat) => cat.type === formData.type);
  const displayCategories = recentCategories.length > 0 && formData.category_id === '' 
    ? [...recentCategories, ...filteredCategories.filter(c => !recentCategories.find(rc => rc.id === c.id))]
    : filteredCategories;

  if (!isLoaded) {
    return (
      <DashboardLayout>
        <InlineLoader text="Loading transaction form..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Transaction</h1>
          <p className="text-muted-foreground">Quickly record your income or expense</p>
        </div>

        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Tap to repeat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map((transaction) => (
                  <Button
                    key={transaction.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => repeatTransaction(transaction)}
                  >
                    <div className="flex items-center gap-2">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {transaction.category?.name || 'Uncategorized'} - ${Number(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                    <Repeat className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Fill in the information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => {
                      setFormData({ ...formData, type: 'income', category_id: '' });
                      fetchCategories();
                    }}
                    className="w-full h-12 text-base"
                  >
                    <ArrowUpCircle className="mr-2 h-5 w-5" />
                    Income
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => {
                      setFormData({ ...formData, type: 'expense', category_id: '' });
                      fetchCategories();
                    }}
                    className="w-full h-12 text-base"
                  >
                    <ArrowDownCircle className="mr-2 h-5 w-5" />
                    Expense
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  ref={amountInputRef}
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={isLoading}
                  className="text-2xl h-14"
                />
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, amount: amount.toString() });
                        amountInputRef.current?.focus();
                      }}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category" className="h-12">
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayCategories.length > 0 ? (
                    displayCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color || '#3b82f6' }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No categories available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="Add a note..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  disabled={isLoading}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 h-12 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <ButtonLoader className="mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Transaction'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
