import { createClient } from '@/app/chat/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/app/chat/lib/db/queries';
import { ChatSDKError } from '@/app/chat/lib/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const limit = Number.parseInt(searchParams.get('limit') || '10');
  const startingAfter = searchParams.get('starting_after');
  const endingBefore = searchParams.get('ending_before');

  if (startingAfter && endingBefore) {
    return new ChatSDKError(
      'bad_request:api',
      'Only one of starting_after or ending_before can be provided.',
    ).toResponse();
  }  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chats = await getChatsByUserId({
    id: user.id, // Use Supabase user ID
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(chats);
}
