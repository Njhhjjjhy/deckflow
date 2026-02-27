import { View, Text, Image, Font, StyleSheet, Svg, Line, Circle } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

/* ------------------------------------------------------------------ */
/*  Register fonts                                                     */
/* ------------------------------------------------------------------ */

Font.register({
  family: 'REM',
  src: '/fonts/REM-SemiBold.ttf',
  fontWeight: 600,
});

Font.register({
  family: 'REM-Regular',
  src: '/fonts/REM-Regular.ttf',
  fontWeight: 400,
});

/* ------------------------------------------------------------------ */
/*  Layout constants — mirrors diagram-page.css positions              */
/* ------------------------------------------------------------------ */

const LOGO_CX = 170; // circle center x
const LOGO_CY = 270; // circle center y
const LOGO_R = 80;   // circle radius

const BRANCH_POSITIONS = [
  { x: 380, y: 90 },
  { x: 380, y: 240 },
  { x: 380, y: 390 },
];

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  logoContainer: {
    position: 'absolute',
    left: 90,
    top: 190,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logoPlaceholder: {
    position: 'absolute',
    left: 90,
    top: 190,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    backgroundColor: '#E8E8E8',
  },

  logoImage: {
    width: 160,
    height: 160,
    objectFit: 'cover',
  },

  lines: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 960,
    height: 540,
  },

  heading: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 22,
    color: '#1A1A1A',
    lineHeight: 1.3,
    marginBottom: 6,
  },

  body: {
    fontFamily: 'REM-Regular',
    fontWeight: 400,
    fontSize: 14,
    color: '#333333',
    lineHeight: 1.5,
    maxWidth: 500,
  },

  bold: {
    fontFamily: 'REM',
    fontWeight: 600,
  },
});

/* ------------------------------------------------------------------ */
/*  Bold text parser                                                   */
/* ------------------------------------------------------------------ */

function renderBody(text: string, bold: Style) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface DiagramBranch {
  heading: string;
  body: string;
}

interface DiagramPagePDFProps {
  logoImage?: string;
  branches: DiagramBranch[];
}

export default function DiagramPagePDF({ logoImage, branches }: DiagramPagePDFProps) {
  const activeBranches = branches.filter((b) => b.heading.trim());

  return (
    <View style={s.page}>
      {/* Logo circle */}
      {logoImage ? (
        <View style={s.logoContainer}>
          <Image style={s.logoImage} src={logoImage} />
        </View>
      ) : (
        <View style={s.logoPlaceholder} />
      )}

      {/* SVG connecting lines and gold nodes */}
      <Svg style={s.lines} viewBox="0 0 960 540">
        {activeBranches.map((_, i) => {
          if (i >= BRANCH_POSITIONS.length) return null;
          const bp = BRANCH_POSITIONS[i];
          const dx = bp.x - LOGO_CX;
          const dy = bp.y - LOGO_CY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const startX = LOGO_CX + (dx / dist) * LOGO_R;
          const startY = LOGO_CY + (dy / dist) * LOGO_R;
          return (
            <Line
              key={`line-${i}`}
              x1={startX}
              y1={startY}
              x2={bp.x}
              y2={bp.y}
              stroke="#E5E5E5"
              strokeWidth={2}
            />
          );
        })}
        {activeBranches.map((_, i) => {
          if (i >= BRANCH_POSITIONS.length) return null;
          const bp = BRANCH_POSITIONS[i];
          return (
            <Circle
              key={`node-${i}`}
              cx={bp.x}
              cy={bp.y}
              r={8}
              fill="#FBB931"
            />
          );
        })}
      </Svg>

      {/* Branch text content */}
      {activeBranches.map((branch, i) => {
        if (i >= BRANCH_POSITIONS.length) return null;
        const bp = BRANCH_POSITIONS[i];
        // Position text to the right of the node dot
        const textTop = bp.y - 12;
        return (
          <View key={i} style={{ position: 'absolute', left: 400, top: textTop }}>
            <Text style={s.heading}>{branch.heading}</Text>
            {branch.body ? (
              <Text style={s.body}>{renderBody(branch.body, s.bold)}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
