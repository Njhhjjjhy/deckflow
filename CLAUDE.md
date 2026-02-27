# Deckflow

## What this is

A web app that turns structured content into brand-consistent MoreHarvest presentations in three languages (EN, zh-TW, zh-CN). Content and layout are separated: you edit structured fields, templates handle visual formatting, and the system exports pixel-perfect PDFs and editable PPTX files.

## Architecture

Three layers, always separated:
1. Content layer: structured JSON with trilingual text, image refs, table data.
2. Template layer: 22 React components that render presentation pages from content data.
3. Output layer: PDF (primary, pixel-perfect) and PPTX (secondary, editable).

Content never contains formatting. Templates never contain content. This separation is the core invariant -- never break it.

## Tech stack

- Frontend: React + TypeScript, single-page app
- Styling: Tailwind for tool UI. Templates use scoped CSS for brand fidelity.
- State: Zustand with localStorage persistence (IndexedDB for images)
- PDF export: @react-pdf/renderer (Option A). Fallback: Puppeteer via Vercel serverless (Option B).
- PPTX export: pptxgenjs (browser-side)
- Translation: Anthropic API via Vercel serverless function
- Charts: Recharts
- Deployment: Vercel

## Brand constants

```ts
const BRAND = {
  colors: {
    primary: '#FBB931',          // MoreHarvest gold
    textPrimary: '#1A1A1A',      // near-black, 90% black
    textSecondary: '#333333',    // dark gray, 80% black
    background: '#F2F2F2',       // ALL backgrounds -- tool UI and slides
    headerBox: '#E8E8E8',        // header boxes, slightly darker than background
    border: '#E5E5E5',           // borders and dividers
  },
  dimensions: {
    slideWidth: 960,
    slideHeight: 540,
    aspectRatio: '16:9',
  },
  fonts: {
    // English
    heading: 'REM',              // Google Font: https://fonts.google.com/specimen/REM
    headingWeight: '600',        // SemiBold
    body: 'Noto Sans JP',       // Google Font
    bodyWeight: '400',           // Regular
    // Chinese traditional -- used for both headings and body
    zhTw: 'Noto Sans TC',
    // Chinese simplified -- used for both headings and body
    zhCn: 'Noto Sans SC',
  },
  accessibility: {
    // ALL text must pass WCAG AA contrast standards.
    // Minimum 4.5:1 ratio for normal text, 3:1 for large text (18px+ or 14px+ bold).
    // No hardcoded font sizes -- size text to be readable and AA-compliant
    // at the given color/background combination.
    contrastStandard: 'WCAG AA',
  },
  languages: ['en', 'zh-tw', 'zh-cn'] as const,
};
```

## Build phases (strict order)

Do not skip ahead. Each phase must pass its acceptance test before starting the next.

### Phase 1: single template rendering
Build the cover page template as a React component. Render it in the browser at 960x540px with hardcoded content. Acceptance: visually matches Oakwater PDF page 1 when compared side-by-side.

### Phase 2: content editor for cover page
Build a structured form that drives the cover page template. Three-column layout: page list (left), content fields (center), live preview (right). Content fields include headline (plain text, trilingual tabs), year (plain text), hero image (file upload). Preview updates on every keystroke. Acceptance: type into the headline field, see it render in real time on the preview.

### Phase 3: PDF export
Add a button that exports the current presentation as a PDF using @react-pdf/renderer. Acceptance: exported PDF is visually identical to the browser preview. Fonts are embedded. Images are sharp. Page dimensions are 960x540.

### Phase 4: benchmark test
Recreate Oakwater PDF page 1 using the content editor. Export as PDF. Compare side-by-side with the original. If the output is professional enough to send to an investor, phase passes. If not, iterate on the template until it does.

### Phase 5: remaining 19 templates
Build one template at a time. Test each against the corresponding Oakwater PDF page before moving to the next. Test at least one template with Chinese content before building all 20. See `/docs/templates.md` for specs.

### Phase 6: translation engine
Integrate Anthropic API for EN -> zh-TW and EN -> zh-CN translation. Include term glossary in every API call. Translation status per field: auto-translated (yellow), reviewed (green), outdated (red), empty (gray). See `/docs/features.md#translation` for full spec.

### Phase 7: reusable blocks
Content fragments that can be included by reference in multiple presentations. When a block is edited, all presentations using it are flagged for re-export. See `/docs/features.md#reusable-blocks`.

### Phase 8: PPTX export
Add PPTX export using pptxgenjs. Each template gets a parallel PPTX builder function. Acceptance: file opens in Google Slides and looks professional. Does not need to be pixel-identical to PDF.

### Phase 9: dashboard and presentation library
List all presentations with metadata: name, category, last updated, translation status, quick actions (edit, preview, export, duplicate). See `/docs/features.md#dashboard`.

### Phase 10: feedback workflow
Review links, page-pinned comments, open/resolved status. See `/docs/features.md#feedback`.

## Rules for every session

