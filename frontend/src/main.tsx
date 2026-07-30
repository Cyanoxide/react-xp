import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { Provider } from './context/provider.tsx';
import './index.css';
import './styles/scrollbars.css';
import { initAnalytics } from './utils/analytics.ts';

// Straight to the document rather than through a component, since it has nothing
// to say about the tree.
initAnalytics();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider><App /></Provider>
    </StrictMode>,
);
