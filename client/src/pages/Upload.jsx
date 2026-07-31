import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload as UploadIcon, FileText, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setErrorMsg('');
    if (!selectedFile) return false;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'txt' && extension !== 'md') {
      setErrorMsg('Unsupported file type. Please upload a .txt or .md file.');
      showToast('Invalid file format selected.', 'error');
      return false;
    }
    
    setFile(selectedFile);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrorMsg('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Set multipart headers so Axios handles files properly
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('File imported successfully!', 'success');
      
      // Delay navigation slightly so user sees success toast
      setTimeout(() => {
        navigate(`/document/${response.data.id}`);
      }, 1000);
    } catch (err) {
      console.error('Import file failed:', err);
      const msg = err.response?.data?.error || 'Failed to import file. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
      setUploading(false);
    }
  };

  return (
    <div className="flex-grow p-8 flex flex-col justify-center items-center max-h-screen overflow-y-auto">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Import Document</h1>
          <p className="text-slate-400 text-sm mt-2">
            Upload your text or markdown files to automatically convert them into interactive editable documents.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full min-h-[260px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
              dragActive
                ? 'border-brand-500 bg-brand-500/5'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              accept=".txt,.md"
              className="hidden"
            />

            {!file ? (
              <>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-slate-400">
                  <UploadIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your file here, or{' '}
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    className="text-brand-400 hover:text-brand-300 underline font-bold"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Supports .txt and .md files (Max 5MB)
                </p>
              </>
            ) : (
              <div className="w-full max-w-md bg-slate-950/50 border border-slate-850 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 bg-rose-950/40 border border-rose-900/30 text-rose-300 rounded-xl text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-850 text-sm font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-900 disabled:border disabled:border-slate-800 disabled:text-slate-500 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/10 hover:shadow-brand-600/20 transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing Document...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Convert to Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Upload;
