import { generateUUID } from '@/app/chat/lib/utils';
import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { AuthUser } from '@/app/chat/lib/supabase/types';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/app/chat/lib/artifacts/server';

interface CreateDocumentProps {
  user: AuthUser;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ user, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      dataStream.writeData({
        type: 'id',
        content: id,
      });

      dataStream.writeData({
        type: 'title',
        content: title,
      });

      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        user,
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
