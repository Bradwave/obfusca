// viewer.js (classic script — works on both file:// and https://)
// Obfusca · viewer.js
// PDF page rendering, interactive overlay canvas, crop preview, and pointer drag/resize handlers.


function updateUIState() {
  const pgUnit = state.lang === 'en' ? 'pg.' : 'pag.';
  els.pptLabel.textContent = `${state.pagesPerTest} ${pgUnit}`;
  const sampleCode = state.codeType === 'progressive' ? `${state.codePrefix}001` : `${state.codePrefix}A7X9K`;
  els.prefixPreview.textContent = sampleCode;

  if (!state.totalPages) {
    els.detectedTestsCount.textContent = '—';
    els.pageIndicator.textContent = state.lang === 'en' ? 'Pg. 0 / 0' : 'Pag. 0 / 0';
    return;
  }

  const groups = computeTestGroups();
  els.detectedTestsCount.textContent = `→ ${groups.length} ${t('testsDetected')}`;
  els.singleMapCount.textContent = `${groups.length} / ${state.totalPages}p`;

  const ctxInfo = getPageTestContext(state.currentPage);
  const cfg = getCurrentPageConfig();

  const pfx = state.lang === 'en' ? 'Pg.' : 'Pag.';
  els.pageIndicator.textContent = `${pfx} ${state.currentPage} / ${state.totalPages}`;
  els.btnPrevPage.disabled = state.currentPage <= 1;
  els.btnNextPage.disabled = state.currentPage >= state.totalPages;
  els.btnPrevTest.disabled = state.currentPage <= 1;
  els.btnNextTest.disabled = state.currentPage >= state.totalPages;

  els.qRoleFirst.classList.toggle('on', cfg.role === 'first');
  els.qRoleSub.classList.toggle('on', cfg.role === 'subsequent');
  els.qRoleSkip.classList.toggle('on', cfg.role === 'skip');

  const roleLabel = cfg.role === 'first'
    ? t('roleFirstFull')
    : (cfg.role === 'subsequent' ? `${t('roleSubFull')} (P.${ctxInfo.pageInTest} · ${state.secondPageStamp.mode})` : t('roleSkipFull'));

  els.readout.innerHTML = `
    <span class="full">${t('readoutTest')} #${ctxInfo.testIndex} ${t('readoutOf')} ${ctxInfo.totalTests}</span>
    <span class="wide">File</span><b class="wide">${state.fileName.length > 20 ? state.fileName.slice(0, 18) + '…' : state.fileName}</b>
    <span>${t('readoutPage')}</span><b>${state.currentPage} / ${state.totalPages}</b>
    <span>${t('readoutRole')}</span><b>${roleLabel}</b>
    <span class="wide">${t('readoutExtra')}</span><b class="wide">${cfg.extraRects.length}</b>
  `;

  renderPageMapGrid(groups);
}

function renderPageMapGrid(groups) {
  if (!state.totalPages) return;
  els.pageListGrid.innerHTML = '';

  const pageToTest = {};
  groups.forEach((g, idx) => {
    g.pages.forEach((pObj, pIdx) => {
      pageToTest[pObj.pageNum] = { testIdx: idx + 1, pInTest: pIdx + 1 };
    });
  });

  const pfx = state.lang === 'en' ? 'Pg.' : 'Pag.';
  const vfx = state.lang === 'en' ? 'Ex.' : 'Ver.';

  for (let p = 1; p <= state.totalPages; p++) {
    const cfg = state.pageConfigs[p];
    const info = pageToTest[p] || { testIdx: 1, pInTest: 1 };
    const chip = document.createElement('button');
    chip.className = 'page-chip' + (p === state.currentPage ? ' active' : '');
    const roleTag = cfg.role === 'first'
      ? (state.lang === 'en' ? '🔴 1st pg' : '🔴 1ª pag')
      : (cfg.role === 'subsequent' ? (state.lang === 'en' ? '🟣 2nd+ pg' : '🟣 2ª+ pag') : (state.lang === 'en' ? '⚪ Skip' : '⚪ Intatta'));
    chip.innerHTML = `
      <b>${pfx} ${p}</b>
      <small>${vfx} #${info.testIdx}</small>
      <small>${roleTag}</small>
    `;
    chip.addEventListener('click', () => {
      state.currentPage = p;
      renderCurrentPage();
      updateUIState();
    });
    els.pageListGrid.appendChild(chip);
  }
}

