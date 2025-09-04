'use client';

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode 
} from 'react';
import { useRouter } from 'next/navigation';
import { 
  type User,
  onIdTokenChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  type UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<void>;
  createUser: (email: string, password: string) => Promise<UserCredential>;
  sendPasswordReset: (email: string, actionCodeSettings?: Parameters<typeof sendPasswordResetEmail>[2]) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        const idToken = await user.getIdToken();
        // Send the token to your server to create a session cookie
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });
        router.push('/'); // Redirect to home on successful login
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  
  const signOut = async () => {
    await firebaseSignOut(auth);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signInWithGoogle,
    createUser: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    sendPasswordReset: (email, actionCodeSettings) => sendPasswordResetEmail(auth, email, actionCodeSettings),
    signOut: () => firebaseSignOut(auth)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
