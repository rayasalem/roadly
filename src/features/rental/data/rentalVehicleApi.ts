import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';

export interface RentalVehicleDto {
  id: string;
  providerId: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalVehicleListResponse {
  items: RentalVehicleDto[];
  total: number;
}

export async function fetchMyVehicles(): Promise<RentalVehicleDto[]> {
  try {
    const res = await api.get<RentalVehicleListResponse | RentalVehicleDto[]>(ENDPOINTS.providerVehicles);
    if (!res || typeof res !== 'object' || res.data == null) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as RentalVehicleListResponse).items)) return (data as RentalVehicleListResponse).items;
    return [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export interface SaveVehicleInput {
  id?: string;
  name: string;
  type: string;
  pricePerHour: number;
  description?: string | null;
  images?: string[];
}

export async function addVehicle(input: SaveVehicleInput): Promise<RentalVehicleDto> {
  try {
    const body = {
      name: input.name,
      type: input.type,
      pricePerHour: input.pricePerHour,
      description: input.description ?? undefined,
      images: input.images ?? [],
    };
    const res = await api.post<RentalVehicleDto>(ENDPOINTS.providerVehicles, body);
    if (!res || typeof res !== 'object' || res.data == null) {
      throw new Error('Invalid API response');
    }
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateVehicleApi(id: string, input: Partial<SaveVehicleInput>): Promise<RentalVehicleDto> {
  try {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.type !== undefined) body.type = input.type;
    if (input.pricePerHour !== undefined) body.pricePerHour = input.pricePerHour;
    if (input.description !== undefined) body.description = input.description ?? null;
    if (input.images !== undefined) body.images = input.images;
    const res = await api.patch<RentalVehicleDto>(ENDPOINTS.providerVehicleById(id), body);
    if (!res || typeof res !== 'object' || res.data == null) {
      throw new Error('Invalid API response');
    }
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteVehicleApi(id: string): Promise<void> {
  try {
    await api.delete(ENDPOINTS.providerVehicleById(id));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

