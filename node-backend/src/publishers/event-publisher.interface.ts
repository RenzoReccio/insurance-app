export interface IEventPublisher {
  publish<T>(topic: string, event: T): Promise<void>;
}
