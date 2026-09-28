import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, FolderOpen, Trash2 } from 'lucide-react';

interface FileNodeData {
  label: string;
  path: string;
  format?: string;
  onSelectFile?: (id: string, fullPath: string, filename: string) => void;
  onRenameLabel?: (id: string, newLabel: string) => void;
  onDeleteNode?: (id: string) => void;
}

export const FileNode: React.FC<{ id: string; data: FileNodeData }> = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(data.label);

  const handlePickFile = async () => {
    if (window.electronAPI?.selectFile) {
      const selectedPath = await window.electronAPI.selectFile();
      if (selectedPath) {
        const filename = selectedPath.split('/').pop() || selectedPath;
        setLabelValue(filename);
        data.onSelectFile?.(id, selectedPath, filename);
      }
    }
  };

  const handleFinishRename = () => {
    setIsEditing(false);
    if (labelValue.trim()) {
      data.onRenameLabel?.(id, labelValue.trim());
    } else {
      setLabelValue(data.label);
    }
  };

  return (
    <div className="rounded-2xl bg-[#141824]/90 border border-white/10 p-3.5 shadow-xl min-w-[210px] text-slate-200 font-sans backdrop-blur-md hover:border-sky-500/40 transition-colors group">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <FileText size={15} />
          </div>
          <div className="overflow-hidden">
            {isEditing ? (
              <input
                type="text"
                value={labelValue}
                autoFocus
                onFocus={(e) => e.target.select()}
                onChange={(e) => setLabelValue(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishRename();
                  if (e.key === 'Escape') {
                    setLabelValue(data.label);
                    setIsEditing(false);
                  }
                }}
                className="bg-black/70 border border-sky-400 rounded px-1 text-xs text-white outline-none w-28 font-mono"
              />
            ) : (
              <div 
                onDoubleClick={() => setIsEditing(true)}
                title="İsmi değiştirmek için çift tıklayın"
                className="text-xs font-semibold text-white truncate cursor-text hover:text-sky-300"
              >
                {data.label}
              </div>
            )}
            <div className="text-[10px] text-slate-400 font-mono">
              {data.format || 'BED Format'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handlePickFile}
            title="Dosya Seç"
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <FolderOpen size={13} />
          </button>
          {data.onDeleteNode && (
            <button
              type="button"
              onClick={() => data.onDeleteNode?.(id)}
              title="Düğümü Sil"
              className="p-1 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-400 truncate bg-black/40 px-2 py-1 rounded-md border border-white/5" title={data.path}>
        {data.path || 'Dosya seçilmedi'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-sky-400 !border-2 !border-[#0b0d11]"
      />
    </div>
  );
};