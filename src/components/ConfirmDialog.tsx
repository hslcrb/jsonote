'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소',
    isDanger = false
}: ConfirmDialogProps) {
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
                            <AlertTriangle className={isDanger ? 'text-red' : 'text-muted'} size={24} />
                            <h3>{title}</h3>
                        </div>
                        <p className="dialog-message">{message}</p>
                        <div className="dialog-footer">
                            <button className="dialog-btn cancel" onClick={onCancel}>
                                {cancelText}
                            </button>
                            <button
                                className={`dialog-btn confirm ${isDanger ? 'danger' : ''}`}
                                onClick={onConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>

                    <style jsx>{`
            .dialog-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(4px);
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1.5rem;
            }

            .dialog-container {
              background: var(--bg-primary);
              border: 1px solid var(--border-glass);
              border-radius: var(--radius-lg);
              width: 100%;
              max-width: 400px;
              padding: 2rem;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .dialog-message {
              color: var(--text-secondary);
              font-size: 0.95rem;
              line-height: 1.6;
              margin-bottom: 2.5rem;
            }

            .dialog-footer {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
            }

            .dialog-btn {
              padding: 0.75rem 1.5rem;
              font-size: 0.85rem;
              font-weight: 900;
              text-transform: uppercase;
              border-radius: var(--radius-sm);
              transition: all 0.2s;
            }

            .cancel {
              color: var(--text-muted);
              background: var(--bg-secondary);
            }

            .cancel:hover {
              background: var(--bg-tertiary);
              color: var(--text-primary);
            }

            .confirm {
              background: var(--text-primary);
              color: var(--bg-primary);
            }

            .confirm.danger {
              background: #ff4444;
              color: white;
            }

            .text-red { color: #ff4444; }
            .text-muted { color: var(--text-muted); }
          `}</style>
                </div>
            )}
        </AnimatePresence>
    );
}
