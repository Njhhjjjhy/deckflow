import { View, Text, Image, Font, StyleSheet, Svg, Path } from '@react-pdf/renderer';
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
/*  Styles — mirrors value-proposition-page.css positions              */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  accentBar: {
    position: 'absolute',
    left: 48,
    top: 155,
    width: 100,
    height: 8,
    borderRadius: 2,
  },

  badges: {
    position: 'absolute',
    left: 48,
    top: 195,
    flexDirection: 'row',
  },

  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 60,
  },

  badge: {
    width: 46,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeIcon: {
    width: 28,
    height: 28,
    objectFit: 'contain',
  },

  badgeLabel: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 26,
    color: '#1A1A1A',
    marginLeft: 8,
  },

  badgeLabelSmall: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 20,
    color: '#1A1A1A',
    marginLeft: 8,
  },

  body: {
    position: 'absolute',
    left: 48,
    top: 330,
    width: 864,
    fontFamily: 'REM-Regular',
    fontWeight: 400,
    fontSize: 18,
    lineHeight: 1.6,
    color: '#1A1A1A',
  },

  bodySmall: {
    position: 'absolute',
    left: 48,
    top: 330,
    width: 864,
    fontFamily: 'REM-Regular',
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.6,
    color: '#1A1A1A',
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
/*  Checkmark SVG for PDF                                              */
/* ------------------------------------------------------------------ */

function CheckmarkSvg() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M5 12l5 5L19 7"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ValuePropositionPDFProps {
  badge1Label: string;
  badge2Label: string;
  badge3Label: string;
  bodyText: string;
  badge1Icon?: string;
  badge2Icon?: string;
  badge3Icon?: string;
  accentBarVisible: boolean;
  accentBarColor: string;
}

export default function ValuePropositionPDF({
  badge1Label,
  badge2Label,
  badge3Label,
  bodyText,
  badge1Icon,
  badge2Icon,
  badge3Icon,
  accentBarVisible,
  accentBarColor,
}: ValuePropositionPDFProps) {
  const badges = [
    { label: badge1Label, icon: badge1Icon },
    { label: badge2Label, icon: badge2Icon },
    { label: badge3Label, icon: badge3Icon },
  ];

  // Estimate body lines for font size
  const lines = bodyText.split('\n');
  let totalLines = 0;
  for (const line of lines) {
    totalLines += Math.max(1, Math.ceil(line.length / 80));
  }
  const useSmallBody = totalLines > 3;

  return (
    <View style={s.page}>
      {/* Accent bar */}
      {accentBarVisible && (
        <View style={[s.accentBar, { backgroundColor: accentBarColor }]} />
      )}

      {/* Badges row */}
      <View style={s.badges}>
        {badges.map((badge, i) => (
          <View key={i} style={[s.badgeGroup, i === 2 ? { marginRight: 0 } : {}]}>
            <View style={[s.badge, { backgroundColor: '#FBB931' }]}>
              {badge.icon ? (
                <Image style={s.badgeIcon} src={badge.icon} />
              ) : (
                <CheckmarkSvg />
              )}
            </View>
            <Text style={badge.label.length > 15 ? s.badgeLabelSmall : s.badgeLabel}>
              {badge.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Body */}
      <Text style={useSmallBody ? s.bodySmall : s.body}>
        {renderBody(bodyText, s.bold)}
      </Text>
    </View>
  );
}
