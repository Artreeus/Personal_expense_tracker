'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/lib/types';
import { ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react';

export default function QuickAddPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category_id: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
    if (status === 'authenticated') {
      fetchCategories();
      setTimeout(() => amountInputRef.current?.focus(), 100);
    }
  }, [status, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
          transaction_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create transaction');
      }

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });

      // Reset form
      setFormData({
        type: 'expense',
        amount: '',
        category_id: '',
      });

      // Auto-focus for next entry
      setTimeout(() => {
        amountInputRef.current?.focus();
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

  const quickAmounts = [10, 20, 50, 100, 200, 500];
  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Quick Add</h1>
          <p className="text-muted-foreground">Add transaction in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg shadow-lg border">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={formData.type === 'income' ? 'default' : 'outline'}
              onClick={() => {
                setFormData({ ...formData, type: 'income', category_id: '' });
                fetchCategories();
              }}
              className="h-14 text-base"
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
              className="h-14 text-base"
            >
              <ArrowDownCircle className="mr-2 h-5 w-5" />
              Expense
            </Button>
          </div>

          <div className="space-y-3">
            <Input
              ref={amountInputRef}
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              className="text-3xl h-16 text-center font-bold"
            />
            <div className="flex flex-wrap gap-2 justify-center">
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

          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 h-12 text-base" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="h-12"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <Button variant="link" onClick={() => router.push('/dashboard/add')}>
            Full form →
          </Button>
        </div>
      </div>
    </div>
  );
}

