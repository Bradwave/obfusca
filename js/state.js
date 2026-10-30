// state.js (classic script — works on both file:// and https://)
// Obfusca · state.js
// Application state, page configurations, and DOM element references.

const state = {
  lang: 'it',
  pdfBytes: null,
  pdfDoc: null,
  fileName: '',
  totalPages: 0,
  currentPage: 1,
  scale: 1.45,

  workMode: 'batch',
  pagesPerTest: 2,
  independentRects: false,

  defaultNormRect: { x: 0.075, y: 0.065, w: 0.56, h: 0.05 },

  secondPageStamp: {
    mode: 'minimal',
    x: 0.72,
    y: 0.018,
    w: 0.24,
    h: 0.028,
    scale: 0.75,
    opaqueBg: false,
    showPageNum: true
  },

  pageConfigs: {},

  codeType: 'progressive',
  codePrefix: 'VER-',
  printCodeOnFirst: true,
  shuffleTests: false,
  regroupPages: true,
  securityMode: 'rasterize',
  renderScale: 2.0,

  interaction: {
    active: false,
    target: null,
    extraIdx: -1,
    action: null,
    startX: 0,
    startY: 0,
    origRect: null
  },
  addingExtraMaskMode: false,

  anonPdfBytes: null,
  legendPdfBytes: null,
  singleTestPdfs: [],
  legendItems: []
};

const $ = (id) => document.getElementById(id);

const els = {
  langBtn: $('langBtn'),
  themeBtn: $('themeBtn'),
  themeIcon: $('themeIcon'),
  helpBtn: $('helpBtn'),
  helpBtnMob: $('helpBtnMob'),
  helpDialog: $('helpDialog'),
  helpCloseBtn: $('helpCloseBtn'),
  btnOpenPdfToolbar: $('btnOpenPdfToolbar'),
  btnSampleEmpty: $('btnSampleEmpty'),
  pdfFileInput: $('pdfFileInput'),

  btnPrevTest: $('btnPrevTest'),
  btnPrevPage: $('btnPrevPage'),
  pageIndicator: $('pageIndicator'),
  btnNextPage: $('btnNextPage'),
  btnNextTest: $('btnNextTest'),
  workModeSeg: $('workModeSeg'),
  zoomSeg: $('zoomSeg'),

  canvasWrap: $('canvasWrap'),
  readoutHolder: $('readoutHolder'),
  readout: $('readout'),
  emptyState: $('emptyState'),
  canvasInner: $('canvasInner'),
  pdfRenderCanvas: $('pdfRenderCanvas'),
  selectionOverlayCanvas: $('selectionOverlayCanvas'),

  qRoleFirst: $('qRoleFirst'),
  qRoleSub: $('qRoleSub'),
  qRoleSkip: $('qRoleSkip'),
  qAssignWrap: $('qAssignWrap'),
  qTestAssign: $('qTestAssign'),
  btnAddExtraMask: $('btnAddExtraMask'),
  btnClearExtraMasks: $('btnClearExtraMasks'),

  pagesPerTest: $('pagesPerTest'),
  pptLabel: $('pptLabel'),
  detectedTestsCount: $('detectedTestsCount'),
  codeTypeSeg: $('codeTypeSeg'),
  codePrefix: $('codePrefix'),
  prefixPreview: $('prefixPreview'),
  tgPrintCodeOnFirst: $('tgPrintCodeOnFirst'),
  tgShuffleTests: $('tgShuffleTests'),
  tgRegroupPages: $('tgRegroupPages'),
  securityModeSeg: $('securityModeSeg'),
  securityNote: $('securityNote'),
  dpiSeg: $('dpiSeg'),
  dpiLabel: $('dpiLabel'),
  coordsBadge: $('coordsBadge'),
  cropPreviewCanvas: $('cropPreviewCanvas'),
  cropPlaceholder: $('cropPlaceholder'),
  btnProcessPdf: $('btnProcessPdf'),
  progressWrap: $('progressWrap'),
  progressBar: $('progressBar'),
  progressText: $('progressText'),

  secondStampModeSeg: $('secondStampModeSeg'),
  secondStampControls: $('secondStampControls'),
  stampScaleR: $('stampScaleR'),
  stampScaleL: $('stampScaleL'),
  stampPresetSeg: $('stampPresetSeg'),
  tgStampBg: $('tgStampBg'),
  tgStampPageNum: $('tgStampPageNum'),

  tgIndependentRects: $('tgIndependentRects'),
  btnAllSinglePages: $('btnAllSinglePages'),
  btnResetBatchRoles: $('btnResetBatchRoles'),
  singleMapCount: $('singleMapCount'),
  pageListGrid: $('pageListGrid'),

  resultsEmptyNote: $('resultsEmptyNote'),
  resultsContent: $('resultsContent'),
  btnDownloadAnon: $('btnDownloadAnon'),
  btnDownloadLegend: $('btnDownloadLegend'),
  btnDownloadSinglePdfs: $('btnDownloadSinglePdfs'),
  btnExportCsv: $('btnExportCsv'),
  legendCountBadge: $('legendCountBadge'),
  legendTableBody: $('legendTableBody'),
  toast: $('toast'),
  privacyPrompt: $('privacyPrompt'),
  privacyPromptText: $('privacyPromptText'),
  privacyPromptClose: $('privacyPromptClose')
};

