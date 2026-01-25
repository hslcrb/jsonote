
// src/lib/i18n.ts

export type Language = 'en' | 'ko' | 'ja';

export const translations = {
    en: {
        // Sidebar
        'sidebar.search': 'Search',
        'sidebar.new_page': 'New Page',
        'sidebar.favorites': 'Favorites',
        'sidebar.notes': 'Private',
        'sidebar.guide': 'User Guide',
        'sidebar.trash': 'Trash',
        'sidebar.settings': 'Settings',
        'sidebar.no_results': 'No results found',

        // Editor
        'editor.untitled': 'Untitled',
        'editor.filename': 'Filename',
        'editor.edit': 'Edit',
        'editor.preview': 'Preview',
        'editor.json': 'JSON',
        'editor.type': 'Type',
        'editor.tags': 'Tags',
        'editor.parent': 'Parent Page',
        'editor.mcp_assistant': 'AI Assistant (MCP)',
        'editor.empty_mcp': 'No MCP tools connected.',
        'editor.none': 'None',
        'editor.delete_confirm_title': 'Delete Note',
        'editor.delete_confirm_msg': 'Are you sure you want to permanently delete this note?',
        'editor.save_error': 'Failed to save. Check your connection or GitHub settings.',
        'editor.add_icon': 'Add Icon',
        'editor.add_cover': 'Add Cover',
        'editor.placeholder': 'Press \'/\' for commands...',
        'editor.save_status.saving': 'Saving...',
        'editor.save_status.saved': 'Saved',
        'editor.save_status.error': 'Error',

        'editor.syntax.bold': 'Bold Text',
        'editor.syntax.italic': 'Italic',
        'editor.syntax.heading': 'Heading',
        'editor.syntax.list': 'List Item',
        'editor.syntax.code': 'Code Block',
        'editor.syntax.quote': 'Quote',
        'editor.syntax.link': 'Link Text',
        'editor.syntax.image': 'Image Description',
        'editor.syntax.todo': 'Checklist',
        'editor.syntax.add_item': 'Add Item',

        // Properties
        'props.title': 'Properties',
        'props.add': 'Add Property',
        'props.name': 'Property Name',
        'props.value': 'Value',

        // Settings
        'settings.title': 'Settings',
        'settings.general': 'General',
        'settings.github': 'GitHub Config',
        'settings.theme': 'Theme',
        'settings.language': 'Language',
        'settings.token': 'Personal Access Token',
        'settings.owner': 'Owner',
        'settings.repo': 'Repository',
        'settings.branch': 'Branch',
        'settings.test_conn': 'Test Connection',
        'settings.save': 'Save',
        'settings.cancel': 'Cancel',
        'settings.success': 'Connected successfully!',
        'settings.fail': 'Connection failed',

        // MCP
        'mcp.title': "MCP Tools",
        'mcp.add': "Add Tool",
        'mcp.name': "Tool Name",
        'mcp.url': "SSE URL",

        // Views
        'views.list': 'List',
        'views.table': 'Table',
        'views.board': 'Board',

        // Table
        'table.name': 'Name',
        'table.type': 'Type',
        'table.tags': 'Tags',
        'table.updated': 'Updated',
        'table.actions': 'Actions',
        'table.add_row': 'Add a new row',
    },
    ko: {
        // Sidebar
        'sidebar.search': '검색',
        'sidebar.new_page': '새 페이지',
        'sidebar.favorites': '즐겨찾기',
        'sidebar.notes': '개인 노트',
        'sidebar.guide': '사용 가이드',
        'sidebar.trash': '휴지통',
        'sidebar.settings': '설정',
        'sidebar.no_results': '검색 결과 없음',

        // Editor
        'editor.untitled': '제목 없음',
        'editor.filename': '파일명',
        'editor.edit': '편집',
        'editor.preview': '미리보기',
        'editor.json': 'JSON',
        'editor.type': '유형',
        'editor.tags': '태그',
        'editor.parent': '상위 페이지',
        'editor.mcp_assistant': 'AI 어시스턴트 (MCP)',
        'editor.empty_mcp': '연결된 MCP 도구가 없습니다.',
        'editor.none': '없음',
        'editor.delete_confirm_title': '노트 삭제',
        'editor.delete_confirm_msg': '이 노트를 영구적으로 삭제하시겠습니까?',
        'editor.save_error': '저장에 실패했습니다. 네트워크 또는 GitHub 설정을 확인해주세요.',
        'editor.add_icon': '아이콘 추가',
        'editor.add_cover': '커버 추가',
        'editor.placeholder': '\'/\'를 눌러 명령어 입력...',
        'editor.save_status.saving': '저장 중...',
        'editor.save_status.saved': '저장됨',
        'editor.save_status.error': '오류',

        'editor.syntax.bold': '굵은 텍스트',
        'editor.syntax.italic': '기울임',
        'editor.syntax.heading': '제목',
        'editor.syntax.list': '리스트 항목',
        'editor.syntax.code': '코드 블록',
        'editor.syntax.quote': '인용문',
        'editor.syntax.link': '링크 텍스트',
        'editor.syntax.image': '이미지 설명',
        'editor.syntax.todo': '체크리스트',
        'editor.syntax.add_item': '항목 추가',

        // Properties
        'props.title': '속성',
        'props.add': '속성 추가',
        'props.name': '속성 이름',
        'props.value': '값',

        // Settings
        'settings.title': '설정',
        'settings.general': '일반',
        'settings.github': 'GitHub 설정',
        'settings.theme': '테마',
        'settings.language': '언어',
        'settings.token': '개인 액세스 토큰',
        'settings.owner': '소유자 (Owner)',
        'settings.repo': '저장소 (Repo)',
        'settings.branch': '브랜치',
        'settings.test_conn': '연결 진단',
        'settings.save': '저장',
        'settings.cancel': '취소',
        'settings.success': '성공적으로 연결되었습니다!',
        'settings.fail': '연결 실패',

        // MCP
        'mcp.title': "MCP 도구",
        'mcp.add': "도구 추가",
        'mcp.name': "이름",
        'mcp.url': "SSE URL",

        // Views
        'views.list': '리스트',
        'views.table': '테이블',
        'views.board': '보드',

        // Table
        'table.name': '이름',
        'table.type': '유형',
        'table.tags': '태그',
        'table.updated': '최종 수정일',
        'table.actions': '작업',
        'table.add_row': '새로운 행 추가',
    },
    ja: {
        // Sidebar
        'sidebar.search': '検索',
        'sidebar.new_page': '新規ページ',
        'sidebar.favorites': 'お気に入り',
        'sidebar.notes': 'プライベート',
        'sidebar.guide': 'ユーザーガイド',
        'sidebar.trash': 'ゴミ箱',
        'sidebar.settings': '設定',
        'sidebar.no_results': '結果が見つかりません',

        // Editor
        'editor.untitled': '無題',
        'editor.filename': 'ファイル名',
        'editor.edit': '編集',
        'editor.preview': 'プレビュー',
        'editor.json': 'JSON',
        'editor.type': 'タイプ',
        'editor.tags': 'タグ',
        'editor.parent': '親ページ',
        'editor.mcp_assistant': 'AIアシスタント (MCP)',
        'editor.empty_mcp': '接続されたMCPツールはありません。',
        'editor.none': 'なし',
        'editor.delete_confirm_title': 'ノートを削除',
        'editor.delete_confirm_msg': 'このノートを永久に削除してもよろしいですか？',
        'editor.save_error': '保存に失敗しました。ネットワークまたはGitHubの設定を確認してください。',
        'editor.add_icon': 'アイコン追加',
        'editor.add_cover': 'カバー追加',
        'editor.placeholder': '\'/\'キーでコマンド入力...',
        'editor.save_status.saving': '保存中...',
        'editor.save_status.saved': '保存済み',
        'editor.save_status.error': 'エラー',

        'editor.syntax.bold': '太字',
        'editor.syntax.italic': '斜体',
        'editor.syntax.heading': '見出し',
        'editor.syntax.list': 'リスト項目',
        'editor.syntax.code': 'コードブロック',
        'editor.syntax.quote': '引用',
        'editor.syntax.link': 'リンクテキスト',
        'editor.syntax.image': '画像の説明',
        'editor.syntax.todo': 'チェックリスト',
        'editor.syntax.add_item': '項目追加',

        // Properties
        'props.title': 'プロパティ',
        'props.add': 'プロパティ追加',
        'props.name': 'プロパティ名',
        'props.value': '値',

        // Settings
        'settings.title': '設定',
        'settings.general': '一般',
        'settings.github': 'GitHub設定',
        'settings.theme': 'テーマ',
        'settings.language': '言語',
        'settings.token': 'パーソナルアクセストークン',
        'settings.owner': 'オーナー',
        'settings.repo': 'リポジトリ',
        'settings.branch': 'ブランチ',
        'settings.test_conn': '接続診断',
        'settings.save': '保存',
        'settings.cancel': 'キャンセル',
        'settings.success': '接続に成功しました！',
        'settings.fail': '接続失敗',

        // MCP
        'mcp.title': "MCPツール",
        'mcp.add': "ツール追加",
        'mcp.name': "名前",
        'mcp.url': "SSE URL",

        // Views
        'views.list': 'リスト',
        'views.table': 'テーブル',
        'views.board': 'ボード',

        // Table
        'table.name': '名前',
        'table.type': 'タイプ',
        'table.tags': 'タグ',
        'table.updated': '最終更新日',
        'table.actions': 'アクション',
        'table.add_row': '新しい行を追加',
    }
};
