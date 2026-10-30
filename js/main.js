// main.js (classic script — works on both file:// and https://)
// Obfusca · main.js
// Entry point: initializes viewer interaction, UI controls, and language strings.


pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

initViewerInteraction();
initUI();
applyLanguage();
