import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unmock('firebase-admin');
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
});

describe('firebase admin initialization', () => {
  it('uses service account when FIREBASE_SERVICE_ACCOUNT is set', async () => {
    const initializeApp = vi.fn();
    const cert = vi.fn().mockReturnValue('cert');
    const auth = vi.fn();
    const storage = vi.fn();
    const firestore = vi.fn();
    firestore.FieldValue = {} as any;

    vi.doMock('firebase-admin', () => ({
      __esModule: true,
      default: { apps: [], initializeApp, credential: { cert, applicationDefault: vi.fn() }, auth, firestore, storage },
    }));

    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ projectId: 'p', clientEmail: 'e', privateKey: 'k' });

    await import('@/lib/firebase/admin');

    expect(cert).toHaveBeenCalledWith(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!));
    expect(initializeApp).toHaveBeenCalledWith({ credential: 'cert' });
  });

  it('falls back to applicationDefault when FIREBASE_SERVICE_ACCOUNT is not set', async () => {
    const initializeApp = vi.fn();
    const applicationDefault = vi.fn().mockReturnValue('default');
    const auth = vi.fn();
    const storage = vi.fn();
    const firestore = vi.fn();
    firestore.FieldValue = {} as any;

    vi.doMock('firebase-admin', () => ({
      __esModule: true,
      default: {
        apps: [],
        initializeApp,
        credential: { cert: vi.fn(), applicationDefault },
        auth,
        firestore,
        storage,
      },
    }));

    await import('@/lib/firebase/admin');

    expect(applicationDefault).toHaveBeenCalled();
    expect(initializeApp).toHaveBeenCalledWith({ credential: 'default' });
  });
});
