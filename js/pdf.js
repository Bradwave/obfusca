// pdf.js (classic script — works on both file:// and https://)
// Obfusca · pdf.js
// PDF loading, sample generation, anonymization engine, teacher legend PDF, and CSV/file downloads.



async function loadPdfFromBytes(bytes, fileName) {
  try {
    state.pdfBytes = new Uint8Array(bytes);
    state.fileName = fileName;
    const loadingTask = pdfjsLib.getDocument({ data: state.pdfBytes.slice() });
    state.pdfDoc = await loadingTask.promise;
    state.totalPages = state.pdfDoc.numPages;
    state.currentPage = 1;

    initPageConfigs();

    els.emptyState.hidden = true;
    els.canvasInner.hidden = false;
    els.readoutHolder.hidden = false;
    els.btnProcessPdf.disabled = false;
    els.btnAddExtraMask.disabled = false;
    els.btnClearExtraMasks.disabled = false;

    updateUIState();
    await renderCurrentPage();
  } catch (err) {
    console.error(err);
  }
}

async function generateSamplePdf() {
  try {
    showToast(t('toastSampleGen'));
    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontHand = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const students = [
      { name: 'Mario Rossi', cls: '3ª B', date: '14/05/2025' },
      { name: 'Giulia Bianchi', cls: '3ª B', date: '14/05/2025' }
    ];

    for (let s = 0; s < students.length; s++) {
      const st = students[s];
      const p1 = pdfDoc.addPage([595, 842]);
      p1.drawRectangle({ x: 40, y: 745, width: 515, height: 60, borderColor: rgb(0.65, 0.65, 0.65), borderWidth: 1 });
      p1.drawText('VERIFICA DI FISICA E MATEMATICA - Dinamica e moto armonico', { x: 50, y: 785, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      p1.drawText('Studente (nome e cognome):', { x: 50, y: 760, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      p1.drawText(st.name, { x: 195, y: 758, size: 15, font: fontHand, color: rgb(0.15, 0.1, 0.65) });
      p1.drawText(`Classe: ${st.cls}   Data: ${st.date}`, { x: 400, y: 760, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });

      p1.drawText('Quesito 1. Determina il periodo delle piccole oscillazioni per L = 1,2 m:', { x: 45, y: 700, size: 10.5, font: fontBold });
      p1.drawText('T = 2π √(L / g)', { x: 60, y: 676, size: 12, font: fontRegular });
      p1.drawText(s === 0
        ? 'Svolgimento: T = 2 * 3,14 * sqrt(1,2 / 9,81) = 2,198 secondi.'
        : 'Svolgimento: Applichiamo la legge isocrona: T = 6,283 * 0,3497 = 2,20 s.',
        { x: 60, y: 646, size: 13, font: fontHand, color: rgb(0.1, 0.25, 0.6) });

      p1.drawText('Quesito 2. Risolvi l\'equazione associata al moto armonico:', { x: 45, y: 565, size: 10.5, font: fontBold });
      p1.drawText('2x² - 7x + 3 = 0', { x: 60, y: 540, size: 12, font: fontRegular });
      p1.drawText(s === 0
        ? 'Δ = 49 - 24 = 25  -->  x1 = 3 ,  x2 = 1/2'
        : 'Δ = (-7)² - 4(2)(3) = 25  -->  x = (7 ± 5)/4  -->  3 e 0,5',
        { x: 60, y: 510, size: 13, font: fontHand, color: rgb(0.1, 0.25, 0.6) });
      p1.drawText('Pagina 1 di 2', { x: 270, y: 30, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

      const p2 = pdfDoc.addPage([595, 842]);
      p2.drawText('Quesito 3 (seconda facciata). Analisi energetica nel punto più basso della traiettoria:', { x: 45, y: 785, size: 10.5, font: fontBold });
      p2.drawText('Calcola la tensione T del filo sapendo che m = 0,5 kg e v = 3 m/s (L = 1,2 m).', { x: 45, y: 762, size: 10, font: fontRegular });
      p2.drawText(s === 0
        ? 'T - mg = m v² / L  -->  T = 0,5*(9,81 + 9/1,2) = 8,65 N'
        : 'Forza centripeta Fc = m v²/L = 3,75 N. Tensione T = mg + Fc = 4,905 + 3,75 = 8,66 N.',
        { x: 60, y: 730, size: 13, font: fontHand, color: rgb(0.1, 0.25, 0.6) });
      p2.drawText('Pagina 2 di 2', { x: 270, y: 30, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
    }

    const pdfBytes = await pdfDoc.save();
    state.defaultNormRect = { x: 0.075, y: 0.072, w: 0.57, h: 0.045 };
    state.pagesPerTest = 2;
    els.pagesPerTest.value = 2;
    await loadPdfFromBytes(pdfBytes, 'verifiche_esempio.pdf');
    showToast(t('toastSampleReady'));
  } catch (err) {
    console.error(err);
  }
}

function generateUniqueCodes(count, mode, prefix) {
  const codes = [];
  const used = new Set();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 1; i <= count; i++) {
    if (mode === 'progressive') {
      codes.push(`${prefix}${String(i).padStart(3, '0')}`);
    } else {
      let rnd = '';
      do {
        rnd = '';
        for (let k = 0; k < 5; k++) rnd += chars.charAt(Math.floor(Math.random() * chars.length));
      } while (used.has(rnd));
      used.add(rnd);
      codes.push(`${prefix}${rnd}`);
    }
  }
  return codes;
}

async function processAndAnonymizePdf(onCompleteSwitchTab) {
  if (!state.pdfDoc || !state.pdfBytes) return;

  try {
    els.btnProcessPdf.disabled = true;
    els.progressWrap.hidden = false;

    const testGroups = computeTestGroups();
    const codes = generateUniqueCodes(testGroups.length, state.codeType, state.codePrefix.trim());

    testGroups.forEach((g, idx) => {
      g.code = codes[idx];
      g.cropDataUrl = null;
      g.cropWidth = 0;
      g.cropHeight = 0;
    });

    const workCanvas = document.createElement('canvas');
    const workCtx = workCanvas.getContext('2d');
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    const { PDFDocument, StandardFonts, rgb } = PDFLib;
    const anonPdfDoc = await PDFDocument.create();
    const anonFontBold = await anonPdfDoc.embedFont(StandardFonts.CourierBold);
    const sourceLoadedPdf = state.securityMode === 'overlay' ? await PDFDocument.load(state.pdfBytes) : null;

    const outputOrder = [...testGroups];
    if (state.shuffleTests) {
      for (let i = outputOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [outputOrder[i], outputOrder[j]] = [outputOrder[j], outputOrder[i]];
      }
    }

    state.singleTestPdfs = [];
    let processedPages = 0;

    for (let gIdx = 0; gIdx < outputOrder.length; gIdx++) {
      const group = outputOrder[gIdx];
      const singleDoc = await PDFDocument.create();
      const singleFontBold = await singleDoc.embedFont(StandardFonts.CourierBold);

      for (let pIdx = 0; pIdx < group.pages.length; pIdx++) {
        const pageObj = group.pages[pIdx];
        const pageNumber = pageObj.pageNum;
        const pageRole = pageObj.role;
        const pageCfg = state.pageConfigs[pageNumber] || { role: pageRole, rect: { ...state.defaultNormRect }, extraRects: [] };
        const nameRect = getActiveNameRect(pageNumber);

        processedPages++;
        const pct = Math.round((processedPages / state.totalPages) * 88);
        els.progressBar.style.width = `${pct}%`;
        els.progressText.textContent = `${processedPages}/${state.totalPages} (${pct}%)`;
        await new Promise(r => setTimeout(r, 8));

        const pdfPage = await state.pdfDoc.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale: state.renderScale });
        workCanvas.width = viewport.width;
        workCanvas.height = viewport.height;
        await pdfPage.render({ canvasContext: workCtx, viewport }).promise;

        const rx = nameRect.x * workCanvas.width;
        const ry = nameRect.y * workCanvas.height;
        const rw = nameRect.w * workCanvas.width;
        const rh = nameRect.h * workCanvas.height;

        if (pageRole === 'first' && !group.cropDataUrl) {
          cropCanvas.width = Math.max(1, Math.round(rw));
          cropCanvas.height = Math.max(1, Math.round(rh));
          cropCtx.drawImage(workCanvas, rx, ry, rw, rh, 0, 0, cropCanvas.width, cropCanvas.height);
          group.cropDataUrl = cropCanvas.toDataURL('image/png');
          group.cropWidth = cropCanvas.width;
          group.cropHeight = cropCanvas.height;
        }

        if (state.securityMode === 'rasterize') {
          pageCfg.extraRects.forEach(er => {
            workCtx.fillStyle = '#ffffff';
            workCtx.fillRect(er.x * workCanvas.width, er.y * workCanvas.height, er.w * workCanvas.width, er.h * workCanvas.height);
          });

          if (pageRole === 'first') {
            workCtx.fillStyle = '#ffffff';
            workCtx.fillRect(rx, ry, rw, rh);
            if (state.printCodeOnFirst) {
              workCtx.lineWidth = 2;
              workCtx.strokeStyle = '#1f0d3d';
              workCtx.strokeRect(rx, ry, rw, rh);
              const fontSize = Math.max(14, Math.min(26, Math.round(rh * 0.46)));
              workCtx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
              workCtx.fillStyle = '#1f0d3d';
              workCtx.textBaseline = 'middle';
              workCtx.fillText(`Code: ${group.code}`, rx + 12, ry + rh / 2);
            }
          } else if (pageRole === 'subsequent' && state.secondPageStamp.mode !== 'none') {
            const st = state.secondPageStamp;
            const boxX = st.x * workCanvas.width;
            const boxY = st.y * workCanvas.height;
            const boxW = st.w * workCanvas.width * st.scale;
            const boxH = st.h * workCanvas.height * st.scale;
            const pSuffix = st.showPageNum ? ` · P.${pIdx + 1}` : '';
            const stampText = `${group.code}${pSuffix}`;

            if (st.mode === 'box' || st.opaqueBg) {
              workCtx.fillStyle = '#ffffff';
              workCtx.fillRect(boxX, boxY, boxW, boxH);
            }
            if (st.mode === 'box') {
              workCtx.lineWidth = 1.5;
              workCtx.strokeStyle = '#334155';
              workCtx.strokeRect(boxX, boxY, boxW, boxH);
            }

            const fontSize = Math.max(11, Math.round(boxH * 0.56));
            workCtx.font = `bold ${fontSize}px "Courier New", Courier, monospace`;
            workCtx.fillStyle = '#1e293b';
            workCtx.textBaseline = 'middle';
            workCtx.fillText(stampText, boxX + 6, boxY + boxH / 2);
          }

          const jpegDataUrl = workCanvas.toDataURL('image/jpeg', 0.89);
          const origViewport = pdfPage.getViewport({ scale: 1.0 });

          const jpgImage = await anonPdfDoc.embedJpg(jpegDataUrl);
          const newPage = anonPdfDoc.addPage([origViewport.width, origViewport.height]);
          newPage.drawImage(jpgImage, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });

          const singleJpg = await singleDoc.embedJpg(jpegDataUrl);
          const sPage = singleDoc.addPage([origViewport.width, origViewport.height]);
          sPage.drawImage(singleJpg, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
        } else {
          const applyOverlayToDoc = async (targetDoc, fontBold) => {
            const [copiedPage] = await targetDoc.copyPages(sourceLoadedPdf, [pageNumber - 1]);
            targetDoc.addPage(copiedPage);
            const { width: pw, height: ph } = copiedPage.getSize();

            pageCfg.extraRects.forEach(er => {
              const ew = er.w * pw;
              const eh = er.h * ph;
              copiedPage.drawRectangle({
                x: er.x * pw,
                y: ph - (er.y * ph) - eh,
                width: ew,
                height: eh,
                color: rgb(1, 1, 1)
              });
            });

            if (pageRole === 'first') {
              const pdfRx = nameRect.x * pw;
              const pdfRw = nameRect.w * pw;
              const pdfRh = nameRect.h * ph;
              const pdfRy = ph - (nameRect.y * ph) - pdfRh;

              copiedPage.drawRectangle({
                x: pdfRx,
                y: pdfRy,
                width: pdfRw,
                height: pdfRh,
                color: rgb(1, 1, 1),
                borderColor: state.printCodeOnFirst ? rgb(0.15, 0.1, 0.25) : rgb(1, 1, 1),
                borderWidth: state.printCodeOnFirst ? 1 : 0
              });

              if (state.printCodeOnFirst) {
                const fontSize = Math.max(9, Math.min(15, pdfRh * 0.45));
                copiedPage.drawText(`Code: ${group.code}`, {
                  x: pdfRx + 8,
                  y: pdfRy + (pdfRh - fontSize) / 2 + 2,
                  size: fontSize,
                  font: fontBold,
                  color: rgb(0.1, 0.05, 0.2)
                });
              }
            } else if (pageRole === 'subsequent' && state.secondPageStamp.mode !== 'none') {
              const st = state.secondPageStamp;
              const boxW = st.w * pw * st.scale;
              const boxH = st.h * ph * st.scale;
              const boxX = st.x * pw;
              const boxY = ph - (st.y * ph) - boxH;
              const pSuffix = st.showPageNum ? ` - P.${pIdx + 1}` : '';

              if (st.mode === 'box' || st.opaqueBg) {
                copiedPage.drawRectangle({
                  x: boxX,
                  y: boxY,
                  width: boxW,
                  height: boxH,
                  color: rgb(1, 1, 1),
                  borderColor: st.mode === 'box' ? rgb(0.3, 0.3, 0.3) : rgb(1, 1, 1),
                  borderWidth: st.mode === 'box' ? 0.8 : 0
                });
              }

              const fontSize = Math.max(8, Math.min(13, boxH * 0.55));
              copiedPage.drawText(`${group.code}${pSuffix}`, {
                x: boxX + 4,
                y: boxY + (boxH - fontSize) / 2 + 1,
                size: fontSize,
                font: fontBold,
                color: rgb(0.15, 0.15, 0.2)
              });
            }
          };

          await applyOverlayToDoc(anonPdfDoc, anonFontBold);
          await applyOverlayToDoc(singleDoc, singleFontBold);
        }
      }

      const singleBytes = await singleDoc.save();
      state.singleTestPdfs.push({ code: group.code, bytes: singleBytes });
    }

    els.progressText.textContent = '95%';
    els.progressBar.style.width = '95%';

    const legendPdfDoc = await PDFDocument.create();
    const legFontBold = await legendPdfDoc.embedFont(StandardFonts.HelveticaBold);
    const legFontReg = await legendPdfDoc.embedFont(StandardFonts.Helvetica);
    const legFontMono = await legendPdfDoc.embedFont(StandardFonts.CourierBold);

    let legPage = legendPdfDoc.addPage([595, 842]);
    const drawLegendHeader = (page) => {
      page.drawText('OBFUSCA — Legenda di decodifica / Decoding key', {
        x: 40, y: 805, size: 13, font: legFontBold, color: rgb(0.15, 0.05, 0.3)
      });
      page.drawText(`Totale: ${testGroups.length}   |   Data: ${new Date().toLocaleDateString('it-IT')}`, {
        x: 40, y: 788, size: 9, font: legFontReg, color: rgb(0.4, 0.4, 0.4)
      });
      page.drawLine({ start: { x: 40, y: 778 }, end: { x: 555, y: 778 }, thickness: 1, color: rgb(0.75, 0.75, 0.75) });
    };

    drawLegendHeader(legPage);
    let yCursor = 755;

    const legendSorted = [...testGroups].sort((a, b) => a.code.localeCompare(b.code));
    state.legendItems = legendSorted;

    for (let i = 0; i < legendSorted.length; i++) {
      const item = legendSorted[i];
      const rowHeight = 56;
      if (yCursor - rowHeight < 45) {
        legPage = legendPdfDoc.addPage([595, 842]);
        drawLegendHeader(legPage);
        yCursor = 755;
      }

      if (i % 2 === 0) {
        legPage.drawRectangle({ x: 40, y: yCursor - rowHeight + 8, width: 515, height: rowHeight, color: rgb(0.97, 0.96, 0.99) });
      }

      legPage.drawText(item.code, { x: 48, y: yCursor - 18, size: 12, font: legFontMono, color: rgb(0.35, 0.1, 0.65) });
      legPage.drawText(`Pag. orig. ${item.firstPageNum} (${item.pages.length}p)`, { x: 48, y: yCursor - 32, size: 8, font: legFontReg, color: rgb(0.45, 0.45, 0.45) });

      if (item.cropDataUrl) {
        const pngImage = await legendPdfDoc.embedPng(item.cropDataUrl);
        const maxImgW = 295;
        const maxImgH = 44;
        const ratio = Math.min(maxImgW / item.cropWidth, maxImgH / item.cropHeight);
        const drawW = item.cropWidth * ratio;
        const drawH = item.cropHeight * ratio;

        legPage.drawImage(pngImage, {
          x: 160,
          y: yCursor - 40 + (maxImgH - drawH) / 2,
          width: drawW,
          height: drawH
        });
        legPage.drawRectangle({
          x: 160,
          y: yCursor - 40 + (maxImgH - drawH) / 2,
          width: drawW,
          height: drawH,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 0.6
        });
      }

      legPage.drawRectangle({ x: 475, y: yCursor - 36, width: 72, height: 34, borderColor: rgb(0.65, 0.65, 0.65), borderWidth: 0.8, color: rgb(1, 1, 1) });
      legPage.drawText('Voto:', { x: 480, y: yCursor - 14, size: 8, font: legFontReg, color: rgb(0.5, 0.5, 0.5) });

      yCursor -= (rowHeight + 4);
    }

    state.anonPdfBytes = await anonPdfDoc.save();
    state.legendPdfBytes = await legendPdfDoc.save();

    populateResultsTable(legendSorted);

    els.progressBar.style.width = '100%';
    els.progressText.textContent = '100%!';
    els.resultsEmptyNote.hidden = true;
    els.resultsContent.hidden = false;
    if (onCompleteSwitchTab) onCompleteSwitchTab('results');
    showToast(`${testGroups.length} ${t('toastDone')}`);
  } catch (err) {
    console.error(err);
  } finally {
    els.btnProcessPdf.disabled = false;
    setTimeout(() => { els.progressWrap.hidden = true; }, 1000);
  }
}

function populateResultsTable(items) {
  els.legendCountBadge.textContent = `${items.length}`;
  els.legendTableBody.innerHTML = '';
  items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const imgHtml = item.cropDataUrl
      ? `<img src="${item.cropDataUrl}" alt="${item.code}" class="crop-thumb">`
      : `<span class="note">—</span>`;
    tr.innerHTML = `
      <td>
        <b style="color:var(--accent)">${item.code}</b>
        <div class="note" style="margin:0">P.${item.firstPageNum} (${item.pages.length}f)</div>
      </td>
      <td>${imgHtml}</td>
      <td>
        <div style="display:flex;flex-direction:column;gap:4px">
          <input type="text" data-idx="${idx}" class="inp-student" placeholder="${t('studentPlaceholder')}" style="width:125px;font-size:11px;padding:3px 5px">
          <input type="text" data-idx="${idx}" class="inp-grade" placeholder="${t('gradePlaceholder')}" style="width:125px;font-size:11px;padding:3px 5px">
        </div>
      </td>
    `;
    els.legendTableBody.appendChild(tr);
  });
}

function downloadBytes(bytes, filename, mime = 'application/pdf') {
  if (!bytes) return;
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
