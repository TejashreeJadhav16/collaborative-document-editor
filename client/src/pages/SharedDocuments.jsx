import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Users, Search, Loader2 } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import Toast from '../components/Toast';

const SharedDocuments = () => {
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchSharedDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setSharedDocs(response.data.shared || []);
    } catch (error) {
      console.error('Error fetching shared documents:', error);
      showToast('Failed to load shared documents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const filteredShared = sharedDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-grow p-8 overflow-y-auto max-h-screen">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Shared With Me</h1>
          <p className="text-slate-400 text-sm mt-1">
            Documents shared with you by other collaborators.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search shared documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 transition-all w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-slate-400 text-sm mt-4 font-medium">Fetching shared documents...</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white">Documents</h2>
            <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700/60 font-semibold">
              {filteredShared.length}
            </span>
          </div>

          {filteredShared.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border-dashed border-slate-800">
              <p className="text-sm font-medium">No documents have been shared with you yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShared.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  currentUserId={user?.id}
                  onShareClick={() => {}} // shared users cannot share, button is hidden
                  onDeleteClick={() => {}} // shared users cannot delete, button is hidden
                />
              ))}
            </div>
          )}
        </div>
      )}

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

export default SharedDocuments;
