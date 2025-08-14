// app/guide/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { SuperAdminGuide } from '@/components/guides/super-admin-guide';
import { CompanyAdminGuide } from '@/components/guides/company-admin-guide';
import { EmployeeGuide } from '@/components/guides/employee-guide';

export default function GuidePage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Loading...</div>;
  }

  const role = session.user.role;

  return (
    <div className="container mx-auto py-8">
      {role === 'super_admin' && <SuperAdminGuide />}
      {role === 'company_admin' && <CompanyAdminGuide />}
      {role === 'employee' && <EmployeeGuide />}
    </div>
  );
}
