const searchInput = document.getElementById('search-input');
    const loadingOverlay = document.getElementById('loading-overlay');
    const topLoader = document.getElementById('top-loader');
    const btnSearchIcon = document.getElementById('btn-search-icon');
    const btnSearch = document.getElementById('btn-search');
    const btnSubscribe = document.getElementById('btn-subscribe');
    
    // Elementos del menú desplegable de los 9 puntos
    const appsMenuBtn = document.getElementById('apps-menu-btn');
    const appsPopover = document.getElementById('apps-popover');
    const popoverThemeToggle = document.getElementById('popover-theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconCloud = document.getElementById('theme-icon-cloud');
    const popoverThemeLabel = document.getElementById('popover-theme-label');

    // Manejo de Tema Claro / Oscuro
    function applyTheme(isLight) {
      if (isLight) {
        document.body.classList.add('light-theme');
        themeIconSun.style.display = 'none';
        themeIconCloud.style.display = 'block';
        popoverThemeLabel.textContent = 'Modo Oscuro';
        localStorage.setItem('google_theme_mode', 'light');
      } else {
        document.body.classList.remove('light-theme');
        themeIconSun.style.display = 'block';
        themeIconCloud.style.display = 'none';
        popoverThemeLabel.textContent = 'Modo Claro';
        localStorage.setItem('google_theme_mode', 'dark');
      }
    }

    const savedTheme = localStorage.getItem('google_theme_mode');
    if (savedTheme === 'light') {
      applyTheme(true);
    } else {
      applyTheme(false);
    }

    // Toggle Popover
    appsMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appsPopover.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!appsPopover.contains(e.target) && e.target !== appsMenuBtn) {
        appsPopover.classList.remove('open');
      }
    });

    popoverThemeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyLight = document.body.classList.contains('light-theme');
      applyTheme(!isCurrentlyLight);
      appsPopover.classList.remove('open');
    });

    document.getElementById('search-box').addEventListener('click', (e) => {
      if (e.target !== btnSearchIcon && !btnSearchIcon.contains(e.target)) {
        searchInput.focus();
      }
    });

    function showLoading() {
      topLoader.style.display = 'block';
      loadingOverlay.classList.add('active');
    }

    function hideLoading() {
      loadingOverlay.classList.remove('active');
      topLoader.style.display = 'none';
      searchInput.focus();
    }

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        showLoading();
      }
    });

    btnSearchIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      showLoading();
    });

    btnSearch.addEventListener('click', () => showLoading());
    btnSubscribe.addEventListener('click', () => showLoading());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        appsPopover.classList.remove('open');
      }
      if (loadingOverlay.classList.contains('active')) {
        if (e.key !== 'Enter') {
          hideLoading();
        }
      }
    });

    loadingOverlay.addEventListener('click', () => {
      hideLoading();
    });
