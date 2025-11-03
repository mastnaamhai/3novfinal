import React from 'react';

export type ToastKind = 'error' | 'success' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

export const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }>
  = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80 max-w-full">
      {toasts.map(t => (
        <div key={t.id}
             className={`rounded-md shadow-md border px-4 py-3 text-sm flex items-start space-x-3 ${
               t.kind === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
               t.kind === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
               t.kind === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
               'bg-slate-50 border-slate-200 text-slate-800'
             }`}>
          <div className="flex-1 whitespace-pre-wrap">{t.message}</div>
          <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};


