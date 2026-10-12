/**
 * URL2QR - QR Code Generator Application
 * Handles state transitions, QR rendering, and JPG downloading.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const body = document.body;
  const urlForm = document.getElementById('urlForm');
  const urlInput = document.getElementById('urlInput');
  const btnClearInput = document.getElementById('btnClearInput');
  const btnPasteInput = document.getElementById('btnPasteInput');
  const qrCanvas = document.getElementById('qrCanvas');
  const qrDownloadTrigger = document.getElementById('qrDownloadTrigger');
  const btnExplicitDownload = document.getElementById('btnExplicitDownload');
  const qrUrlDisplay = document.getElementById('qrUrlDisplay');
  const btnCopyUrl = document.getElementById('btnCopyUrl');
  const btnResetToCenter = document.getElementById('btnResetToCenter');
  const brandLogoBtn = document.getElementById('brandLogoBtn');
  const urlChips = document.getElementById('urlChips');
  const toastNotification = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  
  // Help Modal Elements
  const btnHelp = document.getElementById('btnHelp');
  const helpDialog = document.getElementById('helpDialog');
  const btnCloseHelp = document.getElementById('btnCloseHelp');
  const btnHelpConfirm = document.getElementById('btnHelpConfirm');

  // Application State
  let currentActiveUrl = '';
  let qrInstance = null;
  let toastTimer = null;

  // Initialize QRious
  function initQR() {
    if (typeof QRious === 'undefined') {
      console.error('QRious library not found.');
      return;
    }

    qrInstance = new QRious({
      element: qrCanvas,
      size: 1024,
      level: 'H', // High error correction (30%)
      background: '#FFFFFF',
      foreground: '#000000',
      padding: 36,
      value: 'https://github.com'
    });
  }

  // URL Normalization
  function normalizeUrl(rawInput) {
    let url = rawInput.trim();
    if (!url) return '';

    // If it doesn't start with a protocol (http://, https://, ftp://), prepend https://
    if (!/^[a-zA-Z]+:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }

  // Safe QR text encoder for multibyte/Korean characters
  function encodeForQR(text) {
    try {
      return unescape(encodeURIComponent(text));
    } catch (e) {
      return text;
    }
  }

  // Generate QR Code and trigger stage transition
  function generateQRCode(rawUrl) {
    const validUrl = normalizeUrl(rawUrl);
    if (!validUrl) {
      showToast('올바른 웹 주소(URL)를 입력해주세요.', 'warning');
      urlInput.focus();
      return;
    }

    currentActiveUrl = validUrl;

    if (!qrInstance) {
      initQR();
    }

    // Update QR code value
    try {
      qrInstance.set({
        value: encodeForQR(validUrl)
      });
    } catch (err) {
      console.error('QR code generation error:', err);
      showToast('QR코드 생성 중 오류가 발생했습니다.', 'error');
      return;
    }

    // Update Display URL
    qrUrlDisplay.textContent = validUrl;
    qrUrlDisplay.title = validUrl;

    // Transition state: from 'initial' (center) to 'generated' (bottom dock)
    const isFirstTime = body.getAttribute('data-state') !== 'generated';
    body.setAttribute('data-state', 'generated');

    // Trigger subtle bounce feedback on QR card if updated continuously
    const qrCard = document.getElementById('qrCard');
    if (qrCard) {
      qrCard.classList.remove('pulse-update');
      // Force reflow
      void qrCard.offsetWidth;
      qrCard.classList.add('pulse-update');
    }

    if (isFirstTime) {
      showToast('QR코드가 생성되었습니다! 클릭하여 JPG로 저장하세요.');
    } else {
      showToast('새로운 URL로 QR코드가 업데이트되었습니다.');
    }
  }

  // Download QR Code as JPG
  function downloadQRAsJPG() {
    if (!currentActiveUrl) {
      showToast('먼저 URL을 입력해 QR코드를 생성해주세요.', 'warning');
      return;
    }

    try {
      // Create high-resolution export canvas (1024x1024)
      const exportCanvas = document.createElement('canvas');
      const exportSize = 1024;
      exportCanvas.width = exportSize;
      exportCanvas.height = exportSize;
      const ctx = exportCanvas.getContext('2d');

      // CRITICAL: Fill with 100% solid white background
      // Because JPEG does not support alpha channel and converts transparent pixels to black.
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, exportSize, exportSize);

      // Draw the QR canvas onto export canvas
      ctx.drawImage(qrCanvas, 0, 0, exportSize, exportSize);

      // Convert to JPG data URL with 95% quality
      const jpgDataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);

      // Determine appropriate filename
      let filename = 'URL2QR_qrcode.jpg';
      try {
        const parsed = new URL(currentActiveUrl);
        const hostName = parsed.hostname.replace(/[^a-zA-Z0-9]/g, '_');
        const timeStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        filename = `URL2QR_${hostName}_${timeStamp}.jpg`;
      } catch (e) {
        filename = `URL2QR_${Date.now()}.jpg`;
      }

      // Create download anchor and trigger click
      const downloadLink = document.createElement('a');
      downloadLink.href = jpgDataUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast(`JPG 파일이 다운로드되었습니다! (${filename})`);
    } catch (err) {
      console.error('Download error:', err);
      showToast('다운로드 처리 중 문제가 발생했습니다.', 'error');
    }
  }

  // Reset to initial center stage
  function resetToInitial() {
    body.setAttribute('data-state', 'initial');
    urlInput.value = '';
    updateClearButton();
    urlInput.focus();
    showToast('새로운 주소를 입력해주세요.');
  }

  // Toast Notification System
  function showToast(message, type = 'success') {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toastText.textContent = message;
    toastNotification.className = `toast-box show ${type}`;

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3200);
  }

  // Update clear button visibility
  function updateClearButton() {
    if (urlInput.value.trim().length > 0) {
      btnClearInput.classList.remove('hidden');
    } else {
      btnClearInput.classList.add('hidden');
    }
  }

  // Event Listeners

  // 1. Form submit
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateQRCode(urlInput.value);
  });

  // 2. Input typing
  urlInput.addEventListener('input', () => {
    updateClearButton();
  });

  // 3. Clear button
  btnClearInput.addEventListener('click', () => {
    urlInput.value = '';
    updateClearButton();
    urlInput.focus();
  });

  // 4. Paste button
  btnPasteInput.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text;
          updateClearButton();
          urlInput.focus();
          showToast('클립보드 내용이 붙여넣기되었습니다.');
        } else {
          showToast('클립보드가 비어 있습니다.', 'warning');
        }
      } else {
        urlInput.focus();
        showToast('Ctrl + V 단축키로 붙여넣어주세요.');
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      urlInput.focus();
      showToast('Ctrl + V 단축키로 직접 붙여넣어주세요.');
    }
  });

  // 5. QR Code click (JPG Download) - Requirement 4
  qrDownloadTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    downloadQRAsJPG();
  });

  // 6. Explicit JPG Download button
  btnExplicitDownload.addEventListener('click', (e) => {
    e.preventDefault();
    downloadQRAsJPG();
  });

  // 7. Copy URL button
  btnCopyUrl.addEventListener('click', async () => {
    if (!currentActiveUrl) return;
    try {
      await navigator.clipboard.writeText(currentActiveUrl);
      showToast('웹 주소가 클립보드에 복사되었습니다!');
    } catch (err) {
      showToast('복사에 실패했습니다.', 'error');
    }
  });

  // 8. Sample Chips
  if (urlChips) {
    urlChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-item');
      if (!chip) return;
      const sampleUrl = chip.getAttribute('data-url');
      if (sampleUrl) {
        urlInput.value = sampleUrl;
        updateClearButton();
        generateQRCode(sampleUrl);
      }
    });
  }

  // 9. Reset button & Brand Logo click
  btnResetToCenter.addEventListener('click', resetToInitial);
  brandLogoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetToInitial();
  });

  // 10. Help modal
  if (btnHelp && helpDialog) {
    btnHelp.addEventListener('click', () => {
      helpDialog.showModal();
    });
    btnCloseHelp.addEventListener('click', () => {
      helpDialog.close();
    });
    btnHelpConfirm.addEventListener('click', () => {
      helpDialog.close();
    });
    // Close on backdrop click
    helpDialog.addEventListener('click', (e) => {
      if (e.target === helpDialog) {
        helpDialog.close();
      }
    });
  }

  // 11. Interactive Mouse-Responsive Gradient
  function initInteractiveGradient() {
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let isTicking = false;

    function handlePointer(x, y) {
      targetX = Math.max(0, Math.min(100, (x / window.innerWidth) * 100));
      targetY = Math.max(0, Math.min(100, (y / window.innerHeight) * 100));

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateGradient);
      }
    }

    window.addEventListener('mousemove', (e) => {
      handlePointer(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    function updateGradient() {
      // Smooth linear interpolation (lerp) for silky-smooth motion
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Dynamic angle between 110deg and 160deg
      const angle = 115 + (currentX - 50) * 0.5 + (currentY - 50) * 0.3;

      // Color Hue shifts based on mouse coordinates:
      // X axis: 30deg (warm peach amber) to 52deg (sunshine gold)
      const hue1 = 40 + ((currentX - 50) / 50) * 12;
      // Y axis: 18deg (soft coral rose) to 34deg (golden apricot)
      const hue2 = 25 + ((currentY - 50) / 50) * 14;

      const sat1 = 92 + ((currentY - 50) / 50) * 6;
      const sat2 = 88 + ((currentX - 50) / 50) * 8;

      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--mouse-x', `${currentX.toFixed(2)}%`);
      rootStyle.setProperty('--mouse-y', `${currentY.toFixed(2)}%`);
      rootStyle.setProperty('--grad-angle', `${angle.toFixed(1)}deg`);
      rootStyle.setProperty('--grad-color-1', `hsl(${hue1.toFixed(1)}, ${sat1.toFixed(1)}%, 88%)`);
      rootStyle.setProperty('--grad-color-2', `hsl(${hue2.toFixed(1)}, ${sat2.toFixed(1)}%, 91%)`);
      rootStyle.setProperty('--glow-color-1', `hsla(${hue1.toFixed(1)}, 95%, 68%, 0.32)`);
      rootStyle.setProperty('--glow-color-2', `hsla(${hue2.toFixed(1)}, 95%, 72%, 0.26)`);

      // Keep animating until close to target
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        requestAnimationFrame(updateGradient);
      } else {
        isTicking = false;
      }
    }

    // Set initial values
    updateGradient();
  }

  // Initialize features
  initQR();
  initInteractiveGradient();
  urlInput.focus();
});

