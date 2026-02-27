import { View, Text, Image, StyleSheet, Font, Link } from '@react-pdf/renderer';
import LogoPDF from './LogoPDF';
import LogoIconPDF from './LogoIconPDF';

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

/* ------------------------------------------------------------------ */
/*  Styles — mirrors contact-page.css positions exactly                */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    position: 'relative',
    width: 960,
    height: 540,
    backgroundColor: '#F2F2F2',
    overflow: 'hidden',
  },

  /* Wordmark — top-left */
  wordmark: {
    position: 'absolute',
    left: 48,
    top: 28,
  },

  /* Year — top-right */
  year: {
    position: 'absolute',
    right: 48,
    top: 28,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 14,
    color: '#1A1A1A',
  },

  /* Horizontal rule at y=78 */
  rule: {
    position: 'absolute',
    top: 78,
    left: 0,
    width: 960,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    borderBottomStyle: 'solid',
  },

  /* Logo circle — centered at x=480, y=230, diameter 200 */
  logoCircle: {
    position: 'absolute',
    left: 380,   // 480 - 100
    top: 130,    // 230 - 100
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  /* Bottom-left contact block */
  contact: {
    position: 'absolute',
    left: 48,
    top: 415,
  },

  companyName: {
    fontFamily: 'REM',
    fontWeight: 600,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 6,
  },

  detail: {
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 3,
  },

  link: {
    color: '#0080A0',
    textDecoration: 'none',
  },

  /* Bottom-right URL */
  url: {
    position: 'absolute',
    right: 48,
    top: 490,
    fontFamily: 'Noto Sans JP',
    fontWeight: 400,
    fontSize: 13,
    color: '#0080A0',
    textDecoration: 'none',
  },
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ContactPagePDFProps {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  url: string;
  year: string;
  logoImage?: string;
}

export default function ContactPagePDF({
  companyName,
  phone,
  email,
  address,
  url,
  year,
  logoImage,
}: ContactPagePDFProps) {
  return (
    <View style={s.page}>
      {/* Wordmark — top-left */}
      <View style={s.wordmark}>
        <LogoPDF height={22} />
      </View>

      {/* Year — top-right */}
      <Text style={s.year}>{year}</Text>

      {/* Horizontal rule */}
      <View style={s.rule} />

      {/* Logo circle */}
      <View style={s.logoCircle}>
        {logoImage ? (
          <Image src={logoImage} style={s.logoImage} />
        ) : (
          <LogoIconPDF size={120} />
        )}
      </View>

      {/* Bottom-left contact block */}
      <View style={s.contact}>
        <Text style={s.companyName}>{companyName}</Text>
        <Text style={s.detail}>{phone}</Text>
        <Link src={`mailto:${email}`} style={[s.detail, s.link]}>
          {email}
        </Link>
        <Text style={s.detail}>{address}</Text>
      </View>

      {/* Bottom-right URL */}
      <Link src={url.startsWith('http') ? url : `https://${url}`} style={s.url}>
        {url}
      </Link>
    </View>
  );
}
