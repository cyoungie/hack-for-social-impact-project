import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameStateProvider } from './state/GameState.jsx';
import { ComingSoonProvider } from './components/useComingSoon.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameStateProvider>
      <ComingSoonProvider>
        <App />
      </ComingSoonProvider>
    </GameStateProvider>
  </StrictMode>,
);
