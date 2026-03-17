import { prisma } from '../lib/prisma.js';
import type { NotificationType as PrismaNotificationType } from '@prisma/client';

export async function registerDevice(userId: string, token: string): Promise<void> {
  await prisma.deviceToken.upsert({
    where: { userId },
    create: { userId, token },
    update: { token },
  });
}

export async function unregisterDevice(userId: string): Promise<void> {
  await prisma.deviceToken.deleteMany({
    where: { userId },
  });
}

export async function getDeviceToken(userId: string): Promise<string | undefined> {
  const row = await prisma.deviceToken.findUnique({
    where: { userId },
  });
  return row?.token;
}

export type NotificationType =
  | 'request_accepted'
  | 'provider_on_way'
  | 'provider_arrived'
  | 'service_completed'
  | 'request_created'
  | 'general';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

function rowToNotification(n: {
  id: string;
  userId: string;
  type: PrismaNotificationType;
  title: string;
  message: string;
  read: boolean;
  data: unknown;
  createdAt: Date;
}): AppNotification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    read: n.read,
    data: n.data as Record<string, unknown> | undefined,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<AppNotification> {
  const n = await prisma.notification.create({
    data: {
      userId,
      type: type as PrismaNotificationType,
      title,
      message,
      data: data ?? undefined,
    },
  });
  return rowToNotification(n);
}

export async function listNotifications(userId: string): Promise<AppNotification[]> {
  const list = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return list.map(rowToNotification);
}

export async function markNotificationRead(
  id: string
): Promise<AppNotification | undefined> {
  const n = await prisma.notification
    .update({
      where: { id },
      data: { read: true },
    })
    .catch(() => null);
  if (!n) return undefined;
  return rowToNotification(n);
}
