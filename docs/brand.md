# Brand — MoreHarvest

## Colors

| Token        | Hex     | Use                                      |
|--------------|---------|------------------------------------------|
| neutral0     | #F2F2F2 | Slide and page backgrounds               |
| neutral50    | #E8E8E8 | Inner card bg, odd table rows            |
| neutral100   | #DEDEDE | Tool UI bg, header bar, badges           |
| neutral200   | #C8C8C8 | Borders, dividers                        |
| neutral300   | #ADADAD | —                                        |
| neutral400   | #939393 | —                                        |
| neutral500   | #787878 | Page numbers, footnotes                  |
| neutral600   | #5E5E5E | Captions, breadcrumbs                    |
| neutral700   | #444444 | KV keys, supporting copy                 |
| neutral800   | #2A2A2A | Secondary text                           |
| neutral900   | #1A1A1A | Primary text                             |
| neutral950   | #111111 | Maximum contrast                         |
| brandPrimary | #FBB931 | MoreHarvest gold — always use this alias |
| amber50      | #FFFBEF | Table row highlight                      |
| amber100     | #FFF3CD | Table header background                  |
| amber200     | #FFE699 | —                                        |
| amber500     | #FBB931 | —                                        |
| success      | #22C55E | —                                        |
| warning      | #F59E0B | —                                        |
| error        | #EF4444 | —                                        |

## Semantic aliases

| Token             | Resolves to  | Use                     |
|-------------------|--------------|-------------------------|
| textPrimary       | neutral900   | All body text           |
| textSecondary     | neutral800   | Supporting text         |
| surfaceDefault    | neutral0     | Page and UI backgrounds |
| surfaceRaised     | neutral100   | Cards, raised elements  |
| borderDefault     | neutral200   | All borders             |
| tableHeaderBg     | amber100     | Table header rows       |
| tableRowAlt       | neutral50    | Alternating table rows  |
| tableRowHighlight | amber50      | Highlighted table rows  |

## Typography

| Role    | Font         | Weight |
|---------|--------------|--------|
| Heading | REM          | 600    |
| Label   | REM          | 600    |
| Body    | Noto Sans JP | 400    |
| Caption | Noto Sans JP | 400    |
| zh-TW   | Noto Sans TC | 400    |
| zh-CN   | Noto Sans SC | 400    |

Bold (700) is for inline body emphasis only. Never on headings.
For zh-TW and zh-CN, use the CJK font for both headings and body.

## Type scale

| Token | px |
|-------|----|
| xxl   | 64 |
| xl    | 48 |
| lg    | 36 |
| md    | 24 |
| sm    | 18 |
| xs    | 15 |
| xxs   | 13 |

## Line height

| Scale | English | CJK  |
|-------|---------|------|
| xxl   | 1.0     | 1.1  |
| xl    | 1.1     | 1.2  |
| lg    | 1.2     | 1.3  |
| md    | 1.25    | 1.4  |
| sm    | 1.3     | 1.5  |
| xs    | 1.55    | 1.65 |
| xxs   | 1.5     | 1.6  |

## Spacing

| Token | px |
|-------|----|
| sm    | 8  |
| md    | 16 |
| lg    | 24 |
| xl    | 32 |
| xxl   | 48 |

## Border radius

| Token | Value |
|-------|-------|
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| xxl   | 48px  |
| full  | 50%   |

## Canvas

| Orientation | Width | Height |
|-------------|-------|--------|
| Landscape   | 960px | 540px  |
| Portrait    | 720px | 1018px |

## Margins

| Orientation | x    | top  | bottom |
|-------------|------|------|--------|
| Landscape   | 48px | 40px | 32px   |
| Portrait    | 32px | 24px | 32px   |

## Header bar

Height: 48px

## Accessibility

All text must pass WCAG AA. Min 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold).

## Languages

en, zh-tw, zh-cn
