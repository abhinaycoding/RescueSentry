import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'teal';
  requireNotes?: boolean;
  notesPlaceholder?: string;
  onConfirm: (notes: string) => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm Action',
  variant = 'teal',
  requireNotes = false,
  notesPlaceholder = 'Enter required corrective action or resolution notes...',
  onConfirm
}) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireNotes && !notes.trim()) {
      setError('Resolution notes are mandatory for safety audit compliance.');
      return;
    }
    onConfirm(notes);
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg clay-modal border border-[#D8CEBF]/80 overflow-hidden text-[var(--text)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8CEBF]/60 bg-black/[0.02]">
          <div className="flex items-center gap-2.5">
            {variant === 'danger' ? (
              <div className="clay-pill-inset p-1.5 text-[#B52A31]">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="clay-pill-inset p-1.5 text-[#1E6B42]">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-base font-bold tracking-tight text-[var(--text)] font-sans">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="clay-pill-inset p-1.5 text-[var(--text-3)] hover:text-[var(--text)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-2)] leading-relaxed font-sans">
            {description}
          </p>

          {requireNotes && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-3)] mb-1.5 font-bold">
                Mandatory Resolution Log Entry <span className="text-[#B52A31]">*</span>
              </label>
              <textarea
                value={notes}
                onChange={e => {
                  setNotes(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                placeholder={notesPlaceholder}
                className="w-full p-3 text-xs clay-input text-[var(--text)] placeholder-[var(--text-3)] font-mono resize-none"
              />
              {error && (
                <p className="mt-1 text-xs text-[#B52A31] font-mono font-bold">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#D8CEBF]/60 bg-black/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="clay-button clay-btn-cream h-10 px-4 text-xs font-mono uppercase tracking-wider font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`clay-button h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider ${
              variant === 'danger'
                ? 'clay-btn-red text-white'
                : 'clay-btn-green text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
