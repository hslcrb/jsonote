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
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Note, NoteType, GitHubConfig } from '@/types/note';
import NoteEditor from '@/components/NoteEditor';
import SettingsModal from '@/components/SettingsModal';
import { GitHubStorage } from '@/lib/github';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [ghConfig, setGhConfig] = useState<GitHubConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load notes and config from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('jsonote_notes');
    const savedConfig = localStorage.getItem('jsonote_gh_config');

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
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
          content: 'GitHub 연동과 JSON 기반의 궁극적인 노트 앱을 구축합니다.',
        }
      ];
      setNotes(mockNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(mockNotes));
    }

    if (savedConfig) {
      setGhConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Auto-sync effect: Poll GitHub every 60 seconds if configured
  useEffect(() => {
    if (!ghConfig || !ghConfig.token) return;

    const interval = setInterval(() => {
      console.log('Background Sync Initialized...');
      handleSync(true); // silent sync
    }, 60000);

    return () => clearInterval(interval);
  }, [ghConfig, notes]);

  const handleSaveNote = (updatedNote: Note) => {
    let newNotes;
    const exists = notes.find(n => n.metadata.id === updatedNote.metadata.id);
    if (exists) {
      newNotes = notes.map(n => n.metadata.id === updatedNote.metadata.id ? updatedNote : n);
    } else {
      newNotes = [...notes, updatedNote];
    }
    setNotes(newNotes);
    localStorage.setItem('jsonote_notes', JSON.stringify(newNotes));
    setIsEditorOpen(false);
    setSelectedNote(null);
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
    if (!ghConfig || !ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
      if (!silent) setIsSettingsOpen(true);
      return;
    }

    if (!silent) setIsSyncing(true);
    try {
      const storage = new GitHubStorage(ghConfig);

      const remoteNotes = await storage.fetchNotes();

      // Basic merge: push local notes to remote
      // To prevent бесконечные (endless) push/pull, we'd need more logic, 
      // but for this version, we ensure remote has all local edits.
      for (const note of notes) {
        await storage.saveNote(note);
      }

      const finalNotes = await storage.fetchNotes();
      setNotes(finalNotes);
      localStorage.setItem('jsonote_notes', JSON.stringify(finalNotes));
      if (!silent) alert('동기화가 성공적으로 완료되었습니다!');
    } catch (error) {
      console.error('Sync failed:', error);
      if (!silent) alert('동기화 실패: GitHub 설정과 권한을 확인해주세요.');
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleSaveSettings = (config: GitHubConfig) => {
    setGhConfig(config);
    localStorage.setItem('jsonote_gh_config', JSON.stringify(config));
    setIsSettingsOpen(false);
  };

  const filteredNotes = notes.filter(n =>
    n.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.metadata.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="layout">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="sidebar glass"
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">J</div>
            <span className="logo-text">jsonote</span>
          </div>
        </div>

        <div className="sidebar-content">
          <button className="new-note-btn glass-card" onClick={createNewNote}>
            <Plus size={18} />
            <span>새 노트</span>
          </button>

          <nav className="sidebar-nav">
            <div className="nav-group">
              <label>보기</label>
              <button className="nav-item active">
                <FileText size={18} />
                <span>모든 노트</span>
              </button>
              <button className="nav-item">
                <Clock size={18} />
                <span>최근 항목</span>
              </button>
              <button className="nav-item">
                <Star size={18} />
                <span>즐겨찾기</span>
              </button>
            </div>

            <div className="nav-group">
              <label>리포지토리</label>
              <button className="nav-item">
                <Github size={18} />
                <span>{ghConfig?.repo || '연결 안 됨'}</span>
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
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header glass">
          <div className="header-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="icon-btn"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>내 워크스페이스</span>
              <ChevronRight size={14} className="text-muted" />
              <span className="current">모든 노트</span>
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar glass">
              <Search size={16} className="text-muted" />
              <input
                type="text"
                placeholder="노트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={`sync-btn glass-card ${isSyncing ? 'animate-pulse' : ''}`}
              onClick={() => handleSync()}
              disabled={isSyncing}
            >
              <Github size={18} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? '동기화 중...' : '동기화'}</span>
            </button>
          </div>
        </header>

        <section className="notes-grid">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="note-card glass-card"
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditorOpen(true);
                }}
              >
                <div className="note-card-header">
                  <div className={`type-tag type-${note.metadata.type}`}>
                    {note.metadata.type === 'general' ? '일반' :
                      note.metadata.type === 'meeting' ? '회의' :
                        note.metadata.type === 'task' ? '할 일' :
                          note.metadata.type === 'journal' ? '저널' : '코드'}
                  </div>
                  <span className="date">
                    {format(new Date(note.metadata.updatedAt), 'yyyy년 MM월 dd일')}
                  </span>
                </div>
                <h3 className="note-card-title">{note.metadata.title}</h3>
                <p className="note-card-preview">{note.content}</p>
                <div className="note-card-footer">
                  <div className="tags">
                    {note.metadata.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <button className="more-btn">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsModal
              config={ghConfig}
              onSave={handleSaveSettings}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
          {isEditorOpen && selectedNote && (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedNote(null);
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <style jsx>{`
        .layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #0a0a0c 0%, #1a1a1e 100%);
        }

        .sidebar {
          height: 100%;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-glass);
          overflow: hidden;
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.5rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--accent-gradient);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-family: 'Outfit';
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: 'Outfit';
          letter-spacing: -0.02em;
        }

        .sidebar-content {
          flex: 1;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .new-note-btn {
          width: 100%;
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-group label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          padding: 0 0.75rem;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .nav-item:hover, .nav-item.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-primary);
        }

        .badge {
          margin-left: auto;
          font-size: 0.75rem;
          background: var(--border-glass);
          padding: 0.1rem 0.5rem;
          border-radius: var(--radius-full);
          color: var(--text-muted);
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-glass);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .content-header {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--border-glass);
          z-index: 40;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .breadcrumb .current {
          color: var(--text-primary);
          font-weight: 600;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-md);
          width: 300px;
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          width: 100%;
        }

        .sync-btn {
          padding: 0.4rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-primary);
          background: var(--accent-gradient);
        }

        .notes-grid {
          flex: 1;
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          overflow-y: auto;
          align-content: start;
        }

        .note-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          cursor: pointer;
        }

        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .type-tag {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.05em;
        }

        .type-general { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .type-meeting { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .note-card-title {
          font-size: 1.1rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .note-card-preview {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.6;
        }

        .note-card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-glass);
        }

        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 0.75rem;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .more-btn {
          color: var(--text-muted);
        }

        .icon-btn {
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .text-muted { color: var(--text-muted); }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
