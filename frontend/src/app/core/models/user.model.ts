export type UserRole = 'ADMIN' | 'PASTEUR' | 'TREASURER' | 'MEMBER';

export interface User {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  templeName: string | null;
  roles: UserRole[];
}

const ROLE_LABELS: Record<UserRole, string> = {
  MEMBER: 'Membre',
  ADMIN: 'Administrateur',
  PASTEUR: 'Pasteur',
  TREASURER: 'Trésorier',
};

export function roleLabel(user: User): string {
  const role = user.roles[0];
  return role ? ROLE_LABELS[role] : '';
}

/** « Jean Kouassi » → « JK » (repli sur le nom complet pour une session ancienne). */
export function userInitials(user: User): string {
  const parts =
    user.firstName || user.lastName
      ? [user.firstName, user.lastName]
      : user.fullName.split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('')
    .toUpperCase();
}
