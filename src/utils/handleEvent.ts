import { EmbedEvents } from '../types';

type EventHandler = {
  [key in EmbedEvents['event']]?: (
    data: Extract<EmbedEvents, { event: key }>
  ) => void;
};

export function handleEvent(
  event: MessageEvent,
  handlers: EventHandler,
  iframeUrl?: string
) {
  const allowedOrigins = new Set<string>();

  // Backwards compatibility with the old default
  allowedOrigins.add('https://embed.diagrams.net');

  if (iframeUrl) {
    try {
      const resolved =
        typeof window !== 'undefined'
          ? new URL(iframeUrl, window.location.href)
          : new URL(iframeUrl);
      allowedOrigins.add(resolved.origin);
    } catch {
      // ignore
    }
  }

  if (allowedOrigins.size > 0 && !allowedOrigins.has(event.origin)) return;

  try {
    const data = JSON.parse(event.data) as EmbedEvents;

    if (data.event in handlers) {
      const handler = handlers[data.event];

      if (handler) {
        // @ts-ignore Not sure how to fix for now
        handler(data);
      }
    }
  } catch {
    //
  }
}
