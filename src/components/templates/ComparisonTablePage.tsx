import './comparison-table-page.css';

interface ComparisonRowItem {
  label: string;
  moreHarvestValue: string;
  competitorValue: string;
}

interface ComparisonTableContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  heading: string;
  competitorHeaderLabel: string;
  rows: ComparisonRowItem[];
  sourceCitation?: string;
}

interface ComparisonTablePageProps {
  content: ComparisonTableContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function ComparisonTablePage({ content, language = 'en' }: ComparisonTablePageProps) {
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

  // Calculate if rows overflow and need font reduction
  // Content area starts at y=68, heading ~25px + margin 10px = 35px, table starts ~y=103
  // Source citation ~17px + margin 8px = 25px, page number at y=524
  // Available for table: 524 - 103 - (source ? 25 : 0) = ~396px (with source) or ~421px (without)
  const hasSource = !!(content.sourceCitation);
  const availableHeight = hasSource ? 396 : 421;
  const headerHeight = 60;
  const minRowHeight = 40;
  const neededHeight = headerHeight + content.rows.length * minRowHeight;
  const baseFontSize = 12;
  let fontSize = baseFontSize;
  if (neededHeight > availableHeight && content.rows.length > 0) {
    const maxRowSpace = availableHeight - headerHeight;
    const rowHeight = Math.max(28, Math.floor(maxRowSpace / content.rows.length));
    fontSize = Math.max(9, Math.floor(baseFontSize * (rowHeight / minRowHeight)));
  }

  const renderCellValue = (value: string) => {
    if (!value) {
      return <span className="comparison-table-page__empty">[no translation]</span>;
    }
    return value;
  };

  return (
    <div className="comparison-table-page">
      {/* Wordmark */}
      <img
        className="comparison-table-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year */}
      <div className="comparison-table-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="comparison-table-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="comparison-table-page__rule" />

      {/* Content area */}
      <div className="comparison-table-page__content">
        <h2 className="comparison-table-page__heading" style={{ fontFamily: headingFontFamily }}>
          {content.heading}
        </h2>

        {/* Table */}
        <table className="comparison-table-page__table" style={{ fontFamily }}>
          <colgroup>
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>{/* empty row-label header */}</th>
              <th>
                <img
                  className="comparison-table-page__header-logo"
                  src="/assets/logo-moreharvest.svg"
                  alt="MoreHarvest"
                />
              </th>
              <th>{content.competitorHeaderLabel}</th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, ri) => (
              <tr key={ri}>
                <td style={{ fontSize }}>{renderCellValue(row.label)}</td>
                <td style={{ fontSize }}>{renderCellValue(row.moreHarvestValue)}</td>
                <td style={{ fontSize }}>{renderCellValue(row.competitorValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Source citation */}
        {content.sourceCitation && (
          <p className="comparison-table-page__source" style={{ fontFamily }}>
            {content.sourceCitation}
          </p>
        )}
      </div>

      {/* Page number */}
      {content.pageNumber !== undefined && (
        <p className="comparison-table-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
