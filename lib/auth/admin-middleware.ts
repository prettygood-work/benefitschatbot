import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../firebase/admin';
import { USER_ROLES, UserRole, hasRoleAccess, normalizeLegacyRole } from '../constants/roles';

/**
 * Middleware to protect routes with authentication and role-based access control
 * @param requiredRole - Minimum role required to access the route
 * @param handler - The route handler function
 */
export function withAuth(
  requiredRole: UserRole = USER_ROLES.EMPLOYEE,
  handler?: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) {
  // Support legacy usage where first param is the handler
  if (typeof requiredRole === 'function') {
    handler = requiredRole;
    requiredRole = USER_ROLES.SUPER_ADMIN; // Default for backward compatibility
  }

  return async (req: NextRequest, context: { params: any }) => {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      
      // Normalize role from token (handle legacy formats)
      const userRole = normalizeLegacyRole(
        decodedToken.role || 
        decodedToken['custom_claims']?.role || 
        decodedToken.customClaims?.role
      );

      // Check if user has required role access
      if (!hasRoleAccess(userRole, requiredRole)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            required: requiredRole,
            current: userRole 
          },
          { status: 403 }
        );
      }

      // Add normalized user data to the token
      const user = {
        ...decodedToken,
        role: userRole,
        companyId: decodedToken.companyId || decodedToken['custom_claims']?.companyId
      };

      // Call the handler with user context
      if (handler) {
        return handler(req, context, user);
      }

      // If no handler provided, just return success
      return NextResponse.json({ authenticated: true, role: userRole });
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error instanceof Error && error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'Authentication token expired' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware specifically for super admin routes
 */
export const requireSuperAdmin = (
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) => withAuth(USER_ROLES.SUPER_ADMIN, handler);

/**
 * Middleware specifically for platform admin routes
 */
export const requirePlatformAdmin = (
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) => withAuth(USER_ROLES.PLATFORM_ADMIN, handler);

/**
 * Middleware specifically for company admin routes
 */
export const requireCompanyAdmin = (
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) => withAuth(USER_ROLES.COMPANY_ADMIN, handler);

/**
 * Middleware specifically for HR admin routes
 */
export const requireHRAdmin = (
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) => withAuth(USER_ROLES.HR_ADMIN, handler);

/**
 * Middleware for any authenticated user
 */
export const requireAuth = (
  handler: (req: NextRequest, context: { params: any }, user: any) => Promise<Response>
) => withAuth(USER_ROLES.EMPLOYEE, handler);
