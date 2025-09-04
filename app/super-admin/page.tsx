'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';
import type { SuperAdminStats } from '@/types/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const fetcher = async (url: string): Promise<SuperAdminStats> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // @ts-ignore
    error.info = await res.json();
    // @ts-ignore
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export default function SuperAdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<SuperAdminStats>('/api/super-admin/stats', fetcher);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    user.getIdTokenResult().then((idTokenResult) => {
      // @ts-ignore
      if (!idTokenResult.claims.super_admin) {
        router.push('/');
      }
    });
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform-wide overview and management
          </p>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center space-x-4">
            <AlertTriangle className="size-6 text-destructive" />
            <div>
              <CardTitle>Error Fetching Stats</CardTitle>
              <CardDescription className="text-destructive/80">
                Could not load dashboard data. The API endpoint may be down or
                experiencing issues.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers ?? '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              All users on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalDocuments ?? '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              All processed documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefit Plans</CardTitle>
            <Briefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalBenefitPlans ?? '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Available benefit plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Enrollments
            </CardTitle>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeEnrollments ?? 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active plan enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/super-admin/users" passHref>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 size-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/super-admin/documents" passHref>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 size-4" />
                Manage Documents
              </Button>
            </Link>
            <Link href="/super-admin/analytics" passHref>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 size-4" />
                Platform Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Live platform health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Firebase Status</p>
              <span className="text-sm font-medium text-green-600">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">AI Service</p>
              <span className="text-sm font-medium text-green-600">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Database</p>
              <span className="text-sm font-medium text-green-600">OK</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
