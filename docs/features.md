## Content editor rules

### Field types
- Single-line text: max 200 characters.
- Multi-line text: no character limit. Scroll in editor. Template handles overflow.
- Bold markup: **text** renders as bold. No other inline formatting.
- Image picker: accepts .jpg, .png, .webp. Max 5MB per file.
- List editor: add/remove/reorder items. Each item is single-line text. Min 1, max 20.
- Table editor: add/remove rows and columns. Each cell is plain text. Min 1x1, max 20x10.
- Chart data: columns are categories, rows are data series. Values are numbers only.

### Language tabs
- Three tabs per text field: EN, zh-TW, zh-CN.
- EN is always primary. Chinese fields start empty.
- Editing EN after Chinese is marked "reviewed" changes Chinese status to "outdated."

### Status indicators
- Green dot: reviewed.
- Yellow dot: auto-translated.
- Red dot: outdated (English changed after Chinese was reviewed).
- Gray dot: empty.

### Error states
- Image upload fails: show error toast, field reverts to previous state.
- Required field left empty: yellow border on field, warning icon in page list.
- Translation API fails: show error toast, field unchanged, retry button appears.
- Delete page: confirmation dialog.
- Delete reusable block with linked presentations: warning listing affected presentations.
