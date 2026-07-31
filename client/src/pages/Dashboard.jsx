import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Search, Folder, Users, Loader2 } from 'lucide-react';
import DocumentCard from '../components/DocumentCard';
import ShareModal from '../components/ShareModal';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  // Sharing states
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setOwnedDocs(response.data.owned || []);
      setSharedDocs(response.data.shared || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('Failed to load documents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    setCreating(true);
    try {
      const response = await api.post('/documents', {
        title: 'Untitled Document',
        content: '<p>Start writing here...</p>'
      });
      showToast('Document created successfully!', 'success');
      navigate(`/document/${response.data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
      showToast('Failed to create document.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      showToast('Document deleted successfully.', 'success');
      
      // Update local state
      setOwnedDocs(ownedDocs.filter(doc => doc.id !== id));
      setSharedDocs(sharedDocs.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast('Failed to delete document.', 'error');
    }
  };

  const handleRenameDocument = async (id, currentTitle) => {
    const newTitle = window.prompt('Rename Document', currentTitle);
    if (newTitle === null) return; // User cancelled
    
    if (newTitle.trim() === '') {
      showToast('Document title cannot be empty.', 'error');
      return;
    }

    try {
      await api.put(`/documents/${id}`, { title: newTitle.trim() });
      showToast('Document renamed successfully.', 'success');
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error('Error renaming document:', error);
      showToast('Failed to rename document.', 'error');
    }
  };

  const handleShareClick = (doc) => {
    setSelectedDoc(doc);
    setIsShareOpen(true);
  };

  // Filter documents by search query
  const filteredOwned = ownedDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredShared = sharedDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-grow p-8 overflow-y-auto max-h-screen">
      {/* Top Banner (Welcome + Search) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-brand-400 font-semibold">{user?.name}</span>. Manage and write your notes here.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 transition-all w-64"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateDocument}
            disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-700/50 text-white rounded-xl text-sm font-bold shadow-md shadow-brand-600/10 hover:shadow-brand-600/20 transition-all flex-shrink-0"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Document
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-slate-400 text-sm mt-4 font-medium">Fetching documents...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* My Documents Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Folder className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">My Documents</h2>
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700/60 font-semibold">
                {filteredOwned.length}
              </span>
            </div>

            {filteredOwned.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border-dashed border-slate-800">
                <p className="text-sm font-medium">No documents owned by you.</p>
                <button
                  onClick={handleCreateDocument}
                  className="mt-3 text-xs font-bold text-brand-400 hover:text-brand-300 underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOwned.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    currentUserId={user?.id}
                    onShareClick={handleShareClick}
                    onDeleteClick={handleDeleteDocument}
                    onRenameClick={handleRenameDocument}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shared With Me Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">Shared With Me</h2>
              <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700/60 font-semibold">
                {filteredShared.length}
              </span>
            </div>

            {filteredShared.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-500 border-dashed border-slate-800">
                <p className="text-sm font-medium">No documents shared with you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShared.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    currentUserId={user?.id}
                    onShareClick={handleShareClick}
                    onDeleteClick={handleDeleteDocument}
                    onRenameClick={handleRenameDocument}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        doc={selectedDoc}
        onClose={() => {
          setIsShareOpen(false);
          setSelectedDoc(null);
        }}
        onShareSuccess={(msg) => {
          showToast(msg, 'success');
          fetchDocuments(); // Refresh permissions/sharing list
        }}
        onError={(msg) => showToast(msg, 'error')}
      />

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

export default Dashboard;
