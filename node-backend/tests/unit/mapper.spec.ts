import { EndorsementCoreMapper } from '../../src/mappers/endorse-core.mapper';
import { EndorseRequestDto } from '../../src/entities';
import { EndorsementTemplate, Product, EndorsementType } from '../../src/models';

describe('EndorsementCoreMapper (Unit)', () => {
  let mapper: EndorsementCoreMapper;
  let mockTemplate: EndorsementTemplate;

  beforeEach(() => {
    mapper = new EndorsementCoreMapper();

    const product = new Product();
    product.code = 'Rumbo';
    product.name = 'Seguro de Vida Rumbo';

    const endoType = new EndorsementType();
    endoType.code = 'CambioFrecuencia';
    endoType.name = 'Cambio de Frecuencia de Pago';

    mockTemplate = new EndorsementTemplate();
    mockTemplate.id = '33333333-3333-3333-3333-333333333333';
    mockTemplate.product = product;
    mockTemplate.endorsementType = endoType;
    mockTemplate.eventDescription = 'SolicitarEndoso';
    mockTemplate.structureMetadata = {
      riskUnitNumber: '1',
      insuranceObjectNumber: '1',
    };
    mockTemplate.isActive = true;

    // 12 fields matching the PDF exactly
    mockTemplate.fieldConfigs = [
      { id: '1', templateId: mockTemplate.id, label: 'ProductosVida', sourceField: 'producto', defaultValue: null, isRequired: true, displayOrder: 1, createdAt: new Date(), template: mockTemplate },
      { id: '2', templateId: mockTemplate.id, label: 'NombreUsuario', sourceField: 'usuario', defaultValue: null, isRequired: true, displayOrder: 2, createdAt: new Date(), template: mockTemplate },
      { id: '3', templateId: mockTemplate.id, label: 'NumeroPolizaEndoso', sourceField: 'policyNumber', defaultValue: null, isRequired: true, displayOrder: 3, createdAt: new Date(), template: mockTemplate },
      { id: '4', templateId: mockTemplate.id, label: 'TipoEndosoPol', sourceField: null, defaultValue: 'Endoso Simple', isRequired: true, displayOrder: 4, createdAt: new Date(), template: mockTemplate },
      { id: '5', templateId: mockTemplate.id, label: 'ResponsableAtencion', sourceField: null, defaultValue: 'SAC', isRequired: true, displayOrder: 5, createdAt: new Date(), template: mockTemplate },
      { id: '6', templateId: mockTemplate.id, label: 'EndosoModifPrima', sourceField: null, defaultValue: 'Si', isRequired: true, displayOrder: 6, createdAt: new Date(), template: mockTemplate },
      { id: '7', templateId: mockTemplate.id, label: 'InicioVigenciaEndoso', sourceField: null, defaultValue: 'Default', isRequired: true, displayOrder: 7, createdAt: new Date(), template: mockTemplate },
      { id: '8', templateId: mockTemplate.id, label: 'TipoVigenciaEndoso', sourceField: null, defaultValue: '', isRequired: false, displayOrder: 8, createdAt: new Date(), template: mockTemplate },
      { id: '9', templateId: mockTemplate.id, label: 'EndososSimplesSACRumbo', sourceField: null, defaultValue: 'TES008', isRequired: true, displayOrder: 9, createdAt: new Date(), template: mockTemplate },
      { id: '10', templateId: mockTemplate.id, label: 'FechaSolicitud', sourceField: 'fechaSolicitud', defaultValue: null, isRequired: true, displayOrder: 10, createdAt: new Date(), template: mockTemplate },
      { id: '11', templateId: mockTemplate.id, label: 'FechaCliente', sourceField: 'fechaCliente', defaultValue: null, isRequired: true, displayOrder: 11, createdAt: new Date(), template: mockTemplate },
      { id: '12', templateId: mockTemplate.id, label: 'FechaEfectiva', sourceField: 'fechaEfectiva', defaultValue: null, isRequired: true, displayOrder: 12, createdAt: new Date(), template: mockTemplate },
    ];

    mockTemplate.eventConfigs = [
      { id: 'e1', templateId: mockTemplate.id, eventDescription: 'SolicitarEndoso', orderEvent: 1, createdAt: new Date(), template: mockTemplate },
      { id: 'e2', templateId: mockTemplate.id, eventDescription: 'AprobarEndoso', orderEvent: 2, createdAt: new Date(), template: mockTemplate },
    ];
  });

  it('should transform the PDF example payload into the exact expected Core JSON', () => {
    const input: EndorseRequestDto = {
      policyNumber: '08200000049',
      idEnvio: 5984,
      frecuencia: 'Semestral',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanRumbo',
      moneda: 'Nuevo Sol',
      usuario: 'interface.servicios',
      fechaSolicitud: '2025-08-27',
      fechaCliente: '2025-08-27',
      fechaEfectiva: '2025-09-01',
    };

    const output = mapper.toCoreJson(input, mockTemplate);

    // Assert Root fields
    expect(output.policyNumber).toBe('08200000049');
    expect(output.idEnvio).toBe(5984);
    expect(output.financialPlansEntity).toEqual({ description: 'Semestral' });
    expect(output.currency).toEqual({ description: 'Nuevo Sol' });
    expect(output.productEntity).toEqual({ description: 'Rumbo' });
    expect(output.eventEntity.description).toBe('SolicitarEndoso');

    // Assert dynamicData contains 12 items in exact order
    expect(output.eventEntity.dynamicData).toHaveLength(12);
    expect(output.eventEntity.dynamicData).toEqual([
      { etiqueta: 'ProductosVida', value: 'Rumbo' },
      { etiqueta: 'NombreUsuario', value: 'interface.servicios' },
      { etiqueta: 'NumeroPolizaEndoso', value: '08200000049' },
      { etiqueta: 'TipoEndosoPol', value: 'Endoso Simple' },
      { etiqueta: 'ResponsableAtencion', value: 'SAC' },
      { etiqueta: 'EndosoModifPrima', value: 'Si' },
      { etiqueta: 'InicioVigenciaEndoso', value: 'Default' },
      { etiqueta: 'TipoVigenciaEndoso', value: '' },
      { etiqueta: 'EndososSimplesSACRumbo', value: 'TES008' },
      { etiqueta: 'FechaSolicitud', value: '2025-08-27' },
      { etiqueta: 'FechaCliente', value: '2025-08-27' },
      { etiqueta: 'FechaEfectiva', value: '2025-09-01' },
    ]);

    // Assert eventAppliedEntities
    expect(output.eventAppliedEntities).toEqual([
      { description: 'SolicitarEndoso', orderEvent: 1 },
      { description: 'AprobarEndoso', orderEvent: 2 },
    ]);

    // Assert riskUnitEntities
    expect(output.riskUnitEntities).toEqual([
      {
        insuranceObjectEntities: [
          {
            insuranceObjectNumber: '1',
            coverageEntities: [],
            participationEntities: [],
          },
        ],
        plansEntity: {
          description: 'PlanRumbo',
        },
        riskUnitNumber: '1',
      },
    ]);

    expect(output.participationEntities).toEqual([]);
  });

  it('should throw Boom badRequest when a required field without a default is missing', () => {
    const inputWithoutUser: EndorseRequestDto = {
      policyNumber: '08200000049',
      frecuencia: 'Semestral',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanRumbo',
      moneda: 'Nuevo Sol',
      usuario: '', // Empty or missing
    };

    // Make NombreUsuario fail by providing null/undefined
    delete (inputWithoutUser as any).usuario;

    expect(() => mapper.toCoreJson(inputWithoutUser, mockTemplate)).toThrow(
      /Missing required fields.*NombreUsuario/
    );
  });

  it('should correctly use defaults when payload does not send optional fields', () => {
    const input: EndorseRequestDto = {
      policyNumber: 'POL-1234',
      frecuencia: 'Anual',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanOro',
      moneda: 'Dolares',
      usuario: 'test.user',
      fechaSolicitud: '2026-01-01',
      fechaCliente: '2026-01-01',
      fechaEfectiva: '2026-02-01',
    };

    const output = mapper.toCoreJson(input, mockTemplate);
    const tipoEndosoItem = output.eventEntity.dynamicData.find(
      (d) => d.etiqueta === 'TipoEndosoPol'
    );
    expect(tipoEndosoItem?.value).toBe('Endoso Simple');
  });
});
