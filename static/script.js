// Application State
class CodedPadApp {
    constructor() {
        this.currentSection = 'home';
        this.isAuthenticated = false;
        this.userData = {
            content: '',
            hasData: false
        };
        this.lastSaved = null;
        this.autoSaveInterval = null;
        this.sessionStartTime = Date.now();
        this.currentFontSize = 14;
        this.editorTheme = 'default';
        this.fontFamily = "'Fira Code', monospace";
        this.isFullscreen = false;
        this.findReplaceActive = false;
        this.currentSearchIndex = -1;
        this.searchMatches = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupEnhancedEditor();
        this.setupAutoSave();
        this.updateStats();
        this.updateSessionTime();
        this.generateLineNumbers();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Authentication Form
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAuthentication();
            });
        }
        
        // Password Toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }
        
        // Editor Actions
        this.setupEditorActions();
        this.setupEnhancedEditorActions();
        this.setupKeyboardShortcuts();
        
        // Feedback Form
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFeedback();
            });
        }
        
        // Admin Login Form
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                loginAdmin();
            });
        }
        
        // Note Content Change Detection
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            noteContent.addEventListener('input', () => {
                this.updateWordCount();
                this.updateStatus('typing');
            });
            
            noteContent.addEventListener('keydown', (e) => {
                // Ctrl+S to save
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.saveData();
                }
            });
        }
        
        // Modal Events
        this.setupModalEvents();
        
        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Esc to close modals
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    setupEditorActions() {
    }
    
    setupEnhancedEditor() {
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            noteContent.addEventListener('input', () => {
                this.updateStats();
                this.generateLineNumbers();
                this.updateEnhancedStats();
            });
            
            noteContent.addEventListener('scroll', () => {
                this.syncLineNumbers();
            });
            
            noteContent.addEventListener('keydown', (e) => {
                this.handleEditorKeydown(e);
            });
        }
        
        // Theme and font controls
        this.setupThemeControls();
        this.setupFontControls();
        this.setupToolbarButtons();
        this.setupFindReplace();
        this.setupTemplates();
        this.setupAutoSaveToggle();
    }
    
    setupEnhancedEditorActions() {
        // Keep only essential functionality
        // Copy button (since we removed it from HTML, we handle it with Alt+C)
        // Most buttons were removed from the interface
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveData();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleFindReplace();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleBold();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleItalic();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.toggleUnderline();
                        break;
                }
            } else if (e.altKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                this.copyAllContent();
            } else if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            } else if (e.key === 'Escape') {
                if (this.findReplaceActive) {
                    this.toggleFindReplace();
                }
                if (this.isFullscreen) {
                    this.toggleFullscreen();
                }
            }
        });
    }
    
    setupThemeControls() {
        const themeSelector = document.getElementById('editorTheme');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.changeEditorTheme(e.target.value);
            });
        }
    }
    
    setupFontControls() {
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', (e) => {
                this.changeFontFamily(e.target.value);
            });
        }
        
        const fontSizeUp = document.getElementById('fontSizeUp');
        const fontSizeDown = document.getElementById('fontSizeDown');
        
        if (fontSizeUp) {
            fontSizeUp.addEventListener('click', () => this.adjustFontSize(1));
        }
        
        if (fontSizeDown) {
            fontSizeDown.addEventListener('click', () => this.adjustFontSize(-1));
        }
    }
    
    setupToolbarButtons() {
        // Formatting buttons
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        
        if (boldBtn) boldBtn.addEventListener('click', () => this.toggleBold());
        if (italicBtn) italicBtn.addEventListener('click', () => this.toggleItalic());
        if (underlineBtn) underlineBtn.addEventListener('click', () => this.toggleUnderline());
        
        // Heading buttons
        const h1Btn = document.getElementById('h1Btn');
        const h2Btn = document.getElementById('h2Btn');
        const h3Btn = document.getElementById('h3Btn');
        
        if (h1Btn) h1Btn.addEventListener('click', () => this.addHeading(1));
        if (h2Btn) h2Btn.addEventListener('click', () => this.addHeading(2));
        if (h3Btn) h3Btn.addEventListener('click', () => this.addHeading(3));
        
        // List buttons
        const bulletListBtn = document.getElementById('bulletListBtn');
        const numberListBtn = document.getElementById('numberListBtn');
        const checklistBtn = document.getElementById('checklistBtn');
        
        if (bulletListBtn) bulletListBtn.addEventListener('click', () => this.addBulletList());
        if (numberListBtn) numberListBtn.addEventListener('click', () => this.addNumberList());
        if (checklistBtn) checklistBtn.addEventListener('click', () => this.addChecklist());
        
        // Other buttons
        const quoteBtn = document.getElementById('quoteBtn');
        const codeBtn = document.getElementById('codeBtn');
        
        if (quoteBtn) quoteBtn.addEventListener('click', () => this.addQuote());
        if (codeBtn) codeBtn.addEventListener('click', () => this.addCodeBlock());
    }
    
    setupFindReplace() {
        const findInput = document.getElementById('findInput');
        const replaceInput = document.getElementById('replaceInput');
        const findNextBtn = document.getElementById('findNextBtn');
        const findPrevBtn = document.getElementById('findPrevBtn');
        const replaceBtn = document.getElementById('replaceBtn');
        const replaceAllBtn = document.getElementById('replaceAllBtn');
        const closeFindBtn = document.getElementById('closeFindBtn');
        
        if (findInput) {
            findInput.addEventListener('input', () => this.performSearch());
            findInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.findNext();
                }
            });
        }
        
        if (findNextBtn) findNextBtn.addEventListener('click', () => this.findNext());
        if (findPrevBtn) findPrevBtn.addEventListener('click', () => this.findPrevious());
        if (replaceBtn) replaceBtn.addEventListener('click', () => this.replaceCurrent());
        if (replaceAllBtn) replaceAllBtn.addEventListener('click', () => this.replaceAll());
        if (closeFindBtn) closeFindBtn.addEventListener('click', () => this.toggleFindReplace());
    }
    
    setupTemplates() {
        const templateMeetingBtn = document.getElementById('templateMeetingBtn');
        const templateTodoBtn = document.getElementById('templateTodoBtn');
        const templateJournalBtn = document.getElementById('templateJournalBtn');
        
        if (templateMeetingBtn) {
            templateMeetingBtn.addEventListener('click', () => this.insertTemplate('meeting'));
        }
        if (templateTodoBtn) {
            templateTodoBtn.addEventListener('click', () => this.insertTemplate('todo'));
        }
        if (templateJournalBtn) {
            templateJournalBtn.addEventListener('click', () => this.insertTemplate('journal'));
        }
    }
    
    setupAutoSaveToggle() {
        const autoSaveToggle = document.getElementById('autoSaveToggle');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setupAutoSave();
                } else {
                    this.stopAutoSave();
                }
            });
        }
    }
    
    setupModalEvents() {
        const modal = document.getElementById('passwordModal');
        const closeModal = document.getElementById('closeModal');
        const cancelPasswordChange = document.getElementById('cancelPasswordChange');
        const confirmPasswordChange = document.getElementById('confirmPasswordChange');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        if (cancelPasswordChange) {
            cancelPasswordChange.addEventListener('click', () => this.closeModal());
        }
        
        if (confirmPasswordChange) {
            confirmPasswordChange.addEventListener('click', () => this.handlePasswordChange());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
    
    setupAutoSave() {
        // Auto-save every 30 seconds when authenticated
        this.autoSaveInterval = setInterval(() => {
            if (this.isAuthenticated) {
                const noteContent = document.getElementById('noteContent');
                if (noteContent && noteContent.value !== this.userData.content) {
                    this.saveData(true); // Silent save
                }
            }
        }, 30000);
    }
    
    navigateToSection(section) {
        // Check authentication for editor section
        if (section === 'editor' && !this.isAuthenticated) {
            this.showNotification('Please authenticate first to access the editor', 'warning');
            return;
        }
        
        // Automatic logout when navigating back to home
        if (section === 'home' && this.isAuthenticated) {
            this.autoLogout();
        }
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(section).classList.add('active');
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        this.currentSection = section;
        
        // Load editor content if navigating to editor
        if (section === 'editor' && this.isAuthenticated) {
            this.loadEditorContent();
        }
    }
    
    async handleAuthentication() {
        const passwordInput = document.getElementById('passwordInput');
        const password = passwordInput.value.trim();
        
        if (!password) {
            this.showNotification('Please enter a password', 'error');
            return;
        }
        
        if (password.length < 3) {
            this.showNotification('Password must be at least 3 characters long', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isAuthenticated = true;
                this.userData = {
                    content: data.data || '',
                    hasData: data.hasData
                };
                
                this.showNotification(data.message, 'success');
                this.navigateToSection('editor');
                passwordInput.value = '';
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Connection error. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    loadEditorContent() {
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            noteContent.value = this.userData.content;
            this.updateWordCount();
            this.updateStatus('ready');
            
            if (this.userData.hasData) {
                this.updateLastSaved('Data loaded');
            }
        }
    }
    
    async saveData(silent = false) {
        if (!this.isAuthenticated) {
            this.showNotification('Please authenticate first', 'error');
            return;
        }
        
        const noteContent = document.getElementById('noteContent');
        const content = noteContent.value;
        
        if (!silent) {
            this.showLoading();
        }
        
        this.updateStatus('saving');
        
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.userData.content = content;
                this.userData.hasData = true;
                this.lastSaved = new Date();
                
                if (!silent) {
                    this.showNotification(data.message, 'success');
                }
                
                this.updateStatus('saved');
                this.updateLastSaved();
            } else {
                this.showNotification(data.message, 'error');
                this.updateStatus('error');
            }
        } catch (error) {
            this.showNotification('Failed to save. Please try again.', 'error');
            this.updateStatus('error');
        } finally {
            if (!silent) {
                this.hideLoading();
            }
        }
    }
    
    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        const newPasswordInput = document.getElementById('newPasswordInput');
        
        if (modal) {
            modal.classList.add('active');
            newPasswordInput.value = '';
            newPasswordInput.focus();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('passwordModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    async handlePasswordChange() {
        const newPasswordInput = document.getElementById('newPasswordInput');
        const newPassword = newPasswordInput.value.trim();
        
        if (!newPassword) {
            this.showNotification('Please enter a new password', 'error');
            return;
        }
        
        if (newPassword.length < 3) {
            this.showNotification('Password must be at least 3 characters long', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                this.closeModal();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to change password. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    logout() {
        if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
            this.isAuthenticated = false;
            this.userData = { content: '', hasData: false };
            this.lastSaved = null;
            
            // Clear session
            fetch('/logout', { method: 'POST' }).catch(() => {});
            
            this.showNotification('Logged out successfully', 'info');
            this.navigateToSection('home');
        }
    }
    
    autoLogout() {
        // Automatic logout without confirmation when navigating to home
        this.isAuthenticated = false;
        this.userData = { content: '', hasData: false };
        this.lastSaved = null;
        
        // Clear session
        fetch('/logout', { method: 'POST' }).catch(() => {});
        
        // Clear the password input field
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.value = '';
        }
        
        // Clear the editor content
        const noteContent = document.getElementById('noteContent');
        if (noteContent) {
            noteContent.value = '';
        }
        
        // Reset status and stats
        this.updateStatus('ready');
        this.updateStats();
        this.showNotification('Automatically logged out - Welcome back!', 'info');
    }
    
    clearContent() {
        if (confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
            const noteContent = document.getElementById('noteContent');
            if (noteContent) {
                noteContent.value = '';
                this.updateStats();
                this.updateStatus('ready');
            }
        }
    }
    
    async copyContent() {
        const noteContent = document.getElementById('noteContent');
        if (noteContent && noteContent.value) {
            try {
                await navigator.clipboard.writeText(noteContent.value);
                this.showNotification('Content copied to clipboard', 'success');
            } catch (error) {
                // Fallback for older browsers
                noteContent.select();
                document.execCommand('copy');
                this.showNotification('Content copied to clipboard', 'success');
            }
        } else {
            this.showNotification('No content to copy', 'warning');
        }
    }
    
    copyAllContent() {
        // Same as copyContent but triggered by Alt+X
        this.copyContent();
    }
    
    downloadContent() {
        const noteContent = document.getElementById('noteContent');
        if (noteContent && noteContent.value) {
            const content = noteContent.value;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codedpad_note_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Note downloaded successfully', 'success');
        } else {
            this.showNotification('No content to download', 'warning');
        }
    }
    
    // Enhanced Editor Methods
    generateLineNumbers() {
        const noteContent = document.getElementById('noteContent');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (!noteContent || !lineNumbers) return;
        
        const lines = noteContent.value.split('\n').length;
        let lineNumbersHTML = '';
        
        for (let i = 1; i <= lines; i++) {
            lineNumbersHTML += `${i}\n`;
        }
        
        lineNumbers.textContent = lineNumbersHTML;
    }
    
    syncLineNumbers() {
        const noteContent = document.getElementById('noteContent');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (!noteContent || !lineNumbers) return;
        
        lineNumbers.scrollTop = noteContent.scrollTop;
    }
    
    updateEnhancedStats() {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;
        
        const content = noteContent.value;
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
        const readingTime = Math.ceil(content.trim().split(/\s+/).length / 200); // 200 WPM average
        
        const paragraphCount = document.getElementById('paragraphCount');
        const readingTimeEl = document.getElementById('readingTime');
        
        if (paragraphCount) paragraphCount.textContent = paragraphs;
        if (readingTimeEl) readingTimeEl.textContent = `${readingTime} min`;
    }
    
    updateSessionTime() {
        const sessionTimeEl = document.getElementById('sessionTime');
        if (sessionTimeEl) {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 60000);
            sessionTimeEl.textContent = `${elapsed} min`;
        }
        
        // Update every minute
        setTimeout(() => this.updateSessionTime(), 60000);
    }
    
    handleEditorKeydown(e) {
        const noteContent = e.target;
        
        // Handle Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = noteContent.selectionStart;
            const end = noteContent.selectionEnd;
            
            noteContent.value = noteContent.value.substring(0, start) + '    ' + noteContent.value.substring(end);
            noteContent.selectionStart = noteContent.selectionEnd = start + 4;
        }
        
        // Auto-complete brackets and quotes
        const autoCompleteChars = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'"
        };
        
        if (autoCompleteChars[e.key]) {
            const start = noteContent.selectionStart;
            const end = noteContent.selectionEnd;
            
            if (start !== end) {
                e.preventDefault();
                const selectedText = noteContent.value.substring(start, end);
                const replacement = e.key + selectedText + autoCompleteChars[e.key];
                noteContent.value = noteContent.value.substring(0, start) + replacement + noteContent.value.substring(end);
                noteContent.selectionStart = start + 1;
                noteContent.selectionEnd = start + 1 + selectedText.length;
            }
        }
    }
    
    printContent() {
        const noteContent = document.getElementById('noteContent');
        if (noteContent && noteContent.value) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>CodedPad Note</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                        h1 { color: #333; border-bottom: 2px solid #333; }
                        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>CodedPad Note - ${new Date().toLocaleDateString()}</h1>
                    <pre>${noteContent.value}</pre>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } else {
            this.showNotification('No content to print', 'warning');
        }
    }
    
    toggleFullscreen() {
        const editorContainer = document.querySelector('.editor-container').parentElement;
        
        if (!this.isFullscreen) {
            editorContainer.classList.add('editor-fullscreen');
            this.isFullscreen = true;
            this.showNotification('Fullscreen mode activated. Press ESC to exit.', 'info');
        } else {
            editorContainer.classList.remove('editor-fullscreen');
            this.isFullscreen = false;
            this.showNotification('Fullscreen mode deactivated', 'info');
        }
    }
    
    toggleFindReplace() {
        const findReplacePanel = document.getElementById('findReplacePanel');
        const findInput = document.getElementById('findInput');
        
        if (!this.findReplaceActive) {
            findReplacePanel.classList.add('active');
            this.findReplaceActive = true;
            if (findInput) findInput.focus();
        } else {
            findReplacePanel.classList.remove('active');
            this.findReplaceActive = false;
            this.clearSearchHighlights();
        }
    }
    
    performSearch() {
        const findInput = document.getElementById('findInput');
        const noteContent = document.getElementById('noteContent');
        const findStats = document.getElementById('findStats');
        
        if (!findInput || !noteContent) return;
        
        const searchTerm = findInput.value;
        if (!searchTerm) {
            this.clearSearchHighlights();
            if (findStats) findStats.textContent = '';
            return;
        }
        
        const content = noteContent.value;
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
        this.searchMatches = [...content.matchAll(regex)];
        
        if (findStats) {
            findStats.textContent = `${this.searchMatches.length} matches found`;
        }
        
        this.currentSearchIndex = -1;
        if (this.searchMatches.length > 0) {
            this.findNext();
        }
    }
    
    findNext() {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchMatches.length;
        this.highlightSearchMatch();
    }
    
    findPrevious() {
        if (this.searchMatches.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex <= 0 ? 
            this.searchMatches.length - 1 : this.currentSearchIndex - 1;
        this.highlightSearchMatch();
    }
    
    highlightSearchMatch() {
        const noteContent = document.getElementById('noteContent');
        const match = this.searchMatches[this.currentSearchIndex];
        
        if (noteContent && match) {
            noteContent.focus();
            noteContent.setSelectionRange(match.index, match.index + match[0].length);
            
            const findStats = document.getElementById('findStats');
            if (findStats) {
                findStats.textContent = `${this.currentSearchIndex + 1} of ${this.searchMatches.length} matches`;
            }
        }
    }
    
    replaceCurrent() {
        const replaceInput = document.getElementById('replaceInput');
        const noteContent = document.getElementById('noteContent');
        
        if (!replaceInput || !noteContent || this.currentSearchIndex === -1) return;
        
        const match = this.searchMatches[this.currentSearchIndex];
        const replaceText = replaceInput.value;
        
        noteContent.value = noteContent.value.substring(0, match.index) + 
                           replaceText + 
                           noteContent.value.substring(match.index + match[0].length);
        
        // Update search after replacement
        this.performSearch();
        this.showNotification('Text replaced', 'success');
    }
    
    replaceAll() {
        const findInput = document.getElementById('findInput');
        const replaceInput = document.getElementById('replaceInput');
        const noteContent = document.getElementById('noteContent');
        
        if (!findInput || !replaceInput || !noteContent) return;
        
        const searchTerm = findInput.value;
        const replaceText = replaceInput.value;
        
        if (!searchTerm) return;
        
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'), 'gi');
        const replacements = (noteContent.value.match(regex) || []).length;
        
        noteContent.value = noteContent.value.replace(regex, replaceText);
        
        this.performSearch();
        this.showNotification(`${replacements} replacements made`, 'success');
    }
    
    clearSearchHighlights() {
        this.searchMatches = [];
        this.currentSearchIndex = -1;
    }
    
    showDetailedStats() {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;
        
        const content = noteContent.value;
        const words = content.trim().split(/\\s+/).filter(word => word.length > 0);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const avgWordsPerSentence = sentences > 0 ? Math.round(words.length / sentences) : 0;
        const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))).size;
        
        const statsMessage = `
            📊 Detailed Statistics:
            • Characters: ${content.length}
            • Words: ${words.length}
            • Sentences: ${sentences}
            • Unique words: ${uniqueWords}
            • Avg words/sentence: ${avgWordsPerSentence}
            • Reading time: ${Math.ceil(words.length / 200)} minutes
        `;
        
        this.showNotification(statsMessage, 'info');
    }
    
    toggleDarkMode() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
        
        this.showNotification(`Switched to ${isDark ? 'light' : 'dark'} theme`, 'info');
    }
    
    changeEditorTheme(theme) {
        const editorWrapper = document.querySelector('.editor-wrapper');
        if (editorWrapper) {
            // Remove existing theme classes
            editorWrapper.classList.remove('editor-theme-light', 'editor-theme-monokai', 'editor-theme-github', 'editor-theme-dracula');
            
            if (theme !== 'default') {
                editorWrapper.classList.add(`editor-theme-${theme}`);
            }
            
            this.editorTheme = theme;
            this.showNotification(`Theme changed to ${theme}`, 'info');
        }
    }
    
    changeFontFamily(fontFamily) {
        const noteContent = document.getElementById('noteContent');
        const lineNumbers = document.getElementById('lineNumbers');
        
        if (noteContent) noteContent.style.fontFamily = fontFamily;
        if (lineNumbers) lineNumbers.style.fontFamily = fontFamily;
        
        this.fontFamily = fontFamily;
        this.showNotification('Font family updated', 'info');
    }
    
    adjustFontSize(delta) {
        this.currentFontSize = Math.max(10, Math.min(24, this.currentFontSize + delta));
        
        const noteContent = document.getElementById('noteContent');
        const lineNumbers = document.getElementById('lineNumbers');
        const fontSizeDisplay = document.getElementById('fontSizeDisplay');
        
        if (noteContent) noteContent.style.fontSize = `${this.currentFontSize}px`;
        if (lineNumbers) lineNumbers.style.fontSize = `${this.currentFontSize - 1}px`;
        if (fontSizeDisplay) fontSizeDisplay.textContent = `${this.currentFontSize}px`;
    }
    
    // Text formatting methods
    toggleBold() {
        this.wrapSelectedText('**', '**');
    }
    
    toggleItalic() {
        this.wrapSelectedText('*', '*');
    }
    
    toggleUnderline() {
        this.wrapSelectedText('<u>', '</u>');
    }
    
    addHeading(level) {
        const prefix = '#'.repeat(level) + ' ';
        this.addLinePrefix(prefix);
    }
    
    addBulletList() {
        this.addLinePrefix('• ');
    }
    
    addNumberList() {
        this.addNumberedListPrefix();
    }
    
    addChecklist() {
        this.addLinePrefix('☐ ');
    }
    
    addQuote() {
        this.addLinePrefix('> ');
    }
    
    addCodeBlock() {
        this.wrapSelectedText('\\n```\\n', '\\n```\\n');
    }
    
    wrapSelectedText(startWrap, endWrap) {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;
        
        const start = noteContent.selectionStart;
        const end = noteContent.selectionEnd;
        const selectedText = noteContent.value.substring(start, end);
        const replacement = startWrap + selectedText + endWrap;
        
        noteContent.value = noteContent.value.substring(0, start) + replacement + noteContent.value.substring(end);
        noteContent.selectionStart = start + startWrap.length;
        noteContent.selectionEnd = start + startWrap.length + selectedText.length;
        noteContent.focus();
    }
    
    addLinePrefix(prefix) {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;
        
        const start = noteContent.selectionStart;
        const content = noteContent.value;
        const lineStart = content.lastIndexOf('\\n', start - 1) + 1;
        
        noteContent.value = content.substring(0, lineStart) + prefix + content.substring(lineStart);
        noteContent.selectionStart = noteContent.selectionEnd = start + prefix.length;
        noteContent.focus();
    }
    
    addNumberedListPrefix() {
        const noteContent = document.getElementById('noteContent');
        if (!noteContent) return;
        
        const start = noteContent.selectionStart;
        const content = noteContent.value;
        const lineStart = content.lastIndexOf('\\n', start - 1) + 1;
        
        // Find the last numbered item to continue the sequence
        const precedingText = content.substring(0, lineStart);
        const lastNumberMatch = precedingText.match(/\\n(\\d+)\\. /g);
        const nextNumber = lastNumberMatch ? 
            parseInt(lastNumberMatch[lastNumberMatch.length - 1].match(/\\d+/)[0]) + 1 : 1;
        
        const prefix = `${nextNumber}. `;
        noteContent.value = content.substring(0, lineStart) + prefix + content.substring(lineStart);
        noteContent.selectionStart = noteContent.selectionEnd = start + prefix.length;
        noteContent.focus();
    }
    
    insertTemplate(type) {
        const templates = {
            meeting: `# Meeting Notes - ${new Date().toLocaleDateString()}
            
## Attendees
• 
• 
• 

## Agenda
1. 
2. 
3. 

## Discussion Points
• 

## Action Items
☐ 
☐ 
☐ 

## Next Meeting
Date: 
Time: 
`,
            todo: `# Todo List - ${new Date().toLocaleDateString()}

## High Priority
☐ 
☐ 
☐ 

## Medium Priority
☐ 
☐ 
☐ 

## Low Priority
☐ 
☐ 
☐ 

## Completed
✓ 
`,
            journal: `# Journal Entry - ${new Date().toLocaleDateString()}

## Mood
😊 

## What happened today?


## What went well?
• 
• 
• 

## What could be improved?
• 
• 
• 

## Tomorrow's goals
1. 
2. 
3. 

## Gratitude
• 
• 
• 
`
        };
        
        const noteContent = document.getElementById('noteContent');
        if (noteContent && templates[type]) {
            const currentContent = noteContent.value;
            const separator = currentContent ? '\\n\\n---\\n\\n' : '';
            noteContent.value = currentContent + separator + templates[type];
            this.updateStats();
            this.generateLineNumbers();
            this.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} template inserted`, 'success');
        }
    }
    
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    async handleFeedback() {
        const name = document.getElementById('feedbackName').value.trim();
        const email = document.getElementById('feedbackEmail').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        
        if (!name || !email || !message) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (name.length < 2) {
            this.showNotification('Name must be at least 2 characters long', 'error');
            return;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (message.length < 10) {
            this.showNotification('Feedback must be at least 10 characters long', 'error');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, feedback: message }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(data.message, 'success');
                // Clear form
                document.getElementById('feedbackName').value = '';
                document.getElementById('feedbackEmail').value = '';
                document.getElementById('feedbackMessage').value = '';
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to send feedback. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('passwordInput');
        const toggleBtn = document.getElementById('togglePassword');
        const icon = toggleBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    updateWordCount() {
        const noteContent = document.getElementById('noteContent');
        const charCount = document.getElementById('charCount');
        const wordCount = document.getElementById('wordCount');
        const lineCount = document.getElementById('lineCount');
        
        if (noteContent && charCount && wordCount && lineCount) {
            const content = noteContent.value;
            const chars = content.length;
            const words = content.trim() ? content.trim().split(/\s+/).length : 0;
            const lines = content ? content.split('\n').length : 0;
            
            charCount.textContent = chars.toLocaleString();
            wordCount.textContent = words.toLocaleString();
            lineCount.textContent = lines.toLocaleString();
        }
    }
    
    updateLastSaved(message) {
        const lastSavedElement = document.getElementById('lastSaved');
        if (lastSavedElement) {
            if (message) {
                lastSavedElement.textContent = message;
            } else if (this.lastSaved) {
                const now = new Date();
                const diff = Math.floor((now - this.lastSaved) / 1000);
                
                if (diff < 60) {
                    lastSavedElement.textContent = 'Just now';
                } else if (diff < 3600) {
                    lastSavedElement.textContent = `${Math.floor(diff / 60)} min ago`;
                } else {
                    lastSavedElement.textContent = this.lastSaved.toLocaleTimeString();
                }
            } else {
                lastSavedElement.textContent = 'Never';
            }
        }
    }
    
    async updateStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            if (data.success) {
                // You can use stats to show total notes count somewhere in the UI
                console.log('App stats:', data.stats);
            }
        } catch (error) {
            console.log('Failed to fetch stats');
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            case 'info': return 'fas fa-info-circle';
            default: return 'fas fa-info-circle';
        }
    }
    
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Update last saved time periodically
    startLastSavedUpdater() {
        setInterval(() => {
            if (this.lastSaved) {
                this.updateLastSaved();
            }
        }, 60000); // Update every minute
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codedPadApp = new CodedPadApp();
    window.codedPadApp.startLastSavedUpdater();
});

// Handle page visibility change for auto-save
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.codedPadApp && window.codedPadApp.isAuthenticated) {
        // Save when user switches tabs/minimizes
        const noteContent = document.getElementById('noteContent');
        if (noteContent && noteContent.value !== window.codedPadApp.userData.content) {
            window.codedPadApp.saveData(true);
        }
    }
});

// Handle beforeunload for unsaved changes warning
window.addEventListener('beforeunload', (e) => {
    if (window.codedPadApp && window.codedPadApp.isAuthenticated) {
        const noteContent = document.getElementById('noteContent');
        if (noteContent && noteContent.value !== window.codedPadApp.userData.content) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            return e.returnValue;
        }
    }
});

// Service Worker Registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Global function for changePassword button
function changePassword() {
    if (window.codedPadApp) {
        window.codedPadApp.showPasswordModal();
    }
}

// Global function for goToHome button
function goToHome() {
    showSection('home');
}

// Admin functionality
let isAdminLoggedIn = false;
let adminUsersState = { nextCursor: null, loadedCount: 0, isLoading: false };

function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the selected tab
    if (tabName === 'users') {
        loadUserData();
    } else if (tabName === 'feedback') {
        loadFeedbackData();
    }
}

async function loginAdmin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if (username === 'nithin' && password === 'code123') {
        isAdminLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Load initial data
        await loadAdminStats();
    // Reset users pagination state and load initial 50 users
    adminUsersState = { nextCursor: null, loadedCount: 0, isLoading: false };
    wireLoadMoreButton();
    await loadUserData({ append: false, limit: 50 }); // Load initial users
        
        showNotification('Welcome to Admin Dashboard!', 'success');
    } else {
        showNotification('Invalid admin credentials!', 'error');
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    showNotification('Logged out successfully', 'success');
}

async function loadAdminStats() {
    try {
        const response = await axios.get('/api/admin/stats', {
            timeout: 10000 // 10 second timeout
        });
        
        const data = response.data;
        
        if (data.success) {
            document.getElementById('totalUsers').textContent = data.totalUsers;
            document.getElementById('totalFeedback').textContent = data.totalFeedback;
            document.getElementById('activeNotes').textContent = data.activeNotes;
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
        if (error.code === 'ECONNABORTED') {
            showNotification('Stats loading timeout. Please try again.', 'error');
        } else if (error.response) {
            showNotification('Failed to load stats: ' + (error.response.data.message || 'Server error'), 'error');
        } else {
            showNotification('Network error while loading stats', 'error');
        }
    }
}

function wireLoadMoreButton() {
    const btn = document.getElementById('loadMoreUsersBtn');
    if (btn && !btn._wired) {
        btn.addEventListener('click', async () => {
            if (adminUsersState.isLoading) return;
            if (!adminUsersState.nextCursor) {
                showNotification('No more users to load', 'info');
                btn.disabled = true;
                return;
            }
            await loadUserData({ append: true, limit: 10, cursor: adminUsersState.nextCursor });
        });
        btn._wired = true;
    }
}

async function loadUserData(options = {}) {
    const { append = false, limit = 50, cursor = null } = options;
    const btn = document.getElementById('loadMoreUsersBtn');
    const shownEl = document.getElementById('usersShownCount');
    if (btn) btn.disabled = true;
    adminUsersState.isLoading = true;

    console.log(`Loading users from MongoDB... limit=${limit} append=${append} cursor=${cursor ?? 'none'}`);
    try {
        const response = await axios.get('/api/admin/users', {
            params: { limit, ...(cursor ? { cursor } : {}) },
            timeout: 15000 // 15 second timeout for loading data
        });
        
        console.log('Response received:', response.status, response.data);
        const data = response.data;
        
        if (data.success) {
            const tbody = document.getElementById('usersTableBody');
            if (!tbody) {
                console.error('usersTableBody element not found!');
                showNotification('Table element not found - please refresh the page', 'error');
                return;
            }
            
            // If not appending, reset table and state
            if (!append) {
                tbody.innerHTML = '';
                adminUsersState.loadedCount = 0;
            }
            
            if (data.users.length === 0) {
                console.log('No users found in database');
                if (!append && tbody.children.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: var(--space-xl);">
                                <i class="fas fa-database"></i><br>
                                No user data found in collections
                            </td>
                        </tr>
                    `;
                }
                if (btn) btn.disabled = true;
                if (shownEl) shownEl.textContent = `Showing ${adminUsersState.loadedCount} users`;
                return;
            }
            
            console.log(`Processing ${data.users.length} users...`);
            const startIndex = tbody.children.length; // Continue numbering
            data.users.forEach((user, idx) => {
                const row = document.createElement('tr');
                
                // Create data box with the stored content
                const dataBox = user.data ? 
                    `<div class="data-box">${user.data}</div>` : 
                    `<div class="data-box empty">No data stored</div>`;
                
                row.innerHTML = `
                    <td>
                        <div class="user-info">
                            <span class="user-number">#${startIndex + idx + 1}</span>
                            <small style="color: var(--text-secondary); display: block;">Collection: ${user.collection}</small>
                            <small style="color: var(--text-tertiary); display: block;">Created: ${user.created || 'Unknown'}</small>
                        </div>
                    </td>
                    <td class="data-column">
                        ${dataBox}
                    </td>
                    <td>
                        <small>${user.lastModified}</small>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="viewUserData('${user._id}', '${user.collection}')" title="View Full Data">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" onclick="editUserData('${user._id}', '${user.collection}')" title="Edit Data">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn danger" onclick="deleteUser('${user._id}', '#${startIndex + idx + 1}')" title="Delete User">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Update pagination state and UI
            adminUsersState.loadedCount += data.users.length;
            adminUsersState.nextCursor = data.nextCursor || null;
            if (shownEl) shownEl.textContent = `Showing ${adminUsersState.loadedCount} users`;
            if (btn) btn.disabled = !adminUsersState.nextCursor;
            
            console.log(`Successfully loaded ${data.users.length} users (total shown: ${adminUsersState.loadedCount})`);
            showNotification(`Loaded ${data.users.length} users`, 'success');
        } else {
            console.error('API returned success: false', data);
            showNotification('Failed to load user data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Detailed error loading user data:', error);
        if (error.code === 'ECONNABORTED') {
            showNotification('Loading timeout. Please try again.', 'error');
        } else if (error.response) {
            console.error('Server response:', error.response.status, error.response.data);
            showNotification('Failed to load user data: ' + (error.response.data.message || 'Server error'), 'error');
        } else if (error.request) {
            console.error('No response received:', error.request);
            showNotification('No response from server. Please check your connection.', 'error');
        } else {
            console.error('Request setup error:', error.message);
            showNotification('Network error while loading user data', 'error');
        }
    } finally {
        adminUsersState.isLoading = false;
        if (btn) btn.disabled = !adminUsersState.nextCursor;
    }
}

async function loadFeedbackData() {
    console.log('Loading recent 50 feedback entries from MongoDB...');
    try {
        const response = await axios.get('/api/admin/feedback', {
            timeout: 15000 // 15 second timeout
        });
        
        const data = response.data;
        
        if (data.success) {
            const tbody = document.getElementById('feedbackTableBody');
            if (!tbody) {
                console.error('feedbackTableBody element not found!');
                showNotification('Table element not found - please refresh the page', 'error');
                return;
            }
            
            tbody.innerHTML = '';
            
            if (data.feedback.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: var(--space-xl);">
                            <i class="fas fa-comments"></i><br>
                            No feedback received yet
                        </td>
                    </tr>
                `;
                return;
            }
            
            data.feedback.forEach(fb => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fb.name}</td>
                    <td>${fb.email}</td>
                    <td class="data-preview" title="${fb.feedback}">${fb.feedback.substring(0, 50)}${fb.feedback.length > 50 ? '...' : ''}</td>
                    <td>${fb.submitted_at}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn" onclick="viewFeedback('${fb._id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn danger" onclick="deleteFeedback('${fb._id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            console.log(`Successfully loaded ${data.feedback.length} recent feedback entries`);
            showNotification(`Loaded ${data.feedback.length} recent feedback entries`, 'success');
        } else {
            console.error('API returned success: false', data);
            showNotification('Failed to load feedback data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading feedback data:', error);
        if (error.code === 'ECONNABORTED') {
            showNotification('Loading timeout. Please try again.', 'error');
        } else if (error.response) {
            showNotification('Failed to load feedback data: ' + (error.response.data.message || 'Server error'), 'error');
        } else {
            showNotification('Network error while loading feedback data', 'error');
        }
    }
}

function refreshUserData() {
    adminUsersState = { nextCursor: null, loadedCount: 0, isLoading: false };
    wireLoadMoreButton();
    loadUserData({ append: false, limit: 50 });
    showNotification('User data refreshed', 'success');
}

function refreshFeedback() {
    loadFeedbackData();
    showNotification('Feedback data refreshed', 'success');
}

async function deleteUser(userId, userNumber) {
    if (confirm(`Are you sure you want to delete user ${userNumber}?`)) {
        try {
            const response = await axios.delete(`/api/admin/users/${userId}`, {
                timeout: 10000
            });
            
            const data = response.data;
            
            if (data.success) {
                showNotification(data.message, 'success');
                loadUserData();
                loadAdminStats();
            } else {
                showNotification('Failed to delete user: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.code === 'ECONNABORTED') {
                showNotification('Delete request timeout. Please try again.', 'error');
            } else if (error.response) {
                showNotification('Failed to delete user: ' + (error.response.data.message || 'Server error'), 'error');
            } else {
                showNotification('Network error while deleting user', 'error');
            }
        }
    }
}

function viewUserData(userId, collection) {
    // Create a modal to show full user data
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-eye"></i> View User Data</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Collection:</strong> ${collection}</p>
                <p><strong>User ID:</strong> <code>${userId}</code></p>
                <div id="userDataContent" style="margin-top: var(--space-md);">
                    <i class="fas fa-spinner fa-spin"></i> Loading user data...
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Load and display the full user data
    axios.get('/api/admin/users', {
        timeout: 10000
    })
        .then(response => {
            const data = response.data;
            if (data.success) {
                const user = data.users.find(u => u._id === userId);
                if (user) {
                    document.getElementById('userDataContent').innerHTML = `
                        <div class="user-detail">
                            <h4>Stored Data:</h4>
                            <div class="data-box" style="max-height: 300px; width: 100%; margin-bottom: var(--space-md);">
                                ${user.data || '<em style="color: var(--text-secondary);">No data stored</em>'}
                            </div>
                            
                            <h4>Details:</h4>
                            <p><strong>Last Modified:</strong> ${user.lastModified}</p>
                            <p><strong>Data Length:</strong> ${user.data ? user.data.length : 0} characters</p>
                            <p><strong>Collection:</strong> ${user.collection}</p>
                        </div>
                    `;
                } else {
                    document.getElementById('userDataContent').innerHTML = '<p style="color: var(--danger-color);">User not found</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading user data for view:', error);
            document.getElementById('userDataContent').innerHTML = '<p style="color: var(--danger-color);">Error loading user data</p>';
        });
}

function editUserData(userId, collection) {
    // Implementation for editing user data
    showNotification(`Edit user data feature for ${collection} collection - to be implemented`, 'info');
}

function viewFeedback(feedbackId) {
    // Implementation for viewing feedback in detail
    alert('View feedback feature - to be implemented');
}

async function deleteFeedback(feedbackId) {
    if (confirm('Are you sure you want to delete this feedback?')) {
        try {
            const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                showNotification('Feedback deleted successfully', 'success');
                loadFeedbackData();
                loadAdminStats();
            } else {
                showNotification('Failed to delete feedback', 'error');
            }
        } catch (error) {
            showNotification('Error deleting feedback', 'error');
        }
    }
}

function exportFeedback() {
    // Implementation for exporting feedback
    alert('Export feedback feature - to be implemented');
}

// Helper function for notifications
function showNotification(message, type) {
    if (window.codedPadApp) {
        window.codedPadApp.showNotification(message, type);
    } else {
        alert(message);
    }
}
