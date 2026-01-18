'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-primary" size={18} />,
    error: <AlertCircle className="text-primary" size={18} />,
    info: <Info className="text-primary" size={18} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="toast-container"
    >
      <div className={`toast-content ${type}`}>
        {icons[type]}
        <span className="toast-message">{message}</span>
        <button onClick={onClose} className="toast-close">
          <X size={14} />
        </button>
      </div>

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          pointer-events: none;
        }

        .toast-content {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          border-radius: 0;
          box-shadow: none;
          min-width: 280px;
        }

        .toast-message {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--text-primary);
          text-transform: uppercase;
        }

        .toast-close {
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close:hover {
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .text-primary { color: var(--text-primary); }

        .success, .error, .info { border-color: var(--border-glass); }
      `}</style>
    </motion.div>
  );
}
