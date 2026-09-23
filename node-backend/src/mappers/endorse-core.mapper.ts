import Boom from '@hapi/boom';
import { EndorseRequestDto, CoreResponseDto, DynamicDataItem, EventAppliedEntityItem } from '../entities';
import { EndorsementTemplate } from '../models';

export class EndorsementCoreMapper {
  /**
   * Transforms a flat EndorseRequestDto and an EndorsementTemplate into the Core structured JSON.
   */
  toCoreJson(dto: EndorseRequestDto, template: EndorsementTemplate): CoreResponseDto {
    // 1. Build and validate dynamicData strictly ordered by displayOrder
    const sortedFieldConfigs = [...(template.fieldConfigs || [])].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    const missingFields: string[] = [];
    const dynamicData: DynamicDataItem[] = [];

    for (const field of sortedFieldConfigs) {
      let resolvedValue: string | null = null;

      // Check if source_field is provided in payload
      if (field.sourceField && dto[field.sourceField] !== undefined && dto[field.sourceField] !== null) {
        resolvedValue = String(dto[field.sourceField]);
      } else if (field.defaultValue !== null && field.defaultValue !== undefined) {
        resolvedValue = field.defaultValue;
      }

      // Check mandatory constraint
      if (field.isRequired && resolvedValue === null) {
        missingFields.push(field.label);
      } else {
        dynamicData.push({
          etiqueta: field.label,
          value: resolvedValue ?? '',
        });
      }
    }

    if (missingFields.length > 0) {
      throw Boom.badRequest(
        `Missing required fields for configured template (${template.product?.code ?? 'Product'} / ${template.endorsementType?.code ?? 'Endorsement'}): [${missingFields.join(', ')}]`
      );
    }

    // 2. Build eventAppliedEntities strictly ordered by orderEvent
    const sortedEventConfigs = [...(template.eventConfigs || [])].sort(
      (a, b) => a.orderEvent - b.orderEvent
    );

    const eventAppliedEntities: EventAppliedEntityItem[] = sortedEventConfigs.map((event) => ({
      description: event.eventDescription,
      orderEvent: event.orderEvent,
    }));

    // 3. Build riskUnitEntities
    const riskUnitNumber = template.structureMetadata?.riskUnitNumber || '1';
    const insuranceObjectNumber = template.structureMetadata?.insuranceObjectNumber || '1';

    const riskUnitEntities = [
      {
        insuranceObjectEntities: [
          {
            insuranceObjectNumber,
            coverageEntities: [],
            participationEntities: [],
          },
        ],
        plansEntity: {
          description: dto.plan,
        },
        riskUnitNumber,
      },
    ];

    // 4. Assemble final CoreResponseDto matching exact property order
    const response: CoreResponseDto = {
      policyNumber: dto.policyNumber,
      ...(dto.idEnvio !== undefined ? { idEnvio: dto.idEnvio } : {}),
      financialPlansEntity: {
        description: dto.frecuencia,
      },
      currency: {
        description: dto.moneda,
      },
      productEntity: {
        description: dto.producto,
      },
      eventEntity: {
        description: template.eventDescription || 'SolicitarEndoso',
        dynamicData,
      },
      eventAppliedEntities,
      riskUnitEntities,
      participationEntities: [],
    };

    return response;
  }
}
