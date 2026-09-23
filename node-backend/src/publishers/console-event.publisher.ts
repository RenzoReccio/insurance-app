import { IEventPublisher } from './event-publisher.interface';

export class ConsoleEventPublisher implements IEventPublisher {
  async publish<T>(topic: string, event: T): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      layer: 'PUBLISHER',
      topic,
      event,
    };
    console.log(`[Publisher][${topic}] Event published:\n`, JSON.stringify(logEntry, null, 2));
  }
}
