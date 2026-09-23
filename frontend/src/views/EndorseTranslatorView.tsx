import React, { useState } from 'react';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import { endorseApi, EndorsePayload, CoreResponse } from '../api/endorse.api';
import { PresetSelector } from '../components/PresetSelector';
import { EndorseForm } from '../components/EndorseForm';
import { JsonEditor } from '../components/JsonEditor';
import { OutputViewer } from '../components/OutputViewer';
import {
  Send,
  Layers,
  Code2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface EndorseTranslatorViewProps {
  token: string | null;
  onRequireAuth: () => void;
}

export const EndorseTranslatorView: React.FC<EndorseTranslatorViewProps> = ({
  token,
  onRequireAuth,
}) => {
  const [activePresetId, setActivePresetId] = useState<string>('happy-path');
  const [inputMode, setInputMode] = useState<'form' | 'json'>('form');
  const [payload, setPayload] = useState<EndorsePayload>(() => PRESET_SCENARIOS[0].payload);

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<CoreResponse | null>(null);
  const [statusCode, setStatusCode] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (preset: PresetScenario) => {
    setActivePresetId(preset.id);
    setPayload(preset.payload);
    setErrorMessage(null);
  };

  const handleReset = () => {
    const defaultPreset = PRESET_SCENARIOS[0];
    setActivePresetId(defaultPreset.id);
    setPayload(defaultPreset.payload);
    setResponse(null);
    setErrorMessage(null);
  };

  const handleTranslate = async () => {
    if (!token) {
      setErrorMessage('Token JWT no disponible. Obteniendo credenciales...');
      onRequireAuth();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await endorseApi.translate(payload, token);
      setStatusCode(res.statusCode);
      setDurationMs(res.durationMs);

      if (res.data) {
        setResponse(res.data);
      } else {
        setErrorMessage(res.error || 'Error al procesar la solicitud');
        setResponse(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Scenario Presets Bar */}
      <PresetSelector
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Studio Grid */}
      <div className="studio-grid">
        {/* Left Column: Input Panel */}
        <section className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Layers size={18} color="var(--brand-cyan)" />
              <span>Datos del Endoso (Input Plano)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setInputMode('form')}
                className={`btn-secondary ${inputMode === 'form' ? 'active' : ''}`}
                style={{
                  borderColor: inputMode === 'form' ? 'var(--brand-cyan)' : undefined,
                  color: inputMode === 'form' ? '#fff' : undefined,
                }}
              >
                Formulario
              </button>

              <button
                onClick={() => setInputMode('json')}
                className={`btn-secondary ${inputMode === 'json' ? 'active' : ''}`}
                style={{
                  borderColor: inputMode === 'json' ? 'var(--brand-cyan)' : undefined,
                  color: inputMode === 'json' ? '#fff' : undefined,
                }}
              >
                <Code2 size={13} />
                JSON Raw
              </button>
            </div>
          </div>

          <div className="panel-body">
            {inputMode === 'form' ? (
              <EndorseForm payload={payload} onChange={setPayload} />
            ) : (
              <JsonEditor payload={payload} onChange={setPayload} />
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleTranslate}
                disabled={isLoading}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                <Send size={16} className={isLoading ? 'spinner' : ''} />
                <span>{isLoading ? 'Traduciendo...' : 'Traducir para Core (POST)'}</span>
              </button>

              <button
                onClick={handleReset}
                disabled={isLoading}
                className="btn-secondary"
                title="Restablecer valores por defecto"
              >
                <RotateCcw size={14} />
                Limpiar
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Output / Core JSON Panel */}
        <section className="glass-panel">
          <div className="panel-header">
            <div className="panel-title">
              <Sparkles size={18} color="var(--brand-purple)" />
              <span>JSON Estructurado para el Core (Output)</span>
            </div>

            {response && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {response.policyNumber}
              </span>
            )}
          </div>

          <div className="panel-body">
            {/* Error Banner */}
            {errorMessage && (
              <div className="alert-box error">
                <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    Error {statusCode ? `(HTTP ${statusCode})` : ''}
                  </div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Response Viewer */}
            {response ? (
              <OutputViewer
                response={response}
                statusCode={statusCode}
                durationMs={durationMs}
              />
            ) : !errorMessage ? (
              <div
                style={{
                  height: '380px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '20px',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Layers size={44} style={{ opacity: 0.35, marginBottom: '14px' }} />
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Esperando Petición
                </h4>
                <p style={{ fontSize: '13px', maxWidth: '340px' }}>
                  Haz clic en <strong>Traducir para Core</strong> o selecciona un escenario predeterminado para invocar el endpoint <code>/v1/endorse/translate</code>.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};
