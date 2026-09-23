import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { Tabs, TabId } from './components/Tabs';
import { EndorseTranslatorView } from './views/EndorseTranslatorView';
import { OptimalRouteView } from './views/OptimalRouteView';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('translator');
  const { token, user, apiOnline, isAuthenticating, refreshToken } = useAuth();

  return (
    <div className="app-container">
      {/* Executive Header */}
      <Header
        apiOnline={apiOnline}
        token={token}
        user={user}
        isAuthenticating={isAuthenticating}
        onRefreshToken={refreshToken}
      />

      {/* Tabs Navigation */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Views */}
      <main>
        {activeTab === 'translator' ? (
          <EndorseTranslatorView token={token} onRequireAuth={refreshToken} />
        ) : (
          <OptimalRouteView />
        )}
      </main>
    </div>
  );
}

export default App;
