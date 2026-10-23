document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('sb_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sb_theme', next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === 'dark' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  // 2. Mobile Drawer
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    // Close sidebar on link click
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    });
  }

  // 3. Copy Code Buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const codeEl = targetId ? document.getElementById(targetId) : btn.closest('.code-box')?.querySelector('code');
      if (codeEl) {
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
          const origText = btn.innerHTML;
          btn.innerHTML = `✓ Copied!`;
          btn.style.borderColor = 'var(--accent-emerald)';
          btn.style.color = 'var(--accent-emerald)';
          setTimeout(() => {
            btn.innerHTML = origText;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  });

  // 4. Active Sidebar Tracking via IntersectionObserver
  const sections = document.querySelectorAll('.doc-section');
  const navItems = document.querySelectorAll('.nav-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          const a = item.querySelector('a');
          if (a && a.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(sec => observer.observe(sec));

  // 5. Interactive API Explorer Filter
  const apiSearch = document.getElementById('apiSearchInput');
  const apiTabs = document.querySelectorAll('.api-tab-btn');
  const endpointRows = document.querySelectorAll('.endpoint-row');

  let activeTag = 'ALL';
  let activeSearch = '';

  function filterEndpoints() {
    endpointRows.forEach(row => {
      const tag = row.getAttribute('data-tag') || '';
      const path = row.getAttribute('data-path') || '';
      const method = row.getAttribute('data-method') || '';
      const desc = row.getAttribute('data-desc') || '';

      const matchTag = (activeTag === 'ALL' || tag.toUpperCase() === activeTag.toUpperCase());
      const query = activeSearch.toLowerCase().trim();
      const matchSearch = !query || 
        path.toLowerCase().includes(query) || 
        method.toLowerCase().includes(query) || 
        desc.toLowerCase().includes(query);

      if (matchTag && matchSearch) {
        row.style.display = 'block';
      } else {
        row.style.display = 'none';
      }
    });
  }

  apiTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      apiTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTag = tab.getAttribute('data-tag') || 'ALL';
      filterEndpoints();
    });
  });

  if (apiSearch) {
    apiSearch.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      filterEndpoints();
    });
  }

  // Toggle Endpoint Details
  document.querySelectorAll('.endpoint-summary').forEach(summary => {
    summary.addEventListener('click', () => {
      const row = summary.closest('.endpoint-row');
      if (row) {
        row.classList.toggle('open');
      }
    });
  });

  // 6. Global Search Modal (Ctrl+K or /)
  const searchModal = document.getElementById('searchModalBackdrop');
  const searchInput = document.getElementById('searchModalInput');
  const searchResults = document.getElementById('searchResults');
  const searchTrigger = document.getElementById('searchTrigger');

  // Build searchable index from document sections
  const searchIndex = [];
  document.querySelectorAll('.doc-section').forEach(sec => {
    const id = sec.getAttribute('id');
    const title = sec.querySelector('.section-title')?.innerText || id;
    const tag = sec.querySelector('.section-tag')?.innerText || 'Docs';
    const text = sec.innerText.slice(0, 500).replace(/\s+/g, ' ');
    searchIndex.push({ id, title: `${tag}: ${title}`, text, href: `#${id}` });
  });

  // Also index endpoints
  endpointRows.forEach(row => {
    const method = row.getAttribute('data-method');
    const path = row.getAttribute('data-path');
    const desc = row.getAttribute('data-desc');
    searchIndex.push({
      id: `api-${method}-${path}`,
      title: `API [${method}] ${path}`,
      text: desc,
      href: '#backend-api'
    });
  });

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('open');
    searchInput?.focus();
    renderSearchResults('');
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    if (searchInput) searchInput.value = '';
  }

  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  function renderSearchResults(q) {
    if (!searchResults) return;
    const query = q.toLowerCase().trim();
    const matches = query.length === 0 
      ? searchIndex.slice(0, 6) 
      : searchIndex.filter(item => item.title.toLowerCase().includes(query) || item.text.toLowerCase().includes(query)).slice(0, 8);

    if (matches.length === 0) {
      searchResults.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">No documentation matching "${q}"</div>`;
      return;
    }

    searchResults.innerHTML = matches.map(item => `
      <a href="${item.href}" class="search-result-item" onclick="document.getElementById('searchModalBackdrop').classList.remove('open')">
        <h5>${item.title}</h5>
        <p>${item.text.slice(0, 110)}...</p>
      </a>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }
});
