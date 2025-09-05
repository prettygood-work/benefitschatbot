// app/api/auth/google/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { SERVER_ENV } from '@/lib/config/env.server';

const oauth2Client = new google.auth.OAuth2(
  SERVER_ENV.GOOGLE_CLIENT_ID,
  SERVER_ENV.GOOGLE_CLIENT_SECRET,
  SERVER_ENV.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
  });
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const { code } = await request.json();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // TODO: Save the tokens to the database
  return NextResponse.json({ success: true });
}
