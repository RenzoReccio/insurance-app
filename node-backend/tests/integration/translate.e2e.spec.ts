import Hapi, { ServerRoute } from '@hapi/hapi';
import HapiJwt from '@hapi/jwt';
import { registerJwtAuth } from '../../src/plugins/jwt.plugin';
import { registerErrorHandler } from '../../src/plugins/error-handler.plugin';
import { AuthController } from '../../src/controllers/auth.controller';
import { EndorseController } from '../../src/controllers/endorse.controller';
import { EndorsementTranslatorService } from '../../src/services/endorse-translator.service';
import { EndorsementCoreMapper } from '../../src/mappers/endorse-core.mapper';
import { ConsoleEventPublisher } from '../../src/publishers/console-event.publisher';
import { ITemplateRepository } from '../../src/repositories/template.repository';
import { createAuthRoutes } from '../../src/routes/v1/auth.routes';
import { createEndorseRoutes } from '../../src/routes/v1/endorse.routes';
import { EndorsementTemplate, Product, EndorsementType } from '../../src/models';

describe('HTTP Endpoints & Integration (E2E Injection)', () => {
  let server: Hapi.Server;
  let mockRepo: jest.Mocked<ITemplateRepository>;

  const mockProduct = new Product();
  mockProduct.code = 'Rumbo';
  mockProduct.name = 'Seguro Rumbo';

  const mockType = new EndorsementType();
  mockType.code = 'CambioFrecuencia';
  mockType.name = 'Cambio de Frecuencia';

  const seededTemplate = new EndorsementTemplate();
  seededTemplate.product = mockProduct;
  seededTemplate.endorsementType = mockType;
  seededTemplate.eventDescription = 'SolicitarEndoso';
  seededTemplate.structureMetadata = { riskUnitNumber: '1', insuranceObjectNumber: '1' };
  seededTemplate.fieldConfigs = [
    { id: '1', templateId: '1', label: 'ProductosVida', sourceField: 'producto', defaultValue: null, isRequired: true, displayOrder: 1, createdAt: new Date(), template: seededTemplate },
    { id: '2', templateId: '1', label: 'NombreUsuario', sourceField: 'usuario', defaultValue: null, isRequired: true, displayOrder: 2, createdAt: new Date(), template: seededTemplate },
    { id: '3', templateId: '1', label: 'NumeroPolizaEndoso', sourceField: 'policyNumber', defaultValue: null, isRequired: true, displayOrder: 3, createdAt: new Date(), template: seededTemplate },
    { id: '4', templateId: '1', label: 'TipoEndosoPol', sourceField: null, defaultValue: 'Endoso Simple', isRequired: true, displayOrder: 4, createdAt: new Date(), template: seededTemplate },
    { id: '5', templateId: '1', label: 'ResponsableAtencion', sourceField: null, defaultValue: 'SAC', isRequired: true, displayOrder: 5, createdAt: new Date(), template: seededTemplate },
    { id: '6', templateId: '1', label: 'EndosoModifPrima', sourceField: null, defaultValue: 'Si', isRequired: true, displayOrder: 6, createdAt: new Date(), template: seededTemplate },
    { id: '7', templateId: '1', label: 'InicioVigenciaEndoso', sourceField: null, defaultValue: 'Default', isRequired: true, displayOrder: 7, createdAt: new Date(), template: seededTemplate },
    { id: '8', templateId: '1', label: 'TipoVigenciaEndoso', sourceField: null, defaultValue: '', isRequired: false, displayOrder: 8, createdAt: new Date(), template: seededTemplate },
    { id: '9', templateId: '1', label: 'EndososSimplesSACRumbo', sourceField: null, defaultValue: 'TES008', isRequired: true, displayOrder: 9, createdAt: new Date(), template: seededTemplate },
    { id: '10', templateId: '1', label: 'FechaSolicitud', sourceField: 'fechaSolicitud', defaultValue: null, isRequired: true, displayOrder: 10, createdAt: new Date(), template: seededTemplate },
    { id: '11', templateId: '1', label: 'FechaCliente', sourceField: 'fechaCliente', defaultValue: null, isRequired: true, displayOrder: 11, createdAt: new Date(), template: seededTemplate },
    { id: '12', templateId: '1', label: 'FechaEfectiva', sourceField: 'fechaEfectiva', defaultValue: null, isRequired: true, displayOrder: 12, createdAt: new Date(), template: seededTemplate },
  ];
  seededTemplate.eventConfigs = [
    { id: '1', templateId: '1', eventDescription: 'SolicitarEndoso', orderEvent: 1, createdAt: new Date(), template: seededTemplate },
    { id: '2', templateId: '1', eventDescription: 'AprobarEndoso', orderEvent: 2, createdAt: new Date(), template: seededTemplate },
  ];

  beforeAll(async () => {
    server = Hapi.server({ port: 3001, host: 'localhost' });

    mockRepo = {
      findByProductAndType: jest.fn().mockImplementation(async (product, endoType) => {
        if (product.toLowerCase() === 'rumbo' && endoType.toLowerCase() === 'cambiofrecuencia') {
          return seededTemplate;
        }
        return null;
      }),
    };

    const mapper = new EndorsementCoreMapper();
    const publisher = new ConsoleEventPublisher();
    const translatorService = new EndorsementTranslatorService(mockRepo, mapper, publisher);

    const authController = new AuthController();
    const endorseController = new EndorseController(translatorService);

    await registerJwtAuth(server);
    registerErrorHandler(server);

    const routes: ServerRoute[] = [
      ...createAuthRoutes(authController),
      ...createEndorseRoutes(endorseController),
    ];
    server.route(routes);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('1. should generate a JWT access token via POST /v1/auth/token', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/v1/auth/token',
      payload: {
        username: 'interface.servicios',
        role: 'service',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.accessToken).toBeDefined();
    expect(body.tokenType).toBe('Bearer');
    expect(body.user.username).toBe('interface.servicios');
  });

  it('2. should reject requests to /v1/endorse/translate without Authorization header (401)', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/v1/endorse/translate',
      payload: {
        policyNumber: '08200000049',
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('3. should successfully translate payload when authenticated with JWT token', async () => {
    // Obtain valid token
    const tokenRes = await server.inject({
      method: 'POST',
      url: '/v1/auth/token',
      payload: {},
    });
    const token = JSON.parse(tokenRes.payload).accessToken;

    // Send translation request
    const translateRes = await server.inject({
      method: 'POST',
      url: '/v1/endorse/translate',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
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
      },
    });

    expect(translateRes.statusCode).toBe(200);
    const result = JSON.parse(translateRes.payload);

    expect(result.policyNumber).toBe('08200000049');
    expect(result.idEnvio).toBe(5984);
    expect(result.financialPlansEntity.description).toBe('Semestral');
    expect(result.currency.description).toBe('Nuevo Sol');
    expect(result.productEntity.description).toBe('Rumbo');
    expect(result.eventEntity.dynamicData).toHaveLength(12);
    expect(result.eventEntity.dynamicData[0]).toEqual({ etiqueta: 'ProductosVida', value: 'Rumbo' });
    expect(result.eventEntity.dynamicData[4]).toEqual({ etiqueta: 'ResponsableAtencion', value: 'SAC' });
    expect(result.eventAppliedEntities).toHaveLength(2);
    expect(result.riskUnitEntities[0].plansEntity.description).toBe('PlanRumbo');
  });

  it('4. should also respond on alias /endorse/translate (legacy route)', async () => {
    const tokenRes = await server.inject({
      method: 'POST',
      url: '/v1/auth/token',
      payload: {},
    });
    const token = JSON.parse(tokenRes.payload).accessToken;

    const translateRes = await server.inject({
      method: 'POST',
      url: '/endorse/translate',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        policyNumber: '08200000049',
        frecuencia: 'Semestral',
        tipoEndoso: 'CambioFrecuencia',
        producto: 'Rumbo',
        plan: 'PlanRumbo',
        moneda: 'Nuevo Sol',
        usuario: 'interface.servicios',
        fechaSolicitud: '2025-08-27',
        fechaCliente: '2025-08-27',
        fechaEfectiva: '2025-09-01',
      },
    });

    expect(translateRes.statusCode).toBe(200);
  });

  it('5. should return 404 Not Found when product template does not exist', async () => {
    const tokenRes = await server.inject({
      method: 'POST',
      url: '/v1/auth/token',
      payload: {},
    });
    const token = JSON.parse(tokenRes.payload).accessToken;

    const res = await server.inject({
      method: 'POST',
      url: '/v1/endorse/translate',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        policyNumber: '08200000049',
        frecuencia: 'Semestral',
        tipoEndoso: 'EndosoDesconocido',
        producto: 'ProductoDesconocido',
        plan: 'PlanRumbo',
        moneda: 'Nuevo Sol',
        usuario: 'interface.servicios',
      },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.message).toMatch(/Template configuration not found/);
  });

  it('6. should return 400 Bad Request when mandatory Joi body fields are missing', async () => {
    const tokenRes = await server.inject({
      method: 'POST',
      url: '/v1/auth/token',
      payload: {},
    });
    const token = JSON.parse(tokenRes.payload).accessToken;

    const res = await server.inject({
      method: 'POST',
      url: '/v1/endorse/translate',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        // Missing policyNumber, frecuencia, etc.
        producto: 'Rumbo',
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
