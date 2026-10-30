// ui.js (classic script — works on both file:// and https://)
// Obfusca · ui.js
// Theme switching, language application, privacy prompt, tabs, sliders, toggles, and file drag-and-drop.




function isEffectiveDark() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return true;
  if (attr === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncThemeIcon() {
  if (els.themeIcon) {
    els.themeIcon.textContent = isEffectiveDark() ? 'light_mode' : 'dark_mode';
  }
}

function switchTab(tabName) {
  const btn = document.querySelector(`.tab[data-tab="${tabName}"]`);
  if (btn) btn.click();
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  if (els.langBtn) els.langBtn.textContent = state.lang.toUpperCase();

  $('i18nTagline').textContent = t('tagline');
  $('i18nPrevTestLbl').textContent = t('prevTest');
  $('i18nNextTestLbl').textContent = t('nextTest');
  $('i18nModeBatch').textContent = t('modeBatch');
  $('i18nModeSingle').textContent = t('modeSingle');
  $('i18nEmptyTitle').textContent = t('emptyTitle');
  $('i18nEmptyDesc').textContent = t('emptyDesc');
  $('i18nBtnUploadEmpty').textContent = t('btnUploadEmpty');
  $('i18nBtnSampleEmpty').textContent = t('btnSampleEmpty');
  $('i18nCurrPageLabel').textContent = t('currPageLabel');
  $('i18nQRoleFirst').textContent = t('qRoleFirst');
  $('i18nQRoleSub').textContent = t('qRoleSub');
  $('i18nQRoleSkip').textContent = t('qRoleSkip');
  if ($('i18nQAssignLbl')) $('i18nQAssignLbl').textContent = t('qAssignLbl');
  $('i18nBtnAddExtra').textContent = t('btnAddExtra');
  $('i18nBtnClearExtra').textContent = t('btnClearExtra');

  $('i18nTabSetup').textContent = t('tabSetup');
  $('i18nTabSecond').textContent = t('tabSecond');
  $('i18nTabPages').textContent = t('tabPages');
  $('i18nTabExport').textContent = t('tabExport');

  $('i18nSec2Title').textContent = t('sec2Title');
  $('i18nPptTitle').textContent = t('pptTitle');
  $('i18nPptNote').innerHTML = t('pptNote');
  $('i18nCodeFormatLabel').textContent = t('codeFormatLabel');
  $('i18nCodeProg').textContent = t('codeProg');
  $('i18nCodeRand').textContent = t('codeRand');
  $('i18nPrefixLabel').textContent = t('prefixLabel');
  $('i18nTgPrintCodeTitle').textContent = t('tgPrintCodeTitle');
  $('i18nTgPrintCodeSub').textContent = t('tgPrintCodeSub');
  $('i18nTgShuffleTitle').textContent = t('tgShuffleTitle');
  $('i18nTgShuffleSub').textContent = t('tgShuffleSub');
  if ($('i18nTgRegroupTitle')) $('i18nTgRegroupTitle').textContent = t('tgRegroupTitle');
  if ($('i18nTgRegroupSub')) $('i18nTgRegroupSub').textContent = t('tgRegroupSub');
  $('i18nSec3Title').textContent = t('sec3Title');
  $('i18nSecMethodLabel').textContent = t('secMethodLabel');
  $('i18nSecRaster').textContent = t('secRaster');
  $('i18nSecOverlay').textContent = t('secOverlay');
  els.securityNote.innerHTML = state.securityMode === 'rasterize' ? t('secNoteRaster') : t('secNoteOverlay');
  $('i18nDpiTitle').textContent = t('dpiTitle');
  $('i18nDpiLow').textContent = t('dpiLow');
  $('i18nDpiStd').textContent = t('dpiStd');
  $('i18nDpiHigh').textContent = t('dpiHigh');
  $('i18nSec4Title').textContent = t('sec4Title');
  $('i18nBtnProcess').textContent = t('btnProcess');

  $('i18nSecndTitle').textContent = t('secndTitle');
  $('i18nSecndDesc').textContent = t('secndDesc');
  $('i18nStampModeLabel').textContent = t('stampModeLabel');
  $('i18nStampNone').textContent = t('stampNone');
  $('i18nStampMin').textContent = t('stampMin');
  $('i18nStampBox').textContent = t('stampBox');
  $('i18nStampScaleTitle').textContent = t('stampScaleTitle');
  $('i18nStampPosLabel').textContent = t('stampPosLabel');
  $('i18nPosTR').textContent = t('posTR');
  $('i18nPosTL').textContent = t('posTL');
  $('i18nPosTC').textContent = t('posTC');
  $('i18nPosBR').textContent = t('posBR');
  $('i18nPosBL').textContent = t('posBL');
  $('i18nStampDragNote').innerHTML = t('stampDragNote');
  $('i18nTgStampBgTitle').textContent = t('tgStampBgTitle');
  $('i18nTgStampBgSub').textContent = t('tgStampBgSub');
  $('i18nTgStampPgTitle').textContent = t('tgStampPgTitle');
  $('i18nTgStampPgSub').textContent = t('tgStampPgSub');
  $('i18nAiTipTitle').textContent = t('aiTipTitle');
  $('i18nAiTipBody').innerHTML = t('aiTipBody');

  $('i18nSingleTabTitle').textContent = t('singleTabTitle');
  $('i18nSingleTabDesc').textContent = t('singleTabDesc');
  $('i18nTgIndepTitle').textContent = t('tgIndepTitle');
  $('i18nTgIndepSub').textContent = t('tgIndepSub');
  $('i18nBtnAllSingle').textContent = t('btnAllSingle');
  $('i18nBtnResetBatch').textContent = t('btnResetBatch');
  $('i18nPageMapTitle').textContent = t('pageMapTitle');
  $('i18nPageMapDesc').textContent = t('pageMapDesc');
  if (!state.totalPages && $('i18nPageMapEmpty')) {
    $('i18nPageMapEmpty').textContent = t('pageMapEmpty');
  }

  $('i18nResEmptyTitle').textContent = t('resEmptyTitle');
  $('i18nResEmptyDesc').innerHTML = t('resEmptyDesc');
  $('i18nResReadyTitle').textContent = t('resReadyTitle');
  $('i18nBtnDlSingles').textContent = t('btnDlSingles');
  $('i18nBtnDlCsv').textContent = t('btnDlCsv');
  $('i18nLegendTableTitle').textContent = t('legendTableTitle');
  $('i18nLegendTableDesc').textContent = t('legendTableDesc');
  $('i18nThCode').textContent = t('thCode');
  $('i18nThCrop').textContent = t('thCrop');
  $('i18nThGrade').textContent = t('thGrade');

  $('i18nHelpTitle').textContent = t('helpTitle');
  $('i18nHelpP1').innerHTML = t('helpP1');
  $('i18nHelpH2').textContent = t('helpH2');
  $('i18nHelpUl1').innerHTML = t('helpUl1');
  $('i18nHelpH3').textContent = t('helpH3');
  $('i18nHelpUl2').innerHTML = t('helpUl2');
  $('i18nHelpH4').textContent = t('helpH4');
  $('i18nHelpKeys').innerHTML = t('helpKeys');
  els.helpCloseBtn.textContent = t('helpClose');

  if (els.privacyPromptText) els.privacyPromptText.innerHTML = t('privacyPromptText');
  if (els.privacyPromptClose) els.privacyPromptClose.textContent = t('privacyPromptOk');

  updateUIState();
  drawSelectionOverlay();
  updateCropPreview();
}

function bindSeg(segEl, callback) {
  if (!segEl) return;
  segEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      segEl.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
      callback(btn.dataset.v);
    });
  });
}

