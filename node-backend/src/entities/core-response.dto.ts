export interface DynamicDataItem {
  etiqueta: string;
  value: string;
}

export interface EventAppliedEntityItem {
  description: string;
  orderEvent: number;
}

export interface InsuranceObjectEntity {
  insuranceObjectNumber: string;
  coverageEntities: any[];
  participationEntities: any[];
}

export interface RiskUnitEntity {
  insuranceObjectEntities: InsuranceObjectEntity[];
  plansEntity: {
    description: string;
  };
  riskUnitNumber: string;
}

export interface CoreResponseDto {
  policyNumber: string;
  idEnvio?: number;
  financialPlansEntity: {
    description: string;
  };
  currency: {
    description: string;
  };
  productEntity: {
    description: string;
  };
  eventEntity: {
    description: string;
    dynamicData: DynamicDataItem[];
  };
  eventAppliedEntities: EventAppliedEntityItem[];
  riskUnitEntities: RiskUnitEntity[];
  participationEntities: any[];
}
