import { type NextRequest, NextResponse } from 'next/server';
import { requireCompanyAdmin } from '@/lib/auth/admin-middleware';
import {
  userService,
  type FirebaseUser,
} from '@/lib/firebase/services/user.service';
import { EmailService } from '@/lib/services/email.service.server';
import { z } from 'zod';

const emailService = new EmailService();

const bulkSchema = z.object({
  action: z.enum(['deactivate', 'send-email', 'export']),
  employeeIds: z.array(z.string()).min(1),
});

export const POST = requireCompanyAdmin(
  async (req: NextRequest, _context, user) => {
    try {
      const body = await req.json();
      const { action, employeeIds } = bulkSchema.parse(body);

      const employees = await Promise.all(
        employeeIds.map(async (id) => {
          const emp = await userService.getUserFromFirestore(id);
          return emp && emp.companyId === user.companyId ? emp : null;
        }),
      );
      const validEmployees = employees.filter(Boolean) as FirebaseUser[];

      if (action === 'deactivate') {
        await Promise.all(
          validEmployees.map((emp) => userService.deleteUser(emp.uid)),
        );
        return NextResponse.json({ success: true, count: validEmployees.length });
      }

      if (action === 'send-email') {
        const companyName = 'Your Company';
        await Promise.all(
          validEmployees.map((emp) =>
            emailService.sendNotification({
              email: emp.email || '',
              name: emp.displayName || emp.email || '',
              title: `Message from ${companyName}`,
              message: `<p>Hello ${emp.displayName || emp.email},</p><p>You have a new message from ${companyName}.</p>`,
            }),
          ),
        );
        return NextResponse.json({ success: true, count: validEmployees.length });
      }

      // export
      const exportData = validEmployees.map((emp) => ({
        id: emp.uid,
        name: emp.displayName || emp.email,
        email: emp.email,
        role: emp.role || 'employee',
        department: emp.department || '',
      }));
      return NextResponse.json({ success: true, employees: exportData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 },
        );
      }
      console.error('Bulk employee action failed:', error);
      return NextResponse.json(
        { error: 'Failed to process bulk action' },
        { status: 500 },
      );
    }
  },
);