async function renderCurrentPage() {
  if (!state.pdfDoc) return;
  const page = await state.pdfDoc.getPage(state.currentPage);
  const viewport = page.getViewport({ scale: state.scale });

  const canvas = els.pdfRenderCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  els.selectionOverlayCanvas.width = viewport.width;
  els.selectionOverlayCanvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  drawSelectionOverlay();
  updateCropPreview();
}

function drawHandle(ctx, x, y, color) {
  const s = 8;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillRect(x - s / 2, y - s / 2, s, s);
  ctx.strokeRect(x - s / 2, y - s / 2, s, s);
}

function drawSelectionOverlay() {
  const overlay = els.selectionOverlayCanvas;
  if (!overlay.width || !overlay.height) return;
  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  const cfg = getCurrentPageConfig();
  const ctxInfo = getPageTestContext(state.currentPage);
  const w = overlay.width;
  const h = overlay.height;

  if (cfg.role === 'first') {
    const r = getActiveNameRect();
    const rx = r.x * w;
    const ry = r.y * h;
    const rw = r.w * w;
    const rh = r.h * h;

    ctx.fillStyle = 'rgba(225, 29, 72, 0.22)';
    ctx.fillRect(rx, ry, rw, rh);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e11d48';
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.setLineDash([]);

    const labelText = state.printCodeOnFirst
      ? `${t('canvasBannerCode')} ${state.codePrefix}00${ctxInfo.testIndex} ${t('canvasDragHint')}`
      : t('canvasBannerMute');
    ctx.font = 'bold 11px "Space Mono", monospace';
    const tw = ctx.measureText(labelText).width;
    const by = Math.max(0, ry - 20);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(rx, by, Math.min(w - rx, tw + 12), 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, rx + 6, by + 14);

    drawHandle(ctx, rx, ry, '#e11d48');
    drawHandle(ctx, rx + rw, ry, '#e11d48');
    drawHandle(ctx, rx, ry + rh, '#e11d48');
    drawHandle(ctx, rx + rw, ry + rh, '#e11d48');

    els.coordsBadge.textContent = `x:${Math.round(r.x * 100)}% y:${Math.round(r.y * 100)}% w:${Math.round(r.w * 100)}% h:${Math.round(r.h * 100)}%`;
  } else if (cfg.role === 'subsequent') {
    const st = state.secondPageStamp;
    if (st.mode !== 'none') {
      const sx = st.x * w;
      const sy = st.y * h;
      const sw = st.w * w * st.scale;
      const sh = st.h * h * st.scale;

      if (st.mode === 'box') {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.16)';
        ctx.fillRect(sx, sy, sw, sh);
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, sw, sh);
      } else {
        if (st.opaqueBg) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.fillRect(sx, sy, sw, sh);
        }
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(sx, sy, sw, sh);
        ctx.setLineDash([]);
      }

      const fontPx = Math.max(9, Math.round(sh * 0.58));
      ctx.font = `bold ${fontPx}px "Space Mono", monospace`;
      ctx.fillStyle = '#581c87';
      ctx.textBaseline = 'middle';
      const pSuffix = st.showPageNum ? ` · P.${ctxInfo.pageInTest}` : '';
      ctx.fillText(`${state.codePrefix}00${ctxInfo.testIndex}${pSuffix}`, sx + 6, sy + sh / 2);
      ctx.textBaseline = 'alphabetic';

      drawHandle(ctx, sx, sy, '#9333ea');
      drawHandle(ctx, sx + sw, sy + sh, '#9333ea');
    }
    els.coordsBadge.textContent = st.mode === 'none' ? t('noStampBadge') : `${t('stamp2ndBadge')} (${Math.round(st.scale * 100)}%)`;
  } else {
    els.coordsBadge.textContent = t('pageSkippedBadge');
  }

  cfg.extraRects.forEach((er, idx) => {
    const ex = er.x * w;
    const ey = er.y * h;
    const ew = er.w * w;
    const eh = er.h * h;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.fillRect(ex, ey, ew, eh);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex, ey, ew, eh);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 10px "Space Mono", monospace';
    ctx.fillText(`EXTRA #${idx + 1}`, ex + 4, Math.max(10, ey - 4));
  });
}

