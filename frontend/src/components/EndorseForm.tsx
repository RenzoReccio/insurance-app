import React from 'react';
import { EndorsePayload } from '../api/endorse.api';

interface EndorseFormProps {
  payload: EndorsePayload;
  onChange: (updated: EndorsePayload) => void;
}

export const EndorseForm: React.FC<EndorseFormProps> = ({ payload, onChange }) => {
  const handleChange = (field: keyof EndorsePayload, value: any) => {
    onChange({
      ...payload,
      [field]: value,
    });
  };

  return (
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">
          Número de Póliza <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.policyNumber || ''}
          onChange={(e) => handleChange('policyNumber', e.target.value)}
          placeholder="08200000049"
        />
      </div>

      <div className="form-group">
        <label className="form-label">ID Envío (idEnvio)</label>
        <input
          type="number"
          className="form-input"
          value={payload.idEnvio ?? ''}
          onChange={(e) =>
            handleChange(
              'idEnvio',
              e.target.value === '' ? undefined : parseInt(e.target.value, 10)
            )
          }
          placeholder="5984"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Producto <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.producto || ''}
          onChange={(e) => handleChange('producto', e.target.value)}
          placeholder="Rumbo"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Tipo de Endoso <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.tipoEndoso || ''}
          onChange={(e) => handleChange('tipoEndoso', e.target.value)}
          placeholder="CambioFrecuencia"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Frecuencia <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.frecuencia || ''}
          onChange={(e) => handleChange('frecuencia', e.target.value)}
          placeholder="Semestral"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Plan <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.plan || ''}
          onChange={(e) => handleChange('plan', e.target.value)}
          placeholder="PlanRumbo"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Moneda <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.moneda || ''}
          onChange={(e) => handleChange('moneda', e.target.value)}
          placeholder="Nuevo Sol"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Usuario Solicitante <span style={{ color: 'var(--brand-cyan)' }}>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={payload.usuario || ''}
          onChange={(e) => handleChange('usuario', e.target.value)}
          placeholder="interface.servicios"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha Solicitud</label>
        <input
          type="date"
          className="form-input"
          value={payload.fechaSolicitud || ''}
          onChange={(e) => handleChange('fechaSolicitud', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Fecha Cliente</label>
        <input
          type="date"
          className="form-input"
          value={payload.fechaCliente || ''}
          onChange={(e) => handleChange('fechaCliente', e.target.value)}
        />
      </div>

      <div className="form-group full-width">
        <label className="form-label">Fecha Efectiva</label>
        <input
          type="date"
          className="form-input"
          value={payload.fechaEfectiva || ''}
          onChange={(e) => handleChange('fechaEfectiva', e.target.value)}
        />
      </div>
    </div>
  );
};
