import { db, FieldValue } from '@/lib/firebase/admin';
import { google } from 'googleapis';
import type { Credentials } from 'google-auth-library';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = createHash('sha256')
  .update(process.env.OAUTH_TOKEN_ENCRYPTION_KEY || '')
  .digest();

interface EncryptedField {
  content: string;
  iv: string;
  tag: string;
}

function encrypt(text: string): EncryptedField {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    content: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

function decrypt(data: EncryptedField): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(data.iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.content, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export async function saveOAuthTokens(
  tenantId: string,
  tokens: Credentials,
): Promise<void> {
  if (!tokens.access_token) {
    throw new Error('Missing access token');
  }
  const access = encrypt(tokens.access_token);
  const refresh = tokens.refresh_token
    ? encrypt(tokens.refresh_token)
    : undefined;

  await db
    .collection('oauth_tokens')
    .doc(tenantId)
    .set(
      {
        provider: 'google',
        companyId: tenantId,
        access: access.content,
        accessIv: access.iv,
        accessTag: access.tag,
        ...(refresh && {
          refresh: refresh.content,
          refreshIv: refresh.iv,
          refreshTag: refresh.tag,
        }),
        expiryDate: tokens.expiry_date || null,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function getOAuthTokens(
  tenantId: string,
): Promise<Credentials | null> {
  const doc = await db.collection('oauth_tokens').doc(tenantId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data() as any;
  const access_token = decrypt({
    content: data.access,
    iv: data.accessIv,
    tag: data.accessTag,
  });
  const refresh_token = data.refresh
    ? decrypt({
        content: data.refresh,
        iv: data.refreshIv,
        tag: data.refreshTag,
      })
    : undefined;
  return {
    access_token,
    refresh_token,
    expiry_date: data.expiryDate as number | undefined,
  };
}

export async function getValidAccessToken(
  tenantId: string,
): Promise<string | null> {
  const tokens = await getOAuthTokens(tenantId);
  if (!tokens) return null;

  if (tokens.expiry_date && tokens.expiry_date - Date.now() > 60000) {
    return tokens.access_token || null;
  }
  if (!tokens.refresh_token) return null;

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
  client.setCredentials({ refresh_token: tokens.refresh_token });
  const { credentials } = await client.refreshAccessToken();
  await saveOAuthTokens(tenantId, credentials);
  return credentials.access_token || null;
}

export async function deleteOAuthTokens(tenantId: string): Promise<void> {
  await db.collection('oauth_tokens').doc(tenantId).delete();
}
