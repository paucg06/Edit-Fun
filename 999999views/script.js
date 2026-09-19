const STORAGE_KEY = 'editfun_speed_graph_config_v1';

    // Elementos DOM
    const menuBtn = document.getElementById('menu-btn');
    const configModal = document.getElementById('config-modal');
    const btnThemeLight = document.getElementById('btn-theme-light');
    const btnThemeDark = document.getElementById('btn-theme-dark');
    const btnApplyStart = document.getElementById('btn-apply-start');
    const statsArea = document.getElementById('stats-area');

    const displayViews = document.getElementById('display-views');
    const displayLabel = document.getElementById('display-label');
    const progressFill = document.getElementById('progress-fill');
    const displayLikes = document.getElementById('display-likes');
    const displayDislikes = document.getElementById('display-dislikes');

    const inputViewsStart = document.getElementById('input-views-start');
    const inputViewsEnd = document.getElementById('input-views-end');
    const inputLikesStart = document.getElementById('input-likes-start');
    const inputLikesEnd = document.getElementById('input-likes-end');
    const inputDislikesStart = document.getElementById('input-dislikes-start');
    const inputDislikesEnd = document.getElementById('input-dislikes-end');
    const inputDuration = document.getElementById('input-duration');
    const selectLabel = document.getElementById('select-label');

    const dotViews = document.getElementById('dot-views');
    const dotLikes = document.getElementById('dot-likes');
    const dotDislikes = document.getElementById('dot-dislikes');

    const metricTabs = document.querySelectorAll('.metric-tab');
    const btnResetCurve = document.getElementById('btn-reset-curve');
    const curveCanvasWrapper = document.getElementById('curve-canvas-wrapper');
    const curveSvgElem = document.getElementById('curve-svg-elem');
    const curvePath = document.getElementById('curve-path');
    const curveGuidePoly = document.getElementById('curve-guide-poly');
    const cp1 = document.getElementById('cp-1');
    const cp2 = document.getElementById('cp-2');
    const cp3 = document.getElementById('cp-3');
    const controlPointsElements = [cp1, cp2, cp3];

    // Estado principal
    let activeEditingMetric = 'views'; // 'views' | 'likes' | 'dislikes'

    // Puntos por defecto para una velocidad horizontal constante en el centro (y=0.5 -> 40px)
    function getDefaultSpeedPoints() {
      return [
        { x: 0.25, y: 0.50 },
        { x: 0.50, y: 0.50 },
        { x: 0.75, y: 0.50 }
      ];
    }

    const defaultConfig = {
      theme: 'light',
      duration: 10,
      label: 'views',
      views: {
        start: 20000,
        end: 1000000,
        isCustom: false,
        points: getDefaultSpeedPoints()
      },
      likes: {
        start: 900,
        end: 45000,
        isCustom: false,
        points: getDefaultSpeedPoints()
      },
      dislikes: {
        start: 3,
        end: 120,
        isCustom: false,
        points: getDefaultSpeedPoints()
      }
    };

    let appConfig = JSON.parse(JSON.stringify(defaultConfig));

    // Cargar y Guardar en localStorage
    function loadSavedConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          appConfig = Object.assign({}, defaultConfig, parsed);
          ['views', 'likes', 'dislikes'].forEach(m => {
            if (!appConfig[m].points || appConfig[m].points.length !== 3) {
              appConfig[m].points = getDefaultSpeedPoints();
            }
          });
        }
      } catch(e) {
        console.warn('Could not read localStorage', e);
      }
    }

    function saveConfig() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appConfig));
      } catch(e) {
        console.warn('Could not save to localStorage', e);
      }
    }

    function syncUiFromConfig() {
      inputViewsStart.value = appConfig.views.start;
      inputViewsEnd.value = appConfig.views.end;
      inputLikesStart.value = appConfig.likes.start;
      inputLikesEnd.value = appConfig.likes.end;
      inputDislikesStart.value = appConfig.dislikes.start;
      inputDislikesEnd.value = appConfig.dislikes.end;
      inputDuration.value = appConfig.duration;
      selectLabel.value = appConfig.label;
      displayLabel.textContent = appConfig.label;

      if (appConfig.theme === 'dark') {
        document.body.classList.add('dark-theme');
        btnThemeDark.classList.add('active');
        btnThemeLight.classList.remove('active');
      } else {
        document.body.classList.remove('dark-theme');
        btnThemeLight.classList.add('active');
        btnThemeDark.classList.remove('active');
      }

      updateAllMetricDots();
      updateCurveEditorView();
    }

    function syncConfigFromInputs() {
      appConfig.views.start = parseFloat(inputViewsStart.value) || 0;
      appConfig.views.end = parseFloat(inputViewsEnd.value) || 0;
      appConfig.likes.start = parseFloat(inputLikesStart.value) || 0;
      appConfig.likes.end = parseFloat(inputLikesEnd.value) || 0;
      appConfig.dislikes.start = parseFloat(inputDislikesStart.value) || 0;
      appConfig.dislikes.end = parseFloat(inputDislikesEnd.value) || 0;
      appConfig.duration = parseFloat(inputDuration.value) || 10;
      appConfig.label = selectLabel.value;
      displayLabel.textContent = appConfig.label;
      saveConfig();
    }

    function updateAllMetricDots() {
      dotViews.classList.toggle('visible', !!appConfig.views.isCustom);
      dotLikes.classList.toggle('visible', !!appConfig.likes.isCustom);
      dotDislikes.classList.toggle('visible', !!appConfig.dislikes.isCustom);
    }

    // Coordenadas SVG: Width 280, Height 80 (y=0.5 -> 40px, y=1.0 -> 10px, y=0.0 -> 70px)
    function normToSvg(nx, ny) {
      return {
        x: nx * 280,
        y: 70 - ny * 60
      };
    }

    function svgToNorm(sx, sy) {
      const nx = Math.max(0.02, Math.min(0.98, sx / 280));
      const ny = Math.max(0.0, Math.min(1.0, (70 - sy) / 60));
      return { x: nx, y: ny };
    }

    // Evaluación instantánea de velocidad v(t) a lo largo del tiempo
    function evaluateSpeedAtTime(pts, t) {
      t = Math.max(0, Math.min(1, t));
      const allPts = [
        { x: 0, y: pts[0].y },
        ...pts,
        { x: 1, y: pts[2].y }
      ];
      const n = allPts.length;

      let i = 0;
      while (i < n - 2 && allPts[i + 1].x < t) {
        i++;
      }

      const p0 = allPts[Math.max(0, i - 1)];
      const p1 = allPts[i];
      const p2 = allPts[i + 1];
      const p3 = allPts[Math.min(n - 1, i + 2)];

      const dx = Math.max(0.0001, p2.x - p1.x);
      const frac = Math.max(0, Math.min(1, (t - p1.x) / dx));

      const m1 = (p2.y - p0.y) / Math.max(0.0001, p2.x - p0.x);
      const m2 = (p3.y - p1.y) / Math.max(0.0001, p3.x - p1.x);

      const f2 = frac * frac;
      const f3 = f2 * frac;
      const h00 = 2 * f3 - 3 * f2 + 1;
      const h10 = f3 - 2 * f2 + frac;
      const h01 = -2 * f3 + 3 * f2;
      const h11 = f3 - f2;

      const normSpeed = h00 * p1.y + h10 * dx * m1 + h01 * p2.y + h11 * dx * m2;
      const clampedNorm = Math.max(0.0, Math.min(1.0, normSpeed));
      
      // Mapeo: y=0.5 -> velocidad 1.0x; y=1.0 -> velocidad 3.0x; y=0.0 -> velocidad 0.05x
      return Math.max(0.04, 0.04 + clampedNorm * 1.92);
    }

    // Integración numérica acumulada: Progreso = ∫ v(t) dt / ∫_0^1 v(t) dt
    function evaluateSpeedEasing(metric, p) {
      const metricData = appConfig[metric];
      if (!metricData.isCustom) {
        return p; // Constante pura
      }

      const pts = metricData.points;
      const steps = 40;
      let totalIntegral = 0;
      let targetIntegral = 0;
      const dt = 1.0 / steps;

      for (let s = 0; s < steps; s++) {
        const midT = (s + 0.5) * dt;
        const v = evaluateSpeedAtTime(pts, midT);
        totalIntegral += v * dt;
        if (midT <= p) {
          targetIntegral += v * dt;
        } else if (s * dt < p && (s + 1) * dt >= p) {
          const partial = (p - s * dt) / dt;
          targetIntegral += v * dt * partial;
        }
      }

      if (totalIntegral <= 0) return p;
      return Math.max(0, Math.min(1, targetIntegral / totalIntegral));
    }

    // Actualizar visualización del editor de velocidad
    function updateCurveEditorView() {
      const metricData = appConfig[activeEditingMetric];
      const isCustom = !!metricData.isCustom;
      const pts = metricData.points || getDefaultSpeedPoints();

      // Posicionar los 3 puntos
      pts.forEach((p, idx) => {
        const svgP = normToSvg(p.x, p.y);
        controlPointsElements[idx].setAttribute('cx', svgP.x.toFixed(1));
        controlPointsElements[idx].setAttribute('cy', svgP.y.toFixed(1));
      });

      if (!isCustom) {
        curvePath.setAttribute('d', 'M 0 40 L 280 40');
        curveGuidePoly.style.display = 'none';
      } else {
        const p0Svg = normToSvg(0, pts[0].y);
        const p4Svg = normToSvg(1, pts[2].y);
        const polyPoints = [`0,${p0Svg.y.toFixed(1)}`];
        pts.forEach(p => {
          const svgP = normToSvg(p.x, p.y);
          polyPoints.push(`${svgP.x.toFixed(1)},${svgP.y.toFixed(1)}`);
        });
        polyPoints.push(`280,${p4Svg.y.toFixed(1)}`);
        curveGuidePoly.setAttribute('points', polyPoints.join(' '));
        curveGuidePoly.style.display = 'block';

        // Muestrear curva de velocidad continua
        let d = `M 0 ${p0Svg.y.toFixed(1)}`;
        const samples = 32;
        for (let s = 1; s <= samples; s++) {
          const t = s / samples;
          const v = evaluateSpeedAtTime(pts, t);
          // Convertir v de vuelta a coordenada Y de visualización
          const normY = Math.max(0, Math.min(1, (v - 0.04) / 1.92));
          const svgCoord = normToSvg(t, normY);
          d += ` L ${svgCoord.x.toFixed(1)} ${svgCoord.y.toFixed(1)}`;
        }
        curvePath.setAttribute('d', d);
      }

      updateAllMetricDots();
    }

    // Arrastre interactivo de puntos
    let activeDragIndex = -1;

    function getClosestPointIndex(normX, normY, pts) {
      let closestIdx = 0;
      let minD = 999999;
      pts.forEach((p, idx) => {
        const dx = p.x - normX;
        const dy = p.y - normY;
        const d = dx * dx * 0.4 + dy * dy;
        if (d < minD) {
          minD = d;
          closestIdx = idx;
        }
      });
      return closestIdx;
    }

    function handleDragPointer(e) {
      if (activeDragIndex < 0) return;
      const rect = curveSvgElem.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
      if (clientX === undefined) return;

      const sx = ((clientX - rect.left) / rect.width) * 280;
      const sy = ((clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);

      // Límites horizontales
      let minX = 0.05, maxX = 0.95;
      if (activeDragIndex === 0) {
        minX = 0.05;
        maxX = appConfig[activeEditingMetric].points[1].x - 0.05;
      } else if (activeDragIndex === 1) {
        minX = appConfig[activeEditingMetric].points[0].x + 0.05;
        maxX = appConfig[activeEditingMetric].points[2].x - 0.05;
      } else if (activeDragIndex === 2) {
        minX = appConfig[activeEditingMetric].points[1].x + 0.05;
        maxX = 0.95;
      }

      const clampedX = Math.max(minX, Math.min(maxX, norm.x));
      const clampedY = Math.max(0.0, Math.min(1.0, norm.y));

      appConfig[activeEditingMetric].isCustom = true;
      appConfig[activeEditingMetric].points[activeDragIndex] = { x: clampedX, y: clampedY };
      saveConfig();
      updateCurveEditorView();
    }

    // Eventos de ratón y táctiles
    curveCanvasWrapper.addEventListener('mousedown', (e) => {
      const rect = curveSvgElem.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * 280;
      const sy = ((e.clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);
      activeDragIndex = getClosestPointIndex(norm.x, norm.y, appConfig[activeEditingMetric].points);
      controlPointsElements[activeDragIndex].classList.add('dragging');
      handleDragPointer(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (activeDragIndex >= 0) {
        handleDragPointer(e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (activeDragIndex >= 0) {
        controlPointsElements[activeDragIndex].classList.remove('dragging');
        activeDragIndex = -1;
      }
    });

    curveCanvasWrapper.addEventListener('touchstart', (e) => {
      const rect = curveSvgElem.getBoundingClientRect();
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const sx = ((clientX - rect.left) / rect.width) * 280;
      const sy = ((clientY - rect.top) / rect.height) * 80;
      const norm = svgToNorm(sx, sy);
      activeDragIndex = getClosestPointIndex(norm.x, norm.y, appConfig[activeEditingMetric].points);
      handleDragPointer(e);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (activeDragIndex >= 0) {
        handleDragPointer(e);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => {
      activeDragIndex = -1;
    });

    // Botón de Restablecer Línea a Constante Horizontal
    btnResetCurve.addEventListener('click', () => {
      appConfig[activeEditingMetric].isCustom = false;
      appConfig[activeEditingMetric].points = getDefaultSpeedPoints();
      saveConfig();
      updateCurveEditorView();
    });

    // Pestañas de Métrica
    metricTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        metricTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeEditingMetric = btn.dataset.metric;
        updateCurveEditorView();
      });
    });

    // Inputs listeners para guardar en local
    [inputViewsStart, inputViewsEnd, inputLikesStart, inputLikesEnd, inputDislikesStart, inputDislikesEnd, inputDuration, selectLabel].forEach(input => {
      input.addEventListener('change', syncConfigFromInputs);
      input.addEventListener('input', syncConfigFromInputs);
    });

    // Animación y Render
    let isPlaying = false;
    let progress = 0;
    let lastTime = 0;
    let animationFrameId = null;

    function formatNumber(num) {
      return Math.round(num).toLocaleString('en-US');
    }

    function renderFrame(p) {
      const vEased = Math.max(0, Math.min(1, evaluateSpeedEasing('views', p)));
      const lEased = Math.max(0, Math.min(1, evaluateSpeedEasing('likes', p)));
      const dEased = Math.max(0, Math.min(1, evaluateSpeedEasing('dislikes', p)));

      const v = appConfig.views.start + (appConfig.views.end - appConfig.views.start) * vEased;
      const l = appConfig.likes.start + (appConfig.likes.end - appConfig.likes.start) * lEased;
      const d = appConfig.dislikes.start + (appConfig.dislikes.end - appConfig.dislikes.start) * dEased;

      displayViews.textContent = formatNumber(v);
      displayLikes.textContent = formatNumber(l);
      displayDislikes.textContent = formatNumber(d);

      progressFill.style.width = (vEased * 100) + '%';
    }

    function tick(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (isPlaying) {
        const durationMs = Math.max(500, appConfig.duration * 1000);
        progress += delta / durationMs;
        if (progress >= 1) {
          progress = 1;
          isPlaying = false;
        }
        renderFrame(progress);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    function startAnimation() {
      syncConfigFromInputs();
      progress = 0;
      lastTime = 0;
      isPlaying = true;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
    }

    function togglePlayPause() {
      if (progress >= 1) {
        startAnimation();
        return;
      }
      isPlaying = !isPlaying;
      if (isPlaying) {
        lastTime = 0;
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    // Modal
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      configModal.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!configModal.contains(e.target) && e.target !== menuBtn) {
        configModal.classList.remove('open');
      }
    });

    btnApplyStart.addEventListener('click', () => {
      configModal.classList.remove('open');
      startAnimation();
    });

    // Temas
    btnThemeLight.addEventListener('click', () => {
      document.body.classList.remove('dark-theme');
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
      appConfig.theme = 'light';
      saveConfig();
    });

    btnThemeDark.addEventListener('click', () => {
      document.body.classList.add('dark-theme');
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
      appConfig.theme = 'dark';
      saveConfig();
    });

    // Control de pantalla y teclado
    statsArea.addEventListener('click', () => {
      togglePlayPause();
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        startAnimation();
      } else if (e.key === 'Escape') {
        configModal.classList.remove('open');
      }
    });

    // Inicialización
    loadSavedConfig();
    syncUiFromConfig();
    startAnimation();
