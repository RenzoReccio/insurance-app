import React from 'react';
import { Shield, RefreshCw, KeyRound, Server } from 'lucide-react';

interface HeaderProps {
  apiOnline: boolean | null;
  token: string | null;
  user: { username: string; role: string } | null;
  isAuthenticating: boolean;
  onRefreshToken: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiOnline,
  token,
  user,
  isAuthenticating,
  onRefreshToken,
}) => {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-logo">
          <Shield size={24} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">
            Evolution Suite
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Estandarización y Traducción de Endosos para Core Asegurador
          </p>
        </div>
      </div>

      <div className="header-status-group">
        {/* Backend Health Badge */}
        <div
          className={`status-badge ${apiOnline === true
            ? 'success'
            : apiOnline === false
              ? 'error'
              : 'warning'
            }`}
          title="Estado del backend Node.js (Hapi)"
        >
          <Server size={14} />
          <span className={`indicator-dot ${apiOnline ? 'pulse' : ''}`} />
          <span>
            {apiOnline === true
              ? 'Backend API: UP'
              : apiOnline === false
                ? 'Backend: Offline'
                : 'Verificando...'}
          </span>
        </div>

        {/* JWT Auth Badge */}
        <div
          className={`status-badge ${token ? 'info' : 'warning'}`}
          title={token ? `Token JWT activo (${user?.username ?? 'service'})` : 'Sin token'}
        >
          <KeyRound size={14} />
          <span>{token ? 'JWT: Conectado' : 'JWT: Pendiente'}</span>
          <button
            onClick={onRefreshToken}
            disabled={isAuthenticating}
            className="btn-secondary"
            style={{ padding: '3px 6px', marginLeft: '4px', fontSize: '11px' }}
            title="Renovar token JWT"
          >
            <RefreshCw
              size={12}
              className={isAuthenticating ? 'spinner' : ''}
            />
            {isAuthenticating ? 'Renovando' : 'Renovar'}
          </button>
        </div>
      </div>
    </header>
  );
};
