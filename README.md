# Obfusca

A 100% local, GDPR-safe PDF exam anonymizer built for teachers and AI-assisted grading workflows. Sibling of [Pendulum Lab](../pendulum-lab): no build step, no backend—plain HTML, CSS and JavaScript. Vibecoded with Gemini, with <3.

## Features

- **100% Local Processing**: all PDF rendering, redaction, and generation happen directly inside the browser's memory (`PDF.js` + `pdf-lib`). No student data or files are ever uploaded.
- **Interactive Redaction Box**: drag or resize the redaction area via corner handles on the 1st page of each exam, with live name-crop preview.
- **Discreet Second-Page Labels**: choose between **None** (100% untouched follow-up pages), **Micro-Text** (small, unframed code that won't interfere with Vision/LLM OCR), or **Bordered Box**, with full drag-and-drop repositioning and scaling.
- **Fixed Batch & Single-Page Modes**:
  - *Fixed Batch*: automatically splits exams every $N$ pages.
  - *Single Page*: configure each page's role individually (*1st Page*, *2nd+ Follow-up*, or *Skip*), use independent redaction coordinates per sheet, and add extra blank boxes for secondary signatures.
- **AI Grading Ready**:
  - Option to apply a mute white patch on the 1st page without synthetic text.
  - Selectable rasterization sharpness (`1.5×`, `2.0×`, `2.6× High AI OCR`) or fast vector overlay.
  - Export a single merged `verifiche_anonime.pdf`, individual per-exam PDFs (`VER-001.pdf`, `VER-002.pdf`, ...), the teacher's decoding key `legenda_docente.pdf`, and a grades CSV table (`obfusca_grades.csv`).
- **Bilingual UI & System Theme**: instant Italian / English switch (`IT` / `EN`) and automatic light/dark system theme detection.

## Run locally

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Publish with GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main`, folder `/ (root)`.

## Project structure

```
index.html      markup & dialogs
css/style.css   styles, neo-brutalist scrollbars, and light/dark purple tokens
js/main.js      entry point: initializes viewer, UI, and language
js/state.js     application state, page role helpers, and DOM references
js/i18n.js      bilingual dictionary (IT sentence-case / EN)
js/viewer.js    PDF page rendering, interactive canvas overlay, drag/resize handlers
js/pdf.js       PDF anonymization engine, sample generator, teacher legend, and CSV export
js/ui.js        theme, privacy prompt, tabs, sliders, toggles, and drag-and-drop
```

## License

MIT, see [LICENSE](LICENSE).
