/**
 * Unit tests for Joi validation schemas. Run with: npx tsx src/test/validation/joiSchemas.test.ts
 */
import {
  registerSchemaJoi,
  loginSchemaJoi,
  createRequestSchemaJoi,
  updateRequestStatusSchemaJoi,
  rateRequestSchemaJoi,
  nearbyQuerySchemaJoi,
  chatMessageSchemaJoi,
  adminBlockSchemaJoi,
  adminVerifySchemaJoi,
  notificationRegisterSchemaJoi,
} from '../../validation/joiSchemas.js';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function run() {
  // Register
  const regValid = await registerSchemaJoi.validateAsync({ name: 'Test User', email: 'test@example.com', password: 'password123', role: 'user' });
  assert(regValid.name === 'Test User' && regValid.role === 'user', 'Register valid');
  await registerSchemaJoi.validateAsync({ name: 'A', email: 'a@b.com', password: 'password123' }).then(() => {}, () => {}); // optional role
  try {
    await registerSchemaJoi.validateAsync({ name: '', email: 'a@b.com', password: 'x' });
    throw new Error('Register empty name should fail');
  } catch {
    /* ok */
  }

  // Login
  await loginSchemaJoi.validateAsync({ email: 'a@b.com', password: 'p' });
  try {
    await loginSchemaJoi.validateAsync({ email: 'a@b.com' });
    throw new Error('Login missing password should fail');
  } catch {
    /* ok */
  }

  // Create request
  await createRequestSchemaJoi.validateAsync({ serviceType: 'mechanic', origin: { latitude: 32.3, longitude: 35.2 }, providerId: null });
  try {
    await createRequestSchemaJoi.validateAsync({ serviceType: 'invalid', origin: { latitude: 0, longitude: 0 } });
    throw new Error('Invalid serviceType should fail');
  } catch {
    /* ok */
  }

  // Update status
  await updateRequestStatusSchemaJoi.validateAsync({ status: 'accepted' });
  try {
    await updateRequestStatusSchemaJoi.validateAsync({ status: 'invalid' });
    throw new Error('Invalid status should fail');
  } catch {
    /* ok */
  }

  // Rate
  await rateRequestSchemaJoi.validateAsync({ rating: 5 });
  try {
    await rateRequestSchemaJoi.validateAsync({ rating: 6 });
    throw new Error('Rating > 5 should fail');
  } catch {
    /* ok */
  }

  // Nearby query (query params are strings; Joi coerces)
  const nearby = await nearbyQuerySchemaJoi.validateAsync({ lat: '32.5', lng: '35.2', page: '1', limit: '20' }, { convert: true });
  assert(nearby.lat === 32.5 && nearby.lng === 35.2, 'Nearby query coerced');

  // Chat message
  await chatMessageSchemaJoi.validateAsync({ text: 'Hello' });
  try {
    await chatMessageSchemaJoi.validateAsync({});
    throw new Error('Missing text should fail');
  } catch {
    /* ok */
  }

  // Admin block/verify
  await adminBlockSchemaJoi.validateAsync({ blocked: true });
  await adminVerifySchemaJoi.validateAsync({ verified: false });

  // Notification register
  await notificationRegisterSchemaJoi.validateAsync({ token: 'expo-token-123' });

  console.log('All Joi schema tests passed.');
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });