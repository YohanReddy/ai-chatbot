-- 1. Drop old foreign key constraints referencing public."User"
ALTER TABLE public."Chat" DROP CONSTRAINT "Chat_userId_User_id_fk";
ALTER TABLE public."Document" DROP CONSTRAINT "Document_userId_User_id_fk";
ALTER TABLE public."Suggestion" DROP CONSTRAINT "Suggestion_userId_User_id_fk";

-- 2. Drop the "User" table
DROP TABLE public."User";

-- 3. Add new foreign key constraints referencing auth.users(id)
ALTER TABLE public."Chat"
  ADD CONSTRAINT "Chat_userId_auth_users_fk"
  FOREIGN KEY ("userId") REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE public."Document"
  ADD CONSTRAINT "Document_userId_auth_users_fk"
  FOREIGN KEY ("userId") REFERENCES auth.users (id) ON DELETE CASCADE;

ALTER TABLE public."Suggestion"
  ADD CONSTRAINT "Suggestion_userId_auth_users_fk"
  FOREIGN KEY ("userId") REFERENCES auth.users (id) ON DELETE CASCADE;
