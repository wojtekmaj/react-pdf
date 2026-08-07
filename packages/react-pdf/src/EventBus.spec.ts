import { describe, expect, it, vi } from 'vitest';

import EventBus from './EventBus.js';

describe('EventBus', () => {
  it('dispatches events to listeners', () => {
    const eventBus = new EventBus();
    const listener = vi.fn();
    const data = { value: 'event data' };

    eventBus.on('event', listener);
    eventBus.dispatch('event', data);

    expect(listener).toHaveBeenCalledExactlyOnceWith(data);
  });

  it('dispatches internal listeners before external listeners', () => {
    const eventBus = new EventBus();
    const calls: string[] = [];

    eventBus.on('event', () => calls.push('external'));
    eventBus._on('event', () => calls.push('internal'));
    eventBus.dispatch('event', undefined);

    expect(calls).toEqual(['internal', 'external']);
  });

  it('dispatches a once listener only once', () => {
    const eventBus = new EventBus();
    const listener = vi.fn();

    eventBus.on('event', listener, { once: true });
    eventBus.dispatch('event', undefined);
    eventBus.dispatch('event', undefined);

    expect(listener).toHaveBeenCalledOnce();
  });

  it('removes a listener when its abort signal fires', () => {
    const eventBus = new EventBus();
    const listener = vi.fn();
    const abortController = new AbortController();

    eventBus.on('event', listener, { signal: abortController.signal });
    abortController.abort();
    eventBus.dispatch('event', undefined);

    expect(listener).not.toHaveBeenCalled();
  });
});
