import Joi from 'joi';

export interface EndorseRequestDto {
  policyNumber: string;
  idEnvio?: number;
  frecuencia: string;
  tipoEndoso: string;
  producto: string;
  plan: string;
  moneda: string;
  usuario: string;
  fechaSolicitud?: string;
  fechaCliente?: string;
  fechaEfectiva?: string;
  [key: string]: any; // Allow dynamic input properties
}

export const EndorseRequestSchema = Joi.object<EndorseRequestDto>({
  policyNumber: Joi.string().required().description('Policy number'),
  idEnvio: Joi.number().optional().description('Dispatch transmission ID'),
  frecuencia: Joi.string().required().description('Billing frequency (e.g. Semestral)'),
  tipoEndoso: Joi.string().required().description('Type of endorsement (e.g. CambioFrecuencia)'),
  producto: Joi.string().required().description('Product code (e.g. Rumbo)'),
  plan: Joi.string().required().description('Plan name (e.g. PlanRumbo)'),
  moneda: Joi.string().required().description('Currency (e.g. Nuevo Sol)'),
  usuario: Joi.string().required().description('Requesting user identifier'),
  fechaSolicitud: Joi.string().optional().description('Application date (YYYY-MM-DD)'),
  fechaCliente: Joi.string().optional().description('Customer sign date (YYYY-MM-DD)'),
  fechaEfectiva: Joi.string().optional().description('Effective start date (YYYY-MM-DD)'),
}).unknown(true);
