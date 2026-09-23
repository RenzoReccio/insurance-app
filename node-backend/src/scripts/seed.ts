import 'reflect-metadata';
import { initializeDatabase, AppDataSource } from '../config/database';
import {
  Product,
  EndorsementType,
  EndorsementTemplate,
  TemplateFieldConfig,
  TemplateEventConfig,
} from '../models';

export const seedDatabase = async () => {
  const dataSource = await initializeDatabase();
  console.log('[Seed] Starting database seeding...');

  const productRepo = dataSource.getRepository(Product);
  const typeRepo = dataSource.getRepository(EndorsementType);
  const templateRepo = dataSource.getRepository(EndorsementTemplate);
  const fieldRepo = dataSource.getRepository(TemplateFieldConfig);
  const eventRepo = dataSource.getRepository(TemplateEventConfig);

  // 1. Ensure Product 'Rumbo'
  let product = await productRepo.findOne({ where: { code: 'Rumbo' } });
  if (!product) {
    product = productRepo.create({
      id: '11111111-1111-1111-1111-111111111111',
      code: 'Rumbo',
      name: 'Seguro de Vida Rumbo',
    });
    await productRepo.save(product);
    console.log('[Seed] Created product: Rumbo');
  }

  // 2. Ensure EndorsementType 'CambioFrecuencia'
  let endoType = await typeRepo.findOne({ where: { code: 'CambioFrecuencia' } });
  if (!endoType) {
    endoType = typeRepo.create({
      id: '22222222-2222-2222-2222-222222222222',
      code: 'CambioFrecuencia',
      name: 'Cambio de Frecuencia de Pago',
    });
    await typeRepo.save(endoType);
    console.log('[Seed] Created endorsement type: CambioFrecuencia');
  }

  // 3. Ensure Template
  let template = await templateRepo.findOne({
    where: { productId: product.id, endorsementTypeId: endoType.id },
  });

  if (!template) {
    template = templateRepo.create({
      id: '33333333-3333-3333-3333-333333333333',
      productId: product.id,
      endorsementTypeId: endoType.id,
      eventDescription: 'SolicitarEndoso',
      structureMetadata: {
        riskUnitNumber: '1',
        insuranceObjectNumber: '1',
      },
      isActive: true,
    });
    await templateRepo.save(template);
    console.log('[Seed] Created template for Rumbo + CambioFrecuencia');
  }

  // 4. Seed dynamicData Field configs (12 fields in exact required order)
  const existingFieldsCount = await fieldRepo.count({ where: { templateId: template.id } });
  if (existingFieldsCount === 0) {
    const fieldsToInsert: Partial<TemplateFieldConfig>[] = [
      {
        templateId: template.id,
        label: 'ProductosVida',
        sourceField: 'producto',
        defaultValue: null,
        isRequired: true,
        displayOrder: 1,
      },
      {
        templateId: template.id,
        label: 'NombreUsuario',
        sourceField: 'usuario',
        defaultValue: null,
        isRequired: true,
        displayOrder: 2,
      },
      {
        templateId: template.id,
        label: 'NumeroPolizaEndoso',
        sourceField: 'policyNumber',
        defaultValue: null,
        isRequired: true,
        displayOrder: 3,
      },
      {
        templateId: template.id,
        label: 'TipoEndosoPol',
        sourceField: null,
        defaultValue: 'Endoso Simple',
        isRequired: true,
        displayOrder: 4,
      },
      {
        templateId: template.id,
        label: 'ResponsableAtencion',
        sourceField: null,
        defaultValue: 'SAC',
        isRequired: true,
        displayOrder: 5,
      },
      {
        templateId: template.id,
        label: 'EndosoModifPrima',
        sourceField: null,
        defaultValue: 'Si',
        isRequired: true,
        displayOrder: 6,
      },
      {
        templateId: template.id,
        label: 'InicioVigenciaEndoso',
        sourceField: null,
        defaultValue: 'Default',
        isRequired: true,
        displayOrder: 7,
      },
      {
        templateId: template.id,
        label: 'TipoVigenciaEndoso',
        sourceField: null,
        defaultValue: '',
        isRequired: false,
        displayOrder: 8,
      },
      {
        templateId: template.id,
        label: 'EndososSimplesSACRumbo',
        sourceField: null,
        defaultValue: 'TES008',
        isRequired: true,
        displayOrder: 9,
      },
      {
        templateId: template.id,
        label: 'FechaSolicitud',
        sourceField: 'fechaSolicitud',
        defaultValue: null,
        isRequired: true,
        displayOrder: 10,
      },
      {
        templateId: template.id,
        label: 'FechaCliente',
        sourceField: 'fechaCliente',
        defaultValue: null,
        isRequired: true,
        displayOrder: 11,
      },
      {
        templateId: template.id,
        label: 'FechaEfectiva',
        sourceField: 'fechaEfectiva',
        defaultValue: null,
        isRequired: true,
        displayOrder: 12,
      },
    ];

    await fieldRepo.save(fieldsToInsert.map((f) => fieldRepo.create(f)));
    console.log('[Seed] Inserted 12 template field configs in exact order');
  }

  // 5. Seed eventAppliedEntities configs (2 events in exact order)
  const existingEventsCount = await eventRepo.count({ where: { templateId: template.id } });
  if (existingEventsCount === 0) {
    const eventsToInsert: Partial<TemplateEventConfig>[] = [
      {
        templateId: template.id,
        eventDescription: 'SolicitarEndoso',
        orderEvent: 1,
      },
      {
        templateId: template.id,
        eventDescription: 'AprobarEndoso',
        orderEvent: 2,
      },
    ];

    await eventRepo.save(eventsToInsert.map((e) => eventRepo.create(e)));
    console.log('[Seed] Inserted 2 template event configs in exact order');
  }

  console.log('[Seed] Database seeding completed successfully.');
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Seeding failed:', err);
      process.exit(1);
    });
}
