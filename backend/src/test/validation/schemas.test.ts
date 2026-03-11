/**
 * Unit tests for Zod validation schemas. Run with: npx tsx src/test/validation/schemas.test.ts
 */
import {
  registerSchema,
  loginSchema,
  createRequestSchema,
  updateRequestStatusSchema,
  rateRequestSchema,
} from '../../validation/schemas.js';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// Register
const regValid = registerSchema.safeParse({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
});
assert(regValid.success, 'Register valid');
assert(!registerSchema.safeParse({ name: '', email: 'a@b.com', password: 'x' }).success, 'Register empty name fails');
assert(!registerSchema.safeParse({ name: 'A', email: 'invalid', password: 'password123' }).success, 'Register invalid email fails');

// Login
assert(loginSchema.safeParse({ email: 'a@b.com', password: 'p' }).success, 'Login valid');
assert(!loginSchema.safeParse({ email: 'a@b.com' }).success, 'Login missing password fails');

// Create request
const reqValid = createRequestSchema.safeParse({
  serviceType: 'mechanic',
  origin: { latitude: 32.3, longitude: 35.2 },
  providerId: null,
});
assert(reqValid.success, 'Create request valid');
assert(!createRequestSchema.safeParse({ serviceType: 'invalid', origin: { latitude: 0, longitude: 0 } }).success, 'Invalid serviceType fails');

// Update status
assert(updateRequestStatusSchema.safeParse({ status: 'accepted' }).success, 'Status valid');
assert(!updateRequestStatusSchema.safeParse({ status: 'invalid' }).success, 'Invalid status fails');

// Rate
assert(rateRequestSchema.safeParse({ rating: 5 }).success, 'Rate valid');
assert(!rateRequestSchema.safeParse({ rating: 6 }).success, 'Rating > 5 fails');

console.log('All schema tests passed.');
process.exit(0);
