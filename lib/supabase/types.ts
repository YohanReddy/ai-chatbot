export type UserType = 'regular';

export interface AuthUser {
  id: string;
  email: string;
  type: UserType;
}

export interface AuthError {
  message: string;
  status: 'error' | 'success';
}
