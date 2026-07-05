import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkflowSection } from './components/WorkflowSection';
import './tailwind.css';

const container = document.getElementById('workflow-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <WorkflowSection />
    </React.StrictMode>
  );
}
