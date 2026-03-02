import type { HttpError } from './types';
import { createEventBus } from '../../utils/eventBus';

type Events = {
  httpError: HttpError;
};

export const httpEvents = createEventBus<Events>();

