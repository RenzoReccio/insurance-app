import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { routeApi, RouteResponse, GoHealthResponse } from '../api/route.api';
import { CodeViewer } from '../components/CodeViewer';

const LIMA_DISTRICTS = [
  'Miraflores',
  'San Isidro',
  'Barranco',
  'Lince',
  'Surco',
  'Ate',
];

const DEFAULT_GRAPH: Record<string, Record<string, number>> = {
  Miraflores: { SanIsidro: 10, Barranco: 5, Lince: 4 },
  SanIsidro: { Miraflores: 10, Lince: 8, Surco: 15 },
  Barranco: { Miraflores: 5, Surco: 12 },
  Lince: { Miraflores: 4, SanIsidro: 3, Ate: 20 },
  Surco: { SanIsidro: 15, Barranco: 12, Ate: 8 },
  Ate: { Lince: 20, Surco: 8 },
};

export const OptimalRouteView: React.FC = () => {
  const [depots, setDepots] = useState<string[]>(['Miraflores', 'Ate']);
  const [accidentLocation, setAccidentLocation] = useState<string>('San Isidro');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [health, setHealth] = useState<GoHealthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Custom graph editor toggle
  const [showGraphEditor, setShowGraphEditor] = useState<boolean>(false);
  const [useCustomGraph, setUseCustomGraph] = useState<boolean>(false);
  const [customGraphStr, setCustomGraphStr] = useState<string>(
    JSON.stringify(DEFAULT_GRAPH, null, 2)
  );

  // Load health & token on mount
  useEffect(() => {
    checkHealthAndAuth();
  }, []);

  const checkHealthAndAuth = async () => {
    try {
      const hRes = await routeApi.checkHealth();
      if (hRes.data) {
        setHealth(hRes.data);
      }
      const tRes = await routeApi.getToken();
      if (tRes.data?.accessToken) {
        setToken(tRes.data.accessToken);
      }
    } catch {
      // Ignored for graceful fallback
    }
  };

  const toggleDepot = (district: string) => {
    if (depots.includes(district)) {
      setDepots(depots.filter((d) => d !== district));
    } else {
      setDepots([...depots, district]);
    }
  };

  const applyPreset = (presetType: 'pdf' | 'immediate' | 'east' | 'unreachable') => {
    setError(null);
    setErrorCode(null);
    setResult(null);

    switch (presetType) {
      case 'pdf':
        setDepots(['Miraflores', 'Ate']);
        setAccidentLocation('San Isidro');
        setUseCustomGraph(false);
        break;
      case 'immediate':
        setDepots(['Barranco', 'Surco']);
        setAccidentLocation('Surco');
        setUseCustomGraph(false);
        break;
      case 'east':
        setDepots(['Miraflores', 'San Isidro']);
        setAccidentLocation('Ate');
        setUseCustomGraph(false);
        break;
      case 'unreachable': {
        setDepots(['Miraflores']);
        setAccidentLocation('Ate');
        // Custom graph where Ate is disconnected
        const disconnectedGraph: Record<string, Record<string, number>> = {
          Miraflores: { SanIsidro: 5 },
          SanIsidro: { Miraflores: 5 },
          Ate: {},
        };
        setCustomGraphStr(JSON.stringify(disconnectedGraph, null, 2));
        setUseCustomGraph(true);
        setShowGraphEditor(true);
        break;
      }
    }
  };

  const handleCalculate = async () => {
    if (depots.length === 0) {
      setError('Debes seleccionar al menos un depósito de grúas disponible.');
      setErrorCode('VALIDATION_ERROR');
      return;
    }
    if (!accidentLocation) {
      setError('Debes seleccionar la ubicación del siniestro.');
      setErrorCode('VALIDATION_ERROR');
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);
    setResult(null);

    try {
      // Ensure we have a valid token
      let currentToken = token;
      if (!currentToken) {
        const tokenRes = await routeApi.getToken();
        if (tokenRes.data?.accessToken) {
          currentToken = tokenRes.data.accessToken;
          setToken(currentToken);
        }
      }

      let parsedGraph: Record<string, Record<string, number>> | undefined = undefined;
      if (useCustomGraph) {
        try {
          parsedGraph = JSON.parse(customGraphStr);
        } catch (e: any) {
          setError(`El JSON del grafo personalizado no es válido: ${e.message}`);
          setErrorCode('INVALID_JSON');
          setLoading(false);
          return;
        }
      }

      const res = await routeApi.calculateOptimalRoute(
        {
          depots,
          accidentLocation,
          graph: parsedGraph,
        },
        currentToken || ''
      );

      setDurationMs(res.durationMs);

      if (res.error) {
        setError(res.error);
        setErrorCode(res.statusCode ? `HTTP ${res.statusCode}` : 'NETWORK_ERROR');
      } else if (res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al invocar el servicio de rutas.');
      setErrorCode('CLIENT_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Service Status */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-cyan)',
              }}
            >
              <Navigation size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                Ejercicio 2: Servicio de Rutas Óptimas
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Algoritmo <strong>Multi-Source Dijkstra</strong> en Go 1.23 para asignación instantánea de grúas en Lima
              </p>
            </div>
          </div>

          {/* Health Badge & Re-check */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: health?.status === 'UP' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${health?.status === 'UP' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '12.5px',
                fontWeight: 500,
                color: health?.status === 'UP' ? '#34d399' : '#f87171',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: health?.status === 'UP' ? '#34d399' : '#f87171',
                  boxShadow: health?.status === 'UP' ? '0 0 8px #34d399' : 'none',
                }}
              />
              <span>{health?.status === 'UP' ? 'Golang Backend: 8080 UP' : 'Golang Desconectado'}</span>
            </div>

            <button
              onClick={checkHealthAndAuth}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Reconectar y refrescar token"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Presets Bar */}
        <div
          style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="var(--brand-cyan)" /> Presets de Prueba:
          </span>

          <button
            onClick={() => applyPreset('pdf')}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            🎯 PDF Caso Base (Miraflores/Ate → San Isidro)
          </button>

          <button
            onClick={() => applyPreset('immediate')}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            ⚡ Mismo Depósito (Barranco/Surco → Surco)
          </button>

          <button
            onClick={() => applyPreset('east')}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            🚨 Emergencia Este (Hacia Ate)
          </button>

          <button
            onClick={() => applyPreset('unreachable')}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', color: '#f87171' }}
          >
            ❌ Destino Inalcanzable (HTTP 422)
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.2fr)',
          gap: '24px',
        }}
      >
        {/* Left Column: Dispatch Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Siniestro Location Selector */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <MapPin size={18} color="#ef4444" />
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                1. Ubicación del Siniestro (Destino)
              </label>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Selecciona el distrito de Lima donde ocurrió el accidente vehicular:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LIMA_DISTRICTS.map((district) => {
                const isSelected = accidentLocation === district;
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => setAccidentLocation(district)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isSelected
                        ? '1px solid #ef4444'
                        : '1px solid var(--border-color)',
                      background: isSelected
                        ? 'rgba(239, 68, 68, 0.18)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? '#fca5a5' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: isSelected ? '#ef4444' : 'transparent',
                        border: isSelected ? 'none' : '1px solid var(--text-muted)',
                      }}
                    />
                    {district}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depots Multi-Selector */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--brand-cyan)" />
                <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  2. Bases de Grúas Disponibles (Depósitos)
                </label>
              </div>
              <span
                style={{
                  fontSize: '11.5px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--brand-cyan)',
                  fontWeight: 600,
                }}
              >
                {depots.length} seleccionados
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Multi-selección: Dijkstra inicializa todos los depósitos a costo 0 en la cola de prioridad:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {LIMA_DISTRICTS.map((district) => {
                const isSelected = depots.includes(district);
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => toggleDepot(district)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isSelected
                        ? '1px solid var(--brand-cyan)'
                        : '1px solid var(--border-color)',
                      background: isSelected
                        ? 'rgba(6, 182, 212, 0.18)'
                        : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={13} opacity={isSelected ? 1 : 0.4} />
                    {district}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graph Inspector / Editor */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowGraphEditor(!showGraphEditor)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--brand-purple)" />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                  Grafo de Conexiones de Lima {useCustomGraph && '(Modo Personalizado)'}
                </span>
              </div>
              {showGraphEditor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {showGraphEditor && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={useCustomGraph}
                      onChange={(e) => setUseCustomGraph(e.target.checked)}
                      style={{ accentColor: 'var(--brand-cyan)' }}
                    />
                    Enviar grafo personalizado al backend en el payload
                  </label>
                  {useCustomGraph && (
                    <button
                      type="button"
                      onClick={() => setCustomGraphStr(JSON.stringify(DEFAULT_GRAPH, null, 2))}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '3px 8px', marginLeft: 'auto' }}
                    >
                      Restablecer Lima Default
                    </button>
                  )}
                </div>

                <textarea
                  value={customGraphStr}
                  onChange={(e) => setCustomGraphStr(e.target.value)}
                  disabled={!useCustomGraph}
                  rows={8}
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    color: useCustomGraph ? '#38bdf8' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Calculando Ruta Óptima en Go...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span>Calcular Grúa Más Cercana (Dijkstra)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Execution Results & Visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div
              className="glass-panel"
              style={{
                padding: '20px',
                borderLeft: '4px solid #ef4444',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fca5a5', margin: 0 }}>
                      Error en el Cálculo de Ruta
                    </h3>
                    {errorCode && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.25)',
                          color: '#fca5a5',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {errorCode}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {error}
                  </p>
                  {errorCode?.includes('422') && (
                    <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '8px', fontStyle: 'italic' }}>
                      Tip: El código 422 (UNREACHABLE_DESTINATION) confirma que el algoritmo de Dijkstra detectó que no existe ninguna conexión navegable desde los depósitos seleccionados hacia el destino.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {result ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={22} color="#34d399" />
                  <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
                    Ruta Óptima Calculada
                  </h3>
                </div>
                {durationMs !== null && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--brand-cyan)',
                      background: 'rgba(6, 182, 212, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <Clock size={12} /> {durationMs} ms
                  </span>
                )}
              </div>

              {/* Highlight Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div className="metric-card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Grúa Despachada</span>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--brand-cyan)',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={18} />
                    {result.fromDepot}
                  </div>
                </div>

                <div className="metric-card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Costo / Distancia</span>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#34d399',
                      marginTop: '4px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {result.distance} <span style={{ fontSize: '12px', fontWeight: 400 }}>km / min</span>
                  </div>
                </div>

                <div className="metric-card" style={{ padding: '14px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Destino Siniestro</span>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#f87171',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MapPin size={18} />
                    {result.to}
                  </div>
                </div>
              </div>

              {/* Path Breadcrumb Visualization */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Secuencia de Navegación del Camino Mínimo:
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginTop: '12px',
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {result.path.map((node, idx) => {
                    const isOrigin = idx === 0;
                    const isTarget = idx === result.path.length - 1;

                    return (
                      <React.Fragment key={`${node}-${idx}`}>
                        <div
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isOrigin
                              ? 'rgba(6, 182, 212, 0.2)'
                              : isTarget
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: isOrigin
                              ? '1px solid var(--brand-cyan)'
                              : isTarget
                              ? '1px solid #ef4444'
                              : '1px solid var(--border-color)',
                            color: isOrigin
                              ? 'var(--brand-cyan)'
                              : isTarget
                              ? '#fca5a5'
                              : 'var(--text-primary)',
                          }}
                        >
                          {isOrigin && <Truck size={14} />}
                          {isTarget && <MapPin size={14} />}
                          <span>{node}</span>
                          {isOrigin && (
                            <span style={{ fontSize: '10px', opacity: 0.8 }}>(Base)</span>
                          )}
                          {isTarget && (
                            <span style={{ fontSize: '10px', opacity: 0.8 }}>(Siniestro)</span>
                          )}
                        </div>

                        {!isTarget && (
                          <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Raw JSON Code Viewer */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Payload de Respuesta HTTP 200 (JSON Estándar):
                </span>
                <div style={{ marginTop: '8px' }}>
                  <CodeViewer data={result} />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '340px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-cyan)',
                  marginBottom: '16px',
                }}
              >
                <Truck size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Listo para Despachar Grúas
              </h4>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  maxWidth: '420px',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Selecciona la ubicación del siniestro y las bases disponibles, o elige uno de los
                presets superiores para calcular el camino óptimo en tiempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
