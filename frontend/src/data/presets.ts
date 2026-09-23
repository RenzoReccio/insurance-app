import { EndorsePayload } from '../api/endorse.api';

export interface PresetScenario {
  id: string;
  title: string;
  tag: string;
  description: string;
  payload: EndorsePayload;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'happy-path',
    title: 'Rumbo - Caso Exitoso (PDF)',
    tag: '200 OK',
    description: 'Payload estándar del documento técnico con 12 campos dinámicos.',
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
  },
  {
    id: 'defaults-test',
    title: 'Inyección de Valores por Defecto',
    tag: 'Defaults',
    description: 'Envía fechas pero omite campos opcionales; la BD inyecta SAC, Endoso Simple y TES008.',
    payload: {
      policyNumber: '08200000888',
      idEnvio: 6012,
      frecuencia: 'Anual',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanRumbo',
      moneda: 'Dólar Americano',
      usuario: 'operaciones.siniestros',
      fechaSolicitud: '2026-03-15',
      fechaCliente: '2026-03-15',
      fechaEfectiva: '2026-04-01',
    },
  },
  {
    id: 'missing-required',
    title: 'Error: Campo Obligatorio Faltante',
    tag: '400 Error',
    description: 'Omite el usuario obligatorio para evaluar el manejo de error 400 Bad Request.',
    payload: {
      policyNumber: '08200000049',
      frecuencia: 'Semestral',
      tipoEndoso: 'CambioFrecuencia',
      producto: 'Rumbo',
      plan: 'PlanRumbo',
      moneda: 'Nuevo Sol',
      usuario: '',
    },
  },
  {
    id: 'template-not-found',
    title: 'Error: Plantilla Inexistente',
    tag: '404 Error',
    description: 'Solicita un producto/endoso no registrado para evaluar el error 404 controlado.',
    payload: {
      policyNumber: '09900001234',
      frecuencia: 'Trimestral',
      tipoEndoso: 'CambioTitular',
      producto: 'SeguroAutoTotal',
      plan: 'PlanAutoGold',
      moneda: 'Nuevo Sol',
      usuario: 'interface.servicios',
    },
  },
];