function updateCropPreview() {
  if (!state.pdfDoc) {
    els.cropPlaceholder.textContent = t('cropPlaceholderFirst');
    return;
  }
  const cfg = getCurrentPageConfig();
  if (cfg.role !== 'first') {
    els.cropPreviewCanvas.hidden = true;
    els.cropPlaceholder.hidden = false;
    els.cropPlaceholder.textContent = t('cropPlaceholderOther');
    return;
  }

  const r = getActiveNameRect();
  const src = els.pdfRenderCanvas;
  const preview = els.cropPreviewCanvas;

  const sx = Math.max(0, r.x * src.width);
  const sy = Math.max(0, r.y * src.height);
  const sw = Math.max(10, r.w * src.width);
  const sh = Math.max(10, r.h * src.height);

  preview.width = sw;
  preview.height = sh;
  const pCtx = preview.getContext('2d');
  pCtx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);

  preview.hidden = false;
  els.cropPlaceholder.hidden = true;
}

// --- POINTER INTERACTION ON OVERLAY CANVAS ---
function getNormCoords(evt) {
  const rect = els.selectionOverlayCanvas.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
  const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
  const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
  return { x: x / rect.width, y: y / rect.height };
}

function hitTestHandle(px, py, hx, hy, tol = 0.026) {
  return Math.abs(px - hx) <= tol && Math.abs(py - hy) <= tol;
}

function hitTestRect(px, py, r) {
  return px >= r.x && px <= (r.x + r.w) && py >= r.y && py <= (r.y + r.h);
}

