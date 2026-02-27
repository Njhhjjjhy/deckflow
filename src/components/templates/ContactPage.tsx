import './contact-page.css';

interface ContactPageContent {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  url: string;
  year?: string;
}

interface ContactPageProps {
  content: ContactPageContent;
  language?: 'en' | 'zh-tw' | 'zh-cn';
}

export default function ContactPage({ content }: ContactPageProps) {
  const year = content.year || new Date().getFullYear().toString();

  return (
    <div className="contact-page">
      {/* Wordmark — top-left */}
      <img
        className="contact-page__wordmark"
        src="/assets/logo-moreharvest.svg"
        alt="MoreHarvest"
      />

      {/* Year — top-right */}
      <div className="contact-page__year">{year}</div>

      {/* Horizontal rule */}
      <hr className="contact-page__rule" />

      {/* Logo circle — centered */}
      <div className="contact-page__logo-circle">
        <img
          className="contact-page__logo-icon"
          src="/assets/logo-moreharvest-icon.svg"
          alt="MoreHarvest icon"
        />
      </div>

      {/* Bottom-left contact block */}
      <div className="contact-page__contact">
        <p className="contact-page__company-name">{content.companyName}</p>
        <p className="contact-page__detail">{content.phone}</p>
        <p className="contact-page__detail">
          <a href={`mailto:${content.email}`} className="contact-page__link">
            {content.email}
          </a>
        </p>
        <p className="contact-page__detail">{content.address}</p>
      </div>

      {/* Bottom-right URL */}
      <a
        href={content.url.startsWith('http') ? content.url : `https://${content.url}`}
        className="contact-page__url"
      >
        {content.url}
      </a>
    </div>
  );
}
