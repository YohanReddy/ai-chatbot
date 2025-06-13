create table public."Chat" (
  id uuid not null default gen_random_uuid (),
  "createdAt" timestamp without time zone not null,
  title text not null,
  "userId" uuid not null,
  visibility character varying not null default 'private'::character varying,
  constraint Chat_pkey primary key (id),
  constraint Chat_userId_auth_users_fk foreign KEY ("userId") references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public."Document" (
  id uuid not null default gen_random_uuid (),
  "createdAt" timestamp without time zone not null,
  title text not null,
  content text null,
  text character varying not null default 'text'::character varying,
  "userId" uuid not null,
  constraint Document_id_createdAt_pk primary key (id, "createdAt"),
  constraint Document_userId_auth_users_fk foreign KEY ("userId") references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public."Message_v2" (
  id uuid not null default gen_random_uuid (),
  "chatId" uuid not null,
  role character varying not null,
  parts json not null,
  attachments json not null,
  "createdAt" timestamp without time zone not null,
  constraint Message_v2_pkey primary key (id),
  constraint Message_v2_chatId_Chat_id_fk foreign KEY ("chatId") references "Chat" (id)
) TABLESPACE pg_default;

create table public."Stream" (
  id uuid not null default gen_random_uuid (),
  "chatId" uuid not null,
  "createdAt" timestamp without time zone not null,
  constraint Stream_id_pk primary key (id),
  constraint Stream_chatId_Chat_id_fk foreign KEY ("chatId") references "Chat" (id)
) TABLESPACE pg_default;

create table public."Suggestion" (
  id uuid not null default gen_random_uuid (),
  "documentId" uuid not null,
  "documentCreatedAt" timestamp without time zone not null,
  "originalText" text not null,
  "suggestedText" text not null,
  description text null,
  "isResolved" boolean not null default false,
  "userId" uuid not null,
  "createdAt" timestamp without time zone not null,
  constraint Suggestion_id_pk primary key (id),
  constraint Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f foreign KEY ("documentId", "documentCreatedAt") references "Document" (id, "createdAt"),
  constraint Suggestion_userId_auth_users_fk foreign KEY ("userId") references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public."Vote_v2" (
  "chatId" uuid not null,
  "messageId" uuid not null,
  "isUpvoted" boolean not null,
  constraint Vote_v2_chatId_messageId_pk primary key ("chatId", "messageId"),
  constraint Vote_v2_chatId_Chat_id_fk foreign KEY ("chatId") references "Chat" (id),
  constraint Vote_v2_messageId_Message_v2_id_fk foreign KEY ("messageId") references "Message_v2" (id)
) TABLESPACE pg_default;