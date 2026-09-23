import Boom from '@hapi/boom';
import crypto from 'crypto';
import { EndorseRequestDto, CoreResponseDto, EndorsementTranslatedEvent } from '../entities';
import { ITemplateRepository } from '../repositories/template.repository';
import { EndorsementCoreMapper } from '../mappers/endorse-core.mapper';
import { IEventPublisher } from '../publishers/event-publisher.interface';

export class EndorsementTranslatorService {
  constructor(
    private readonly templateRepo: ITemplateRepository,
    private readonly mapper: EndorsementCoreMapper,
    private readonly publisher: IEventPublisher
  ) {}

  async translate(dto: EndorseRequestDto): Promise<CoreResponseDto> {
    // 1. Fetch template by product and endorsement type
    const template = await this.templateRepo.findByProductAndType(dto.producto, dto.tipoEndoso);

    if (!template) {
      throw Boom.notFound(
        `Template configuration not found for product '${dto.producto}' and endorsement type '${dto.tipoEndoso}'`
      );
    }

    // 2. Perform transformation & validation
    const coreJson = this.mapper.toCoreJson(dto, template);

    // 3. Emit domain event via Publisher layer
    const domainEvent: EndorsementTranslatedEvent = {
      eventId: crypto.randomUUID(),
      eventType: 'endorsement.translated',
      occurredAt: new Date().toISOString(),
      payload: {
        policyNumber: dto.policyNumber,
        product: dto.producto,
        endorsementType: dto.tipoEndoso,
        userId: dto.usuario,
        idEnvio: dto.idEnvio,
      },
    };

    try {
      await this.publisher.publish('endorsements.translated', domainEvent);
    } catch (err) {
      // Non-blocking for the primary response, but logged
      console.error('[Service] Error publishing domain event:', err);
    }

    return coreJson;
  }
}
