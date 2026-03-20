# Color

## Neutral scale


| Token      | Hex     | Use                            |
|------------|---------|--------------------------------|
| neutral0   | #F2F2F2 | Slide and page backgrounds     |
| neutral50  | #E8E8E8 | Inner card bg, odd table rows  |
| neutral100 | #DEDEDE | Tool UI bg, header bar, badges |
| neutral200 | #C8C8C8 | Borders, dividers              |
| neutral300 | #ADADAD | Placeholder text               |
| neutral400 | #939393 | —                              |
| neutral500 | #787878 | Page numbers, footnotes        |
| neutral600 | #5E5E5E | Captions, breadcrumbs          |
| neutral700 | #444444 | KV keys, supporting copy       |
| neutral800 | #2A2A2A | Secondary text                 |
| neutral900 | #1A1A1A | Primary text                   |
| neutral950 | #111111 | Maximum contrast               |

## Brand

| Token         | Hex     | Use                              |
|---------------|---------|----------------------------------|
| brand-primary | #FBB931 | MoreHarvest gold — always use this alias |

## Amber

| Token    | Hex     | Use                      |
|----------|---------|--------------------------|
| amber50  | #FFFBEF | Table row highlight      |
| amber100 | #FFF3CD | Table header background  |
| amber200 | #FFE699 | —                        |
| amber500 | #FBB931 | —                        |

## Status

| Token   | Hex     |
|---------|---------|
| success | #22C55E |
| warning | #F59E0B |
| error   | #EF4444 |

## Semantic aliases

| Token               | Resolves to | Use                        |
|---------------------|-------------|----------------------------|
| text-primary        | neutral900  | All body text              |
| text-secondary      | neutral800  | Supporting text            |
| text-muted          | neutral600  | Captions, breadcrumbs      |
| text-placeholder    | neutral300  | Placeholder text           |
| surface-default     | neutral0    | Slide and page backgrounds |
| surface-raised      | neutral100  | Header bar, raised surfaces|
| surface-card        | neutral50   | Inner card backgrounds     |
| border-default      | neutral200  | All borders and dividers   |
| table-header-bg     | amber100    | Table header rows          |
| table-row-alt       | neutral50   | Alternating table rows     |
| table-row-highlight | amber50     | Highlighted table rows     |

## Accessibility

All text must pass WCAG AA. Min 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold).