// --- PAGE ROLES & GROUPING HELPERS ---
function initPageConfigs() {
  state.pageConfigs = {};
  const ppt = Math.max(1, state.pagesPerTest);
  for (let p = 1; p <= state.totalPages; p++) {
    const isFirst = ((p - 1) % ppt) === 0;
    state.pageConfigs[p] = {
      role: isFirst ? 'first' : 'subsequent',
      assignedTest: null,
      rect: { ...state.defaultNormRect },
      extraRects: []
    };
  }
}

function syncBatchRoles() {
  const ppt = Math.max(1, state.pagesPerTest);
  for (let p = 1; p <= state.totalPages; p++) {
    if (!state.pageConfigs[p]) {
      state.pageConfigs[p] = { role: 'first', assignedTest: null, rect: { ...state.defaultNormRect }, extraRects: [] };
    }
    state.pageConfigs[p].role = (((p - 1) % ppt) === 0) ? 'first' : 'subsequent';
    state.pageConfigs[p].assignedTest = null;
  }
}

function getCurrentPageConfig() {
  if (!state.pageConfigs[state.currentPage]) {
    state.pageConfigs[state.currentPage] = {
      role: 'first',
      assignedTest: null,
      rect: { ...state.defaultNormRect },
      extraRects: []
    };
  }
  return state.pageConfigs[state.currentPage];
}

function getActiveNameRect(pageNum = state.currentPage) {
  if (state.independentRects && state.pageConfigs[pageNum]) {
    return state.pageConfigs[pageNum].rect;
  }
  return state.defaultNormRect;
}

function setActiveNameRect(newRect, pageNum = state.currentPage) {
  const clamped = {
    x: Math.max(0, Math.min(0.96, newRect.x)),
    y: Math.max(0, Math.min(0.96, newRect.y)),
    w: Math.max(0.03, Math.min(1 - newRect.x, newRect.w)),
    h: Math.max(0.018, Math.min(1 - newRect.y, newRect.h))
  };
  if (state.independentRects && state.pageConfigs[pageNum]) {
    state.pageConfigs[pageNum].rect = clamped;
  } else {
    state.defaultNormRect = clamped;
    Object.values(state.pageConfigs).forEach(cfg => { cfg.rect = { ...clamped }; });
  }
}

function computeTestGroups() {
  const groups = [];

  // Pass 1: every 'first' page establishes a distinct student exam group
  for (let p = 1; p <= state.totalPages; p++) {
    const cfg = state.pageConfigs[p] || { role: 'first', assignedTest: null, rect: { ...state.defaultNormRect }, extraRects: [] };
    if (cfg.role === 'first') {
      groups.push({
        originalIndex: groups.length + 1,
        firstPageNum: p,
        pages: [{ pageNum: p, role: 'first' }]
      });
    }
  }

  // Fallback if user set zero 'first' pages across the document
  if (groups.length === 0 && state.totalPages > 0) {
    groups.push({
      originalIndex: 1,
      firstPageNum: 1,
      pages: []
    });
  }

  // Pass 2: attach 'subsequent' and 'skip' pages either to their explicitly assignedTest
  // (1-based index into groups) or to the nearest preceding 'first' group (auto flow)
  let currentGroupIdx = 0;
  for (let p = 1; p <= state.totalPages; p++) {
    const cfg = state.pageConfigs[p] || { role: 'first', assignedTest: null, rect: { ...state.defaultNormRect }, extraRects: [] };
    if (cfg.role === 'first') {
      const foundIdx = groups.findIndex(g => g.firstPageNum === p);
      if (foundIdx !== -1) currentGroupIdx = foundIdx;
    } else {
      let targetIdx = currentGroupIdx;
      if (cfg.assignedTest !== null && cfg.assignedTest !== undefined) {
        const manualIdx = parseInt(cfg.assignedTest, 10) - 1;
        if (!Number.isNaN(manualIdx) && manualIdx >= 0 && manualIdx < groups.length) {
          targetIdx = manualIdx;
        }
      }
      groups[targetIdx].pages.push({
        pageNum: p,
        role: cfg.role,
        manualAssign: cfg.assignedTest !== null && cfg.assignedTest !== undefined
      });
    }
  }

  return groups;
}

function getPageTestContext(pageNum) {
  const groups = computeTestGroups();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const idx = g.pages.findIndex(item => item.pageNum === pageNum);
    if (idx !== -1) {
      return {
        testIndex: i + 1,
        totalTests: groups.length,
        pageInTest: idx + 1,
        pagesInThisTest: g.pages.length,
        role: g.pages[idx].role
      };
    }
  }
  return { testIndex: 1, totalTests: 1, pageInTest: 1, pagesInThisTest: 1, role: 'first' };
}

// --- TOAST NOTIFICATIONS ---
let toastTimer = null;
function showToast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3200);
}
