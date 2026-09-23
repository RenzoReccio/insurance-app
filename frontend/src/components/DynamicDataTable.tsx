import React from 'react';
import { DynamicDataItem } from '../api/endorse.api';

interface DynamicDataTableProps {
  items: DynamicDataItem[];
}

export const DynamicDataTable: React.FC<DynamicDataTableProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px', textAlign: 'center' }}>
        No hay campos dinámicos disponibles.
      </div>
    );
  }

  const defaultValuesSet = new Set(['Endoso Simple', 'SAC', 'Si', 'Default', 'TES008', '']);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="dynamic-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>#</th>
            <th>Etiqueta Core (dynamicData)</th>
            <th>Valor Resuelto</th>
            <th style={{ width: '100px' }}>Origen</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const isLikelyDefault = defaultValuesSet.has(item.value);
            return (
              <tr key={item.etiqueta + index}>
                <td>
                  <span className="order-badge">{index + 1}</span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {item.etiqueta}
                </td>
                <td style={{ color: 'var(--brand-cyan-glow)', fontFamily: 'var(--font-mono)' }}>
                  {item.value === '' ? (
                    <em style={{ color: 'var(--text-muted)' }}>(vacío)</em>
                  ) : (
                    item.value
                  )}
                </td>
                <td>
                  {isLikelyDefault ? (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        color: 'var(--brand-purple)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      Plantilla / Def
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(6, 182, 212, 0.12)',
                        color: 'var(--brand-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.25)',
                      }}
                    >
                      Input Payload
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
