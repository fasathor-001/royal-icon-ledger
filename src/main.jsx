import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App_v2.jsx';
import './index.css';

function Root() {
  const [updateReady, setUpdateReady] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    const updateFn = registerSW({
      onNeedRefresh() {
        setUpdateReady(true);
      },
      onOfflineReady() {
        // App is ready to work offline — silent
      },
    });
    setUpdateSW(() => updateFn);
  }, []);

  const applyUpdate = () => {
    if (updateSW) {
      updateSW(true); // true = reload page after update
    }
  };

  return (
    <>
      <App />
      {updateReady && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#D97757',
            color: '#0A0908',
            padding: '14px 20px',
            borderRadius: '6px',
            boxShadow: '0 8px 32px rgba(217, 119, 87, 0.4), 0 0 0 1px rgba(217, 119, 87, 0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '90vw',
            animation: 'slideUpFade 400ms ease',
          }}
        >
          <style>{`
            @keyframes slideUpFade {
              from { opacity: 0; transform: translate(-50%, 20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
          <span>New version available</span>
          <button
            onClick={applyUpdate}
            style={{
              background: '#0A0908',
              color: '#E8E2D5',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Update
          </button>
          <button
            onClick={() => setUpdateReady(false)}
            style={{
              background: 'transparent',
              color: '#0A0908',
              border: 'none',
              padding: '4px 8px',
              fontSize: '18px',
              cursor: 'pointer',
              opacity: 0.6,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);