import { env } from './config/env.js';
import { app } from './app.js';

app.listen(env.PORT, () => {
  if (env.NODE_ENV !== 'production') {
    console.info(`Server listening on port ${env.PORT}`);
  }
});
