'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-6xl font-bold mb-2">404</CardTitle>
              <CardDescription className="text-lg">
                Page Not Found
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This dashboard page doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

