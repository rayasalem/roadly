import { hashPassword } from '../services/password.js';

export type Role = 'user' | 'mechanic' | 'mechanic_tow' | 'car_rental' | 'admin';

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  blocked: boolean;
  createdAt: string;
}

const users = new Map<string, User>();
const refreshTokenToUserId = new Map<string, string>();

let idCounter = 1;
const nextId = () => String(idCounter++);

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role = 'user'
): Promise<User> {
  const existing = Array.from(users.values()).find((u) => u.email === email);
  if (existing) throw new Error('Email already registered');
  const id = nextId();
  const passwordHash = await hashPassword(password);
  const user: User = {
    id,
    name,
    email,
    passwordHash,
    role,
    blocked: false,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

export function setUserBlocked(userId: string, blocked: boolean): User | undefined {
  const user = users.get(userId);
  if (!user) return undefined;
  user.blocked = blocked;
  return user;
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}

export function findUserById(id: string): User | undefined {
  return users.get(id);
}

export function storeRefreshToken(token: string, userId: string): void {
  refreshTokenToUserId.set(token, userId);
}

export function consumeRefreshToken(token: string): string | null {
  const userId = refreshTokenToUserId.get(token);
  if (!userId) return null;
  refreshTokenToUserId.delete(token);
  return userId;
}

export function revokeAllRefreshTokensForUser(userId: string): void {
  for (const [tok, uid] of refreshTokenToUserId.entries()) {
    if (uid === userId) refreshTokenToUserId.delete(tok);
  }
}
