/**
 * Route smoke tests: 401/403/400 + mock Bearer tokens.
 * When DATABASE_URL is unset or DB unreachable, some handlers return 500 (Prisma) — allowed where noted.
 * Run: npx tsx src/test/integration/routesApi.test.ts
 */
import request from 'supertest';
import { app } from '../../app.js';

const U = {
  user: 'Bearer mock-access-user',
  mechanic: 'Bearer mock-access-mechanic',
  admin: 'Bearer mock-access-admin',
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

/** Prisma may be unavailable in CI — accept 200 or 500 for DB-backed success-style routes */
function ok200or500(status: number): boolean {
  return status === 200 || status === 500;
}

async function main() {
  const agent = request(app);

  const regInvalid = await agent.post('/auth/register').send({ email: 'bad' });
  assert(regInvalid.status === 400, `register invalid expected 400, got ${regInvalid.status}`);

  const refreshInvalid = await agent.post('/auth/refresh').send({});
  assert(refreshInvalid.status === 400, `refresh {} expected 400, got ${refreshInvalid.status}`);

  const meNoAuth = await agent.get('/auth/me');
  assert(meNoAuth.status === 401, `/auth/me no auth expected 401, got ${meNoAuth.status}`);

  const meMock = await agent.get('/auth/me').set('Authorization', U.user);
  assert(
    [404, 500].includes(meMock.status),
    `/auth/me mock user expected 404 (not found) or 500 (DB), got ${meMock.status}`,
  );

  const logout = await agent.post('/auth/logout');
  assert(logout.status === 204, `logout expected 204, got ${logout.status}`);

  const dashNoAuth = await agent.get('/dashboard/mechanic');
  assert(dashNoAuth.status === 401, `dashboard/mechanic no auth expected 401`);

  const dashWrongRole = await agent.get('/dashboard/mechanic').set('Authorization', U.user);
  assert(dashWrongRole.status === 403, `dashboard/mechanic as user expected 403`);

  const dashMech = await agent.get('/dashboard/mechanic').set('Authorization', U.mechanic);
  assert(ok200or500(dashMech.status), `dashboard/mechanic expected 200 or 500, got ${dashMech.status}`);

  const adminNoAuth = await agent.get('/admin/dashboard');
  assert(adminNoAuth.status === 401, `admin/dashboard no auth 401`);

  const adminForbidden = await agent.get('/admin/dashboard').set('Authorization', U.user);
  assert(adminForbidden.status === 403, `admin/dashboard as user 403`);

  const adminOk = await agent.get('/admin/dashboard').set('Authorization', U.admin);
  assert(ok200or500(adminOk.status), `admin/dashboard expected 200 or 500, got ${adminOk.status}`);

  const adminUsersInvalid = await agent.patch('/admin/users/x/block').set('Authorization', U.admin).send({});
  assert(adminUsersInvalid.status === 400, `admin block invalid body 400`);

  const chatNoAuth = await agent.get('/chat/conversations');
  assert(chatNoAuth.status === 401, 'chat conversations 401');

  const chatOk = await agent.get('/chat/conversations').set('Authorization', U.user);
  assert(chatOk.status === 200, 'chat conversations 200');
  assert(Array.isArray(chatOk.body), 'conversations array');

  const chatMsgInvalid = await agent
    .post('/chat/conversations/req-1/messages')
    .set('Authorization', U.user)
    .send({});
  assert(chatMsgInvalid.status === 400, 'chat message invalid 400');

  const notifNoAuth = await agent.get('/notifications');
  assert(notifNoAuth.status === 401, 'notifications list 401');

  const notifOk = await agent.get('/notifications').set('Authorization', U.user);
  assert(notifOk.status === 200, 'notifications 200');

  const notifRegInvalid = await agent.post('/notifications/register').set('Authorization', U.user).send({});
  assert(notifRegInvalid.status === 400, 'notifications register 400');

  const notifUnreg = await agent.post('/notifications/unregister');
  assert(notifUnreg.status === 204, 'notifications unregister 204');

  const nearbyInvalid = await agent.get('/providers/nearby');
  assert(nearbyInvalid.status === 400, 'nearby missing query 400');

  const nearbyOk = await agent.get('/providers/nearby').query({ lat: 25.2, lng: 55.27 });
  assert(nearbyOk.status === 200, 'nearby 200');
  assert(Array.isArray(nearbyOk.body?.items), 'nearby items');

  const provMe = await agent.get('/providers/me').set('Authorization', U.mechanic);
  assert(ok200or500(provMe.status), 'providers/me 200 or 500');

  const locInvalid = await agent
    .patch('/providers/me/location')
    .set('Authorization', U.mechanic)
    .send({});
  assert(locInvalid.status === 400, 'location patch 400');

  const reqNoAuth = await agent.get('/requests/customer');
  assert(reqNoAuth.status === 401, 'requests customer 401');

  const reqCreateInvalid = await agent.post('/requests').set('Authorization', U.user).send({ serviceType: 'bad' });
  assert(reqCreateInvalid.status === 400, 'create request 400');

  const reqList = await agent.get('/requests/customer').set('Authorization', U.user);
  assert(ok200or500(reqList.status), 'requests customer 200 or 500');

  const vehNoAuth = await agent.get('/providers/vehicles');
  assert(vehNoAuth.status === 401, 'vehicles list 401');

  const vehInvalid = await agent.post('/providers/vehicles').set('Authorization', U.mechanic).send({ name: '' });
  assert(vehInvalid.status === 400, 'vehicle create 400');

  const vehList = await agent.get('/providers/vehicles').set('Authorization', U.mechanic);
  assert(ok200or500(vehList.status), 'vehicles list 200 or 500');

  const upNoAuth = await agent.post('/uploads/vehicle-image');
  assert(upNoAuth.status === 401, 'upload no auth 401');

  const upNoFile = await agent.post('/uploads/vehicle-image').set('Authorization', U.user);
  assert(upNoFile.status === 400, 'upload no file 400');

  const upOk = await agent
    .post('/uploads/vehicle-image')
    .set('Authorization', U.user)
    .attach('file', Buffer.from('fake'), 't.png');
  assert(upOk.status === 201, `upload 201, got ${upOk.status}`);
  assert(typeof upOk.body?.url === 'string', 'upload url');

  console.log('All routes API checks passed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
