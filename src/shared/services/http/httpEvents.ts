import type { HttpError } from './types';
import { createEventBus } from '../../utils/eventBus';

type Events = {
  httpError: HttpError;
  /** Emitted when refresh fails or 401 and we must clear session and redirect to Login */
  unauthorized: void;
};

export const httpEvents = createEventBus<Events>();

