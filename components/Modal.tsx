'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'success' | 'error' | 'info';
}

export default function Modal({ isOpen, onClose, title, children, type = 'info' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 rounded-xl shadow-2xl border border-stone-700 max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        
        <div className="text-gray-300 whitespace-pre-line">
          {children}
        </div>
      </div>
      
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10" />
    </div>
  );
}

