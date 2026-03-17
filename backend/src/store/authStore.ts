import { hashPassword } from '../services/password.js';
import { prisma } from '../lib/prisma.js';
import type { Role as PrismaRole } from '@prisma/client';

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

function mapRole(r: PrismaRole): Role {
  return r as Role;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role = 'user'
): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as PrismaRole,
    },
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: mapRole(user.role),
    blocked: user.blocked,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function setUserBlocked(userId: string, blocked: boolean): Promise<User | undefined> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { blocked },
  }).catch(() => null);
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: mapRole(user.role),
    blocked: user.blocked,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: mapRole(u.role),
    blocked: u.blocked,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: mapRole(user.role),
    blocked: user.blocked,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function findUserById(id: string): Promise<User | undefined> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: mapRole(user.role),
    blocked: user.blocked,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function storeRefreshToken(token: string, userId: string): Promise<void> {
  await prisma.refreshToken.create({
    data: { token, userId },
  });
}

export async function consumeRefreshToken(token: string): Promise<string | null> {
  const record = await prisma.refreshToken.findUnique({
    where: { token },
  });
  if (!record) return null;
  await prisma.refreshToken.delete({
    where: { token },
  });
  return record.userId;
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}
