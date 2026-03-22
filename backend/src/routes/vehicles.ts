import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { validateBodyJoi, validateParamsJoi } from '../middleware/validateRequest.js';
import { createVehicleSchemaJoi, updateVehicleSchemaJoi, idParamSchemaJoi } from '../validation/joiSchemas.js';
import { sanitizeUserInput } from '../lib/sanitize.js';
import {
  listVehiclesByProvider,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../store/vehicleStore.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authGuard);

router.get(
  '/providers/vehicles',
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || typeof user.id !== 'string') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const items = await listVehiclesByProvider(user.id);
    res.json({ items, total: items.length });
  }),
);

router.post(
  '/providers/vehicles',
  validateBodyJoi(createVehicleSchemaJoi),
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || typeof user.id !== 'string') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const body = req.validated!.body as {
      name: string;
      type: string;
      pricePerHour: number;
      description?: string | null;
      images?: string[];
    };
    const name = sanitizeUserInput(body.name, 200);
    const type = sanitizeUserInput(body.type, 100);
    const description =
      body.description != null && body.description !== ''
        ? sanitizeUserInput(body.description, 2000)
        : null;
    const images = Array.isArray(body.images)
      ? body.images.map((u) => sanitizeUserInput(String(u), 2000))
      : [];
    const created = await createVehicle(user.id, {
      name,
      type,
      pricePerHour: body.pricePerHour,
      description,
      images,
    });
    res.status(201).json(created);
  }),
);

router.patch(
  '/providers/vehicles/:id',
  validateParamsJoi(idParamSchemaJoi),
  validateBodyJoi(updateVehicleSchemaJoi),
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || typeof user.id !== 'string') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.validated!.params as { id: string };
    const body = req.validated!.body as {
      name?: string;
      type?: string;
      pricePerHour?: number;
      description?: string | null;
      images?: string[];
    };
    const payload: {
      name?: string;
      type?: string;
      pricePerHour?: number;
      description?: string | null;
      images?: string[];
    } = {};
    if (body.name != null) payload.name = sanitizeUserInput(body.name, 200);
    if (body.type != null) payload.type = sanitizeUserInput(body.type, 100);
    if (body.pricePerHour != null) payload.pricePerHour = body.pricePerHour;
    if (body.description !== undefined) {
      payload.description =
        body.description != null && body.description !== ''
          ? sanitizeUserInput(body.description, 2000)
          : null;
    }
    if (body.images !== undefined) {
      payload.images = Array.isArray(body.images)
        ? body.images.map((u) => sanitizeUserInput(String(u), 2000))
        : [];
    }
    const updated = await updateVehicle(user.id, id, payload);
    if (!updated) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    res.json(updated);
  }),
);

router.delete(
  '/providers/vehicles/:id',
  validateParamsJoi(idParamSchemaJoi),
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user || typeof user.id !== 'string') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.validated!.params as { id: string };
    const ok = await deleteVehicle(user.id, id);
    if (!ok) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    res.status(204).send();
  }),
);

export default router;

