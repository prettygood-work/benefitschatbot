import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

/**
 * Database cleanup API endpoint to resolve authentication issues
 * GET /api/admin/cleanup-database
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Starting database cleanup...');

    // 1. Find duplicate users by email
    console.log('📋 Checking for duplicate users by email...');
    const allUsers = await db.select().from(users);
    const emailGroups = allUsers.reduce((groups, user) => {
      if (!groups[user.email]) {
        groups[user.email] = [];
      }
      groups[user.email].push(user);
      return groups;
    }, {} as Record<string, typeof allUsers>);

    const duplicates = Object.entries(emailGroups).filter(([_, userList]) => userList.length > 1);
    
    // 2. Find users without valid Stack User IDs
    const invalidStackUsers = allUsers.filter(user => 
      !user.stackUserId || user.stackUserId.startsWith('migrated-')
    );
    
    // 3. Find orphaned users (users without companies)
    const orphanedUsers = allUsers.filter(user => !user.companyId);

    const report = {
      totalUsers: allUsers.length,
      duplicateEmails: duplicates.length,
      invalidStackUsers: invalidStackUsers.length,
      orphanedUsers: orphanedUsers.length,
      duplicateDetails: duplicates.map(([email, userList]) => ({
        email,
        count: userList.length,
        users: userList.map(u => ({
          id: u.id,
          stackUserId: u.stackUserId,
          companyId: u.companyId,
          role: u.role
        }))
      })),
      invalidStackUserDetails: invalidStackUsers.map(u => ({
        id: u.id,
        email: u.email,
        stackUserId: u.stackUserId,
        companyId: u.companyId
      })),
      orphanedUserDetails: orphanedUsers.map(u => ({
        id: u.id,
        email: u.email,
        stackUserId: u.stackUserId
      })),
      recommendations: generateRecommendations(duplicates.length, invalidStackUsers.length, orphanedUsers.length)
    };

    console.log('🔧 Database cleanup completed');
    
    return NextResponse.json(report);

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    return NextResponse.json(
      { error: 'Database cleanup failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  duplicateCount: number, 
  invalidStackUserCount: number, 
  orphanedUserCount: number
): string[] {
  const recommendations: string[] = [];

  if (duplicateCount > 0) {
    recommendations.push('🔧 DUPLICATE EMAILS: Review and merge or remove duplicate user accounts');
  }

  if (invalidStackUserCount > 0) {
    recommendations.push('🔧 INVALID STACK IDS: Update users with proper Stack Auth user IDs');
  }

  if (orphanedUserCount > 0) {
    recommendations.push('🔧 ORPHANED USERS: Assign users to appropriate companies');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ No issues found - database is clean');
  }

  return recommendations;
}
