import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import api from '../services/api';
import { 
  ArrowLeft, Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3, 
  List, ListOrdered, Save, Loader2, CloudCheck, Eye, Edit3, ShieldAlert,
  Undo, Redo, Strikethrough, Quote, Code, Terminal, Minus, Printer, Download,
  ChevronDown, FileText, FileCode
} from 'lucide-react';
import Toast from '../components/Toast';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'unsaved', 'saving'
  const [toast, setToast] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  // We keep a reference to current title and content for auto-save comparison
  const docRef = useRef({ title: '', content: '' });
  const editorInitialized = useRef(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: '',
    onUpdate: () => {
      setSaveStatus('unsaved');
    }
  });

  // Fetch document details on page mount or when document ID changes
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${id}`);
        setDoc(response.data);
        setTitle(response.data.title);
        
        docRef.current = {
          title: response.data.title,
          content: response.data.content || ''
        };
        
        // Reset editor initialization flag for new documents
        editorInitialized.current = false;
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error fetching document details:', error);
        showToast(error.response?.data?.error || 'Failed to load document.', 'error');
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Populate editor content exactly once after both the editor view and document details are ready
  useEffect(() => {
    if (editor && editor.view && doc && !editorInitialized.current) {
      editor.commands.setContent(doc.content || '');
      const canWrite = doc.permission === 'owner' || doc.permission === 'write';
      editor.setEditable(canWrite);
      editorInitialized.current = true;
    }
  }, [editor, doc]);

  // Download as plain text
  const downloadText = () => {
    if (!editor) return;
    const textContent = editor.getText();
    const blob = new Blob([`${title}\n\n${textContent}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as Markdown
  const downloadMarkdown = () => {
    if (!editor) return;
    let html = editor.getHTML();
    let md = html
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<li>(.*?)<\/li>/gi, '* $1\n')
      .replace(/<ul>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre><code>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '');

    const blob = new Blob([`# ${title}\n\n${md}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as HTML
  const downloadHtml = () => {
    if (!editor) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 2.5rem; max-width: 800px; margin: 0 auto; color: #1e293b; }
    h1 { border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; color: #0f172a; }
    blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; background: #f8fafc; font-style: italic; color: #475569; margin: 1.5rem 0; border-radius: 0 4px 4px 0; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; border: 1px solid #e2e8f0; }
    code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.85em; color: #be185d; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${editor.getHTML()}
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Counts for document footer
  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const getCharCount = () => {
    if (!editor) return 0;
    return editor.getText().length;
  };

  // Handle document save
  const handleSave = async (silent = false) => {
    if (!editor || !doc) return;

    const currentTitle = title.trim();
    const currentContent = editor.getHTML();

    if (!currentTitle) {
      showToast('Document title cannot be empty.', 'error');
      return;
    }

    // Check if changes actually exist
    if (currentTitle === docRef.current.title && currentContent === docRef.current.content) {
      setSaveStatus('saved');
      return;
    }

    if (!silent) setSaving(true);
    setSaveStatus('saving');

    try {
      await api.put(`/documents/${id}`, {
        title: currentTitle,
        content: currentContent
      });

      docRef.current = {
        title: currentTitle,
        content: currentContent
      };
      
      setSaveStatus('saved');
      if (!silent) showToast('Document saved successfully.', 'success');
    } catch (err) {
      console.error('Error saving document:', err);
      setSaveStatus('unsaved');
      if (!silent) showToast('Failed to save document.', 'error');
    } finally {
      if (!silent) setSaving(false);
    }
  };

  // Auto-Save interval (every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const canWrite = doc?.permission === 'owner' || doc?.permission === 'write';
      if (canWrite && saveStatus === 'unsaved') {
        handleSave(true);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [doc, title, saveStatus, editor]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-slate-950 min-h-screen">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-400 text-sm mt-4 font-medium">Loading document editor...</p>
      </div>
    );
  }

  if (!doc) return null;

  const canEdit = doc.permission === 'owner' || doc.permission === 'write';

  // Formatting helpers for Toolbar
  const toggleFormat = (formatAction) => {
    if (!editor || !canEdit) return;
    formatAction(editor.chain().focus()).run();
  };

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* Editor Sub-Header (Navigation + Title Input + Save Status) */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-slate-900 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-4 flex-grow min-w-0 mr-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Title input */}
          <div className="flex-grow min-w-0 max-w-xl">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                if (canEdit) {
                  setTitle(e.target.value);
                  setSaveStatus('unsaved');
                }
              }}
              placeholder="Document Title"
              disabled={!canEdit}
              className={`w-full bg-transparent font-bold text-lg text-white border-b border-transparent focus:border-brand-500 focus:outline-none py-1 transition-all ${
                !canEdit ? 'cursor-not-allowed opacity-80' : 'hover:border-slate-800'
              }`}
            />
          </div>

          {/* Permission badges */}
          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
            doc.permission === 'owner'
              ? 'bg-brand-950/40 border-brand-500/30 text-brand-300'
              : doc.permission === 'write'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            {doc.permission === 'owner' ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Owner
              </>
            ) : doc.permission === 'write' ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                Collaborator (Editor)
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Viewer (Read Only)
              </>
            )}
          </span>
        </div>

        {/* Save button and status indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            {saveStatus === 'saved' && (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Saved to Cloud</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-amber-400 font-medium">Unsaved changes...</span>
            )}
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            )}
          </div>

          {canEdit && (
            <button
              onClick={() => handleSave(false)}
              disabled={saving || saveStatus === 'saved'}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-900 disabled:border disabled:border-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-all"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Now
            </button>
          )}
        </div>
      </header>

      {/* Editor Toolbar */}
      {editor && canEdit && (
        <div className="flex flex-wrap items-center gap-1 px-6 py-2 border-b border-slate-900 bg-slate-900/30 print:hidden">
          {/* Undo */}
          <button
            onClick={() => toggleFormat((c) => c.undo())}
            disabled={!editor.can().undo()}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={() => toggleFormat((c) => c.redo())}
            disabled={!editor.can().redo()}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Bold */}
          <button
            onClick={() => toggleFormat((c) => c.toggleBold())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bold') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          {/* Italic */}
          <button
            onClick={() => toggleFormat((c) => c.toggleItalic())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('italic') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            onClick={() => toggleFormat((c) => c.toggleUnderline())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('underline') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          {/* Strikethrough */}
          <button
            onClick={() => toggleFormat((c) => c.toggleStrike())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('strike') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Inline Code */}
          <button
            onClick={() => toggleFormat((c) => c.toggleCode())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('code') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Headers */}
          <button
            onClick={() => toggleFormat((c) => c.toggleHeading({ level: 1 }))}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => toggleFormat((c) => c.toggleHeading({ level: 2 }))}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFormat((c) => c.toggleHeading({ level: 3 }))}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Lists */}
          <button
            onClick={() => toggleFormat((c) => c.toggleBulletList())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('bulletList') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFormat((c) => c.toggleOrderedList())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('orderedList') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          {/* Blockquote */}
          <button
            onClick={() => toggleFormat((c) => c.toggleBlockquote())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('blockquote') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Code Block */}
          <button
            onClick={() => toggleFormat((c) => c.toggleCodeBlock())}
            className={`p-2 rounded-lg transition-colors ${
              editor.isActive('codeBlock') ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Code Block"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Horizontal Rule */}
          <button
            onClick={() => toggleFormat((c) => c.setHorizontalRule())}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-grow" />

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Download / Export"
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {exportOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setExportOpen(false)} 
                />
                <div className="absolute right-0 mt-1 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => { downloadText(); setExportOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-left text-xs font-semibold transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    Plain Text (.txt)
                  </button>
                  <button
                    onClick={() => { downloadMarkdown(); setExportOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-left text-xs font-semibold transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-slate-400" />
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => { downloadHtml(); setExportOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-left text-xs font-semibold transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-brand-400" />
                    HTML Document (.html)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <main className="flex-grow overflow-y-auto px-6 py-10 flex justify-center bg-slate-950 scrollbar">
        {/* A4 Paper page container */}
        <div className="w-full max-w-4xl bg-white text-slate-900 shadow-2xl border border-slate-200 min-h-[1120px] h-fit px-16 py-20 rounded-sm editor-container relative">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Floating Word & Character Count */}
      {editor && (
        <div className="fixed bottom-6 right-6 bg-slate-900/90 border border-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-sm z-20 flex gap-4 print:hidden">
          <span>Words: <strong className="text-white">{getWordCount()}</strong></span>
          <span className="w-px bg-slate-800" />
          <span>Characters: <strong className="text-white">{getCharCount()}</strong></span>
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

export default Editor;
