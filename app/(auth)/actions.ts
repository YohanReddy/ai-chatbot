'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { headers } from "next/headers";
import { redirect } from "next/navigation";


const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Sign in with Supabase first
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });    if (error) {
      return { status: 'failed' };
    }

    // User authentication is now handled entirely by Supabase
    // No need to check local database

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Check if user already exists in Supabase first
    const supabase = await createClient();
    
    // Sign up with Supabase first
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      // Handle specific Supabase errors
      // Supabase error codes: https://supabase.com/docs/reference/javascript/auth-signup
      if (
        error.message?.toLowerCase().includes('already registered') ||
        error.message?.toLowerCase().includes('user already exists') ||
        error.status === 400 // Supabase returns 400 for existing user
      ) {
        return { status: 'user_exists' };
      }
      return { status: 'failed' };
    }    // User registration is now handled entirely by Supabase
    // No need to create user in local database

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return { error: error.message };
  }

  await supabase.from("users").insert({
    user_id: data.user?.id,
    email,
    created_at: new Date().toISOString(),
  });

  return { success: "Sign up successful. Check your email for verification." };
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: error.message };
  }

  return redirect("/"); // generic success redirect
};