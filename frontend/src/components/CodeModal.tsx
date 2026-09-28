import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export function CodeModal({ isOpen, onClose, code }: CodeModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#141721] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#181c28]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xs font-mono font-medium text-slate-200">Snakefile (Otomatik Üretildi)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <pre className="p-5 font-mono text-xs text-sky-300 overflow-x-auto bg-[#0b0d11] leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}