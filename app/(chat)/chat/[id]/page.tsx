'use client';

import { useEffect, useState } from 'react';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import type { ChatMessage } from '@/lib/types';

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  // If not authenticated, go to login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Verify the user has access to this conversation (client-side UI guard)
  useEffect(() => {
    if (!user) return;

    const verifyAccess = async () => {
      try {
        const convRef = doc(db, 'conversations', params.id);
        const convSnap = await getDoc(convRef);
        const convData = convSnap.data() as any | undefined;

        if (!convSnap.exists() || !convData || convData.userId !== user.uid) {
          // You can change this path to wherever your 404/unauthorized UI lives
          router.replace('/404');
        }
      } catch {
        router.replace('/404');
      }
    };

    verifyAccess();
  }, [user, params.id, router]);

  // Load initial messages
  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const messagesQuery = query(
          collection(db, `conversations/${params.id}/messages`),
          orderBy('createdAt', 'asc'),
        );
        const snapshot = await getDocs(messagesQuery);
        const history: ChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: data.id || docSnap.id,
            role: data.role,
            parts: [{ type: 'text', text: data.content }],
            metadata: data.createdAt
              ? { createdAt: data.createdAt.toDate().toISOString() }
              : undefined,
          };
        });
        setMessages(history);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user, params.id]);

  if (loading || !user || isLoadingMessages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full size-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Chat
      id={params.id}
      initialMessages={messages}
      initialChatModel={DEFAULT_CHAT_MODEL}
      initialVisibilityType="private"
      isReadonly={false}
      autoResume={false}
    />
  );
}
