'use client';

import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export const SignOutForm = () => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left px-1 py-0.5 text-red-500"
    >
      Sign out
    </button>
  );
};
