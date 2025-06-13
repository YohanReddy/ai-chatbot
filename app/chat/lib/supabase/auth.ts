import { createClient } from './server';
import { createClient as createBrowserClient } from './client';
import type { AuthUser, } from './types';

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, user: null };
  }

  return { error: null, user: data.user };
}

export async function signUp(email: string, password: string) {
  const supabase = createBrowserClient();
  
  // Sign up with Supabase (no local database user creation needed)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message, user: null };
  }

  return { error: null, user: data.user };
}

export async function signOut() {
  const supabase = createBrowserClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error: error.message };
  }
  
  return { error: null };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    type: 'regular'
  };
}
