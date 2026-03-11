/**
 * Integration tests: health and auth validation.
 * Run with: npx tsx src/test/integration/healthAndAuth.test.ts
 * Requires: npm install supertest @types/supertest (dev)
 */
import request from 'supertest';
import { app } from '../../app.js';

async function main() {
  const agent = request(app);

  const healthRes = await agent.get('/health');
  if (healthRes.status !== 200) {
    throw new Error(`GET /health expected 200, got ${healthRes.status}`);
  }
  if (!healthRes.body?.status || healthRes.body.status !== 'ok') {
    throw new Error('GET /health body.status should be "ok"');
  }
  console.log('GET /health: 200 OK');

  const loginNoBody = await agent.post('/auth/login').send({});
  if (loginNoBody.status !== 400) {
    throw new Error(`POST /auth/login {} expected 400 (validation), got ${loginNoBody.status}`);
  }
  console.log('POST /auth/login (empty body): 400 validation');

  const loginInvalidEmail = await agent.post('/auth/login').send({ email: 'not-an-email', password: 'x' });
  if (loginInvalidEmail.status !== 400) {
    throw new Error(`POST /auth/login invalid email expected 400, got ${loginInvalidEmail.status}`);
  }
  console.log('POST /auth/login (invalid email): 400 validation');

  console.log('All integration checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
