'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Github,
  Settings,
  Folder,
  FileText,
  Clock,
  Star,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Hash,
  Trash2,
  Type,
  Cloud
} from 'lucide-react';
import { format } from 'date-fns';
import { Note, NoteType, StorageConfig } from '@/types/note';
import NoteEditor from '@/components/NoteEditor';
import SettingsModal from '@/components/SettingsModal';
import { getStorage } from '@/lib/storage';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [storageConfig, setStorageConfig] = useState<StorageConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // States: Theme & Device View
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [filterType, setFilterType] = useState<NoteType | 'all'>('all');

  // Load persistence
  useEffect(() => {
    const savedNotes = localStorage.getItem('jsonote_notes');
    const savedConfig = localStorage.getItem('jsonote_storage_config');
    const savedTheme = localStorage.getItem('jsonote_theme') as 'dark' | 'light';
    const savedView = localStorage.getItem('jsonote_view') as 'desktop' | 'mobile';

    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConfig) setStorageConfig(JSON.parse(savedConfig));
    if (savedTheme) setTheme(savedTheme);
    if (savedView) setViewMode(savedView);

    if (!savedNotes) {
      const mockNotes: Note[] = [
        {
          metadata: {
            id: '1',
            title: 'jsonote 프로젝트 비전',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'general',
            tags: ['비전', 'jsonote'],
          },
          content: 'GitHub, GitLab, S3 등을 지원하는 궁극적인 노트 앱을 구축합니다.',
        }
      ];
      setNotes(mockNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(mockNotes));
    }
  }, []);

  // Theme & View effects
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jsonote_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jsonote_view', viewMode);
  }, [viewMode]);

  // Auto-sync
  useEffect(() => {
    if (!storageConfig || !storageConfig.enabled) return;
    const interval = setInterval(() => handleSync(true), 120000); // Poll every 2 mins
    return () => clearInterval(interval);
  }, [storageConfig, notes]);

  const handleSaveNote = (updatedNote: Note) => {
    const newNotes = notes.find(n => n.metadata.id === updatedNote.metadata.id)
      ? notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n)
      : [...notes, updatedNote];
    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    setIsEditorOpen(false);
    setSelectedNote(null);
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말 이 노트를 삭제하시겠습니까?')) {
      const newNotes = notes.filter(n => n.metadata.id !== id);
      setNotes(newNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      metadata: {
        id: Math.random().toString(36).substr(2, 9),
        title: '제목 없는 노트',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: 'general',
        tags: [],
      },
      content: '',
    };
    setSelectedNote(newNote);
    setIsEditorOpen(true);
  };

  const handleSync = async (silent: boolean = false) => {
    if (!storageConfig || !storageConfig.enabled) {
      if (!silent) setIsSettingsOpen(true);
      return;
    }

    const storage = getStorage(storageConfig);
    if (!storage) {
      if (!silent) alert('지원되지 않는 저장소 방식입니다.');
      return;
    }

    if (!silent) setIsSyncing(true);
    try {
      // Step 1: Push local updates to remote
      for (const note of notes) {
        await storage.saveNote(note);
      }

      // Step 2: Fetch latest from remote
      const resynced = await storage.fetchNotes();
      setNotes(resynced);
      localStorage.setItem('jsonote_notes', JSON.stringify(resynced));

      if (!silent) alert('동기화가 성공적으로 완료되었습니다!');
    } catch (e) {
      console.error('Sync error:', e);
      if (!silent) alert('동기화 중 오류가 발생했습니다.');
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleSaveSettings = (config: StorageConfig) => {
    setStorageConfig(config);
    localStorage.setItem('jsonote_storage_config', JSON.stringify(config));
    setIsSettingsOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleViewMode = () => setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.metadata.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className={`layout-container ${viewMode}-view`}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? (viewMode === 'mobile' ? '100%' : '280px') : '0',
          x: isSidebarOpen ? 0 : -280,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className="sidebar glass"
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">J</div>
            <span className="logo-text">jsonote</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="icon-btn mobile-only">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <button className="new-note-btn glass-card" onClick={createNewNote}>
            <Plus size={18} />
            <span>새 노트 작성</span>
          </button>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <label>필터링</label>
              <button
                className={`nav-item ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                <FileText size={18} />
                <span>모든 노트</span>
              </button>
              <button
                className={`nav-item ${filterType === 'journal' ? 'active' : ''}`}
                onClick={() => setFilterType('journal')}
              >
                <Star size={18} />
                <span>저널</span>
              </button>
            </div>

            <div className="nav-group">
              <label>저장소 유형</label>
              <button className="nav-item">
                {storageConfig?.provider === 's3' ? <Cloud size={18} /> : <Github size={18} />}
                <span className="truncate">{storageConfig?.provider?.toUpperCase() || '로컬 저장소'}</span>
                <span className="badge">{notes.length}</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} />
            <span>설정</span>
          </button>
          <div className="toggle-group glass">
            <button onClick={toggleTheme} className="icon-btn" title="테마 변경">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={toggleViewMode} className="icon-btn" title="보기 모드 변경">
              {viewMode === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header glass">
          <div className="header-left">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`icon-btn ${isSidebarOpen ? 'hidden' : ''}`}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb desktop-only">
              <span>내 워크스페이스</span>
              <ChevronRight size={14} className="text-muted" />
              <span className="current">모두 보기</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar glass">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={`sync-btn glass-card ${isSyncing ? 'animate-pulse' : ''}`}
              onClick={() => handleSync()}
              disabled={isSyncing}
            >
              <Cloud size={18} className={isSyncing ? 'animate-spin' : ''} />
              <span className="desktop-only text-nowrap">{isSyncing ? '동기화 중...' : '클라우드 동기화'}</span>
            </button>
          </div>
        </header>

        <section className={`notes-container ${viewMode === 'mobile' ? 'list-view' : 'grid-view'}`}>
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.metadata.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="note-card glass-card"
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditorOpen(true);
                }}
              >
                <div className="note-card-header">
                  <div className={`type-tag type-${note.metadata.type}`}>
                    <Hash size={10} />
                    {note.metadata.type === 'general' ? '일반' :
                      note.metadata.type === 'meeting' ? '회의' :
                        note.metadata.type === 'task' ? '할 일' :
                          note.metadata.type === 'journal' ? '저널' : '코드'}
                  </div>
                  <button className="del-btn" onClick={(e) => deleteNote(note.metadata.id, e)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="note-card-title">{note.metadata.title || '제목 없음'}</h3>
                <p className="note-card-preview">{note.content || '내용이 없습니다.'}</p>
                <div className="note-card-footer">
                  <span className="date">
                    {format(new Date(note.metadata.updatedAt), 'MM.dd')}
                  </span>
                  <div className="tags">
                    {note.metadata.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="empty-state">
              <Type size={48} className="text-muted" />
              <p>노트가 존재하지 않습니다.</p>
            </div>
          )}
        </section>

        {/* Modals */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsModal
              config={storageConfig}
              onSave={handleSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
          {isEditorOpen && selectedNote && (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onClose={() => { setIsEditorOpen(false); setSelectedNote(null); }}
            />
          )}
        </AnimatePresence>
      </main>

      <style jsx>{`
        .layout-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background-color: var(--bg-primary);
          transition: background-color 0.3s ease;
        }

        /* Mobile View Mode: Centered Phone-like Column */
        .mobile-view {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #0c0c0e; /* Clean neutral outer background */
        }

        /* Container for the mobile app simulation */
        .mobile-view .main-content,
        .mobile-view .sidebar {
          width: 100%;
          max-width: 420px;
          height: 100%;
          max-height: 850px;
          margin: 0;
          background-color: var(--bg-primary);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          border-radius: 32px;
          overflow: hidden;
          position: absolute;
        }

        .mobile-view .main-content {
          border: 1px solid var(--border-glass);
          z-index: 10;
        }

        .mobile-view .sidebar {
          position: absolute !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          z-index: 1000 !important;
        }

        /* Adjustments for the mobile internal elements */
        .mobile-view .content-header {
          height: 64px;
          padding: 0 1.25rem;
        }

        .mobile-view .notes-container {
          padding: 1.25rem;
        }

        .mobile-view .new-note-btn {
          padding: 0.85rem;
        }

        /* Desktop Layout Mode: Side-by-Side */
        .desktop-view .sidebar { 
          width: 280px;
          border-right: 1px solid var(--border-glass); 
          height: 100%;
        }

        .desktop-view .main-content {
          flex: 1;
        }

        .sidebar { 
          display: flex; 
          flex-direction: column; 
          background: var(--bg-secondary);
          flex-shrink: 0;
          z-index: 50; 
        }
        
        .sidebar-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .logo-container { display: flex; align-items: center; gap: 0.75rem; }
        .logo-icon { width: 32px; height: 32px; background: var(--accent-gradient); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-family: 'Outfit'; }
        .logo-text { font-size: 1.25rem; font-weight: 700; font-family: 'Outfit'; letter-spacing: -0.02em; }
        .sidebar-content { flex: 1; padding: 0 1rem; display: flex; flex-direction: column; gap: 1.5rem; overflow-y: auto; }
        
        .new-note-btn { 
          width: 100%; 
          padding: 1rem; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 0.5rem; 
          font-weight: 700; 
          color: white; 
          background: var(--accent-gradient); 
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .nav-group { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem; }
        .nav-group label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); padding: 0 0.85rem; margin-bottom: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; }
        
        .nav-item { 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          padding: 0.85rem 1rem; 
          border-radius: var(--radius-md); 
          color: var(--text-secondary); 
          font-size: 0.95rem; 
          font-weight: 600; 
          text-align: left; 
        }
        
        .nav-item:hover, .nav-item.active { color: var(--text-primary); background: rgba(255,255,255,0.05); }
        .nav-item.active { background: rgba(59, 130, 246, 0.1); color: var(--accent-primary); }
        
        .badge { margin-left: auto; font-size: 0.75rem; background: var(--border-glass); padding: 0.15rem 0.6rem; border-radius: var(--radius-full); color: var(--text-muted); }
        .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border-glass); display: flex; flex-direction: column; gap: 1rem; }
        .toggle-group { display: flex; padding: 0.35rem; border-radius: var(--radius-lg); justify-content: space-around; background: rgba(0,0,0,0.2); }
        
        .main-content { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          position: relative; 
          background: var(--bg-primary);
        }
        
        .content-header { height: 72px; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; z-index: 40; border-bottom: 1px solid var(--border-glass); }
        .header-left, .header-right { display: flex; align-items: center; gap: 1rem; }
        
        .search-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1.25rem; border-radius: var(--radius-full); width: clamp(160px, 30vw, 400px); background: rgba(0,0,0,0.1); }
        .search-bar input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.95rem; width: 100%; }
        
        .sync-btn { 
          padding: 0.6rem 1.25rem; 
          display: flex; 
          align-items: center; 
          gap: 0.5rem; 
          font-weight: 700; 
          font-size: 0.9rem; 
          color: var(--text-primary); 
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
        }
        
        .notes-container { flex: 1; padding: 1.5rem; overflow-y: auto; align-content: start; }
        .grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .list-view { display: flex; flex-direction: column; gap: 0.85rem; max-width: 600px; margin: 0 auto; width: 100%; }
        
        .note-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; cursor: pointer; position: relative; border-radius: var(--radius-lg); border: 1px solid var(--border-glass); }
        .note-card-header { display: flex; justify-content: space-between; align-items: center; }
        
        .type-tag { font-size: 0.6rem; text-transform: uppercase; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); letter-spacing: 0.08em; display: flex; align-items: center; gap: 0.3rem; }
        .type-general { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .type-meeting { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .type-journal { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
        
        .del-btn { color: var(--text-muted); opacity: 0; transition: opacity 0.2s; }
        .note-card:hover .del-btn { opacity: 1; }
        .del-btn:hover { color: #f43f5e; }
        
        .note-card-title { font-size: 1.1rem; color: var(--text-primary); line-height: 1.3; font-weight: 700; }
        .note-card-preview { font-size: 0.9rem; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; }
        .note-card-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-glass); }
        
        .date { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .tags { display: flex; gap: 0.4rem; }
        .tag { font-size: 0.7rem; color: var(--accent-primary); font-weight: 700; }
        
        .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); }
        .icon-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); color: var(--text-secondary); transition: all 0.2s; }
        .icon-btn:hover { background: rgba(255,255,255,0.05); color: var(--accent-primary); }
        
        .hidden { display: none; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .text-nowrap { white-space: nowrap; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
