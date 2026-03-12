import { env } from './config/env.js';
import { app } from './app.js';

app.listen(env.PORT, '0.0.0.0', () => {
  if (env.NODE_ENV !== 'production') {
    console.info(`Server listening on http://0.0.0.0:${env.PORT} (LAN: use your PC IP, e.g. http://192.168.x.x:${env.PORT})`);
  }
});
