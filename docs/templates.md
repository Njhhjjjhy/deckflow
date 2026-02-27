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
