export type Unsubscribe = () => void;

type Listener<T> = (payload: T) => void;

export function createEventBus<Events extends Record<string, unknown>>() {
  const listeners = new Map<keyof Events, Set<Listener<any>>>();

  function on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): Unsubscribe {
    const set = listeners.get(event) ?? new Set();
    set.add(listener as Listener<any>);
    listeners.set(event, set);
    return () => {
      set.delete(listener as Listener<any>);
    };
  }

  function emit<K extends keyof Events>(event: K, payload: Events[K]) {
    const set = listeners.get(event);
    if (!set) return;
    for (const listener of set) listener(payload);
  }

  return { on, emit } as const;
}

