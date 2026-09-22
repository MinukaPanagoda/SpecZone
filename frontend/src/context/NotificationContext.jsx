import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, HelpCircle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const confirmResolveRef = useRef(null);

  // Show Toast
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Confirm Modal (Promise-based)
  const confirmModal = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning' // 'danger' | 'warning' | 'success' | 'info'
  }) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type
      });
    });
  }, []);

  const handleConfirmAction = (result) => {
    if (confirmResolveRef.current) {
      confirmResolveRef.current(result);
      confirmResolveRef.current = null;
    }
    setConfirmDialog(null);
  };

  // Keyboard shortcut support for Confirm Dialog (ESC = cancel, Enter = confirm)
  useEffect(() => {
    if (!confirmDialog) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleConfirmAction(false);
      } else if (e.key === 'Enter') {
        handleConfirmAction(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog]);

  // Styling helpers
  const getTypeStyles = (type) => {
    switch (type) {
      case 'danger':
      case 'error':
        return {
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          glow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 51, 102, 0.25)',
          bg: 'rgba(25, 10, 15, 0.95)',
          icon: <AlertCircle size={20} color="var(--danger)" />
        };
      case 'warning':
        return {
          border: '1px solid #ffb400',
          color: '#ffb400',
          glow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 180, 0, 0.25)',
          bg: 'rgba(25, 20, 10, 0.95)',
          icon: <AlertTriangle size={20} color="#ffb400" />
        };
      case 'info':
        return {
          border: '1px solid var(--accent-primary)',
          color: 'var(--accent-primary)',
          glow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.25)',
          bg: 'rgba(10, 20, 30, 0.95)',
          icon: <Info size={20} color="var(--accent-primary)" />
        };
      case 'success':
      default:
        return {
          border: '1px solid var(--success)',
          color: 'var(--success)',
          glow: '0 8px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 230, 118, 0.25)',
          bg: 'rgba(10, 25, 20, 0.95)',
          icon: <CheckCircle2 size={20} color="var(--success)" />
        };
    }
  };

  const getConfirmBtnStyle = (type) => {
    switch (type) {
      case 'danger':
        return {
          background: 'var(--danger)',
          color: '#ffffff',
          boxShadow: '0 0 15px rgba(255, 51, 102, 0.4)'
        };
      case 'warning':
        return {
          background: '#ffb400',
          color: '#000000',
          boxShadow: '0 0 15px rgba(255, 180, 0, 0.4)'
        };
      case 'info':
        return {
          background: 'var(--accent-primary)',
          color: '#000000',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
        };
      case 'success':
      default:
        return {
          background: 'var(--success)',
          color: '#000000',
          boxShadow: '0 0 15px rgba(0, 230, 118, 0.4)'
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirmModal }}>
      {children}

      {/* Global Toast Container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
            maxWidth: '90vw',
            width: 'max-content'
          }}
        >
          {toasts.map((toast) => {
            const styles = getTypeStyles(toast.type);
            return (
              <div
                key={toast.id}
                style={{
                  background: styles.bg,
                  border: styles.border,
                  color: styles.color,
                  padding: '0.85rem 1.4rem',
                  borderRadius: '10px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: styles.glow,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  pointerEvents: 'auto',
                  animation: 'fadeIn 0.2s ease-out',
                  maxWidth: '550px',
                  lineHeight: '1.4'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {styles.icon}
                </span>
                <span style={{ flex: 1, color: '#f0f0f0' }}>{toast.message}</span>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    marginLeft: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.75,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                  title="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Confirm Modal */}
      {confirmDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1.2rem',
            overflowY: 'auto',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => handleConfirmAction(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '2rem',
              borderRadius: '14px',
              border: getTypeStyles(confirmDialog.type).border,
              boxShadow: getTypeStyles(confirmDialog.type).glow,
              background: 'linear-gradient(145deg, rgba(20, 24, 33, 0.98), rgba(12, 16, 24, 0.99))',
              position: 'relative',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => handleConfirmAction(false)}
              style={{
                position: 'absolute',
                top: '1.2rem',
                right: '1.2rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Header Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.2rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: getTypeStyles(confirmDialog.type).border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getTypeStyles(confirmDialog.type).icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                {confirmDialog.title}
              </h3>
            </div>

            {/* Message Body */}
            <div
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                marginBottom: '1.8rem',
                whiteSpace: 'pre-line',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '1rem 1.2rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {confirmDialog.message}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ minWidth: '100px', padding: '0.65rem 1.2rem' }}
                onClick={() => handleConfirmAction(false)}
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  minWidth: '120px',
                  padding: '0.65rem 1.4rem',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  ...getConfirmBtnStyle(confirmDialog.type)
                }}
                onClick={() => handleConfirmAction(true)}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
