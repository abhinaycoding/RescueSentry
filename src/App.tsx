import React from 'react';
import { SentryProvider } from './context/SentryContext';
import { Shell } from './components/layout/Shell';

export function App() {
  return (
    <SentryProvider>
      <Shell />
    </SentryProvider>
  );
}

export default App;
