import React, { useState } from 'react';
import { CoreResponse } from '../api/endorse.api';
import { CodeViewer } from './CodeViewer';
import { DynamicDataTable } from './DynamicDataTable';
import { FileJson, ListOrdered, CheckCircle2 } from 'lucide-react';

interface OutputViewerProps {
  response: CoreResponse;
  statusCode: number;
  durationMs: number;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  response,
  statusCode,
  durationMs,
}) => {
  const [subView, setSubView] = useState<'json' | 'table'>('json');

  const dynamicItems = response.eventEntity?.dynamicData || [];
  const eventsCount = response.eventAppliedEntities?.length || 0;

  return (
    <div>
      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="metric-card">
          <div className="metric-label">Estado HTTP</div>
          <div className="metric-val" style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            {statusCode} OK
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Latencia API</div>
          <div className="metric-val" style={{ color: 'var(--brand-cyan)' }}>
            {durationMs} ms
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Campos Dinámicos</div>
          <div className="metric-val">
            {dynamicItems.length}{' '}
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>
              ordenados
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Eventos Aplicados</div>
          <div className="metric-val">{eventsCount}</div>
        </div>
      </div>

      {/* Sub-view toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setSubView('json')}
          className={`btn-secondary ${subView === 'json' ? 'active' : ''}`}
          style={{
            borderColor: subView === 'json' ? 'var(--brand-cyan)' : undefined,
            color: subView === 'json' ? '#fff' : undefined,
          }}
        >
          <FileJson size={14} />
          JSON Core Estructurado
        </button>

        <button
          onClick={() => setSubView('table')}
          className={`btn-secondary ${subView === 'table' ? 'active' : ''}`}
          style={{
            borderColor: subView === 'table' ? 'var(--brand-cyan)' : undefined,
            color: subView === 'table' ? '#fff' : undefined,
          }}
        >
          <ListOrdered size={14} />
          Tabla de dynamicData ({dynamicItems.length})
        </button>
      </div>

      {/* Render sub-view */}
      {subView === 'json' ? (
        <CodeViewer data={response} />
      ) : (
        <DynamicDataTable items={dynamicItems} />
      )}
    </div>
  );
};
