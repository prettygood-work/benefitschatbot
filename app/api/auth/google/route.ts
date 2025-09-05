// app/api/auth/google/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { googleWorkspaceService } from '@/lib/services/google-workspace.service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || undefined;
  const url = googleWorkspaceService.getAuthorizationUrl(tenantId);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  try {
    const { code, tenantId } = await request.json();
    if (!code || !tenantId) {
      return NextResponse.json(
        { error: 'Missing code or tenantId' },
        { status: 400 },
      );
    }
    const tokens = await googleWorkspaceService.getTokens(code);
    await googleWorkspaceService.enableIntegration(tenantId, tokens);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
