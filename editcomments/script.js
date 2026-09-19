/* ========================================================
       ESTADO Y PERSISTENCIA LOCALSTORAGE
       ======================================================== */
    const STORAGE_KEY_USER_TAG = 'yt_comment_user_tag';
    const STORAGE_KEY_USER_AVATAR = 'yt_comment_user_avatar';
    const STORAGE_KEY_CREATOR_TAG = 'yt_comment_creator_tag';
    const STORAGE_KEY_CREATOR_AVATAR = 'yt_comment_creator_avatar';
    const STORAGE_KEY_CREATOR_HEART = 'yt_comment_creator_heart_enabled';

    let userAvatarBase64 = localStorage.getItem(STORAGE_KEY_USER_AVATAR) || null;
    let creatorAvatarBase64 = localStorage.getItem(STORAGE_KEY_CREATOR_AVATAR) || null;

    // Elementos DOM del Formulario
    const inputUsername = document.getElementById('input-username');
    const btnFetchUserTag = document.getElementById('btn-fetch-user-tag');
    const inputAvatarFile = document.getElementById('input-avatar-file');
    const btnResetAvatar = document.getElementById('btn-reset-avatar');
    const avatarPreviewLetter = document.getElementById('avatar-preview-letter');
    const avatarPreviewImg = document.getElementById('avatar-preview-img');

    const checkAuthorBadge = document.getElementById('check-author-badge');
    const checkVerified = document.getElementById('check-verified');

    const inputContent = document.getElementById('input-content');
    const inputTimeNum = document.getElementById('input-time-num');
    const selectTimeUnit = document.getElementById('select-time-unit');
    const selectLang = document.getElementById('select-lang');
    const checkPinned = document.getElementById('check-pinned');
    const rowPinnedChannel = document.getElementById('row-pinned-channel');
    const inputPinnedName = document.getElementById('input-pinned-name');
    const checkEdited = document.getElementById('check-edited');

    const inputLikes = document.getElementById('input-likes');
    const checkCreatorHeart = document.getElementById('check-creator-heart');
    const rowCreatorAvatar = document.getElementById('row-creator-avatar');
    const inputCreatorTag = document.getElementById('input-creator-tag');
    const btnFetchCreatorTag = document.getElementById('btn-fetch-creator-tag');
    const creatorThumbPreview = document.getElementById('creator-thumb-preview');
    const inputCreatorFile = document.getElementById('input-creator-file');

    const checkReplies = document.getElementById('check-replies');
    const rowRepliesCount = document.getElementById('row-replies-count');
    const inputRepliesNum = document.getElementById('input-replies-num');

    const voteRadios = document.getElementsByName('vote-state');
    const themeRadios = document.getElementsByName('yt-theme');

    // Elementos DOM de Vista Previa (Coincidencia 100% con HTML)
    const ytTarget = document.getElementById('yt-comment-target');
    const ytRenderedAvatar = document.getElementById('yt-rendered-avatar');
    const ytRenderedLetter = document.getElementById('yt-rendered-letter');
    const ytRenderedImg = document.getElementById('yt-rendered-img');

    const ytPinnedBadge = document.getElementById('yt-pinned-badge');
    const ytPinnedPrefix = document.getElementById('yt-pinned-prefix');
    const ytPinnedChannelName = document.getElementById('yt-pinned-channel-name');

    const ytAuthorEl = document.getElementById('yt-author-el');
    const ytAuthorText = document.getElementById('yt-author-text');
    const ytBadgeVerifiedIcon = document.getElementById('yt-badge-verified-icon');
    const ytTimeDisplay = document.getElementById('yt-time-display');
    const ytEditedDisplay = document.getElementById('yt-edited-display');

    const ytContentDisplay = document.getElementById('yt-content-display');

    const ytBtnLike = document.getElementById('yt-btn-like');
    const ytBtnDislike = document.getElementById('yt-btn-dislike');
    const ytLikeIconSlot = document.getElementById('yt-like-icon-slot');
    const ytDislikeIconSlot = document.getElementById('yt-dislike-icon-slot');
    const ytLikesDisplay = document.getElementById('yt-likes-display');

    const ytCreatorHeartBox = document.getElementById('yt-creator-heart-box');
    const ytCreatorHeartImg = document.getElementById('yt-creator-heart-img');

    const ytRepliesBox = document.getElementById('yt-replies-box');
    const ytRepliesText = document.getElementById('yt-replies-text');
    const previewThemeIndicator = document.getElementById('preview-theme-indicator');

    const toastEl = document.getElementById('toast-msg');
    const toastText = document.getElementById('toast-text');

    function showToast(msg) {
      if (!toastEl) return;
      toastText.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2500);
    }

        /* ========================================================
       ALGORITMO PARA EXTRAER AVATAR DE YOUTUBE POR TAG
       ======================================================== */
    async function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    async function extractYouTubeAvatar(tag) {
      const clean = tag.replace(/^@+/, '').trim();
      if (!clean) throw new Error('Ingresa un tag válido (ej: @eternodev)');

      // Intento 1: Unavatar.io (API oficial rápida y con soporte CORS total)
      try {
        const unavatarUrl = `https://unavatar.io/youtube/@${encodeURIComponent(clean)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(unavatarUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 500 && blob.type.includes('image')) {
            const base64 = await blobToBase64(blob);
            return { tag: `@${clean}`, avatarUrl: unavatarUrl, base64: base64 };
          }
        }
      } catch (e) {
        console.warn('Unavatar.io fallback:', e);
      }

      // Intento 2: Invidious Instances
      const instances = [
        `https://inv.nadeko.net/api/v1/channels/@${encodeURIComponent(clean)}`,
        `https://yewtu.be/api/v1/channels/@${encodeURIComponent(clean)}`
      ];

      for (const inst of instances) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const r = await fetch(inst, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (r.ok) {
            const data = await r.json();
            if (data.authorThumbnails && data.authorThumbnails.length > 0) {
              let imgUrl = data.authorThumbnails[data.authorThumbnails.length - 1].url;
              if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
              // Download as blob
              const imgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(imgUrl)}`);
              if (imgRes.ok) {
                const blob = await imgRes.blob();
                const base64 = await blobToBase64(blob);
                return { tag: `@${clean}`, avatarUrl: imgUrl, base64: base64 };
              }
            }
          }
        } catch (e) {
          console.warn('Invidious instance error:', e);
        }
      }

      // Intento 3: allorigins scrap og:image
      try {
        const targetUrl = `https://www.youtube.com/@${encodeURIComponent(clean)}`;
        const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
        if (r.ok) {
          const data = await r.json();
          const pageHtml = data.contents || '';
          const match = pageHtml.match(/property="og:image"\s+content="([^"]+)"/) ||
                        pageHtml.match(/og:image"\s+content="([^"]+)"/) ||
                        pageHtml.match(/https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+/);
          if (match) {
            let directUrl = match[1] || match[0];
            if (directUrl.includes('=s')) {
              directUrl = directUrl.replace(/=s\d+[^"]*/, '=s800-c-k-c0x00ffffff-no-rj');
            }
            const imgRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const base64 = await blobToBase64(blob);
              return { tag: `@${clean}`, avatarUrl: directUrl, base64: base64 };
            }
          }
        }
      } catch (e) {
        console.warn('allorigins scrap error:', e);
      }

      throw new Error(`No se pudo cargar el avatar del canal @${clean}. Comprueba que el tag esté bien escrito.`);
    }

    /* Auto Fetch Usuario */
    btnFetchUserTag.addEventListener('click', async () => {
      const tag = inputUsername.value.trim();
      if (!tag) {
        showToast('Escribe un nombre de usuario');
        return;
      }

      btnFetchUserTag.classList.add('loading');
      btnFetchUserTag.querySelector('span').textContent = 'Buscando...';
      
      try {
        const data = await extractYouTubeAvatar(tag);
        userAvatarBase64 = data.base64;
        localStorage.setItem(STORAGE_KEY_USER_AVATAR, userAvatarBase64);
        localStorage.setItem(STORAGE_KEY_USER_TAG, data.tag.replace('@', ''));
        showToast(`Foto de ${data.tag} cargada`);
        updateAvatarPreviews();
        updatePreview();
      } catch (err) {
        showToast(err.message || 'No se pudo cargar la foto');
      } finally {
        btnFetchUserTag.classList.remove('loading');
        btnFetchUserTag.querySelector('span').textContent = 'Auto @';
      }
    });

    /* Auto Fetch Creador */
    btnFetchCreatorTag.addEventListener('click', async () => {
      const tag = inputCreatorTag.value.trim();
      if (!tag) {
        showToast('Escribe el tag del creador');
        return;
      }

      btnFetchCreatorTag.classList.add('loading');
      btnFetchCreatorTag.querySelector('span').textContent = 'Buscando...';

      try {
        const data = await extractYouTubeAvatar(tag);
        creatorAvatarBase64 = data.base64;
        localStorage.setItem(STORAGE_KEY_CREATOR_AVATAR, creatorAvatarBase64);
        localStorage.setItem(STORAGE_KEY_CREATOR_TAG, data.tag.replace('@', ''));
        showToast(`Avatar del Creador ${data.tag} cargado`);
        updateCreatorAvatarPreviews();
        updatePreview();
      } catch (err) {
        showToast(err.message || 'No se pudo cargar avatar del creador');
      } finally {
        btnFetchCreatorTag.classList.remove('loading');
        btnFetchCreatorTag.querySelector('span').textContent = 'Auto @';
      }
    });

    // Strip '@' if user types it into input
    inputUsername.addEventListener('input', (e) => {
      const cleaned = e.target.value.replace(/^@+/, '');
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
      localStorage.setItem(STORAGE_KEY_USER_TAG, cleaned);
      updatePreview();
    });

    inputCreatorTag.addEventListener('input', (e) => {
      const cleaned = e.target.value.replace(/^@+/, '');
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
      localStorage.setItem(STORAGE_KEY_CREATOR_TAG, cleaned);
      updatePreview();
    });

    // Enter key triggers auto-fetch
    inputUsername.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnFetchUserTag.click();
      }
    });

    inputCreatorTag.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnFetchCreatorTag.click();
      }
    });

    /* Gestión Manual de Fotos */
    inputAvatarFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          userAvatarBase64 = evt.target.result;
          localStorage.setItem(STORAGE_KEY_USER_AVATAR, userAvatarBase64);
          updateAvatarPreviews();
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });

    btnResetAvatar.addEventListener('click', () => {
      userAvatarBase64 = null;
      localStorage.removeItem(STORAGE_KEY_USER_AVATAR);
      inputAvatarFile.value = '';
      updateAvatarPreviews();
      updatePreview();
    });

    function updateAvatarPreviews() {
      if (userAvatarBase64) {
        avatarPreviewImg.src = userAvatarBase64;
        avatarPreviewImg.style.display = 'block';
        avatarPreviewLetter.style.display = 'none';
        btnResetAvatar.style.display = 'block';
      } else {
        avatarPreviewImg.src = '';
        avatarPreviewImg.style.display = 'none';
        avatarPreviewLetter.style.display = 'block';
        btnResetAvatar.style.display = 'none';
      }
    }

    inputCreatorFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          creatorAvatarBase64 = evt.target.result;
          localStorage.setItem(STORAGE_KEY_CREATOR_AVATAR, creatorAvatarBase64);
          updateCreatorAvatarPreviews();
          updatePreview();
        };
        reader.readAsDataURL(file);
      }
    });

    function updateCreatorAvatarPreviews() {
      if (creatorAvatarBase64) {
        creatorThumbPreview.src = creatorAvatarBase64;
        ytCreatorHeartImg.src = creatorAvatarBase64;
      } else {
        creatorThumbPreview.src = '/assets/png/editfun_icon.png';
        ytCreatorHeartImg.src = '/assets/png/editfun_icon.png';
      }
    }

    // Toggle Panels
    checkPinned.addEventListener('change', () => {
      rowPinnedChannel.style.display = checkPinned.checked ? 'flex' : 'none';
      updatePreview();
    });

    checkCreatorHeart.addEventListener('change', () => {
      rowCreatorAvatar.style.display = checkCreatorHeart.checked ? 'flex' : 'none';
      localStorage.setItem(STORAGE_KEY_CREATOR_HEART, checkCreatorHeart.checked ? 'true' : 'false');
      updatePreview();
    });

    checkReplies.addEventListener('change', () => {
      rowRepliesCount.style.display = checkReplies.checked ? 'flex' : 'none';
      updatePreview();
    });

    // Helpers
    function formatLikesYouTube(rawVal, lang) {
      if (!rawVal || rawVal.trim() === '') return '';
      const cleanVal = rawVal.trim().toUpperCase().replace(/,/g, '.');
      
      const numMatch = cleanVal.match(/^(\d+(?:\.\d+)?)\s*([KMB])?$/);
      if (numMatch) {
        let num = parseFloat(numMatch[1]);
        let suffix = numMatch[2] || '';

        if (!suffix) {
          if (num >= 1000000) {
            num = (num / 1000000).toFixed(1).replace(/\.0$/, '');
            suffix = 'M';
          } else if (num >= 1000) {
            num = (num / 1000).toFixed(1).replace(/\.0$/, '');
            suffix = 'K';
          } else {
            return Math.floor(num).toString();
          }
        }

        let numStr = num.toString();
        if (lang === 'es') {
          numStr = numStr.replace('.', ',');
          return `${numStr} ${suffix}`;
        } else {
          return `${numStr} ${suffix}`;
        }
      }

      return rawVal;
    }

    function formatRelativeTime(num, unit, lang) {
      const n = parseInt(num) || 1;
      const dict = {
        es: {
          seconds: [ 'segundo', 'segundos' ],
          minutes: [ 'minuto', 'minutos' ],
          hours:   [ 'hora', 'horas' ],
          days:    [ 'día', 'días' ],
          weeks:   [ 'semana', 'semanas' ],
          months:  [ 'mes', 'meses' ],
          years:   [ 'año', 'años' ]
        },
        en: {
          seconds: [ 'second', 'seconds' ],
          minutes: [ 'minute', 'minutes' ],
          hours:   [ 'hour', 'hours' ],
          days:    [ 'day', 'days' ],
          weeks:   [ 'week', 'weeks' ],
          months:  [ 'month', 'months' ],
          years:   [ 'year', 'years' ]
        }
      };

      const word = n === 1 ? dict[lang][unit][0] : dict[lang][unit][1];
      if (lang === 'es') {
        return `hace ${n} ${word}`;
      } else {
        return `${n} ${word} ago`;
      }
    }

    function formatCommentText(raw) {
      if (!raw) return '';
      let escaped = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Negritas *texto*
      escaped = escaped.replace(/\*([^\*\n]+)\*/g, '<strong>$1</strong>');
      // Timestamps 0:00 o 12:34
      escaped = escaped.replace(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g, '<a href="#" class="yt-tag-link">$1</a>');
      // @menciones
      escaped = escaped.replace(/(@[a-zA-Z0-9_.-]+)/g, '<a href="#" class="yt-tag-link">$1</a>');
      // #hashtags
      escaped = escaped.replace(/(#[a-zA-Z0-9_]+)/g, '<a href="#" class="yt-tag-link">$1</a>');

      return escaped;
    }

    
    const SVG_LIKE_FILLED = `<svg viewBox="0 0 130 130" width="15.5" height="15.5" style="fill:currentColor; stroke:currentColor; display:block;"><path d="M111 103.5C111.64 106.41 112.97 110.37 111.94 113.46C108.84 122.77 97.86 124 89.5 124C78.49 124 67 124.39 56.52 121.95C51.27 120.74 44.93 118.32 40.31 115.84C38.15 114.68 35.79 112.83 33.46 112.06C27.25 109.99 18.38 114.11 12.31 110.84C8.97 109.05 9 104.45 9 101.17C9 93.5 9 85.83 9 78.17C9 75.35 8.15 70.9 9.12 68.26C11.92 60.67 22.36 63 28.83 63C31.51 63 35.3 63.56 36.84 60.69C39.42 55.89 40.36 50.64 42.06 45.54C43.04 42.58 44.95 39.42 45.94 36.46C47.56 31.61 48.74 27.06 50.81 22.3C52.34 18.76 54.66 6.91 57.31 5.15C61.56 2.34 67.1 6.64 70.15 9.69C78.78 18.33 75.3 28.82 72.06 38.54C71.12 41.36 69.84 45.98 72.15 48.69C75.16 52.21 80.15 51 84.5 51C93.54 51 105.02 49.24 113.46 52.06C121.79 54.83 123.31 65.37 120.94 72.46C120.33 74.29 117.45 74.09 117.07 76.18C116.42 79.7 119.25 81.47 119.95 84.52C121.96 93.16 116.25 98.25 111 103.5Z" fill-rule="evenodd" stroke-width="0.25" stroke-linejoin="round"/></svg>`;

    const SVG_LIKE_OUTLINE = `<svg viewBox="0 0 121 127" width="15.5" height="15.5" style="fill:currentColor; stroke:currentColor; display:block;"><path fill-rule="evenodd" clip-rule="evenodd" d="M49.2281 1.50511C51.8581 0.535112 53.1939 -0.068546 55.5039 0.181454C68.7539 1.60145 79.8739 12.9215 77.9939 27.3715C77.6539 29.9615 73.0439 44.3515 74.1639 45.8915C75.0839 47.1715 82.5339 46.2015 84.1739 46.2015C92.7839 46.2015 102.334 45.4015 109.694 49.3615C116.854 53.2115 121.764 64.9215 119.954 72.6815C119.174 76.0715 117.094 78.6415 116.064 81.7415C114.854 85.3715 117.164 89.9915 115.944 93.6615C114.684 97.4515 111.984 100.101 110.164 103.511C109.054 105.581 109.654 107.851 108.884 109.941C106.604 116.121 101.194 121.701 94.7439 124.081C82.3139 128.661 50.4339 124.111 38.5439 120.141C33.8539 118.581 29.9539 114.771 25.0939 113.321C18.9239 111.491 7.39391 116.291 3.15392 109.891C0.213915 105.451 -0.796084 73.3015 1.06392 67.7415C5.97392 53.0215 17.0439 63.1215 23.3039 59.0115C25.1439 57.8015 26.8339 53.8215 27.8439 51.8915C29.1039 49.5015 29.2039 46.3015 30.0639 43.7415C33.5339 33.3215 36.7639 21.5315 41.8439 11.8915C43.9739 7.85145 44.7281 5.00511 49.2281 1.50511ZM55.5439 11.2815C53.7281 12.5051 54.2281 11.8915 52.7281 14.0051C46.7281 21.5051 42.1939 50.6415 37.8439 58.8915C35.6439 63.0715 31.7439 68.8515 26.4839 70.1515C22.7039 71.0915 13.3639 70.9415 13.0639 71.7415C12.5539 73.0815 12.8739 100.501 13.1639 100.891C13.5239 101.381 26.7339 101.321 28.6939 102.361C44.6639 110.781 55.9639 113.201 75.1739 113.201C79.5239 113.201 87.3239 114.731 91.3039 113.011C100.414 109.061 95.0839 105.341 98.1639 99.5115C99.9839 96.0615 104.244 94.4615 104.994 90.3615C105.684 86.5615 102.744 82.9315 103.104 79.7215C103.534 75.9615 115.524 66.7215 103.694 60.3615C92.7239 54.4615 72.4639 65.4315 64.1539 52.8915C59.4139 45.7215 66.3439 29.1615 66.0039 20.3715C65.8639 16.8615 59.2639 10.4115 55.5439 11.2815Z" stroke-width="0.25" stroke-linejoin="round"/></svg>`;

    const SVG_DISLIKE_FILLED = `<svg viewBox="0 0 130 130" width="15.5" height="15.5" style="fill:currentColor; stroke:currentColor; display:block;"><path d="M32.26 7.12C36.11 5.72 42.72 7 46.83 7C58.22 7 70.1 7.6 80.46 11.06C86.13 12.95 91 17.1 96.54 18.94C103.33 21.21 114.63 15.28 119.63 21.89C121.55 24.43 121 28.79 121 31.83C121 37.25 122.24 58.04 120.88 61.74C117.05 72.12 103.18 63.95 95.7 67.19C93.29 68.24 92.21 71.31 91.16 73.31C89.9 75.7 89.8 78.9 88.94 81.46C87.64 85.38 85.4 89.52 84.06 93.54C81.89 100.06 80.45 107.06 77.16 113.31C75.03 117.35 76.08 123.91 70.74 125.88C68.34 126.76 65.61 124.19 63.69 123.16C52.09 116.92 52.56 101.71 57.84 91.69C58.83 89.81 59.98 84.47 58.84 82.31C56.42 77.71 50.5 79 46.17 79C36.5 79 22.7 81.35 14.31 76.84C9.35 74.18 5.6 65.16 8.16 60.31C9.13 58.46 12.88 55.98 13 54.17C13.32 49.24 8.73 45.89 10.01 38.84C10.94 33.74 16.69 31.79 18.84 27.69C19.27 26.87 17.62 20 18.01 17.84C19.21 11.29 27.21 8.96 32.26 7.12Z" fill-rule="evenodd" stroke-width="0.25" stroke-linejoin="round"/></svg>`;

    const SVG_DISLIKE_OUTLINE = `<svg viewBox="0 0 120 126" width="15.5" height="15.5" style="fill:currentColor; stroke:currentColor; display:block;"><path fill-rule="evenodd" clip-rule="evenodd" d="M46.5614 79.375C36.4014 75.725 22.4614 82.105 11.0414 75.965C3.77135 72.055 -1.85865 59.615 0.791352 51.665C1.71135 48.895 3.75135 46.345 4.67135 43.585C5.87135 39.985 3.56135 35.355 4.79135 31.665C6.05135 27.885 8.68135 25.355 10.5714 21.815C12.7614 17.705 12.1914 13.145 15.0414 9.275C21.5814 0.384999 32.1114 0.125 42.2313 0.125C55.8913 0.125 68.9314 1.095 81.1914 5.185C85.7414 6.705 89.9314 9.985 94.4314 11.935C100.601 14.605 112.071 8.645 116.581 15.435C121.071 22.225 118.731 41.335 118.731 49.955C118.731 53.605 119.221 58.685 117.571 61.815C112.701 71.055 97.0914 63.485 93.8914 69.435C91.3114 74.235 90.3714 79.485 88.6714 84.585C85.3614 94.525 81.1014 103.725 77.7914 113.665C76.6714 117.035 76.4314 118.455 74.7314 121.625C72.6314 125.535 67.8114 125.315 64.9014 125.125C54.1914 124.435 45.2213 116.125 42.7813 105.605C40.6413 96.395 48.1314 87.995 46.5614 79.375ZM106.721 24.295C101.661 23.565 96.0714 24.665 91.2714 23.065C86.3714 21.435 82.0414 17.975 77.1914 16.185C67.0214 12.435 57.5613 12.125 46.2313 12.125C39.9613 12.125 27.5514 9.625 23.8914 16.435C22.2914 19.415 23.7114 22.475 22.6714 25.585C20.7514 31.365 10.4114 33.785 17.7314 45.625C11.8714 51.485 9.04135 63.655 19.2714 67.065C30.0514 70.655 49.0913 61.065 56.5813 72.435C64.6013 84.625 41.9714 108.645 65.2314 114.125C68.2314 105.605 67.2514 107.545 68.8914 104.435C74.0014 94.745 77.2214 82.935 80.6714 72.585C82.3714 67.495 83.9114 60.655 89.0414 57.275C94.6914 53.565 100.661 55.635 106.721 53.875C106.721 44.015 106.721 34.155 106.721 24.295Z" stroke-width="0.25" stroke-linejoin="round"/></svg>`;

    /* ========================================================
       ACTUALIZACIÓN EN TIEMPO REAL
       ======================================================== */
    function updatePreview() {
      // 1. Tema y Formato (Estándar / Corto)
      let currentTheme = 'dark';
      for (const r of themeRadios) {
        if (r.checked) currentTheme = r.value;
      }

      let currentLength = 'normal';
      const lengthRadios = document.getElementsByName('yt-length');
      for (const r of lengthRadios) {
        if (r.checked) currentLength = r.value;
      }

      ytTarget.className = `yt-comment-container yt-${currentTheme} width-${currentLength}`;
      previewThemeIndicator.textContent = currentTheme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';

      // 2. Usuario & Avatar
      const cleanUser = inputUsername.value.trim().replace(/^@+/, '') || 'usuario';
      ytAuthorText.textContent = `@${cleanUser}`;
      avatarPreviewLetter.textContent = cleanUser.charAt(0).toUpperCase();

      if (userAvatarBase64) {
        ytRenderedImg.src = userAvatarBase64;
        ytRenderedImg.style.display = 'block';
        ytRenderedLetter.style.display = 'none';
        ytRenderedAvatar.classList.add('has-image');
      } else {
        ytRenderedImg.src = '';
        ytRenderedImg.style.display = 'none';
        ytRenderedLetter.textContent = cleanUser.charAt(0).toUpperCase();
        ytRenderedLetter.style.display = 'block';
        ytRenderedAvatar.classList.remove('has-image');
      }

      // 3. Badges
      if (checkAuthorBadge.checked) {
        ytAuthorEl.classList.add('is-channel-owner');
      } else {
        ytAuthorEl.classList.remove('is-channel-owner');
      }

      ytBadgeVerifiedIcon.style.display = checkVerified.checked ? 'inline-block' : 'none';

      // 4. Tiempo
      const lang = selectLang.value;
      ytTimeDisplay.textContent = formatRelativeTime(inputTimeNum.value, selectTimeUnit.value, lang);

      // 5. Editado
      if (checkEdited.checked) {
        ytEditedDisplay.textContent = lang === 'es' ? ' (editado)' : ' (edited)';
        ytEditedDisplay.style.display = 'inline';
      } else {
        ytEditedDisplay.style.display = 'none';
      }

      // 6. Fijado
      if (checkPinned.checked) {
        ytPinnedBadge.style.display = 'flex';
        const pinnedChannel = inputPinnedName.value.trim() || 'EternoDev';
        ytPinnedPrefix.textContent = lang === 'es' ? 'Fijado por ' : 'Pinned by ';
        ytPinnedChannelName.textContent = pinnedChannel;
      } else {
        ytPinnedBadge.style.display = 'none';
      }

      // 7. Texto
      ytContentDisplay.innerHTML = formatCommentText(inputContent.value);

      // 8. Likes
      const formattedLikes = formatLikesYouTube(inputLikes.value, lang);
      ytLikesDisplay.textContent = formattedLikes;
      ytLikesDisplay.style.display = formattedLikes ? 'inline' : 'none';

      // 9. Votos (SVGs provistos por el usuario)
      let voteState = 'neutral';
      for (const r of voteRadios) {
        if (r.checked) voteState = r.value;
      }

      ytBtnLike.className = `yt-action-btn ${voteState === 'liked' ? 'active' : 'neutral'}`;
      ytBtnDislike.className = `yt-action-btn ${voteState === 'disliked' ? 'active' : 'neutral'}`;

      if (voteState === 'liked') {
        ytLikeIconSlot.innerHTML = SVG_LIKE_FILLED;
      } else {
        ytLikeIconSlot.innerHTML = SVG_LIKE_OUTLINE;
      }

      if (voteState === 'disliked') {
        ytDislikeIconSlot.innerHTML = SVG_DISLIKE_FILLED;
      } else {
        ytDislikeIconSlot.innerHTML = SVG_DISLIKE_OUTLINE;
      }

      // 10. Corazón del Creador
      if (checkCreatorHeart.checked) {
        ytCreatorHeartBox.style.display = 'inline-flex';
        ytCreatorHeartImg.src = creatorAvatarBase64 || '/assets/png/editfun_icon.png';
      } else {
        ytCreatorHeartBox.style.display = 'none';
      }

      // 11. Respuestas
      if (checkReplies.checked) {
        ytRepliesBox.style.display = 'flex';
        const numRep = parseInt(inputRepliesNum.value) || 1;
        if (lang === 'es') {
          ytRepliesText.textContent = numRep === 1 ? '1 respuesta' : `${numRep} respuestas`;
        } else {
          ytRepliesText.textContent = numRep === 1 ? '1 reply' : `${numRep} replies`;
        }
      } else {
        ytRepliesBox.style.display = 'none';
      }
    }

    /* Listeners de Entrada */
    const allInputs = [
      inputContent, inputTimeNum, selectTimeUnit, selectLang,
      checkPinned, inputPinnedName, checkEdited, inputLikes,
      checkAuthorBadge, checkVerified, checkReplies, inputRepliesNum
    ];

    allInputs.forEach(el => {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    });

    for (const r of voteRadios) r.addEventListener('change', updatePreview);
    for (const r of themeRadios) r.addEventListener('change', updatePreview);
    const lengthRadios = document.getElementsByName('yt-length');
    for (const r of lengthRadios) r.addEventListener('change', updatePreview);

    // Restaurar desde LocalStorage al inicio
    const savedUserTag = localStorage.getItem(STORAGE_KEY_USER_TAG);
    if (savedUserTag) inputUsername.value = savedUserTag;

    const savedCreatorTag = localStorage.getItem(STORAGE_KEY_CREATOR_TAG);
    if (savedCreatorTag) inputCreatorTag.value = savedCreatorTag;

    const savedCreatorHeart = localStorage.getItem(STORAGE_KEY_CREATOR_HEART);
    if (savedCreatorHeart === 'true') {
      checkCreatorHeart.checked = true;
      rowCreatorAvatar.style.display = 'flex';
    }

    updateAvatarPreviews();
    updateCreatorAvatarPreviews();
    updatePreview();

    /* ========================================================
       EXPORT ENGINE (PNG, JPG, WEBP, SVG, CLIPBOARD)
       ======================================================== */
    async function captureCanvas(type = 'png') {
      const target = document.getElementById('yt-comment-target');
      const selectResolution = document.getElementById('select-resolution');
      const scaleFactor = selectResolution ? parseInt(selectResolution.value) || 3 : 3;
      
      const isDark = target.classList.contains('yt-dark');
      const bgColor = isDark ? '#0f0f0f' : '#ffffff';

      const canvas = await html2canvas(target, {
        scale: scaleFactor,
        useCORS: true,
        allowTaint: true,
        backgroundColor: (type === 'jpg') ? bgColor : null,
        logging: false
      });

      if (type === 'png') {
        const roundedCanvas = document.createElement('canvas');
        roundedCanvas.width = canvas.width;
        roundedCanvas.height = canvas.height;
        const ctx = roundedCanvas.getContext('2d');
        const radius = 14 * scaleFactor;

        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(canvas, 0, 0);
        return roundedCanvas;
      }

      return canvas;
    }

    function downloadDataUrl(dataUrl, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 1. PNG HD
    document.getElementById('btn-dl-png').addEventListener('click', async () => {
      try {
        showToast('Generando PNG HD...');
        const canvas = await captureCanvas('png');
        downloadDataUrl(canvas.toDataURL('image/png'), 'youtube-comment.png');
        showToast('PNG descargado correctamente');
      } catch (err) {
        console.error(err);
        showToast('Error en la exportación');
      }
    });

    // 2. JPG
    document.getElementById('btn-dl-jpg').addEventListener('click', async () => {
      try {
        showToast('Generando JPG...');
        const canvas = await captureCanvas('jpg');
        downloadDataUrl(canvas.toDataURL('image/jpeg', 0.95), 'youtube-comment.jpg');
        showToast('JPG descargado correctamente');
      } catch (err) {
        console.error(err);
        showToast('Error en la exportación');
      }
    });

    // 3. WEBP
    document.getElementById('btn-dl-webp').addEventListener('click', async () => {
      try {
        showToast('Generando WEBP...');
        const canvas = await captureCanvas('webp');
        downloadDataUrl(canvas.toDataURL('image/webp', 0.95), 'youtube-comment.webp');
        showToast('WEBP descargado correctamente');
      } catch (err) {
        console.error(err);
        showToast('Error en la exportación');
      }
    });

    // 4. Copiar al Portapapeles
    document.getElementById('btn-copy-clipboard').addEventListener('click', async () => {
      try {
        showToast('Copiando al portapapeles...');
        const canvas = await captureCanvas('png');
        canvas.toBlob(async (blob) => {
          if (!blob) {
            showToast('Error al generar imagen');
            return;
          }
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            showToast('Copiado al portapapeles con éxito');
          } catch (clipErr) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            showToast('Copiado al portapapeles');
          }
        }, 'image/png');
      } catch (err) {
        console.error(err);
        showToast('Error al copiar al portapapeles');
      }
    });

        // 5. SVG Vectorial
    document.getElementById('btn-dl-svg').addEventListener('click', async () => {
      try {
        showToast('Generando SVG vectorial...');
        const target = document.getElementById('yt-comment-target');
        const rect = target.getBoundingClientRect();
        const clone = target.cloneNode(true);

        const isDark = target.classList.contains('yt-dark');
        const iconColor = isDark ? '#f1f1f1' : '#0f0f0f';
        const mutedColor = isDark ? '#aaaaaa' : '#606060';
        const linkColor = isDark ? '#3ea6ff' : '#065fd4';

        // Set explicit inline fill and stroke on cloned action button SVGs so vector editors render them perfectly
        const actionSvgs = clone.querySelectorAll('.yt-action-btn svg, .yt-pinned-row svg');
        actionSvgs.forEach(svg => {
          svg.setAttribute('fill', iconColor);
          svg.setAttribute('stroke', iconColor);
          svg.style.fill = iconColor;
          svg.style.stroke = iconColor;
          svg.style.color = iconColor;
          const paths = svg.querySelectorAll('path');
          paths.forEach(p => {
            p.setAttribute('fill', iconColor);
            p.style.fill = iconColor;
          });
        });

        // Ensure reply button in clone is cleanly styled
        const replyBtn = clone.querySelector('.yt-reply-btn');
        if (replyBtn) {
          replyBtn.style.background = 'transparent';
          replyBtn.style.border = 'none';
          replyBtn.style.outline = 'none';
          replyBtn.style.color = iconColor;
          replyBtn.style.padding = '0';
          replyBtn.style.margin = '0';
          replyBtn.style.fontSize = '12px';
          replyBtn.style.fontWeight = '600';
          replyBtn.style.fontFamily = "'Roboto', Arial, sans-serif";
        }

        const serializedClone = new XMLSerializer().serializeToString(clone);

        const svgData = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(rect.width)}" height="${Math.ceil(rect.height)}" viewBox="0 0 ${Math.ceil(rect.width)} ${Math.ceil(rect.height)}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style><![CDATA[
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; }
        .yt-comment-container { border-radius: 14px; padding: 16px 20px; width: 100%; display: flex; align-items: flex-start; gap: 16px; line-height: 1.4; }
        .yt-dark { background-color: #0f0f0f; color: #f1f1f1; }
        .yt-light { background-color: #ffffff; color: #0f0f0f; }
        .yt-avatar-box { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #009688; display: flex; align-items: center; justify-content: center; border: none; }
        .yt-avatar-box.has-image { background: transparent !important; }
        .yt-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; border: none; }
        .yt-avatar-letter { font-size: 18px; font-weight: 500; color: #ffffff; }
        .yt-body-wrap { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .yt-pinned-row { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; margin-bottom: 2px; }
        .yt-dark .yt-pinned-row { color: #aaaaaa; }
        .yt-light .yt-pinned-row { color: #606060; }
        .yt-pinned-row svg { width: 17px; height: 17px; fill: currentColor; }
        .yt-header-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; line-height: 18px; }
        .yt-author-name { font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
        .yt-dark .yt-author-name { color: #f1f1f1; }
        .yt-light .yt-author-name { color: #0f0f0f; }
        .yt-author-name.is-channel-owner { background: #606060; color: #ffffff !important; border-radius: 12px; padding: 0 8px; line-height: 18px; font-size: 12px; }
        .yt-dark .yt-author-name.is-channel-owner { background: #888888; color: #0f0f0f !important; }
        .yt-verified-icon { width: 13px; height: 13px; vertical-align: middle; fill: #aaaaaa; }
        .yt-time-ago { font-size: 12px; font-weight: 400; color: #aaaaaa; }
        .yt-light .yt-time-ago { color: #606060; }
        .yt-edited-mark { font-size: 12px; font-weight: 400; color: #aaaaaa; }
        .yt-light .yt-edited-mark { color: #606060; }
        .yt-comment-text { font-size: 14px; line-height: 20px; font-weight: 400; word-break: break-word; white-space: pre-line; margin-top: 2px; margin-bottom: 3px; }
        .yt-comment-text strong { font-weight: 600; }
        .yt-dark .yt-comment-text .yt-tag-link { color: #3ea6ff; text-decoration: none; }
        .yt-light .yt-comment-text .yt-tag-link { color: #065fd4; text-decoration: none; }
        .yt-actions-row { display: flex; align-items: center; gap: 12px; margin-top: 5px; height: 30px; }
        .yt-action-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important; outline: none !important; }
        .yt-dark .yt-action-btn, .yt-dark .yt-action-btn svg { color: #f1f1f1; fill: #f1f1f1; stroke: #f1f1f1; }
        .yt-light .yt-action-btn, .yt-light .yt-action-btn svg { color: #0f0f0f; fill: #0f0f0f; stroke: #0f0f0f; }
        .yt-action-btn svg { width: 15.5px; height: 15.5px; display: block; }
        .yt-likes-count { font-size: 12px; font-weight: 400; }
        .yt-dark .yt-likes-count { color: #aaaaaa; }
        .yt-light .yt-likes-count { color: #606060; }
        .yt-creator-heart-wrap { display: inline-flex; align-items: center; position: relative; width: 29px; height: 29px; vertical-align: middle; margin-left: 3px; }
        .yt-creator-heart-avatar { width: 27px; height: 27px; border-radius: 50%; object-fit: cover; display: block; border: none; background: transparent; }
        .yt-creator-heart-icon-badge { position: absolute; right: -2px; bottom: -2px; width: 14.5px; height: 14.5px; display: flex; align-items: center; justify-content: center; }
        .yt-reply-btn { background: transparent !important; border: none !important; outline: none !important; padding: 0 !important; margin: 0 !important; font-size: 12px !important; font-weight: 600 !important; font-family: inherit !important; cursor: default; }
        .yt-dark .yt-reply-btn { color: #f1f1f1 !important; }
        .yt-light .yt-reply-btn { color: #0f0f0f !important; }
        .yt-replies-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 12px; font-weight: 500; }
        .yt-dark .yt-replies-row { color: #3ea6ff; fill: #3ea6ff; }
        .yt-light .yt-replies-row { color: #065fd4; fill: #065fd4; }
      ]]></style>
      ${serializedClone}
    </div>
  </foreignObject>
</svg>`;

        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        downloadDataUrl(url, 'youtube-comment.svg');
        URL.revokeObjectURL(url);
        showToast('SVG descargado correctamente');
      } catch (err) {
        console.error(err);
        showToast('Error en la exportación SVG');
      }
    });