function bindToggle(tgEl, callback) {
  if (!tgEl) return;
  tgEl.addEventListener('click', () => {
    const next = tgEl.getAttribute('aria-pressed') !== 'true';
    tgEl.setAttribute('aria-pressed', String(next));
    callback(next);
  });
}

function setCurrentPageRole(role) {
  if (!state.pdfDoc) return;
  const cfg = getCurrentPageConfig();
  cfg.role = role;
  if (role === 'first') {
    cfg.assignedTest = null;
  }
  updateUIState();
  drawSelectionOverlay();
  updateCropPreview();
}

function dismissPrivacyPrompt(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  if (els.privacyPrompt) {
    els.privacyPrompt.hidden = true;
    els.privacyPrompt.style.display = 'none';
    els.privacyPrompt.remove();
  }
  try {
    localStorage.setItem('obfusca_privacy_ack', '1');
  } catch (_) {}
}

function initUI() {
  // Restore saved theme & language from localStorage (fallback to system theme)
  try {
    const savedTheme = localStorage.getItem('obfusca_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedLang = localStorage.getItem('obfusca_lang');
    if (savedLang === 'it' || savedLang === 'en') {
      state.lang = savedLang;
    }
  } catch (_) {}

  syncThemeIcon();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeIcon);
  }
  if (els.themeBtn) {
    els.themeBtn.addEventListener('click', () => {
      const nextTheme = isEffectiveDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('obfusca_theme', nextTheme);
      } catch (_) {}
      syncThemeIcon();
    });
  }

  // First-launch privacy prompt
  try {
    if (localStorage.getItem('obfusca_privacy_ack') === '1' && els.privacyPrompt) {
      els.privacyPrompt.hidden = true;
      els.privacyPrompt.style.display = 'none';
    }
  } catch (_) {}

  if (els.privacyPromptClose) {
    els.privacyPromptClose.addEventListener('click', dismissPrivacyPrompt);
  }

  // Language switch
  if (els.langBtn) {
    els.langBtn.addEventListener('click', () => {
      state.lang = state.lang === 'it' ? 'en' : 'it';
      try {
        localStorage.setItem('obfusca_lang', state.lang);
      } catch (_) {}
      applyLanguage();
    });
  }

  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b === btn));
      ['setup', 'second', 'single', 'results'].forEach(id => {
        $('pane-' + id).hidden = (id !== target);
      });
    });
  });

  // Help dialog (both desktop and mobile button)
  const openHelp = () => els.helpDialog.showModal();
  if (els.helpBtn) els.helpBtn.addEventListener('click', openHelp);
  if (els.helpBtnMob) els.helpBtnMob.addEventListener('click', openHelp);
  if (els.helpCloseBtn) els.helpCloseBtn.addEventListener('click', () => els.helpDialog.close());

  // Segmented controls & toggles
  bindSeg(els.workModeSeg, (val) => {
    state.workMode = val;
    if (val === 'single') {
      switchTab('single');
      showToast(t('toastSingleMode'));
    } else {
      syncBatchRoles();
      updateUIState();
      drawSelectionOverlay();
      showToast(t('toastBatchMode'));
    }
  });

  bindSeg(els.zoomSeg, (val) => {
    state.scale = parseFloat(val);
    renderCurrentPage();
  });

  bindSeg(els.codeTypeSeg, (val) => {
    state.codeType = val;
    updateUIState();
  });

  els.codePrefix.addEventListener('input', () => {
    state.codePrefix = els.codePrefix.value;
    updateUIState();
    drawSelectionOverlay();
  });

  els.pagesPerTest.addEventListener('input', () => {
    state.pagesPerTest = parseInt(els.pagesPerTest.value, 10) || 1;
    syncBatchRoles();
    updateUIState();
    drawSelectionOverlay();
    updateCropPreview();
  });

  bindToggle(els.tgPrintCodeOnFirst, (val) => {
    state.printCodeOnFirst = val;
    drawSelectionOverlay();
  });

  bindToggle(els.tgShuffleTests, (val) => {
    state.shuffleTests = val;
  });

  bindToggle(els.tgRegroupPages, (val) => {
    state.regroupPages = val;
  });

  bindSeg(els.securityModeSeg, (val) => {
    state.securityMode = val;
    els.securityNote.innerHTML = val === 'rasterize' ? t('secNoteRaster') : t('secNoteOverlay');
  });

  bindSeg(els.dpiSeg, (val) => {
    state.renderScale = parseFloat(val);
    const labels = { '1.5': '1.5× (~110 DPI)', '2.0': '2.0× (~150 DPI)', '2.6': '2.6× (~200 DPI AI)' };
    els.dpiLabel.textContent = labels[val] || `${val}×`;
  });

  // Second-page stamp controls
  bindSeg(els.secondStampModeSeg, (val) => {
    state.secondPageStamp.mode = val;
    els.secondStampControls.style.opacity = val === 'none' ? '0.4' : '1';
    els.secondStampControls.style.pointerEvents = val === 'none' ? 'none' : 'auto';
    updateUIState();
    drawSelectionOverlay();
  });

  els.stampScaleR.addEventListener('input', () => {
    state.secondPageStamp.scale = parseFloat(els.stampScaleR.value);
    els.stampScaleL.textContent = `${Math.round(state.secondPageStamp.scale * 100)}%`;
    drawSelectionOverlay();
  });

  bindSeg(els.stampPresetSeg, (pos) => {
    const st = state.secondPageStamp;
    const effW = st.w * st.scale;
    const effH = st.h * st.scale;
    if (pos === 'tr') { st.x = 0.96 - effW; st.y = 0.018; }
    else if (pos === 'tl') { st.x = 0.04; st.y = 0.018; }
    else if (pos === 'tc') { st.x = 0.5 - effW / 2; st.y = 0.018; }
    else if (pos === 'br') { st.x = 0.96 - effW; st.y = 0.965 - effH; }
    else if (pos === 'bl') { st.x = 0.04; st.y = 0.965 - effH; }
    drawSelectionOverlay();
  });

  bindToggle(els.tgStampBg, (val) => {
    state.secondPageStamp.opaqueBg = val;
    drawSelectionOverlay();
  });

  bindToggle(els.tgStampPageNum, (val) => {
    state.secondPageStamp.showPageNum = val;
    drawSelectionOverlay();
  });

  // Quick bar & Single-page controls
  els.qRoleFirst.addEventListener('click', () => setCurrentPageRole('first'));
  els.qRoleSub.addEventListener('click', () => setCurrentPageRole('subsequent'));
  els.qRoleSkip.addEventListener('click', () => setCurrentPageRole('skip'));

  if (els.qTestAssign) {
    els.qTestAssign.addEventListener('change', (e) => {
      if (!state.pdfDoc) return;
      const cfg = getCurrentPageConfig();
      const val = e.target.value;
      cfg.assignedTest = (val === 'auto' || val === 'first') ? null : parseInt(val, 10);
      updateUIState();
      drawSelectionOverlay();
    });
  }

  els.btnAddExtraMask.addEventListener('click', () => {
    if (!state.pdfDoc) return;
    state.addingExtraMaskMode = !state.addingExtraMaskMode;
    els.btnAddExtraMask.classList.toggle('primary', state.addingExtraMaskMode);
    if (state.addingExtraMaskMode) {
      showToast(t('toastExtraDraw'));
    }
  });

  els.btnClearExtraMasks.addEventListener('click', () => {
    if (!state.pdfDoc) return;
    getCurrentPageConfig().extraRects = [];
    updateUIState();
    drawSelectionOverlay();
    showToast(t('toastExtraCleared'));
  });

  bindToggle(els.tgIndependentRects, (val) => {
    state.independentRects = val;
    showToast(val ? t('toastIndepOn') : t('toastIndepOff'));
    drawSelectionOverlay();
    updateCropPreview();
  });

  els.btnAllSinglePages.addEventListener('click', () => {
    if (!state.pdfDoc) return;
    state.pagesPerTest = 1;
    els.pagesPerTest.value = 1;
    for (let p = 1; p <= state.totalPages; p++) {
      state.pageConfigs[p].role = 'first';
      state.pageConfigs[p].assignedTest = null;
    }
    updateUIState();
    drawSelectionOverlay();
    updateCropPreview();
    showToast(t('toastAllSingle'));
  });

  els.btnResetBatchRoles.addEventListener('click', () => {
    if (!state.pdfDoc) return;
    syncBatchRoles();
    updateUIState();
    drawSelectionOverlay();
    updateCropPreview();
    showToast(t('toastResetBatch'));
  });

  // Page navigation & keyboard shortcuts
  els.btnPrevPage.addEventListener('click', () => {
    if (state.currentPage > 1) { state.currentPage--; renderCurrentPage(); updateUIState(); }
  });
  els.btnNextPage.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) { state.currentPage++; renderCurrentPage(); updateUIState(); }
  });
  els.btnPrevTest.addEventListener('click', () => {
    const groups = computeTestGroups();
    const curCtx = getPageTestContext(state.currentPage);
    if (curCtx.testIndex > 1) {
      state.currentPage = groups[curCtx.testIndex - 2].firstPageNum;
      renderCurrentPage();
      updateUIState();
    } else if (state.currentPage > 1) {
      state.currentPage = 1;
      renderCurrentPage();
      updateUIState();
    }
  });
  els.btnNextTest.addEventListener('click', () => {
    const groups = computeTestGroups();
    const curCtx = getPageTestContext(state.currentPage);
    if (curCtx.testIndex < groups.length) {
      state.currentPage = groups[curCtx.testIndex].firstPageNum;
      renderCurrentPage();
      updateUIState();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!state.pdfDoc) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'ArrowLeft' && state.currentPage > 1) {
      state.currentPage--; renderCurrentPage(); updateUIState();
    } else if (e.key === 'ArrowRight' && state.currentPage < state.totalPages) {
      state.currentPage++; renderCurrentPage(); updateUIState();
    } else if (e.key === '1') {
      setCurrentPageRole('first');
    } else if (e.key === '2') {
      setCurrentPageRole('subsequent');
    } else if (e.key === '0') {
      setCurrentPageRole('skip');
    }
  });

  // Downloads & Processing
  els.btnSampleEmpty.addEventListener('click', generateSamplePdf);
  els.btnProcessPdf.addEventListener('click', () => processAndAnonymizePdf(switchTab));
  els.btnOpenPdfToolbar.addEventListener('click', () => els.pdfFileInput.click());

  els.btnDownloadAnon.addEventListener('click', () => {
    downloadBytes(state.anonPdfBytes, 'verifiche_anonime.pdf');
  });

  els.btnDownloadLegend.addEventListener('click', () => {
    downloadBytes(state.legendPdfBytes, 'legenda_docente.pdf');
  });

  els.btnDownloadSinglePdfs.addEventListener('click', async () => {
    if (!state.singleTestPdfs.length) return;
    for (let i = 0; i < state.singleTestPdfs.length; i++) {
      const item = state.singleTestPdfs[i];
      downloadBytes(item.bytes, `${item.code}.pdf`);
      await new Promise(r => setTimeout(r, 220));
    }
  });

  els.btnExportCsv.addEventListener('click', () => {
    if (!state.legendItems.length) return;
    const studentInputs = els.legendTableBody.querySelectorAll('.inp-student');
    const gradeInputs = els.legendTableBody.querySelectorAll('.inp-grade');

    const rows = [['Code', 'Original_Pages', 'Pages_Count', 'Student_Name', 'Grade_Notes']];
    state.legendItems.forEach((item, idx) => {
      const stName = (studentInputs[idx]?.value || '').replace(/"/g, '""');
      const stGrade = (gradeInputs[idx]?.value || '').replace(/"/g, '""');
      const pagesStr = item.pages.map(p => p.pageNum).join(',');
      rows.push([item.code, `"${pagesStr}"`, item.pages.length, `"${stName}"`, `"${stGrade}"`]);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
    const encoder = new TextEncoder();
    downloadBytes(encoder.encode(csvContent), 'obfusca_grades.csv', 'text/csv;charset=utf-8');
    showToast(t('toastCsv'));
  });

  // File input & main stage Drag & Drop
  els.pdfFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    await loadPdfFromBytes(buffer, file.name);
  });

  els.canvasWrap.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.canvasWrap.classList.add('dragover');
  });
  els.canvasWrap.addEventListener('dragleave', (e) => {
    if (!els.canvasWrap.contains(e.relatedTarget)) {
      els.canvasWrap.classList.remove('dragover');
    }
  });
  els.canvasWrap.addEventListener('drop', async (e) => {
    e.preventDefault();
    els.canvasWrap.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      await loadPdfFromBytes(buffer, file.name);
    } else {
      showToast(t('toastInvalidPdf'));
    }
  });
}
