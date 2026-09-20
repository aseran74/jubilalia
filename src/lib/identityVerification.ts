export type IdentityStatus = 'unverified' | 'pending' | 'verified';

const storageKey = (userId: string) => `jubilalia-identity-${userId}`;

export function getIdentityStatus(userId?: string | null): IdentityStatus {
  if (!userId) return 'unverified';
  const raw = localStorage.getItem(storageKey(userId));
  if (raw === 'pending' || raw === 'verified') return raw;
  return 'unverified';
}

export function setIdentityStatus(userId: string, status: IdentityStatus) {
  localStorage.setItem(storageKey(userId), status);
}
