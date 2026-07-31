import React, { useState } from 'react';
import { X, Send, Shield, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../services/api';

const ShareModal = ({ isOpen, doc, onClose, onShareSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('read');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !doc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || email.trim() === '') {
      onError('Please enter an email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      onError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/share', {
        documentId: doc.id,
        email: email.trim(),
        permission
      });
      
      onShareSuccess(response.data.message);
      setEmail('');
      setPermission('read');
      onClose();
    } catch (error) {
      console.error('Sharing document failed:', error);
      const msg = error.response?.data?.error || 'Failed to share document. Please try again.';
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden relative shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Share Document</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">
              "{doc.title}"
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-slate-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              User Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. bob@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-700 focus:border-brand-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Permission Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Read option */}
              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                permission === 'read'
                  ? 'border-brand-500/50 bg-brand-500/5 text-brand-300'
                  : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="permission"
                  value="read"
                  checked={permission === 'read'}
                  onChange={() => setPermission('read')}
                  className="hidden"
                />
                <Shield className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">Viewer</p>
                  <span className="text-[10px] text-slate-400 font-medium">Read Only</span>
                </div>
              </label>

              {/* Write option */}
              <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                permission === 'write'
                  ? 'border-brand-500/50 bg-brand-500/5 text-brand-300'
                  : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="permission"
                  value="write"
                  checked={permission === 'write'}
                  onChange={() => setPermission('write')}
                  className="hidden"
                />
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">Editor</p>
                  <span className="text-[10px] text-slate-400 font-medium">Read & Write</span>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-700/50 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/10 hover:shadow-brand-600/20 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
