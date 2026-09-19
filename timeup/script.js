/* ========================================================
       ESTADO DEL TEMPORIZADOR
       ======================================================== */
    let timerMode = 'countdown'; // 'countdown' | 'countup'
    let configuredTotalSeconds = 4 * 3600; // 4 horas por defecto
    let currentSeconds = 4 * 3600;
    let isRunning = true;
    let speedMultiplier = 1;
    let isTimelapseMode = false;
    let timelapseDurationMs = 5000;
    let timelapseStartTime = 0;
    let timelapseStartSeconds = 0;

    let lastFrameTime = performance.now();

    // Curva de velocidad interactiva
    let speedPoints = [
      { x: 0.25, y: 0.5 },
      { x: 0.50, y: 0.5 },
      { x: 0.75, y: 0.5 }
    ];
    let isDraggingPoint = false;
    let dragPointIndex = -1;

    // Elementos DOM
    const displayTime = document.getElementById('display-time');
    const displayArea = document.getElementById('display-area');
    const btnToggle = document.getElementById('btn-toggle');
    const btnReset = document.getElementById('btn-reset');
    const menuBtn = document.getElementById('menu-btn');
    const configModal = document.getElementById('config-modal');

    const optSpeedTimelapse = document.getElementById('opt-speed-timelapse');

    const rowTimeConfig = document.getElementById('row-time-config');
    const rowSoundConfig = document.getElementById('row-sound-config');
    const selectSound = document.getElementById('select-sound');
    const rowCustomSound = document.getElementById('row-custom-sound');
    const soundFileInput = document.getElementById('sound-file-input');
    const customSoundContainer = document.getElementById('custom-sound-container');
    let customAudioBuffer = null;
    let customAudioFileName = '';

    const inputH = document.getElementById('input-h');
    const inputM = document.getElementById('input-m');
    const inputS = document.getElementById('input-s');

    const btnModeCountdown = document.getElementById('btn-mode-countdown');
    const btnModeCountup = document.getElementById('btn-mode-countup');

    const selectSpeed = document.getElementById('select-speed');
    const rowCustomSpeed = document.getElementById('row-custom-speed');
    const inputCustomSpeed = document.getElementById('input-custom-speed');
    const rowTimelapseConfig = document.getElementById('row-timelapse-config');
    const inputTimelapseSecs = document.getElementById('input-timelapse-secs');

    const curveWrapper = document.getElementById('curve-canvas-wrapper');
    const curvePath = document.getElementById('curve-path');
    const btnResetCurve = document.getElementById('btn-reset-curve');
    const controlPointsElements = [
      document.getElementById('cp-1'),
      document.getElementById('cp-2'),
      document.getElementById('cp-3')
    ];

    const btnColorDefault = document.getElementById('btn-color-default');
    const btnColorOrange = document.getElementById('btn-color-orange');

    const btnThemeLight = document.getElementById('btn-theme-light');
    const btnThemeDark = document.getElementById('btn-theme-dark');

    /* ========================================================
       FORMATEO DE TIEMPO (2 dígitos obligatorios 00:00:00)
       ======================================================== */
    function formatTwoDigits(n) {
      return String(Math.max(0, Math.floor(n))).padStart(2, '0');
    }

    function formatTime(totalSec) {
      const s = Math.max(0, Math.floor(totalSec));
      const hours = Math.floor(s / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const seconds = s % 60;
      return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
    }

    function updateDisplayDOM() {
      const formatted = formatTime(currentSeconds);
      if (displayTime.textContent !== formatted) {
        displayTime.textContent = formatted;
      }
    }

    /* ========================================================
       LECTURA Y FORMATEO DE INPUTS DE TIEMPO
       ======================================================== */
    function readConfiguredSeconds() {
      const h = Math.max(0, parseInt(inputH.value, 10) || 0);
      const m = Math.min(59, Math.max(0, parseInt(inputM.value, 10) || 0));
      const s = Math.min(59, Math.max(0, parseInt(inputS.value, 10) || 0));
      return h * 3600 + m * 60 + s;
    }

    function handleInputsChange() {
      configuredTotalSeconds = readConfiguredSeconds();
      if (timerMode === 'countdown') {
        currentSeconds = configuredTotalSeconds;
      } else {
        currentSeconds = 0;
      }
      if (selectSpeed.value === 'timelapse') {
        startTimelapse();
      }
      updateDisplayDOM();
    }

    [inputH, inputM, inputS].forEach(inp => {
      inp.addEventListener('input', handleInputsChange);
      inp.addEventListener('blur', () => {
        const val = parseInt(inp.value, 10) || 0;
        inp.value = formatTwoDigits(val);
      });
    });

    /* ========================================================
       CAMBIO DE MODO: Cuenta atrás / Cronómetro
       ======================================================== */
    btnModeCountdown.addEventListener('click', () => {
      timerMode = 'countdown';
      btnModeCountdown.classList.add('active');
      btnModeCountup.classList.remove('active');
      rowTimeConfig.style.display = 'flex';
      rowSoundConfig.style.display = 'flex';
      optSpeedTimelapse.style.display = '';
      configuredTotalSeconds = readConfiguredSeconds();
      currentSeconds = configuredTotalSeconds;
      if (selectSpeed.value === 'timelapse') startTimelapse();
      updateDisplayDOM();
    });

    btnModeCountup.addEventListener('click', () => {
      timerMode = 'countup';
      btnModeCountup.classList.add('active');
      btnModeCountdown.classList.remove('active');
      rowTimeConfig.style.display = 'none'; // Ocultar en cronómetro
      rowSoundConfig.style.display = 'none'; // Ocultar sonido en cronómetro
      optSpeedTimelapse.style.display = 'none'; // Ocultar opción timelapse en cronómetro

      if (selectSpeed.value === 'timelapse') {
        selectSpeed.value = 'normal';
        rowTimelapseConfig.style.display = 'none';
        rowCustomSpeed.style.display = 'none';
        isTimelapseMode = false;
        speedMultiplier = 1;
      }

      currentSeconds = 0;
      updateDisplayDOM();
    });

    /* ========================================================
       GESTIÓN DE VELOCIDAD (Solo 3 opciones)
       ======================================================== */
    selectSpeed.addEventListener('change', () => {
      const val = selectSpeed.value;
      if (val === 'normal') {
        rowCustomSpeed.style.display = 'none';
        rowTimelapseConfig.style.display = 'none';
        isTimelapseMode = false;
        speedMultiplier = 1;
      } else if (val === 'custom') {
        rowCustomSpeed.style.display = 'flex';
        rowTimelapseConfig.style.display = 'none';
        isTimelapseMode = false;
        speedMultiplier = Math.max(1, parseFloat(inputCustomSpeed.value) || 2);
      } else if (val === 'timelapse') {
        rowCustomSpeed.style.display = 'none';
        rowTimelapseConfig.style.display = 'flex';
        updateCurveEditorView();
        startTimelapse();
      }
    });

    inputCustomSpeed.addEventListener('input', () => {
      if (selectSpeed.value === 'custom') {
        speedMultiplier = Math.max(1, parseFloat(inputCustomSpeed.value) || 1);
      }
    });

    inputTimelapseSecs.addEventListener('input', () => {
      if (selectSpeed.value === 'timelapse') {
        const secs = Math.max(1, parseFloat(inputTimelapseSecs.value) || 5);
        timelapseDurationMs = secs * 1000;
        startTimelapse();
      }
    });

    function startTimelapse() {
      isTimelapseMode = true;
      const secs = Math.max(1, parseFloat(inputTimelapseSecs.value) || 5);
      timelapseDurationMs = secs * 1000;
      timelapseStartTime = performance.now();
      timelapseStartSeconds = currentSeconds > 0 ? currentSeconds : configuredTotalSeconds;
    }

    /* ========================================================
       CURVA DE VELOCIDAD INTERACTIVA
       ======================================================== */
    function normToSvg(nx, ny) {
      return {
        x: nx * 280,
        y: 64 - ny * 56
      };
    }

    function svgToNorm(sx, sy) {
      const nx = Math.max(0.02, Math.min(0.98, sx / 280));
      const ny = Math.max(0.0, Math.min(1.0, (64 - sy) / 56));
      return { x: nx, y: ny };
    }

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
      return Math.max(0.04, 0.04 + clampedNorm * 1.92);
    }

    function evaluateTimelapseProgress(p) {
      const steps = 40;
      let totalIntegral = 0;
      let targetIntegral = 0;
      const dt = 1.0 / steps;

      for (let s = 0; s < steps; s++) {
        const midT = (s + 0.5) * dt;
        const v = evaluateSpeedAtTime(speedPoints, midT);
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

    function updateCurveEditorView() {
      speedPoints.forEach((p, idx) => {
        const svgP = normToSvg(p.x, p.y);
        controlPointsElements[idx].setAttribute('cx', svgP.x.toFixed(1));
        controlPointsElements[idx].setAttribute('cy', svgP.y.toFixed(1));
      });

      let pathD = 'M 0 ' + normToSvg(0, speedPoints[0].y).y.toFixed(1);
      for (let s = 0; s <= 40; s++) {
        const t = s / 40;
        const v = evaluateSpeedAtTime(speedPoints, t);
        const normY = (v - 0.04) / 1.92;
        const pt = normToSvg(t, normY);
        pathD += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
      curvePath.setAttribute('d', pathD);
    }

    // Dragging de puntos en la gráfica
    controlPointsElements.forEach((handle, idx) => {
      function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        isDraggingPoint = true;
        dragPointIndex = idx;
        handle.classList.add('dragging');
      }
      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: false });
    });

    function handlePointerMove(e) {
      if (!isDraggingPoint || dragPointIndex < 0) return;
      const rect = curveWrapper.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const svgX = (clientX - rect.left) * (280 / rect.width);
      const svgY = (clientY - rect.top) * (72 / rect.height);
      const norm = svgToNorm(svgX, svgY);

      const minX = dragPointIndex === 0 ? 0.08 : speedPoints[dragPointIndex - 1].x + 0.06;
      const maxX = dragPointIndex === 2 ? 0.92 : speedPoints[dragPointIndex + 1].x - 0.06;

      speedPoints[dragPointIndex].x = Math.max(minX, Math.min(maxX, norm.x));
      speedPoints[dragPointIndex].y = norm.y;

      updateCurveEditorView();
    }

    function handlePointerUp() {
      if (isDraggingPoint) {
        isDraggingPoint = false;
        if (dragPointIndex >= 0 && controlPointsElements[dragPointIndex]) {
          controlPointsElements[dragPointIndex].classList.remove('dragging');
        }
        dragPointIndex = -1;
      }
    }

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    btnResetCurve.addEventListener('click', () => {
      speedPoints = [
        { x: 0.25, y: 0.5 },
        { x: 0.50, y: 0.5 },
        { x: 0.75, y: 0.5 }
      ];
      updateCurveEditorView();
    });

    /* ========================================================
       SONIDOS SINTETIZADOS Y CUSTOMIZADOS (WEB AUDIO API)
       ======================================================== */
    function playCustomAudioBuffer(ctx) {
      if (!customAudioBuffer) return;
      try {
        const source = ctx.createBufferSource();
        source.buffer = customAudioBuffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (err) {
        console.error('Error reproduciendo audio customizado:', err);
      }
    }

    function updateCustomSoundUI() {
      if (!customSoundContainer) return;
      if (customAudioBuffer && customAudioFileName) {
        customSoundContainer.innerHTML = `
          <div class="custom-sound-active-wrap" title="${customAudioFileName}">
            <div class="custom-sound-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <span class="custom-sound-name">${customAudioFileName}</span>
            </div>
            <button type="button" class="btn-remove-sound" title="Quitar sonido">&times;</button>
          </div>
        `;
        const btnRemove = customSoundContainer.querySelector('.btn-remove-sound');
        if (btnRemove) {
          btnRemove.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            customAudioBuffer = null;
            customAudioFileName = '';
            if (soundFileInput) soundFileInput.value = '';
            updateCustomSoundUI();
          });
        }
      } else {
        customSoundContainer.innerHTML = `
          <button type="button" class="btn-upload-sound" title="Subir archivo de audio propio (.mp3, .wav, .ogg)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span>Subir sonido customizado</span>
          </button>
        `;
        const btnUpload = customSoundContainer.querySelector('.btn-upload-sound');
        if (btnUpload) {
          btnUpload.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (soundFileInput) soundFileInput.click();
          });
        }
      }
    }

    if (soundFileInput) {
      soundFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          const arrayBuffer = ev.target.result;
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioCtx.decodeAudioData(arrayBuffer.slice(0), (decoded) => {
            customAudioBuffer = decoded;
            customAudioFileName = file.name;
            updateCustomSoundUI();
            playCustomAudioBuffer(audioCtx);
          }, (err) => {
            console.error('Error decodificando audio:', err);
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }

    selectSound.addEventListener('change', () => {
      if (selectSound.value === 'custom') {
        rowCustomSound.style.display = 'block';
        updateCustomSoundUI();
      } else {
        rowCustomSound.style.display = 'none';
      }
    });

    function playAlarmSound() {
      const type = selectSound.value;
      if (type === 'none') return;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        if (type === 'custom') {
          if (customAudioBuffer) {
            playCustomAudioBuffer(audioCtx);
          } else {
            // Pitido breve si todavía no ha cargado archivo
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.21);
          }
        } else if (type === 'beep') {
          // Pitido digital triple clásico
          for (let i = 0; i < 3; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime + i * 0.15); // C6
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + i * 0.15);
            osc.stop(audioCtx.currentTime + i * 0.15 + 0.11);
          }
        } else if (type === 'bell') {
          // Campana resonante
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime);
          osc.stop(audioCtx.currentTime + 1.2);
        } else if (type === 'double') {
          // Alarma doble
          for (let i = 0; i < 2; i++) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(784, audioCtx.currentTime + i * 0.2); // G5
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + 0.14);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + i * 0.2);
            osc.stop(audioCtx.currentTime + i * 0.2 + 0.15);
          }
        }
      } catch (e) {}
    }

    /* ========================================================
       COLOR DE DÍGITOS (Por defecto / Naranja)
       ======================================================== */
    btnColorDefault.addEventListener('click', () => {
      document.body.classList.remove('digit-orange');
      btnColorDefault.classList.add('active');
      btnColorOrange.classList.remove('active');
    });

    btnColorOrange.addEventListener('click', () => {
      document.body.classList.add('digit-orange');
      btnColorOrange.classList.add('active');
      btnColorDefault.classList.remove('active');
    });

    /* ========================================================
       TEMA BLANCO / NEGRO
       ======================================================== */
    btnThemeLight.addEventListener('click', () => {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      btnThemeLight.classList.add('active');
      btnThemeDark.classList.remove('active');
    });

    btnThemeDark.addEventListener('click', () => {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      btnThemeDark.classList.add('active');
      btnThemeLight.classList.remove('active');
    });

    /* ========================================================
       BUCLE DE ALTA PRECISIÓN (requestAnimationFrame)
       ======================================================== */
    function timerLoop(now) {
      const deltaSec = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      if (isRunning && deltaSec > 0 && deltaSec < 2) {
        if (isTimelapseMode) {
          const elapsed = now - timelapseStartTime;
          const rawProgress = Math.min(1, elapsed / timelapseDurationMs);
          const easedProgress = evaluateTimelapseProgress(rawProgress);

          if (timerMode === 'countdown') {
            currentSeconds = timelapseStartSeconds * (1 - easedProgress);
          } else {
            currentSeconds = timelapseStartSeconds + (configuredTotalSeconds - timelapseStartSeconds) * easedProgress;
          }

          if (rawProgress >= 1) {
            isTimelapseMode = false;
            isRunning = false;
            syncPlayButtonsState();
            playAlarmSound();
          }
        } else {
          const advance = deltaSec * speedMultiplier;
          if (timerMode === 'countdown') {
            currentSeconds -= advance;
            if (currentSeconds <= 0) {
              currentSeconds = 0;
              isRunning = false;
              syncPlayButtonsState();
              playAlarmSound();
            }
          } else {
            currentSeconds += advance;
          }
        }
        updateDisplayDOM();
      }

      requestAnimationFrame(timerLoop);
    }

    /* ========================================================
       SINCRONIZACIÓN DE BOTONES INICIAR / PARAR
       ======================================================== */
    function syncPlayButtonsState() {
      if (isRunning) {
        btnToggle.textContent = 'Parar';
      } else {
        btnToggle.textContent = 'Iniciar';
      }
    }

    function toggleTimer() {
      isRunning = !isRunning;
      syncPlayButtonsState();
      if (isRunning) {
        lastFrameTime = performance.now();
        if (selectSpeed.value === 'timelapse') {
          startTimelapse();
        }
      }
    }

    function resetTimer() {
      configuredTotalSeconds = readConfiguredSeconds();
      if (timerMode === 'countdown') {
        currentSeconds = configuredTotalSeconds;
      } else {
        currentSeconds = 0;
      }
      if (selectSpeed.value === 'timelapse') {
        startTimelapse();
      } else {
        isTimelapseMode = false;
      }
      updateDisplayDOM();
    }

    displayArea.addEventListener('click', toggleTimer);
    btnToggle.addEventListener('click', toggleTimer);
    btnReset.addEventListener('click', resetTimer);

    // Menú 3 puntos
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      configModal.classList.toggle('open');
      if (configModal.classList.contains('open') && selectSpeed.value === 'timelapse') {
        updateCurveEditorView();
      }
    });

    document.addEventListener('click', (e) => {
      if (!configModal.contains(e.target) && !menuBtn.contains(e.target)) {
        configModal.classList.remove('open');
      }
    });

    // Inicializar
    syncPlayButtonsState();
    updateDisplayDOM();
    updateCurveEditorView();
    updateCustomSoundUI();
    requestAnimationFrame(timerLoop);
