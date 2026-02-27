import './data-table-page.css';

interface ColumnItem {
  label: string;
  widthPercent: number;
}

interface CellItem {
  value: string;
  highlighted: boolean;
}

interface RowItem {
  cells: CellItem[];
  highlighted: boolean;
}

interface DataTableContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading: string;
  subtitle: string;
  columns: ColumnItem[];
  rows: RowItem[];
  footnotes: string[];
}

interface DataTablePageProps {
  content: DataTableContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function DataTablePage({ content, language = 'en' }: DataTablePageProps) {
  const year = content.year || new Date().getFullYear().toString();
  const label = content.sectionLabel || '';

  const fontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'Noto Sans JP', sans-serif";

  const headingFontFamily =
    language === 'zh-tw'
      ? "'Noto Sans TC', sans-serif"
      : language === 'zh-cn'
        ? "'Noto Sans SC', sans-serif"
        : "'REM', sans-serif";

  // Normalize column widths: if they don't sum to 100, distribute remaining evenly
  const totalWidth = content.columns.reduce((sum, c) => sum + c.widthPercent, 0);
  const columns = content.columns.map((col) => {
    if (totalWidth === 100 || totalWidth === 0) return col;
    const remaining = 100 - totalWidth;
    const extra = remaining / content.columns.length;
    return { ...col, widthPercent: col.widthPercent + extra };
  });

  // Calculate available height for table rows to avoid overflow
  // Header area ends at y=68. Content starts there.
  // Heading ~25px, subtitle ~22px, gap ~10px = ~57px before table
  // Page number at y=524, footnotes need space above it
  // Available for table: roughly y=125 to y=510 minus footnotes
  const footnoteHeight = content.footnotes.length * 17 + (content.footnotes.length > 0 ? 8 : 0);
  const maxTableY = 524 - 68 - 57 - footnoteHeight; // available px for table
  const totalRows = content.rows.length + 1; // +1 for header
  const defaultRowHeight = 34;
  const neededHeight = totalRows * defaultRowHeight;
  const rowHeight = neededHeight > maxTableY && maxTableY > 0
    ? Math.max(20, Math.floor(maxTableY / totalRows))
    : defaultRowHeight;

  return (
    <div className="data-table-page">
      {/* Wordmark */}
      <img
        className="data-table-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="data-table-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="data-table-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="data-table-page__rule" />

      {/* Content area */}
      <div className="data-table-page__content">
        <h2 className="data-table-page__heading" style={{ fontFamily: headingFontFamily }}>
          {content.heading}
        </h2>
        <p className="data-table-page__subtitle" style={{ fontFamily }}>
          {content.subtitle}
        </p>

        {/* Table */}
        {columns.length > 0 && (
          <table className="data-table-page__table" style={{ fontFamily }}>
            <colgroup>
              {columns.map((col, ci) => (
                <col key={ci} style={{ width: `${col.widthPercent}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((col, ci) => (
                  <th key={ci} style={{ height: rowHeight }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={row.highlighted ? 'data-table-page__row--highlighted' : ''}
                >
                  {row.cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className={cell.highlighted ? 'data-table-page__cell--highlighted' : ''}
                      style={{ height: rowHeight }}
                    >
                      {cell.value || (
                        <span style={{ color: '#CCCCCC', fontWeight: 400 }}>[no translation]</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footnotes */}
        {content.footnotes.length > 0 && (
          <div className="data-table-page__footnotes">
            {content.footnotes.map((fn, i) => (
              <p key={i} className="data-table-page__footnote" style={{ fontFamily }}>
                {fn}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="data-table-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
