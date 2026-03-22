import { prisma } from '../lib/prisma.js';

/** Resolve ProviderProfile.id from User.id (JWT subject). Vehicle.providerId FK points to ProviderProfile.id. */
async function getProviderProfileIdByUserId(userId: string): Promise<string | null> {
  const row = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return row?.id ?? null;
}

export interface Vehicle {
  id: string;
  /** ProviderProfile.id (internal); API still exposes logical provider as user id where needed */
  providerId: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

function rowToVehicle(row: {
  id: string;
  providerId: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}): Vehicle {
  return {
    id: row.id,
    providerId: row.providerId,
    name: row.name,
    type: row.type,
    pricePerHour: row.pricePerHour,
    description: row.description,
    images: row.images ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listVehiclesByProvider(userId: string): Promise<Vehicle[]> {
  const profileId = await getProviderProfileIdByUserId(userId);
  if (!profileId) return [];
  const rows = await prisma.vehicle.findMany({
    where: { providerId: profileId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(rowToVehicle);
}

export async function createVehicle(userId: string, data: {
  name: string;
  type: string;
  pricePerHour: number;
  description?: string | null;
  images?: string[];
}): Promise<Vehicle> {
  const profileId = await getProviderProfileIdByUserId(userId);
  if (!profileId) {
    throw new Error('Provider profile not found; complete onboarding first');
  }
  const row = await prisma.vehicle.create({
    data: {
      providerId: profileId,
      name: data.name,
      type: data.type,
      pricePerHour: data.pricePerHour,
      description: data.description ?? null,
      images: data.images ?? [],
    },
  });
  return rowToVehicle(row);
}

export async function updateVehicle(userId: string, id: string, data: {
  name?: string;
  type?: string;
  pricePerHour?: number;
  description?: string | null;
  images?: string[];
}): Promise<Vehicle | null> {
  const profileId = await getProviderProfileIdByUserId(userId);
  if (!profileId) return null;
  const existing = await prisma.vehicle.findFirst({
    where: { id, providerId: profileId },
  });
  if (!existing) return null;
  const row = await prisma.vehicle.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.pricePerHour !== undefined && { pricePerHour: data.pricePerHour }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.images !== undefined && { images: data.images }),
    },
  });
  return rowToVehicle(row);
}

export async function deleteVehicle(userId: string, id: string): Promise<boolean> {
  const profileId = await getProviderProfileIdByUserId(userId);
  if (!profileId) return false;
  const existing = await prisma.vehicle.findFirst({
    where: { id, providerId: profileId },
  });
  if (!existing) return false;
  await prisma.vehicle.delete({ where: { id } });
  return true;
}

