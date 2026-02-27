import './photo-gallery-page.css';

interface PhotoGalleryContent {
  sectionLabel?: string;
  year?: string;
  photos: (string | null)[]; // base64 data URLs or null for placeholder
}

interface PhotoGalleryPageProps {
  content: PhotoGalleryContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const GRID_WIDTH = 900;
const GRID_HEIGHT = 460;
const GAP = 3;

/**
 * Compute row distribution for photo count.
 * - 1–4: 1 row
 * - 5–8: 2 rows
 * - 9–12: 3 rows
 * - 13–16: 4 rows
 * Extra photos go to earlier rows (e.g. 11 → 4-4-3).
 */
function computeRowDistribution(count: number): number[] {
  if (count <= 0) return [];
  const clamped = Math.min(count, 16);

  let numRows: number;
  if (clamped <= 4) numRows = 1;
  else if (clamped <= 8) numRows = 2;
  else if (clamped <= 12) numRows = 3;
  else numRows = 4;

  const base = Math.floor(clamped / numRows);
  const remainder = clamped % numRows;

  const rows: number[] = [];
  for (let r = 0; r < numRows; r++) {
    rows.push(base + (r < remainder ? 1 : 0));
  }
  return rows;
}

/**
 * Compute cell positions for all photos.
 * Returns array of { x, y, w, h } for each photo.
 */
function computeCellPositions(count: number): { x: number; y: number; w: number; h: number }[] {
  const rowDist = computeRowDistribution(count);
  if (rowDist.length === 0) return [];

  const numRows = rowDist.length;
  const totalVerticalGap = GAP * (numRows - 1);
  const cellHeight = (GRID_HEIGHT - totalVerticalGap) / numRows;

  const cells: { x: number; y: number; w: number; h: number }[] = [];
  let photoIdx = 0;

  for (let r = 0; r < numRows; r++) {
    const colsInRow = rowDist[r];
    const totalHorizontalGap = GAP * (colsInRow - 1);
    const cellWidth = (GRID_WIDTH - totalHorizontalGap) / colsInRow;
    const y = r * (cellHeight + GAP);

    for (let c = 0; c < colsInRow; c++) {
      if (photoIdx >= count) break;
      cells.push({
        x: c * (cellWidth + GAP),
        y,
        w: cellWidth,
        h: cellHeight,
      });
      photoIdx++;
    }
  }

  return cells;
}

export default function PhotoGalleryPage({ content, language = 'en' }: PhotoGalleryPageProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';
  const photos = content.photos || [];

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  const cells = computeCellPositions(photos.length);

  return (
    <div className="photo-gallery-page">
      {/* Wordmark */}
      <img
        className="photo-gallery-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="photo-gallery-page__year" style={{ fontFamily }}>{year}</div>

      {/* Section label */}
      {label && (
        <p className="photo-gallery-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="photo-gallery-page__rule" />

      {/* Photo grid */}
      <div className="photo-gallery-page__grid">
        {photos.map((photo, idx) => {
          if (idx >= cells.length) return null;
          const cell = cells[idx];
          return (
            <div
              key={idx}
              className="photo-gallery-page__cell"
              style={{
                left: cell.x,
                top: cell.y,
                width: cell.w,
                height: cell.h,
              }}
            >
              {photo ? (
                <img src={photo} alt="" />
              ) : (
                <div className="photo-gallery-page__cell-placeholder" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
