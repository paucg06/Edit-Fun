const STORAGE_KEY = 'editfun_windows_errors_v10';

    // Elementos DOM
    const menuBtn = document.getElementById('menu-btn');
    const configModal = document.getElementById('config-modal');
    const selectScreenMode = document.getElementById('select-screen-mode');
    const selectLang = document.getElementById('select-lang');
    const inputPctStart = document.getElementById('input-pct-start');
    const inputPctEnd = document.getElementById('input-pct-end');
    const inputDuration = document.getElementById('input-duration');
    const inputStopcode = document.getElementById('input-stopcode');
    const btnStartAnim = document.getElementById('btn-start-anim');
    const rowStopcode = document.getElementById('row-stopcode');
    const rowProgress = document.getElementById('row-progress');
    const rowDuration = document.getElementById('row-duration');

    const screenReal = document.getElementById('screen-bsod-real');
    const screenMeme = document.getElementById('screen-bsod-meme');
    const screenUpdate = document.getElementById('screen-win-update');
    const screenUndo = document.getElementById('screen-win-undo');
    const screenRecovery = document.getElementById('screen-win-recovery');
    const screenInstall = document.getElementById('screen-win-install');
    
    const screenViews = {
      bsod_real: screenReal,
      bsod_meme: screenMeme,
      recovery: screenRecovery,
      install: screenInstall,
      update: screenUpdate,
      undo: screenUndo
    };

    const realMsg = document.getElementById('real-msg');
    const realPct = document.getElementById('real-pct');
    const realInfo = document.getElementById('real-info');

    const memeTitle = document.getElementById('meme-title');
    const memePct = document.getElementById('meme-pct');
    const memeInfoP1 = document.getElementById('meme-info-p1');
    const memeInfoP2 = document.getElementById('meme-info-p2');
    const memeStopcodeDisp = document.getElementById('meme-stopcode-disp');

    const updateMsgMain = document.getElementById('update-msg-main');
    const updatePctDisp = document.getElementById('update-pct-disp');
    const updateMsgSub = document.getElementById('update-msg-sub');
    const updateFooterDisp = document.getElementById('update-footer-disp');

    const undoLine1 = document.getElementById('undo-line-1');
    const undoLine2 = document.getElementById('undo-line-2');
    const undoLine3 = document.getElementById('undo-line-3');

    const recTitle = document.getElementById('rec-title');
    const recSubtitle = document.getElementById('rec-subtitle');
    const recDesc = document.getElementById('rec-desc');
    const btnRecAdvanced = document.getElementById('btn-rec-advanced');
    const btnRecRestart = document.getElementById('btn-rec-restart');

    const instTitle = document.getElementById('inst-title');
    const instSubtitle = document.getElementById('inst-subtitle');
    const instPctDisp = document.getElementById('inst-pct-disp');
    const btnInstCancel = document.getElementById('btn-inst-cancel');

    // Configuración
    let currentMode = 'bsod_real';
    let currentLang = 'en';
    let pctStart = 65, pctEnd = 100, durationSec = 12;
    let stopCode = 'CRITICAL_PROCESS_DIED';

    let isPlaying = false;
    let progress = 0;
    let lastTime = 0;
    let animationFrameId = null;

    const TEXTS = {
      en: {
        realMsg: "Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.",
        realPctLabel: "complete",
        realInfoP1: "For more information about this issue and possible fixes, visit",
        realInfoP2: "if you call a support person, give them this info:",
        memeTitle: "I don’t know WHAT<br>the fuck is going on.",
        memePctLabel: "complete",
        memeInfoP1: "Good luck searching for it online though, might even visit",
        memeInfoP2: "Here’s a useless code that Google has no results for. Try Bing. Just kidding",
        memeDefaultStopCode: "WINDOWS MY FUCKING ASS",
        updateMain: "Working on updates",
        updateSub: "Don't turn off your PC. This will take a while.",
        updateFooter: "Your PC will restart several times.",
        undo1: "We couldn't complete the updates",
        undo2: "Undoing changes",
        undo3: "Don't turn off your computer",
        recTitle: "Recovery",
        recSubtitle: "It looks like Windows didn’t load correctly",
        recDesc: "If you’d like to restart and try again, choose “Restart my PC” below. Otherwise, choose “See advanced repair options” for troubleshooting tools and advanced options. If you don’t know which option is right for you, contact someone you trust to help with this.",
        recBtnAdvanced: "See advanced repair options",
        recBtnRestart: "Restart my PC",
        instTitle: "Installing Windows 11",
        instSubtitle: "Your PC will restart several times. This might take a while.",
        instPctLabel: "complete",
        instCancel: "Cancel"
      },
      es: {
        realMsg: "Se ha producido un problema en su PC y necesita reiniciarse. Vamos a recopilar información sobre el error y después se reiniciará.",
        realPctLabel: "completado",
        realInfoP1: "Para obtener más información sobre este problema y posibles soluciones, visita",
        realInfoP2: "Si llamas al soporte técnico, indícales esta información:",
        memeTitle: "No sé QUÉ cojones<br>está pasando aquí.",
        memePctLabel: "completado",
        memeInfoP1: "Buena suerte buscando esto en internet, quizá visitando",
        memeInfoP2: "Aquí tienes un código inútil sin resultados en Google. Prueba Bing. Es broma.",
        memeDefaultStopCode: "WINDOWS_MY_FUCKING_ASS",
        updateMain: "Trabajando en las actualizaciones",
        updateSub: "Mantén el equipo enchufado.",
        updateFooter: "Es posible que el equipo se reinicie varias veces.",
        undo1: "No hemos podido completar las actualizaciones",
        undo2: "Deshaciendo cambios",
        undo3: "No apagues el equipo",
        recTitle: "Recuperación",
        recSubtitle: "Parece que Windows no se cargó correctamente",
        recDesc: "Si quieres reiniciar e intentarlo de nuevo, elige “Reiniciar mi PC” a continuación. De lo contrario, elige “Ver opciones de reparación avanzadas” para herramientas de solución de problemas y opciones avanzadas. Si no sabes qué opción es la correcta, consulta con alguien de confianza.",
        recBtnAdvanced: "Ver opciones de reparación avanzadas",
        recBtnRestart: "Reiniciar mi PC",
        instTitle: "Instalando Windows 11",
        instSubtitle: "El equipo se reiniciará varias veces. Esto puede tardar unos minutos.",
        instPctLabel: "completado",
        instCancel: "Cancelar"
      }
    };

    function updateLanguageTexts() {
      const t = TEXTS[currentLang] || TEXTS.en;
      realMsg.textContent = t.realMsg || TEXTS.en.realMsg;
      realInfo.innerHTML = `
        <p>${t.realInfoP1 || TEXTS.en.realInfoP1} <a href="#">https://www.windows.com/stopcode</a></p>
        <div class="bsod-info-codes">
          <p>${t.realInfoP2 || TEXTS.en.realInfoP2}</p>
          <p>Stop code: <span id="real-stopcode-disp">${stopCode}</span></p>
        </div>
      `;
      
      memeTitle.innerHTML = t.memeTitle || TEXTS.en.memeTitle;
      memeInfoP1.innerHTML = `${t.memeInfoP1 || TEXTS.en.memeInfoP1} <a href="#">https://www.windows.com/stopcode</a>`;
      memeInfoP2.textContent = t.memeInfoP2 || TEXTS.en.memeInfoP2;
      memeStopcodeDisp.textContent = (currentMode === 'bsod_meme' && stopCode === 'CRITICAL_PROCESS_DIED') ? (t.memeDefaultStopCode || TEXTS.en.memeDefaultStopCode) : stopCode;

      updateMsgSub.textContent = t.updateSub || TEXTS.en.updateSub;
      updateFooterDisp.textContent = t.updateFooter || TEXTS.en.updateFooter;

      undoLine1.textContent = t.undo1 || TEXTS.en.undo1;
      undoLine2.textContent = t.undo2 || TEXTS.en.undo2;
      undoLine3.textContent = t.undo3 || TEXTS.en.undo3;

      recTitle.textContent = t.recTitle || TEXTS.en.recTitle;
      recSubtitle.textContent = t.recSubtitle || TEXTS.en.recSubtitle;
      recDesc.textContent = t.recDesc || TEXTS.en.recDesc;
      btnRecAdvanced.textContent = t.recBtnAdvanced || TEXTS.en.recBtnAdvanced;
      btnRecRestart.textContent = t.recBtnRestart || TEXTS.en.recBtnRestart;

      instTitle.textContent = t.instTitle || TEXTS.en.instTitle;
      instSubtitle.textContent = t.instSubtitle || TEXTS.en.instSubtitle;
      btnInstCancel.textContent = t.instCancel || TEXTS.en.instCancel;

      renderCurrentPct(pctStart);
    }

    function switchMode(mode) {
      currentMode = mode;
      selectScreenMode.value = mode;

      Object.values(screenViews).forEach(s => s.classList.remove('active'));
      if (screenViews[mode]) {
        screenViews[mode].classList.add('active');
      }

      const hasProgress = ['bsod_real', 'bsod_meme', 'update', 'install'].includes(mode);
      rowProgress.style.display = hasProgress ? 'flex' : 'none';
      rowDuration.style.display = hasProgress ? 'flex' : 'none';
      btnStartAnim.style.display = hasProgress ? 'flex' : 'none';

      const hasStopcode = ['bsod_real', 'bsod_meme'].includes(mode);
      rowStopcode.style.display = hasStopcode ? 'flex' : 'none';

      if (mode === 'bsod_meme' && (inputStopcode.value === 'CRITICAL_PROCESS_DIED' || !inputStopcode.value)) {
        inputStopcode.value = 'WINDOWS MY FUCKING ASS';
        stopCode = 'WINDOWS MY FUCKING ASS';
      }

      updateLanguageTexts();
      saveConfig();
    }

    function renderCurrentPct(val) {
      const rounded = Math.round(val);
      const t = TEXTS[currentLang] || TEXTS.en;
      realPct.textContent = `${rounded}% ${t.realPctLabel}`;
      memePct.textContent = `${rounded}% ${t.memePctLabel}`;
      updateMsgMain.innerHTML = `${t.updateMain} <span id="update-pct-disp">${rounded}%</span>`;
      instPctDisp.textContent = `${rounded}% ${t.instPctLabel}`;
    }

    function tick(timestamp) {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (isPlaying) {
        progress += delta / (durationSec * 1000);
        if (progress >= 1) {
          progress = 1;
          isPlaying = false;
        }
        const currentVal = pctStart + (pctEnd - pctStart) * progress;
        renderCurrentPct(currentVal);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(tick);
      }
    }

    function startAnimation() {
      pctStart = parseFloat(inputPctStart.value) || 0;
      pctEnd = parseFloat(inputPctEnd.value) || 100;
      durationSec = Math.max(1, parseFloat(inputDuration.value) || 10);
      stopCode = inputStopcode.value || 'CRITICAL_PROCESS_DIED';
      currentLang = selectLang.value;

      updateLanguageTexts();
      progress = 0;
      lastTime = 0;
      isPlaying = true;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
      saveConfig();
    }

    function saveConfig() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          mode: currentMode,
          lang: currentLang,
          pctStart,
          pctEnd,
          durationSec,
          stopCode
        }));
      } catch(e){}
    }

    function loadSavedConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          currentMode = parsed.mode || 'bsod_real';
          currentLang = parsed.lang || 'en';
          pctStart = parsed.pctStart !== undefined ? parsed.pctStart : 65;
          pctEnd = parsed.pctEnd !== undefined ? parsed.pctEnd : 100;
          durationSec = parsed.durationSec || 12;
          stopCode = parsed.stopCode || 'CRITICAL_PROCESS_DIED';

          inputPctStart.value = pctStart;
          inputPctEnd.value = pctEnd;
          inputDuration.value = durationSec;
          inputStopcode.value = stopCode;
          selectLang.value = currentLang;
          selectScreenMode.value = currentMode;
        }
      } catch(e){}
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

    selectScreenMode.addEventListener('change', () => {
      switchMode(selectScreenMode.value);
    });

    selectLang.addEventListener('change', () => {
      currentLang = selectLang.value;
      updateLanguageTexts();
      saveConfig();
    });

    btnStartAnim.addEventListener('click', () => {
      configModal.classList.remove('open');
      startAnimation();
    });

    // Interacciones de botones en pantallas
    btnRecRestart.addEventListener('click', () => {
      switchMode('update');
      startAnimation();
    });

    btnInstCancel.addEventListener('click', () => {
      switchMode('undo');
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (progress >= 1) {
          startAnimation();
        } else {
          isPlaying = !isPlaying;
          if (isPlaying) {
            lastTime = 0;
            animationFrameId = requestAnimationFrame(tick);
          }
        }
      } else if (e.key === 'r' || e.key === 'R') {
        startAnimation();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'Escape') {
        configModal.classList.remove('open');
      }
    });

    // Inicialización
    loadSavedConfig();
    switchMode(currentMode);
    updateLanguageTexts();
    startAnimation();
