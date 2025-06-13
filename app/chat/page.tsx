import { cookies } from 'next/headers';

import { Chat } from '@/app/chat/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/app/chat/lib/ai/models';
import { generateUUID } from '@/app/chat/lib/utils';
import { DataStreamHandler } from '@/app/chat/components/data-stream-handler';
import { createClient } from '@/app/chat/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { AuthUser } from '@/app/chat/lib/supabase/types';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }
    // Create AuthUser directly from Supabase user
  const authUserData: AuthUser = {
    id: user.id,
    email: user.email || '',
    type: 'regular'
  };

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={authUserData}
          autoResume={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={modelIdFromCookie.value}
        initialVisibilityType="private"
        isReadonly={false}
        session={authUserData}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
