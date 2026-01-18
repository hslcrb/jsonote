'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({
  isOpen,
  title,
  message,
  defaultValue = '',
  onConfirm,
  onCancel
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) setValue(defaultValue);
  }, [isOpen, defaultValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onConfirm(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="dialog-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="dialog-container"
          >
            <div className="dialog-header">
              <MessageSquare className="text-primary" size={24} />
              <h3>{title}</h3>
            </div>
            <p className="dialog-message">{message}</p>

            <form onSubmit={handleSubmit}>
              <input
                className="dialog-input"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />

              <div className="dialog-footer">
                <button type="button" className="dialog-btn cancel" onClick={onCancel}>
                  취소
                </button>
                <button type="submit" className="dialog-btn confirm">
                  확인
                </button>
              </div>
            </form>
          </motion.div>

          <style jsx>{`
            .dialog-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1.5rem;
            }

            .dialog-container {
              background: var(--bg-secondary);
              border: 1px solid var(--border-glass);
              border-radius: var(--radius-lg);
              width: 100%;
              max-width: 400px;
              padding: 2rem;
              box-shadow: var(--shadow-lg);
            }

            .dialog-header {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 1rem;
            }

            .dialog-header h3 {
              margin: 0;
              font-size: 1.25rem;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-family: 'Nanum Gothic', sans-serif;
              color: var(--text-primary);
            }

            .dialog-message {
              color: var(--text-secondary);
              font-size: 0.95rem;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            }

            .dialog-input {
              width: 100%;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-glass);
              border-radius: var(--radius-md);
              padding: 0.75rem 1rem;
              color: var(--text-primary);
              font-size: 1rem;
              margin-bottom: 2rem;
              outline: none;
              font-family: 'Nanum Gothic', sans-serif;
              transition: var(--transition-fast);
            }

            .dialog-input:focus {
              border-color: var(--text-secondary);
              background: var(--bg-secondary);
            }

            .dialog-footer {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
            }

            .dialog-btn {
              padding: 0.75rem 1.5rem;
              font-size: 0.85rem;
              font-weight: 700;
              text-transform: uppercase;
              border-radius: var(--radius-md);
              transition: var(--transition-fast);
              font-family: 'Nanum Gothic', sans-serif;
            }

            .cancel {
              color: var(--text-muted);
              background: var(--bg-tertiary);
              border: 1px solid var(--border-glass);
            }

            .cancel:hover {
              background: var(--bg-secondary);
              color: var(--text-primary);
            }

            .confirm {
              background: var(--text-primary);
              color: var(--bg-primary);
            }

            .confirm:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }

            .text-primary { color: var(--text-primary); }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
}
