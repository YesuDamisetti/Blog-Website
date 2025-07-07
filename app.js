// Configure marked.js
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    breaks: true,
    gfm: true
});

// Application state
let posts = JSON.parse(localStorage.getItem('inkwell-posts')) || [];
let currentView = 'list';
let currentPost = null;
let editorMode = 'create';
let isPreviewVisible = true;

// DOM elements
const elements = {
    // Navigation
    navHome: document.getElementById('nav-home'),
    navNewPost: document.getElementById('nav-new-post'),
    
    // Views
    postsList: document.getElementById('posts-list'),
    postView: document.getElementById('post-view'),
    editorView: document.getElementById('editor-view'),
    
    // Posts list
    postsContainer: document.getElementById('posts-container'),
    emptyState: document.getElementById('empty-state'),
    postsCount: document.getElementById('posts-count'),
    wordsCount: document.getElementById('words-count'),
    readTime: document.getElementById('read-time'),
    heroNewPost: document.getElementById('hero-new-post'),
    heroExplore: document.getElementById('hero-explore'),
    headerNewPost: document.getElementById('header-new-post'),
    emptyNewPost: document.getElementById('empty-new-post'),
    
    // Post view
    backToList: document.getElementById('back-to-list'),
    editPost: document.getElementById('edit-post'),
    deletePost: document.getElementById('delete-post'),
    viewPostTitle: document.getElementById('view-post-title'),
    viewPostDate: document.getElementById('view-post-date'),
    viewPostReadTime: document.getElementById('view-post-read-time'),
    viewPostWordCount: document.getElementById('view-post-word-count'),
    viewPostContent: document.getElementById('view-post-content'),
    
    // Editor
    backFromEditor: document.getElementById('back-from-editor'),
    previewToggle: document.getElementById('preview-toggle'),
    savePost: document.getElementById('save-post'),
    editorTitle: document.getElementById('editor-title'),
    editorContent: document.getElementById('editor-content'),
    previewPanel: document.getElementById('preview-panel'),
    previewContent: document.getElementById('preview-content'),
    editorWordCount: document.getElementById('editor-word-count'),
    editorReadTime: document.getElementById('editor-read-time'),
    
    // Toolbar buttons
    btnBold: document.getElementById('btn-bold'),
    btnItalic: document.getElementById('btn-italic'),
    btnHeading: document.getElementById('btn-heading'),
    btnLink: document.getElementById('btn-link'),
    btnImage: document.getElementById('btn-image'),
    btnCode: document.getElementById('btn-code'),
    btnQuote: document.getElementById('btn-quote'),
    btnList: document.getElementById('btn-list'),
    btnListOrdered: document.getElementById('btn-list-ordered'),
    
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalMessage: document.getElementById('modal-message'),
    modalCancel: document.getElementById('modal-cancel'),
    modalConfirm: document.getElementById('modal-confirm'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

// Initialize the application
function init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Create sample post if no posts exist
    if (posts.length === 0) {
        createSamplePost();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Show initial view
    showView('list');
    updateStats();
    
    // Add smooth scrolling for hero explore button
    if (elements.heroExplore) {
        elements.heroExplore.addEventListener('click', () => {
            const postsSection = document.querySelector('.posts-section');
            if (postsSection) {
                postsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Create sample post
function createSamplePost() {
    const samplePost = {
        id: generateId(),
        title: 'Welcome to Inkwell ✨',
        content: `# Welcome to Inkwell! 

This is your beautiful new blog platform where creativity meets elegance. Inkwell is designed to help you focus on what matters most: **your writing**.

## ✨ Why Choose Inkwell?

Inkwell isn't just another blogging platform—it's a carefully crafted writing experience that puts your creativity first.

### 🎨 Beautiful Design
- **Clean, distraction-free interface** that lets your words shine
- **Elegant typography** that makes reading a pleasure
- **Responsive design** that looks stunning on every device
- **Thoughtful animations** that enhance the user experience

### 🚀 Powerful Features
- **Real-time Markdown preview** as you type
- **Syntax highlighting** for code blocks
- **Local storage** - your data stays with you
- **Keyboard shortcuts** for efficient writing
- **Word count and reading time** tracking

### 📝 Writing Made Simple

Creating a new post is effortless:

1. Click the **"Start Writing"** button
2. Give your story a captivating title
3. Write using our intuitive Markdown editor
4. Watch the live preview update in real-time
5. Publish when you're ready to share

## 🎯 Markdown Mastery

Inkwell supports all the Markdown features you love:

### Text Formatting
Make your text **bold** with \`**bold**\` or *italic* with \`*italic*\`. You can even combine them for ***bold and italic*** text!

### Code Blocks
Share your code beautifully:

\`\`\`javascript
function createMagic() {
    const inspiration = "Beautiful writing";
    const platform = "Inkwell";
    
    return \`\${inspiration} + \${platform} = Amazing stories!\`;
}

console.log(createMagic());
\`\`\`

### Lists and Structure
Create organized content with ease:

- **Unordered lists** for flexible content
- **Ordered lists** for step-by-step guides
- **Nested lists** for detailed organization

### Quotes and Citations
> "The first draft of anything is shit. But the second draft is where the magic happens." 
> 
> — *Every writer, ever*

### Links and Images
Connect your readers to the world:

[Explore beautiful writing](https://example.com) or showcase stunning visuals:

![Beautiful landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&auto=format)

---

## 🌟 Start Your Journey

Your thoughts deserve a beautiful home. Whether you're crafting technical tutorials, sharing personal stories, or building a professional blog, Inkwell provides the perfect foundation.

**Ready to begin?** Click the "Start Writing" button and let your creativity flow!

*Happy writing!* 🖋️`,
        date: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    posts.push(samplePost);
    savePosts();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    elements.navHome.addEventListener('click', () => showView('list'));
    elements.navNewPost.addEventListener('click', () => showEditor('create'));
    
    // Hero actions
    if (elements.heroNewPost) {
        elements.heroNewPost.addEventListener('click', () => showEditor('create'));
    }
    if (elements.headerNewPost) {
        elements.headerNewPost.addEventListener('click', () => showEditor('create'));
    }
    if (elements.emptyNewPost) {
        elements.emptyNewPost.addEventListener('click', () => showEditor('create'));
    }
    
    // Post view
    elements.backToList.addEventListener('click', () => showView('list'));
    elements.editPost.addEventListener('click', handleEditPost);
    elements.deletePost.addEventListener('click', handleDeletePost);
    
    // Editor
    elements.backFromEditor.addEventListener('click', handleBackFromEditor);
    elements.previewToggle.addEventListener('click', togglePreview);
    elements.savePost.addEventListener('click', handleSavePost);
    elements.editorTitle.addEventListener('input', () => {
        updatePreview();
        updateEditorStats();
    });
    elements.editorContent.addEventListener('input', () => {
        updatePreview();
        updateEditorStats();
    });
    
    // Toolbar
    elements.btnBold.addEventListener('click', () => insertMarkdown('**', '**', 'bold text'));
    elements.btnItalic.addEventListener('click', () => insertMarkdown('*', '*', 'italic text'));
    elements.btnHeading.addEventListener('click', () => insertMarkdown('## ', '', 'Heading'));
    elements.btnLink.addEventListener('click', () => insertMarkdown('[', '](https://example.com)', 'link text'));
    elements.btnImage.addEventListener('click', () => insertMarkdown('![', '](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800)', 'alt text'));
    elements.btnCode.addEventListener('click', () => insertMarkdown('```\n', '\n```', 'code'));
    elements.btnQuote.addEventListener('click', () => insertMarkdown('> ', '', 'quote'));
    elements.btnList.addEventListener('click', () => insertMarkdown('- ', '', 'list item'));
    elements.btnListOrdered.addEventListener('click', () => insertMarkdown('1. ', '', 'list item'));
    
    // Modal
    elements.modalCancel.addEventListener('click', hideModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) hideModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (currentView === 'editor') {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    handleSavePost();
                    break;
                case 'b':
                    e.preventDefault();
                    insertMarkdown('**', '**', 'bold text');
                    break;
                case 'i':
                    e.preventDefault();
                    insertMarkdown('*', '*', 'italic text');
                    break;
            }
        }
    }
}

// Show view
function showView(view) {
    currentView = view;
    
    // Hide all views
    elements.postsList.style.display = 'none';
    elements.postView.style.display = 'none';
    elements.editorView.style.display = 'none';
    
    // Update navigation
    elements.navHome.classList.toggle('active', view === 'list');
    elements.navNewPost.classList.toggle('active', view === 'editor');
    
    // Show current view
    switch (view) {
        case 'list':
            elements.postsList.style.display = 'block';
            renderPostsList();
            break;
        case 'view':
            elements.postView.style.display = 'block';
            renderPostView();
            break;
        case 'editor':
            elements.editorView.style.display = 'block';
            break;
    }
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Show editor
function showEditor(mode, post = null) {
    editorMode = mode;
    currentPost = post;
    
    if (mode === 'edit' && post) {
        elements.editorTitle.value = post.title;
        elements.editorContent.value = post.content;
    } else {
        elements.editorTitle.value = '';
        elements.editorContent.value = '';
    }
    
    updatePreview();
    updateEditorStats();
    showView('editor');
    
    // Focus title input
    setTimeout(() => elements.editorTitle.focus(), 100);
}

// Render posts list
function renderPostsList() {
    if (posts.length === 0) {
        elements.postsContainer.style.display = 'none';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.postsContainer.style.display = 'grid';
    elements.emptyState.style.display = 'none';
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    elements.postsContainer.innerHTML = sortedPosts.map(post => {
        const excerpt = stripMarkdown(post.content).substring(0, 150);
        const wordCount = stripMarkdown(post.content).split(/\s+/).filter(word => word.length > 0).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        const firstLetter = post.title.charAt(0).toUpperCase();
        
        return `
            <article class="post-card" onclick="showPost('${post.id}')">
                <div class="post-card-image">
                    <div class="post-card-placeholder">${firstLetter}</div>
                </div>
                <div class="post-card-body">
                    <div class="post-card-meta">
                        <div class="post-card-date">${formatDate(post.date)}</div>
                        <div class="post-card-category">
                            <i data-lucide="bookmark"></i>
                            <span>Story</span>
                        </div>
                    </div>
                    <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
                    <p class="post-card-excerpt">${escapeHtml(excerpt)}${post.content.length > 150 ? '...' : ''}</p>
                    <div class="post-card-footer">
                        <div class="post-card-stats">
                            <div class="post-card-stat">
                                <i data-lucide="clock"></i>
                                <span>${readTime} min</span>
                            </div>
                            <div class="post-card-stat">
                                <i data-lucide="type"></i>
                                <span>${wordCount} words</span>
                            </div>
                        </div>
                        <div class="read-more">
                            <span>Read more</span>
                            <i data-lucide="arrow-right"></i>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Show post
function showPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    currentPost = post;
    showView('view');
}

// Render post view
function renderPostView() {
    if (!currentPost) return;
    
    const wordCount = stripMarkdown(currentPost.content).split(/\s+/).filter(word => word.length > 0).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    elements.viewPostTitle.textContent = currentPost.title;
    elements.viewPostDate.textContent = formatDate(currentPost.date, true);
    elements.viewPostReadTime.textContent = `${readTime} min read`;
    elements.viewPostWordCount.textContent = `${wordCount} words`;
    
    // Render markdown content
    const renderedContent = marked.parse(currentPost.content);
    elements.viewPostContent.innerHTML = DOMPurify.sanitize(renderedContent);
    
    // Apply syntax highlighting
    elements.viewPostContent.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

// Handle edit post
function handleEditPost() {
    if (!currentPost) return;
    showEditor('edit', currentPost);
}

// Handle delete post
function handleDeletePost() {
    if (!currentPost) return;
    
    showModal(
        'Delete Post',
        `Are you sure you want to delete "${currentPost.title}"? This action cannot be undone.`,
        () => {
            posts = posts.filter(p => p.id !== currentPost.id);
            savePosts();
            updateStats();
            showView('list');
            showToast('Post deleted successfully');
        }
    );
}

// Handle back from editor
function handleBackFromEditor() {
    if (isDirty()) {
        showModal(
            'Unsaved Changes',
            'You have unsaved changes. Are you sure you want to leave without saving?',
            () => {
                if (editorMode === 'edit' && currentPost) {
                    showView('view');
                } else {
                    showView('list');
                }
            }
        );
    } else {
        if (editorMode === 'edit' && currentPost) {
            showView('view');
        } else {
            showView('list');
        }
    }
}

// Handle save post
function handleSavePost() {
    const title = elements.editorTitle.value.trim();
    const content = elements.editorContent.value.trim();
    
    if (!title) {
        showToast('Please enter a title for your post');
        elements.editorTitle.focus();
        return;
    }
    
    if (!content) {
        showToast('Post content cannot be empty');
        elements.editorContent.focus();
        return;
    }
    
    if (editorMode === 'edit' && currentPost) {
        // Update existing post
        const postIndex = posts.findIndex(p => p.id === currentPost.id);
        if (postIndex !== -1) {
            posts[postIndex] = {
                ...posts[postIndex],
                title,
                content,
                lastModified: new Date().toISOString()
            };
            currentPost = posts[postIndex];
        }
        showToast('Post updated successfully');
    } else {
        // Create new post
        const newPost = {
            id: generateId(),
            title,
            content,
            date: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        posts.push(newPost);
        currentPost = newPost;
        showToast('Post published successfully');
    }
    
    savePosts();
    updateStats();
    showView('view');
}

// Toggle preview
function togglePreview() {
    isPreviewVisible = !isPreviewVisible;
    elements.previewPanel.style.display = isPreviewVisible ? 'flex' : 'none';
    
    if (isPreviewVisible) {
        elements.previewToggle.innerHTML = '<i data-lucide="eye-off"></i><span>Hide Preview</span>';
    } else {
        elements.previewToggle.innerHTML = '<i data-lucide="eye"></i><span>Show Preview</span>';
    }
    
    lucide.createIcons();
}

// Update preview
function updatePreview() {
    if (!isPreviewVisible) return;
    
    const title = elements.editorTitle.value;
    const content = elements.editorContent.value;
    
    let previewHtml = '';
    
    if (title) {
        previewHtml += `<h1>${escapeHtml(title)}</h1>`;
    }
    
    if (content) {
        const renderedContent = marked.parse(content);
        previewHtml += DOMPurify.sanitize(renderedContent);
    }
    
    if (!previewHtml) {
        previewHtml = `
            <div class="preview-placeholder">
                <i data-lucide="file-text"></i>
                <p>Your beautiful story will appear here as you type...</p>
            </div>
        `;
    }
    
    elements.previewContent.innerHTML = previewHtml;
    
    // Apply syntax highlighting
    elements.previewContent.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
    
    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Update editor stats
function updateEditorStats() {
    const content = elements.editorContent.value;
    const wordCount = content.trim() ? stripMarkdown(content).split(/\s+/).filter(word => word.length > 0).length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    
    if (elements.editorWordCount) {
        elements.editorWordCount.textContent = `${wordCount} words`;
    }
    if (elements.editorReadTime) {
        elements.editorReadTime.textContent = `${readTime} min read`;
    }
}

// Insert markdown
function insertMarkdown(before, after, placeholder) {
    const textarea = elements.editorContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    textarea.value = beforeText + before + textToInsert + after + afterText;
    
    // Set cursor position
    const newCursorPos = start + before.length + textToInsert.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Focus textarea and update preview
    textarea.focus();
    updatePreview();
    updateEditorStats();
}

// Check if editor has unsaved changes
function isDirty() {
    if (editorMode === 'edit' && currentPost) {
        return currentPost.title !== elements.editorTitle.value || 
               currentPost.content !== elements.editorContent.value;
    } else {
        return elements.editorTitle.value.trim() !== '' || 
               elements.editorContent.value.trim() !== '';
    }
}

// Update stats
function updateStats() {
    const totalPosts = posts.length;
    const totalWords = posts.reduce((total, post) => {
        return total + stripMarkdown(post.content).split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    const totalReadTime = Math.max(1, Math.ceil(totalWords / 200));
    
    elements.postsCount.textContent = totalPosts;
    elements.wordsCount.textContent = totalWords.toLocaleString();
    elements.readTime.textContent = totalReadTime;
}

// Show modal
let modalConfirmCallback = null;

function showModal(title, message, onConfirm) {
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    modalConfirmCallback = onConfirm;
    elements.modalOverlay.style.display = 'flex';
    elements.modalOverlay.classList.add('show');
}

// Hide modal
function hideModal() {
    elements.modalOverlay.classList.remove('show');
    setTimeout(() => {
        elements.modalOverlay.style.display = 'none';
    }, 300);
    modalConfirmCallback = null;
}

// Handle modal confirm
function handleModalConfirm() {
    if (modalConfirmCallback) {
        modalConfirmCallback();
    }
    hideModal();
}

// Show toast
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.style.display = 'flex';
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        hideToast();
    }, 4000);
}

// Hide toast
function hideToast() {
    elements.toast.classList.remove('show');
    setTimeout(() => {
        elements.toast.style.display = 'none';
    }, 300);
}

// Utility functions
function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('en-US', options);
}

function stripMarkdown(md) {
    return md
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/>\s[^>]*/g, '')
        .replace(/\n/g, ' ')
        .trim();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function savePosts() {
    localStorage.setItem('inkwell-posts', JSON.stringify(posts));
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}