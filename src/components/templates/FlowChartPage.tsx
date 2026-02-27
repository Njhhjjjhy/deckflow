import './flow-chart-page.css';

interface FlowChartNode {
  id: string;
  heading: string;
  body: string;
  fillColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface FlowChartArrow {
  id: string;
  sourceId: string;
  targetId: string;
  bidirectional: boolean;
  label: string;
  labelPosition: 'above' | 'below' | 'left' | 'right';
}

interface FlowChartLegendItem {
  color: string;
  label: string;
}

interface FlowChartFootnote {
  text: string;
  visible: boolean;
}

interface FlowChartContent {
  sectionLabel?: string;
  year?: string;
  pageNumber?: number;
  nodes: FlowChartNode[];
  arrows: FlowChartArrow[];
  arrowColor: string;
  legend: FlowChartLegendItem[];
  footnotes: FlowChartFootnote[];
}

interface FlowChartPageProps {
  content: FlowChartContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

const CHART_W = 690;
const CHART_H = 460;

/** Find where a line from rectangle center exits the rectangle boundary. */
function getEdgePoint(
  cx: number, cy: number,
  hw: number, hh: number,
  tx: number, ty: number
): { x: number; y: number } {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const t = absDx * hh > absDy * hw ? hw / absDx : hh / absDy;
  return { x: cx + dx * t, y: cy + dy * t };
}

export default function FlowChartPage({ content, language = 'en' }: FlowChartPageProps) {
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

  const arrowColor = content.arrowColor || '#1A1A1A';

  // Build node lookup for arrow rendering
  const nodeMap = new Map<string, FlowChartNode>();
  for (const node of content.nodes) {
    nodeMap.set(node.id, node);
  }

  // Compute arrow geometry
  const arrowLines = content.arrows.map((arrow) => {
    const src = nodeMap.get(arrow.sourceId);
    const tgt = nodeMap.get(arrow.targetId);
    if (!src || !tgt) return null;

    const scx = (src.x / 100) * CHART_W + src.width / 2;
    const scy = (src.y / 100) * CHART_H + src.height / 2;
    const tcx = (tgt.x / 100) * CHART_W + tgt.width / 2;
    const tcy = (tgt.y / 100) * CHART_H + tgt.height / 2;

    const start = getEdgePoint(scx, scy, src.width / 2, src.height / 2, tcx, tcy);
    const end = getEdgePoint(tcx, tcy, tgt.width / 2, tgt.height / 2, scx, scy);

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    let labelX = midX;
    let labelY = midY;
    let textAnchor: 'middle' | 'end' | 'start' = 'middle';
    if (arrow.label) {
      switch (arrow.labelPosition) {
        case 'above': labelY -= 8; break;
        case 'below': labelY += 14; break;
        case 'left': labelX -= 8; textAnchor = 'end'; break;
        case 'right': labelX += 8; textAnchor = 'start'; break;
      }
    }

    return { ...arrow, start, end, labelX, labelY, textAnchor };
  }).filter(Boolean) as (FlowChartArrow & { start: { x: number; y: number }; end: { x: number; y: number }; labelX: number; labelY: number; textAnchor: string })[];

  return (
    <div className="flow-chart-page">
      {/* Wordmark — top-left */}
      <img
        className="flow-chart-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="flow-chart-page__year">{year}</div>

      {/* Section label */}
      {label && (
        <p className="flow-chart-page__label" style={{ fontFamily }}>
          {label}
        </p>
      )}

      {/* Horizontal rule */}
      <hr className="flow-chart-page__rule" />

      {/* Left panel — legend + footnotes */}
      <div className="flow-chart-page__left-panel">
        <div className="flow-chart-page__legend">
          {content.legend.map((item, i) => (
            <div key={i} className="flow-chart-page__legend-row">
              <div
                className="flow-chart-page__legend-swatch"
                style={{ background: item.color }}
              />
              <p className="flow-chart-page__legend-label" style={{ fontFamily }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flow-chart-page__footnotes">
          {content.footnotes
            .filter((fn) => fn.visible && fn.text)
            .map((fn, i) => (
              <p key={i} className="flow-chart-page__footnote" style={{ fontFamily }}>
                {fn.text}
              </p>
            ))}
        </div>
      </div>

      {/* Flow chart area */}
      <div className="flow-chart-page__chart">
        {/* SVG arrows (rendered behind nodes) */}
        <svg className="flow-chart-page__arrows-svg" viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
          <defs>
            <marker
              id="fc-arrow-end"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={arrowColor} />
            </marker>
            <marker
              id="fc-arrow-start"
              markerWidth="10"
              markerHeight="7"
              refX="1"
              refY="3.5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <polygon points="10 0, 0 3.5, 10 7" fill={arrowColor} />
            </marker>
          </defs>

          {arrowLines.map((a) => (
            <g key={a.id}>
              <line
                x1={a.start.x}
                y1={a.start.y}
                x2={a.end.x}
                y2={a.end.y}
                stroke={arrowColor}
                strokeWidth="1.5"
                markerEnd="url(#fc-arrow-end)"
                markerStart={a.bidirectional ? 'url(#fc-arrow-start)' : undefined}
              />
              {a.label && (
                <text
                  x={a.labelX}
                  y={a.labelY}
                  textAnchor={a.textAnchor}
                  style={{
                    fontFamily,
                    fontSize: '9px',
                    fontWeight: 400,
                    fill: '#333333',
                  }}
                >
                  {a.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Nodes */}
        {content.nodes.map((node) => (
          <div
            key={node.id}
            className="flow-chart-page__node"
            style={{
              left: `${(node.x / 100) * CHART_W}px`,
              top: `${(node.y / 100) * CHART_H}px`,
              width: `${node.width}px`,
              height: `${node.height}px`,
              borderRadius: `${node.borderRadius}px`,
              background: node.fillColor,
            }}
          >
            <p className="flow-chart-page__node-heading" style={{ fontFamily: headingFontFamily }}>
              {node.heading}
            </p>
            {node.body && (
              <p className="flow-chart-page__node-body" style={{ fontFamily }}>
                {node.body}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Page number — bottom center */}
      {content.pageNumber !== undefined && (
        <p className="flow-chart-page__page-number">
          {content.pageNumber}
        </p>
      )}
    </div>
  );
}