function onPointerDown(e) {
  if (!state.pdfDoc) return;
  if (e.touches) e.preventDefault();
  const pos = getNormCoords(e);
  const cfg = getCurrentPageConfig();

  if (state.addingExtraMaskMode) {
    cfg.extraRects.push({ x: pos.x, y: pos.y, w: 0.02, h: 0.02 });
    state.interaction = {
      active: true,
      target: 'extraRect',
      extraIdx: cfg.extraRects.length - 1,
      action: 'draw-new',
      startX: pos.x,
      startY: pos.y,
      origRect: { ...cfg.extraRects[cfg.extraRects.length - 1] }
    };
    state.addingExtraMaskMode = false;
    els.btnAddExtraMask.classList.remove('primary');
    return;
  }

  for (let i = cfg.extraRects.length - 1; i >= 0; i--) {
    if (hitTestRect(pos.x, pos.y, cfg.extraRects[i])) {
      state.interaction = {
        active: true,
        target: 'extraRect',
        extraIdx: i,
        action: 'move',
        startX: pos.x,
        startY: pos.y,
        origRect: { ...cfg.extraRects[i] }
      };
      return;
    }
  }

  if (cfg.role === 'first') {
    const r = getActiveNameRect();
    if (hitTestHandle(pos.x, pos.y, r.x, r.y)) {
      state.interaction = { active: true, target: 'nameRect', action: 'resize-nw', startX: pos.x, startY: pos.y, origRect: { ...r } };
    } else if (hitTestHandle(pos.x, pos.y, r.x + r.w, r.y)) {
      state.interaction = { active: true, target: 'nameRect', action: 'resize-ne', startX: pos.x, startY: pos.y, origRect: { ...r } };
    } else if (hitTestHandle(pos.x, pos.y, r.x, r.y + r.h)) {
      state.interaction = { active: true, target: 'nameRect', action: 'resize-sw', startX: pos.x, startY: pos.y, origRect: { ...r } };
    } else if (hitTestHandle(pos.x, pos.y, r.x + r.w, r.y + r.h)) {
      state.interaction = { active: true, target: 'nameRect', action: 'resize-se', startX: pos.x, startY: pos.y, origRect: { ...r } };
    } else if (hitTestRect(pos.x, pos.y, r)) {
      state.interaction = { active: true, target: 'nameRect', action: 'move', startX: pos.x, startY: pos.y, origRect: { ...r } };
    } else {
      state.interaction = { active: true, target: 'nameRect', action: 'draw-new', startX: pos.x, startY: pos.y, origRect: { ...r } };
    }
    return;
  }

  if (cfg.role === 'subsequent' && state.secondPageStamp.mode !== 'none') {
    const st = state.secondPageStamp;
    const effRect = { x: st.x, y: st.y, w: st.w * st.scale, h: st.h * st.scale };
    if (hitTestHandle(pos.x, pos.y, effRect.x + effRect.w, effRect.y + effRect.h, 0.03)) {
      state.interaction = {
        active: true,
        target: 'stampRect',
        action: 'resize-se',
        startX: pos.x,
        startY: pos.y,
        origScale: st.scale
      };
    } else if (hitTestRect(pos.x, pos.y, effRect)) {
      state.interaction = {
        active: true,
        target: 'stampRect',
        action: 'move',
        startX: pos.x,
        startY: pos.y,
        origRect: { x: st.x, y: st.y }
      };
    } else {
      st.x = Math.max(0.01, Math.min(0.95 - effRect.w, pos.x - effRect.w / 2));
      st.y = Math.max(0.01, Math.min(0.96 - effRect.h, pos.y - effRect.h / 2));
      drawSelectionOverlay();
    }
  }
}

