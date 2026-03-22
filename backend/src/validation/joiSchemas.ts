/**
 * Joi schemas for API request validation.
 * Use with validateBodyJoi, validateQueryJoi, validateParamsJoi middleware.
 */
import Joi from 'joi';

const roleEnum = Joi.string().valid('user', 'mechanic', 'mechanic_tow', 'car_rental', 'admin');
const serviceTypeEnum = Joi.string().valid('mechanic', 'tow', 'rental', 'battery', 'tire', 'oil_change');
const requestStatusEnum = Joi.string().valid('pending', 'accepted', 'on_the_way', 'completed', 'cancelled');

const coordSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

/** POST /auth/register */
export const registerSchemaJoi = Joi.object({
  name: Joi.string().min(1).max(200).trim().required(),
  email: Joi.string().email().max(320).required(),
  password: Joi.string().min(8).max(128).required(),
  role: roleEnum.optional().default('user'),
});

/** POST /auth/login */
export const loginSchemaJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

/** POST /auth/refresh */
export const refreshSchemaJoi = Joi.object({
  refreshToken: Joi.string().min(1).required(),
});

/** POST /requests */
export const createRequestSchemaJoi = Joi.object({
  serviceType: serviceTypeEnum.required(),
  origin: coordSchema.required(),
  destination: coordSchema.optional().allow(null),
  providerId: Joi.string().min(1).optional().allow(null).empty(''),
  description: Joi.string().max(2000).optional().allow(null, ''),
});

/** PATCH /requests/:id/status */
export const updateRequestStatusSchemaJoi = Joi.object({
  status: requestStatusEnum.required(),
});

/** POST /requests/:id/rate */
export const rateRequestSchemaJoi = Joi.object({
  rating: Joi.number().min(1).max(5).integer().required(),
  comment: Joi.string().max(500).optional().allow(null, ''),
});

/** PATCH /providers/me/location & POST /providers/location */
export const updateLocationSchemaJoi = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

/** POST /providers/location – body with either { lat, lng } or { latitude, longitude } */
export const locationBodySchemaJoi = Joi.alternatives().try(
  Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
  Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  })
);

/** PATCH /providers/me */
export const updateProviderMeSchemaJoi = Joi.object({
  name: Joi.string().max(200).trim().optional(),
  phone: Joi.string().max(50).trim().optional().allow('', null),
  photo: Joi.string().max(2000).optional().allow(null, ''),
  services: Joi.array().items(Joi.string().max(200)).max(50).optional(),
});

/** PATCH /providers/me/availability */
export const updateAvailabilitySchemaJoi = Joi.object({
  isAvailable: Joi.boolean().required(),
});

/** GET /providers/nearby – query */
export const nearbyQuerySchemaJoi = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.1).max(500).optional(),
  role: Joi.string().valid('mechanic', 'mechanic_tow', 'car_rental').optional(),
  available: Joi.string().valid('true', 'false').optional(),
  verified: Joi.string().valid('true', 'false').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

/** PATCH /admin/users/:id/block */
export const adminBlockSchemaJoi = Joi.object({
  blocked: Joi.boolean().required(),
});

/** PATCH /admin/providers/:id/verify */
export const adminVerifySchemaJoi = Joi.object({
  verified: Joi.boolean().required(),
});

/** POST /chat/conversations/:id/messages */
export const chatMessageSchemaJoi = Joi.object({
  text: Joi.string().min(1).max(2000).trim().required(),
});

/** POST /notifications/register */
export const notificationRegisterSchemaJoi = Joi.object({
  token: Joi.string().min(1).max(500).required(),
});

/** POST /providers/vehicles */
export const createVehicleSchemaJoi = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  type: Joi.string().min(1).max(100).required(),
  pricePerHour: Joi.number().min(0).max(1_000_000).required(),
  description: Joi.string().max(2000).optional().allow(null, ''),
  images: Joi.array().items(Joi.string().uri().max(2000)).max(10).optional(),
});

/** PATCH /providers/vehicles/:id */
export const updateVehicleSchemaJoi = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  type: Joi.string().min(1).max(100).optional(),
  pricePerHour: Joi.number().min(0).max(1_000_000).optional(),
  description: Joi.string().max(2000).optional().allow(null, ''),
  images: Joi.array().items(Joi.string().uri().max(2000)).max(10).optional(),
}).min(1);

/** Path param :id (generic) */
export const idParamSchemaJoi = Joi.object({
  id: Joi.string().min(1).max(100).required(),
});
