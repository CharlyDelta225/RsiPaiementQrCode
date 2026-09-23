export type UserRole = 'ADMIN' | 'PASTEUR' | 'TREASURER' | 'MEMBER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  roles: UserRole[];
}