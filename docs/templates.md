# Template specs

## Template 1: cover page

Canvas: 960 x 540px
Background: #F2F2F2

### Elements

**Header bar**
- Position: x=0, y=0, width=960, height=56px
- Background: #F2F2F2
- Bottom border: 1px solid #E5E5E5

**MoreHarvest logo**
- Position: x=40, y=13
- Height: 30px, width auto
- Logo image file from /docs/brand.md

**Year**
- Position: top-right, x=920 (right-aligned), y=18
- Font: Noto Sans JP Regular, #1A1A1A
- Font size: 14px
- Content: current year (default) or overridden by year field

**Headline**
- Position: x=60, y=220
- Max width: 400px
- Font: REM SemiBold, #1A1A1A
- Font size: 36–48px (scale down if text exceeds 3 lines)
- Supports **bold** markup (double asterisks = bold span)
- Vertically centered in body area (y=56 to y=540)

**Hero image**
- Shape: circle, diameter 280px
- Center: x=672, y=300
- Object-fit: cover

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| headline | single-line text | yes | supports **bold** markup |
| heroImage | image | yes | circular crop, object-fit cover |
| year | single-line text | no | defaults to current year |

### Edge cases
- Headline over 3 lines: reduce font size to 28px minimum.
- No hero image: gray circle placeholder (#E8E8E8) with dashed #CCCCCC border.
- Chinese headline: use Noto Sans TC or Noto Sans SC, same size rules apply.

## Template 9: multi-card grid

Canvas: 960 x 540px
Background: #F2F2F2
Oakwater reference: pages 9–10

### Header area (shared pattern)

**MoreHarvest logo**
- Position: x=30, y=14, height=22px, width auto

**Year**
- Position: right-aligned, right=30, y=14
- Font: Noto Sans JP Regular 13px, #1A1A1A

**Section label**
- Position: x=30, y=38
- Font: Noto Sans JP Regular 11px, #333333

**Horizontal rule**
- Position: x=30, y=54, width=900px, 1px solid #E5E5E5

**Page number**
- Position: horizontally centered, y=524
- Font: Noto Sans JP Regular 11px, #333333

### Content area

- Position: x=30, y=70, width=900px, height=445px
- Two equal columns:
  - Left column: x=30, width=430px
  - Right column: x=500, width=430px
- Cards distributed left-to-right, top-to-bottom (card 1 left, card 2 right, card 3 left, etc.)
- 4–10 cards supported

### Card layout (per card)

**Icon**
- Size: 28×28px
- Rendered as `<img>` from uploaded image (base64 in IndexedDB)
- If no image uploaded: 28×28px dashed gray placeholder (#CCCCCC border)

**Heading**
- Position: x = icon right edge + 10px, vertically centered with icon
- Font: REM SemiBold 15px (EN) / Noto Sans TC or SC 700 (Chinese), #1A1A1A

**Body**
- Position: below heading + 6px, x=38px (aligned with heading left edge)
- Font: Noto Sans JP Regular 12px, #333333, line-height 1.5
- Wraps within column width

**Bullets** (when bodyType = 'bullets')
- Each bullet: filled circle 4px at x=0, text at x=14px
- Min 1, max 5 bullets per card

**Paragraph** (when bodyType = 'paragraph')
- Plain wrapping text

**Card gap**
- 20px between cards in the same column

### Content model

```ts
interface MultiCardGridContent {
  sectionLabel: TranslatableField;
  year: string;
  pageNumber: number;
  cards: CardItem[];  // min 4, max 10
}

interface CardItem {
  icon: string | null;   // base64 image key in IndexedDB, null if not yet uploaded
  heading: TranslatableField;
  bodyType: 'bullets' | 'paragraph';
  bullets?: TranslatableField[];   // min 1, max 5, used when bodyType='bullets'
  paragraph?: TranslatableField;   // used when bodyType='paragraph'
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| sectionLabel | single-line text (trilingual) | no | e.g. "02 \| Our Strengths" |
| year | single-line text | no | defaults to current year |
| pageNumber | number | no | displayed at bottom center |
| cards | card list (4–10) | yes | each card has icon, heading, body |

Per card:

| Field | Type | Required | Notes |
|---|---|---|---|
| icon | image upload | no | 28×28px, .png/.svg/.webp/.jpg, max 1MB |
| heading | single-line text (trilingual) | yes | bold heading next to icon |
| bodyType | toggle | yes | "Bullets" or "Paragraph" |
| bullets | list of single-line text (trilingual) | conditional | 1–5 items, when bodyType='bullets' |
| paragraph | multi-line text (trilingual) | conditional | when bodyType='paragraph' |

### Edge cases
- No icon uploaded: 28×28px dashed gray placeholder square in template.
- Upload error: error toast, field reverts to previous state.
- Chinese text significantly shorter than English: layout must still look balanced.
- Card content exceeds available vertical height: reduce body font size proportionally (min 9px) rather than clipping.

## Template 8: text + chart

Canvas: 960 x 540px
Background: #F2F2F2
Oakwater reference: page 8

### Header area (shared pattern)

**MoreHarvest logo**
- Position: x=30, y=14, height=22px, width auto

**Year**
- Position: right-aligned, right=30, y=14
- Font: Noto Sans JP Regular 13px, #1A1A1A

**Section label**
- Position: x=30, y=38
- Font: Noto Sans JP Regular 11px, #333333

**Horizontal rule**
- Position: x=30, y=54, width=900px, 1px solid #E5E5E5

**Page number**
- Position: horizontally centered, y=524
- Font: Noto Sans JP Regular 11px, #333333

### Left column

- Position: x=30, y=80, width=430px

**Heading**
- Font: REM Bold 18px (EN) / Noto Sans TC or SC 700 (Chinese), #1A1A1A
- Line-height: 1.4
- Margin-bottom: 12px

**Bullets**
- Each bullet: filled circle 5px at x=0, top=8px relative to line, text starting at x=16px
- Font: Noto Sans JP Regular 13px, #333333, line-height 1.6
- Margin-bottom: 6px between bullets
- Min 1, max 8 bullets

### Right column

- Position: x=500, y=80, width=430px, height=400px
- Renders either a live bar chart (chartMode='data') or an uploaded image (chartMode='image')

**Chart mode = 'data'**

Chart title:
- Font: Noto Sans JP Regular 13px, #1A1A1A
- Margin-bottom: 8px

Bar chart (rendered with Recharts):
- Width: 430px, height: 360px
- Bars: fill=#FBB931, border-radius 2px top corners
- Value labels: inside each bar near top, font-size 12px, bold, #1A1A1A
- Y-axis: labeled with yAxisUnit suffix, gridlines at 25% intervals, font-size 11px, #333333
- X-axis: category labels, font-size 11px, #333333
- X-axis title: centered below x-axis labels, font-size 11px, #333333
- Y-axis title: rotated -90deg, left of y-axis, font-size 11px, #333333
- No legend, no border/background on chart area
- Bar width reduces proportionally when count exceeds 8

**Chart mode = 'image'**

- Image scaled to fill right column (object-fit: contain, max 430×400px)
- If no image uploaded: dashed gray placeholder (#CCCCCC border) with upload icon
- Optional caption: font-size 11px, #333333, centered below image, margin-top 6px

### Content model

```ts
interface TextChartContent {
  sectionLabel: TranslatableField;
  year: string;
  pageNumber: number;
  heading: TranslatableField;
  bullets: TranslatableField[];         // min 1, max 8
  chartMode: 'data' | 'image';
  // used when chartMode='data':
  chartTitle?: TranslatableField;
  xAxisLabel?: TranslatableField;
  yAxisLabel?: TranslatableField;
  yAxisUnit?: string;                   // e.g. "%"
  yAxisMax?: number;                    // e.g. 100
  bars?: BarItem[];                     // min 1, max 12
  // used when chartMode='image':
  chartImage?: string | null;           // base64, stored in IndexedDB
  chartImageCaption?: TranslatableField;
}

interface BarItem {
  label: string;
  value: number;
}
```

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| sectionLabel | single-line text (trilingual) | no | e.g. "02 \| About Us" |
| year | single-line text | no | defaults to current year |
| pageNumber | number | no | displayed at bottom center |
| heading | single-line text (trilingual) | yes | bold heading for left column |
| bullets | list of single-line text (trilingual) | yes | 1–8 items |
| chartMode | toggle | yes | "Data chart" or "Image" |

When chartMode = 'data':

| Field | Type | Required | Notes |
|---|---|---|---|
| chartTitle | single-line text (trilingual) | no | title above chart |
| xAxisLabel | single-line text (trilingual) | no | label below x-axis |
| yAxisLabel | single-line text (trilingual) | no | rotated label left of y-axis |
| yAxisUnit | single-line text | no | suffix for y-axis tick labels, e.g. "%" |
| yAxisMax | number | no | maximum y-axis value, e.g. 100 |
| bars | spreadsheet grid (label + value) | yes | 1–12 rows |

When chartMode = 'image':

| Field | Type | Required | Notes |
|---|---|---|---|
| chartImage | image upload | no | .jpg/.png/.webp/.svg, max 5MB |
| chartImageCaption | single-line text (trilingual) | no | optional caption below image |

### Edge cases
- Switching chart mode preserves both modes' data in state — toggling back restores it.
- chartMode='image' with no image uploaded: dashed gray placeholder in right column.
- Empty bullet text for a language: show "[no translation]" in light gray (#CCCCCC).
- Bar count exceeds 8: reduce bar width proportionally to fit.
