import { EndorsementTranslatorService } from '../../src/services/endorse-translator.service';
import { EndorsementCoreMapper } from '../../src/mappers/endorse-core.mapper';
import { ITemplateRepository } from '../../src/repositories/template.repository';
import { IEventPublisher } from '../../src/publishers/event-publisher.interface';
import { EndorseRequestDto } from '../../src/entities';
import { EndorsementTemplate, Product, EndorsementType } from '../../src/models';

describe('EndorsementTranslatorService (Unit)', () => {
  let service: EndorsementTranslatorService;
  let mockRepo: jest.Mocked<ITemplateRepository>;
  let mockPublisher: jest.Mocked<IEventPublisher>;
  let mapper: EndorsementCoreMapper;

  const mockProduct = new Product();
  mockProduct.code = 'Rumbo';
  mockProduct.name = 'Rumbo';

  const mockType = new EndorsementType();
  mockType.code = 'CambioFrecuencia';
  mockType.name = 'CambioFrecuencia';

  const mockTemplate = new EndorsementTemplate();
  mockTemplate.product = mockProduct;
  mockTemplate.endorsementType = mockType;
  mockTemplate.fieldConfigs = [];
  mockTemplate.eventConfigs = [];

  beforeEach(() => {
    mockRepo = {
      findByProductAndType: jest.fn(),
    };

    mockPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mapper = new EndorsementCoreMapper();
    service = new EndorsementTranslatorService(mockRepo, mapper, mockPublisher);
  });

  it('should throw Boom.notFound when template is not found in database', async () => {
    mockRepo.findByProductAndType.mockResolvedValue(null);

    const dto: EndorseRequestDto = {
      policyNumber: '123',
      frecuencia: 'Mensual',
      tipoEndoso: 'Inexistente',
      producto: 'NoExiste',
      plan: 'PlanX',
      moneda: 'Soles',
      usuario: 'user1',
    };

    await expect(service.translate(dto)).rejects.toThrow(
      /Template configuration not found for product 'NoExiste' and endorsement type 'Inexistente'/
    );

    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });

  it('should successfully translate and publish domain event', async () => {
    mockRepo.findByProductAndType.mockResolvedValue(mockTemplate);

    const dto: EndorseRequestDto = {
      policyNumber: 'POL-100',
      idEnvio: 101,
      frecuencia: 'Mensual',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanX',
      moneda: 'Soles',
      usuario: 'user1',
    };

    const result = await service.translate(dto);

    expect(result).toBeDefined();
    expect(result.policyNumber).toBe('POL-100');
    expect(mockPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledWith(
      'endorsements.translated',
      expect.objectContaining({
        eventType: 'endorsement.translated',
        payload: expect.objectContaining({
          policyNumber: 'POL-100',
          product: 'Rumbo',
          endorsementType: 'CambioFrecuencia',
          userId: 'user1',
          idEnvio: 101,
        }),
      })
    );
  });
});
