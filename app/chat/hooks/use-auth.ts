import { createClient } from "@/app/chat/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type UserRole =
  | "Student"
  | "Teacher"
  | "Admin"
  | "admin"
  | "dat_student"
  | "dat_school"
  | "dat_judge"
  | "dat_admin"
  | "School"
  | null;

interface UseAuthReturn {
  user: User | null;
  session?: Session | null;
  email: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  status: string | null;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AUTH_QUERY_KEY = ["auth", "session"] as const;

export const useAuth = (): UseAuthReturn => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        // Clear any stale session data on auth errors
        if (
          error.message.includes("Invalid JWT") ||
          error.message.includes("JWT expired")
        ) {
          return null;
        }
        throw error;
      }
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - balance between performance and freshness
    retry: (failureCount, error) => {
      // Don't retry on auth errors, only network errors
      const authErrors = [
        "Invalid JWT",
        "JWT expired",
        "Invalid login credentials",
      ];
      if (authErrors.some((authError) => error?.message?.includes(authError))) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Listen to auth state changes for real-time updates
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Update the React Query cache with new session data
        queryClient.setQueryData(AUTH_QUERY_KEY, session);

        // Handle specific auth events
        switch (event) {
          case "SIGNED_OUT":
            queryClient.clear(); // Clear all cached data on sign out
            break;
          case "TOKEN_REFRESHED":
            // Session is already updated above
            break;
          case "SIGNED_IN":
            // Session is already updated above
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, queryClient]);

  const user = session?.user ?? null;

  const getUserRole = (): UserRole =>
    (user?.user_metadata?.role as UserRole) ?? null;

  const getUserStatus = (): string | null =>
    user?.user_metadata?.status ?? null;

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all cached data and redirect
      queryClient.clear();
      router.push("/chat");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const refetchSession = async () => {
    await refetch();
  };

  return {
    user,
    session,
    email: user?.email ?? null,
    loading: isLoading,
    isAuthenticated: !!user && !!session,
    role: getUserRole(),
    status: getUserStatus(),
    signOut,
    refetch: refetchSession,
  };
};