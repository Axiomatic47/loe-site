import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Mount the React application to the DOM
createRoot(document.getElementById("root")!).render(<App />);