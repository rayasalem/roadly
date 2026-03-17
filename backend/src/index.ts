import { env } from './config/env.js';
import { app } from './app.js';
import { connectDatabase } from './lib/prisma.js';
import { createUser, findUserByEmail } from './store/authStore.js';

async function seedDevUser() {
  if (env.NODE_ENV === 'production') return;
  const email = 'raya@example.com';
  const password = '123321';
  const existing = await findUserByEmail(email);
  if (existing) return;
  try {
    await createUser('Raya', email, password, 'user');
    console.info(`[seed] Dev user created: ${email} / ${password}`);
  } catch {
    // already exists or other error
  }
}

async function main() {
  try {
    await connectDatabase();
    await seedDevUser();
  } catch (err) {
    console.error('Database connection failed:', err instanceof Error ? err.message : err);
    console.error('Set DATABASE_URL in .env and ensure PostgreSQL is running. Server will start anyway; /health works, other endpoints may fail.');
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    console.info(`Server running on http://localhost:${env.PORT}`);
    if (env.NODE_ENV !== 'production') {
      console.info(`Also on http://0.0.0.0:${env.PORT} (LAN: use your PC IP, e.g. http://192.168.x.x:${env.PORT})`);
    }
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
