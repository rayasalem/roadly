import { env } from './config/env.js';
import { app } from './app.js';
import { createUser, findUserByEmail } from './store/authStore.js';

async function seedDevUser() {
  if (env.NODE_ENV === 'production') return;
  const email = 'raya@example.com';
  const password = '123321';
  if (findUserByEmail(email)) return;
  try {
    await createUser('Raya', email, password, 'user');
    console.info(`[seed] Dev user created: ${email} / ${password}`);
  } catch {
    // already exists or other error
  }
}

seedDevUser().then(() => {
  app.listen(env.PORT, '0.0.0.0', () => {
    if (env.NODE_ENV !== 'production') {
      console.info(`Server listening on http://0.0.0.0:${env.PORT} (LAN: use your PC IP, e.g. http://192.168.x.x:${env.PORT})`);
    }
  });
});
