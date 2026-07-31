import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Share2, FolderOpen, Trash2, Calendar, User as UserIcon, Edit3 } from 'lucide-react';

const DocumentCard = ({ doc, currentUserId, onShareClick, onDeleteClick, onRenameClick }) => {
  const navigate = useNavigate();

  const isOwner = doc.owner_id === currentUserId;
  const ownerName = isOwner ? 'Me' : doc.Owner?.name || 'Unknown';
  
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-48 group">
      <div>
        {/* Header (Icon + Badge) */}
        <div className="flex justify-between items-start">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl group-hover:bg-brand-500/20 group-hover:border-brand-500/40 transition-colors">
            <FileText className="w-6 h-6 text-brand-400" />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            isOwner 
              ? 'bg-brand-950/40 border-brand-500/30 text-brand-300' 
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}>
            {isOwner ? 'Owner' : doc.permission === 'write' ? 'Can Edit' : 'Read Only'}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-4 font-semibold text-base text-white group-hover:text-brand-300 transition-colors truncate">
          {doc.title}
        </h3>
      </div>

      <div>
        {/* Metadata */}
        <div className="space-y-1.5 mb-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5" />
            <span className="truncate">Owner: <strong className="text-slate-300">{ownerName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated: {formatDate(doc.updatedAt)}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800/60">
          <div className="flex gap-1">
            {isOwner && (
              <button
                onClick={() => onShareClick(doc)}
                className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                title="Share Document"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {(isOwner || doc.permission === 'write') && (
              <button
                onClick={() => onRenameClick(doc.id, doc.title)}
                className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                title="Rename Document"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => onDeleteClick(doc.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Delete Document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => navigate(`/document/${doc.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700/60 hover:border-brand-500/40 transition-all shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
