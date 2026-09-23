export interface EndorsementTranslatedEvent {
  eventId: string;
  eventType: 'endorsement.translated';
  occurredAt: string;
  payload: {
    policyNumber: string;
    product: string;
    endorsementType: string;
    userId: string;
    idEnvio?: number;
  };
}
