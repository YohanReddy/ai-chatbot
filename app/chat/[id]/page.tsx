import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/app/chat/components/chat';
import { getChatById, getMessagesByChatId } from '@/app/chat/lib/db/queries';
import { DataStreamHandler } from '@/app/chat/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/app/chat/lib/ai/models';
import type { DBMessage } from '@/app/chat/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';
import { createClient } from '@/app/chat/lib/supabase/server';
import type { AuthUser } from '@/app/chat/lib/supabase/types';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {    redirect('/login');
  }
  
  // Create AuthUser directly from Supabase user
  const authUser: AuthUser = {
    id: user.id,
    email: user.email || '',
    type: 'regular'
  };

  if (chat.visibility === 'private') {
    if (authUser.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={authUser.id !== chat.userId}
          session={authUser}
          autoResume={true}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={authUser.id !== chat.userId}
        session={authUser}
        autoResume={true}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
