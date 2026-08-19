import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TONE_STYLES: Record<string, { icon: React.ReactNode; bar: string; ring: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    bar: 'bg-emerald-500',
    ring: 'bg-emerald-50 text-emerald-600'
  },
  warning: {
    icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
    bar: 'bg-amber-500',
    ring: 'bg-amber-50 text-amber-600'
  },
  error: {
    icon: <XCircle className="w-4 h-4 text-rose-600" />,
    bar: 'bg-rose-500',
    ring: 'bg-rose-50 text-rose-600'
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-600" />,
    bar: 'bg-blue-500',
    ring: 'bg-blue-50 text-blue-600'
  }
};

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-[min(92vw,23rem)] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.type] || TONE_STYLES.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto relative bg-white text-slate-800 border border-slate-200 shadow-xl rounded-xl pl-3.5 pr-3 py-3 flex items-start gap-3 overflow-hidden"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tone.ring}`}>
                {tone.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-semibold text-slate-900 leading-snug">{toast.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Countdown bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${tone.bar}`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