1. Commit to git after every working state. Never go more than one feature without a commit.
2. One feature per session. Test before moving on.
3. Content fields are always plain text. The only inline formatting is `**bold**` via markdown double asterisks. No rich text editors. Ever.
4. Every text field must support three languages via tabs (EN, zh-TW, zh-CN).
5. Templates use absolute positioning within the 960x540 container. No flexbox for slide layout.
6. The tool UI uses a light theme (bg: #F2F2F2). Slide backgrounds are also #F2F2F2.
7. Images are stored as base64 in IndexedDB for the MVP.
8. All charts use the MoreHarvest color palette (#FBB931 bars, #1A1A1A labels). No chart configuration UI beyond data entry.
9. When in doubt, refer to the Oakwater PDF as the visual benchmark.
10. Do not build future expansion features (Google Docs import, user accounts, version history, batch export) unless explicitly asked.

## File structure

```
/src
  /components
    /editor        -- content editor, form fields, language tabs
    /templates     -- 20 page template React components
    /preview       -- live preview renderer
    /dashboard     -- presentation library
    /assets        -- asset library UI
    /feedback      -- review and comment system
  /lib
    /export        -- PDF and PPTX generation
    /translation   -- Anthropic API integration, glossary
    /store         -- Zustand store, data model
  /types           -- TypeScript interfaces for all data
/docs
  /templates.md    -- detailed specs for all 20 page types
  /features.md     -- acceptance criteria for all 8 MVP features
  /brand.md        -- complete brand reference (source of truth for colors, fonts, logos)
/public
  /assets          -- uploaded images, logos, icons
```

## Data model (core types)

```ts
interface Presentation {
  id: string;
  name: string;
  category: 'investor-deck' | 'partner-deck' | 'brochure';
  partnerName?: string;
  dimensions: { width: 960; height: 540 };
  pages: Page[];
  glossary: GlossaryEntry[];
  metadata: PresentationMetadata;
}

interface Page {
  id: string;
  order: number;
  type: PageType; // 'cover' | 'value-proposition' | 'section-divider' | ...
  content: Record<string, TranslatableField | string | TableData | ChartData>;
  reusableBlockId?: string;
}

interface TranslatableField {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
  translationStatus: {
    'zh-tw': 'auto-translated' | 'reviewed' | 'outdated' | 'empty';
    'zh-cn': 'auto-translated' | 'reviewed' | 'outdated' | 'empty';
  };
}

interface GlossaryEntry {
  en: string;
  'zh-tw': string;
  'zh-cn': string;
}

interface ReusableBlock {
  id: string;
  name: string;
  type: PageType;
  content: Record<string, TranslatableField | string>;
  usedIn: string[]; // presentation IDs
}

interface Asset {
  id: string;
  name: string;
  filename: string;
  category: 'photos' | 'logos' | 'icons' | 'charts' | 'maps';
  data: string; // base64 for MVP
  usedIn: string[];
}
```

## Page types (22 templates)

Each template is a React component accepting `content` and `language` props, rendering at 960x540px with absolute positioning.

| # | Type | Key elements | Used on (Oakwater) |
|---|---|---|---|
| 1 | Cover | Logo top-left, year top-right, headline left-half, circular hero image right-half | p.1 |
| 2 | Value proposition | Gold accent bar, checkmark badges row, body paragraph with bold emphasis | p.2 |
| 3 | Diagram/branching | Circular logo left, connected branch points with headings and body text right | p.3 |
| 4 | Index/TOC | Header bar with logo, numbered section groups with page refs, oval image right | p.4 |
| 5 | Section divider | Section letter/number, large title, minimal layout, heavy whitespace | p.5,11,16,21,27,29,31 |
| 6 | Long-form text (2-col) | Header bar, page title, two-column body, bold closing statement, page number | p.6 |
| 7 | Timeline + image | Vertical timeline with dated entries left, large captioned photo right | p.7 |
| 8 | Text + chart | Bold heading and bullet list left, bar/line chart right with labeled axes | p.8 |
| 9 | Multi-card grid | 2-column grid, each card has gold icon + bold heading + bullets, 4-6 per page | p.9-10 |
| 10 | Map + text | Three modes: (A) map left + stacked org cards right with gold arrow connectors between cards, (B) map left + two-column property list + summary table right, (C) map full-width with floating label callouts overlaid on the image. Mode selected via radio control in the editor. Map is always a user-uploaded image, never a live map. | p.12, 18, 30 |
| 11 | Text + images | Text with headings/bullets left, logo/photos with captions right | p.13 |
| 12 | Before/after grid | 2x2 image pairs with "before"/"after" labels and arrows | p.14 |
| 13 | Photo gallery | 3x3 or similar photo grid, no body text, header only | p.15 |
| 14 | Data table | Heading, subtitle, full-width table, gold/yellow header row, optional highlight row, footnotes | p.17 |
| 15 | Comparison table | Two-column branded comparison (MoreHarvest logo vs competitor), MH column highlighted, source citations | p.19,23-25 |
| 16 | Three circles | Centered heading, three overlapping circles with headings and body text | p.22 |
| 17 | Text + news clippings | Bullet content left, screenshot images with captions right | p.26 |
| 18 | Flow chart / org structure | Color-coded jurisdiction boxes, relationship arrows, legend, footnotes | p.28 |
| 19 | Disclaimer | Long-form legal text, smaller font, multiple paragraphs, header bar only | p.33 |
| 20 | Contact / closing | Large centered circular logo, company details bottom-left, URL bottom-right | p.34 |
| 21 | Partner profile | Centered partner logo image top-center, body paragraph below with bold+inline text support, optional labeled link section (bold label + URL on its own line), contact block bottom-left (multiline plain text), URL bottom-right | p.32 |
| 22 | Logos + text + table image | Left column: 2–4 partner entries each with an uploaded logo image + bold heading + bullet list. Right column: table title text, uploaded table image (screenshot), footnote text below table, source text below footnote | p.20 |

Detailed element specs (positions, sizes, fonts, required/optional fields) are in `/docs/templates.md`.

## MVP features summary

8 features, built in the phase order above:

1. **Content editor.** Structured form per page type. Plain text fields with trilingual tabs. Image picker (upload or choose from library). Chart/table data entry via spreadsheet-like grid. No rich text. No formatting controls.
2. **Translation engine.** Anthropic API with term glossary. Per-field status tracking (auto-translated / reviewed / outdated / empty). Global "translate all" button. Individual field translate button.
3. **Template renderer.** 22 React components rendering at 960x540. Live preview updates on keystroke. Absolute positioning. Brand-enforced styling.
4. **PDF export.** Single language or all-languages zip. Fonts embedded, images sharp, dimensions correct. Must be indistinguishable from hand-crafted output.
5. **PPTX export.** Single language or all-languages zip. Opens cleanly in Google Slides. Professional, not pixel-perfect. Embedded fonts and images.
6. **Asset library.** Upload once, reference everywhere. Categories: photos, logos, icons, charts, maps. Usage tracking per asset.
7. **Reusable blocks.** Shared content fragments included by reference. Edit once, all linked presentations flagged for re-export.
8. **Feedback workflow.** Shareable review links. Comments pinned to page numbers. Open/resolved status. Comment history preserved.

Full acceptance criteria per feature are in `/docs/features.md`.

## App navigation

Six views:
1. Dashboard -- all presentations, reusable blocks, recent activity, quick stats.
2. Presentation editor -- three-column layout (page list / content fields / live preview).
3. Full preview -- full-screen rendered presentation with page nav and zoom.
4. Asset library -- grid view, upload, tag, search, usage tracking.
5. Reusable blocks -- block library with content fields and linked presentations list.
6. Review view -- shareable link, rendered presentation with comment sidebar, no account required.

Top nav: logo, dashboard, assets, blocks, user menu.

## Design direction

- Light UI theme. All backgrounds are #F2F2F2.
- Text: #1A1A1A. Accent: #FBB931. Borders: #E5E5E5.
- System fonts for tool UI. Brand fonts only inside template renders.
- Translation status color-coded: green (reviewed), yellow (auto-translated), red (outdated), gray (empty).
- Page list shows small thumbnails with type label and page number. Drag-and-drop reorder.
- The editor is the hero screen. Preview must be large enough to read text clearly.

## Error handling requirements

Every feature must handle these states:
- Empty state (0 pages, 0 presentations, 0 assets).
- Loading state (translation API in progress, PDF generating, image uploading).
- Error state (API failure, upload failure, invalid data).
- Confirmation before destructive actions (delete page, delete presentation, delete reusable block with linked presentations).

When Chinese text is significantly shorter than English, the template must still look balanced.

When a reusable block is deleted that's referenced by presentations, show a warning listing all affected presentations and require confirmation.

## Supporting docs (read when working on the relevant feature)

- `/docs/templates.md` -- specs for all 20 page templates with element positions, fonts, required/optional fields
- `/docs/features.md` -- detailed acceptance criteria for each MVP feature
- `/docs/brand.md` -- complete brand reference (source of truth for all colors, fonts, logos)

## Success criteria

The tool works when:
- The 34-page Oakwater deck can be recreated from structured content in under 2 hours.
- Updating a presentation after feedback takes under 30 minutes.
- Translating to both Chinese variants takes under 2 hours including human review.
- A core fact change propagates to all affected presentations via re-export in under 15 minutes.
- PDF output is indistinguishable from hand-crafted slides.
- Presentation work drops from 80% to 20% of total work hours.

## Future expansions (do not build unless explicitly asked)

- Google Docs import
- Vercel Blob storage for images (replacing IndexedDB)
- User accounts for team access
- Version history / rollback
- Batch export (all presentations in one click)
- Portrait and custom dimension support
- Per-page PNG export
- Figma plugin integration
