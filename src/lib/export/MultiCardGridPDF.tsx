import { View, Text, Image, Font, StyleSheet } from '@react-pdf/renderer';
import LogoPDF from './LogoPDF';

/* ------------------------------------------------------------------ */
/*  Register fonts                                                     */
/* ------------------------------------------------------------------ */

Font.register({
  family: 'REM',
  src: '/fonts/REM-SemiBold.ttf',
  fontWeight: 600,
});

Font.register({
  family: 'Noto Sans JP',
  src: '/fonts/NotoSansJP-Regular.ttf',
  fontWeight: 400,
});

Font.register({
  family: 'Noto Sans JP Bold',
  src: '/fonts/NotoSansJP-Bold.ttf',
  fontWeight: 700,
});

/* ------------------------------------------------------------------ */
/*  Styles — mirrors multi-card-grid-page.css positions               */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  wordmark: {
    position: 'absolute',
    left: 30,
    top: 14,
  },

  year: {
    position: 'absolute',
    right: 30,
    top: 14,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
    textAlign: 'right',
  },

  label: {
    position: 'absolute',
    left: 30,
    top: 38,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#333333',
  },

  rule: {
    position: 'absolute',
    top: 54,
    left: 30,
    width: 900,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },

  pageNumber: {
    position: 'absolute',
    top: 524,
    left: 0,
    width: 960,
    textAlign: 'center',
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 11,
    color: '#333333',
  },

  contentArea: {
    position: 'absolute',
    left: 30,
    top: 70,
    width: 900,
    height: 445,
    flexDirection: 'row',
  },

  leftColumn: {
    width: 430,
  },

  rightColumn: {
    position: 'absolute',
    left: 470,
    width: 430,
  },

  card: {
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    width: 28,
    height: 28,
    objectFit: 'contain',
  },

  iconPlaceholder: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
  },

  heading: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 10,
  },

  bulletItem: {
    flexDirection: 'row',
    marginLeft: 38,
    marginTop: 2,
  },

  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333333',
    marginTop: 5,
    marginRight: 10,
  },

  bulletText: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.5,
    flex: 1,
  },

  paragraph: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.5,
    marginLeft: 38,
    marginTop: 6,
  },
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CardProps {
  icon: string | null;
  heading: string;
  bodyType: 'bullets' | 'paragraph';
  bullets?: string[];
  paragraph?: string;
}

interface MultiCardGridPDFProps {
  sectionLabel: string;
  year: string;
  pageNumber?: number;
  cards: CardProps[];
}

export default function MultiCardGridPDF({
  sectionLabel,
  year,
  pageNumber,
  cards,
}: MultiCardGridPDFProps) {
  const leftCards: CardProps[] = [];
  const rightCards: CardProps[] = [];
  cards.forEach((card, i) => {
    if (i % 2 === 0) leftCards.push(card);
    else rightCards.push(card);
  });

  const renderCard = (card: CardProps, idx: number) => (
    <View key={idx} style={s.card}>
      <View style={s.cardHeader}>
        {card.icon ? (
          <Image src={card.icon} style={s.icon} />
        ) : (
          <View style={s.iconPlaceholder} />
        )}
        <Text style={s.heading}>{card.heading}</Text>
      </View>

      {card.bodyType === 'bullets' && card.bullets && card.bullets.length > 0 ? (
        <View style={{ marginTop: 6 }}>
          {card.bullets.map((bullet, bi) => (
            <View key={bi} style={s.bulletItem}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ) : card.bodyType === 'paragraph' && card.paragraph ? (
        <Text style={s.paragraph}>{card.paragraph}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={s.page}>
      {/* Wordmark */}
      <View style={s.wordmark}>
        <LogoPDF height={22} />
      </View>

      {/* Year */}
      <Text style={s.year}>{year}</Text>

      {/* Section label */}
      {sectionLabel ? <Text style={s.label}>{sectionLabel}</Text> : null}

      {/* Horizontal rule */}
      <View style={s.rule} />

      {/* Two-column card grid */}
      <View style={s.contentArea}>
        <View style={s.leftColumn}>
          {leftCards.map((card, i) => renderCard(card, i))}
        </View>
        <View style={s.rightColumn}>
          {rightCards.map((card, i) => renderCard(card, i))}
        </View>
      </View>

      {/* Page number */}
      {pageNumber !== undefined && (
        <Text style={s.pageNumber}>{pageNumber}</Text>
      )}
    </View>
  );
}