function onPointerMove(e) {
  const inter = state.interaction;
  if (!inter.active) {
    if (!state.pdfDoc) return;
    const pos = getNormCoords(e);
    const cfg = getCurrentPageConfig();
    if (cfg.role === 'first') {
      const r = getActiveNameRect();
      if (hitTestHandle(pos.x, pos.y, r.x, r.y) || hitTestHandle(pos.x, pos.y, r.x + r.w, r.y + r.h)) {
        els.selectionOverlayCanvas.style.cursor = 'nwse-resize';
      } else if (hitTestHandle(pos.x, pos.y, r.x + r.w, r.y) || hitTestHandle(pos.x, pos.y, r.x, r.y + r.h)) {
        els.selectionOverlayCanvas.style.cursor = 'nesw-resize';
      } else if (hitTestRect(pos.x, pos.y, r)) {
        els.selectionOverlayCanvas.style.cursor = 'grab';
      } else {
        els.selectionOverlayCanvas.style.cursor = 'crosshair';
      }
    } else if (cfg.role === 'subsequent' && state.secondPageStamp.mode !== 'none') {
      const st = state.secondPageStamp;
      const effRect = { x: st.x, y: st.y, w: st.w * st.scale, h: st.h * st.scale };
      if (hitTestHandle(pos.x, pos.y, effRect.x + effRect.w, effRect.y + effRect.h, 0.03)) {
        els.selectionOverlayCanvas.style.cursor = 'nwse-resize';
      } else if (hitTestRect(pos.x, pos.y, effRect)) {
        els.selectionOverlayCanvas.style.cursor = 'grab';
      } else {
        els.selectionOverlayCanvas.style.cursor = 'pointer';
      }
    } else {
      els.selectionOverlayCanvas.style.cursor = 'default';
    }
    return;
  }

  if (e.touches) e.preventDefault();
  const pos = getNormCoords(e);
  const dx = pos.x - inter.startX;
  const dy = pos.y - inter.startY;

  if (inter.target === 'nameRect') {
    const o = inter.origRect;
    let next = { ...o };
    if (inter.action === 'move') {
      next.x = Math.max(0, Math.min(1 - o.w, o.x + dx));
      next.y = Math.max(0, Math.min(1 - o.h, o.y + dy));
    } else if (inter.action === 'resize-se') {
      next.w = Math.max(0.04, o.w + dx);
      next.h = Math.max(0.02, o.h + dy);
    } else if (inter.action === 'resize-nw') {
      next.x = Math.min(o.x + o.w - 0.04, o.x + dx);
      next.y = Math.min(o.y + o.h - 0.02, o.y + dy);
      next.w = (o.x + o.w) - next.x;
      next.h = (o.y + o.h) - next.y;
    } else if (inter.action === 'resize-ne') {
      next.y = Math.min(o.y + o.h - 0.02, o.y + dy);
      next.w = Math.max(0.04, o.w + dx);
      next.h = (o.y + o.h) - next.y;
    } else if (inter.action === 'resize-sw') {
      next.x = Math.min(o.x + o.w - 0.04, o.x + dx);
      next.w = (o.x + o.w) - next.x;
      next.h = Math.max(0.02, o.h + dy);
    } else if (inter.action === 'draw-new') {
      const x0 = Math.min(inter.startX, pos.x);
      const y0 = Math.min(inter.startY, pos.y);
      const w = Math.abs(pos.x - inter.startX);
      const h = Math.abs(pos.y - inter.startY);
      if (w > 0.015 && h > 0.012) {
        next = { x: x0, y: y0, w, h };
      }
    }
    setActiveNameRect(next);
    drawSelectionOverlay();
    updateCropPreview();
  } else if (inter.target === 'stampRect') {
    const st = state.secondPageStamp;
    if (inter.action === 'move') {
      const effW = st.w * st.scale;
      const effH = st.h * st.scale;
      st.x = Math.max(0.01, Math.min(0.99 - effW, inter.origRect.x + dx));
      st.y = Math.max(0.01, Math.min(0.99 - effH, inter.origRect.y + dy));
    } else if (inter.action === 'resize-se') {
      const newScale = Math.max(0.45, Math.min(1.5, inter.origScale + dx * 2.5));
      st.scale = Math.round(newScale * 20) / 20;
      els.stampScaleR.value = st.scale;
      els.stampScaleL.textContent = `${Math.round(st.scale * 100)}%`;
    }
    drawSelectionOverlay();
  } else if (inter.target === 'extraRect') {
    const cfg = getCurrentPageConfig();
    const er = cfg.extraRects[inter.extraIdx];
    if (!er) return;
    if (inter.action === 'draw-new') {
      er.x = Math.min(inter.startX, pos.x);
      er.y = Math.min(inter.startY, pos.y);
      er.w = Math.max(0.02, Math.abs(pos.x - inter.startX));
      er.h = Math.max(0.015, Math.abs(pos.y - inter.startY));
    } else if (inter.action === 'move') {
      er.x = Math.max(0, Math.min(1 - er.w, inter.origRect.x + dx));
      er.y = Math.max(0, Math.min(1 - er.h, inter.origRect.y + dy));
    }
    drawSelectionOverlay();
  }
}

function onPointerUp() {
  if (state.interaction.active) {
    state.interaction.active = false;
    updateUIState();
    updateCropPreview();
  }
}

function initViewerInteraction() {
  els.selectionOverlayCanvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  els.selectionOverlayCanvas.addEventListener('touchstart', onPointerDown, { passive: false });
  els.selectionOverlayCanvas.addEventListener('touchmove', onPointerMove, { passive: false });
  els.selectionOverlayCanvas.addEventListener('touchend', onPointerUp);
}
