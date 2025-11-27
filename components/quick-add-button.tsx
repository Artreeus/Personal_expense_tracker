'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/lib/types';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function QuickAddButton() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category_id: '',
    note: '',
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        const allCategories = data.categories || [];
        setCategories(allCategories);
        
        // Get recent categories from localStorage
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

  const handleOpen = () => {
    if (!session) return;
    setIsOpen(true);
    fetchCategories();
    // Auto-focus amount input after dialog opens
    setTimeout(() => {
      const amountInput = document.getElementById('quick-amount');
      if (amountInput) amountInput.focus();
    }, 100);
  };

  useEffect(() => {
    if (!session) return;
    
    // Keyboard shortcut: 'q' to open quick add
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey && !isOpen) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
          handleOpen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [session, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      type: 'expense',
      amount: '',
      category_id: '',
      note: '',
    });
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

      // Save to recent categories
      if (formData.category_id) {
        const recent = JSON.parse(localStorage.getItem('recentCategories') || '[]');
        if (!recent.includes(formData.category_id)) {
          recent.unshift(formData.category_id);
          localStorage.setItem('recentCategories', JSON.stringify(recent.slice(0, 5)));
        }
      }

      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });

      handleClose();
      
      // Refresh the page to update stats
      window.location.reload();
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
  const displayCategories = recentCategories.length > 0 && formData.category_id === '' 
    ? [...recentCategories, ...filteredCategories.filter(c => !recentCategories.find(rc => rc.id === c.id))]
    : filteredCategories;

  if (!session) return null;

  return (
    <>
      <Button
        onClick={handleOpen}
        size="lg"
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 h-14 w-14 rounded-full shadow-lg z-40 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData({ ...formData, type: 'income', category_id: '' });
                    fetchCategories();
                  }}
                  className="w-full"
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Income
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'default' : 'outline'}
                  onClick={() => {
                    setFormData({ ...formData, type: 'expense', category_id: '' });
                    fetchCategories();
                  }}
                  className="w-full"
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Expense
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-amount">Amount</Label>
              <Input
                id="quick-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus
                className="text-lg"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger id="quick-category">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.length > 0 ? (
                    displayCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No categories available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-note">Note (Optional)</Label>
              <Input
                id="quick-note"
                placeholder="Quick note..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

