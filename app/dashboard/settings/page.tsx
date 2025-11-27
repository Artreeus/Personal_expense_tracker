'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isLoaded) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.imageUrl || ''} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{user?.fullName || user?.firstName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Framework</span>
              <span className="text-sm font-medium">Next.js 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Database</span>
              <span className="text-sm font-medium">MongoDB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
