import Image from "next/image";
import footerLogo from "@/public/assets/img/main_logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg">
        <Image src={footerLogo} className="img-fluid" alt="GITEX Nigeria" />

        <div className="footer-right-links">
          <div className="footer-link-block">
            <h4 className="footer-title">GET INVOLVED</h4>
            <a href="mailto:sales@gitexnigeria.ng" className="footer-link">
              sales@gitexnigeria.ng
            </a>
          </div>

          <div className="footer-link-block">
            <h4 className="footer-title">
              FOR EXHIBITION / SPONSORSHIP ENQUIRIES
            </h4>
            <a href="mailto:sales@gitexnigeria.ng" className="footer-link">
              sales@gitexnigeria.ng
            </a>
          </div>

          <div className="footer-link-block">
            <h4 className="footer-title">
              MARKETING ENQUIRIES / TO BECOME A PARTNER
            </h4>
            <a href="mailto:marketing@gitexnigeria.ng" className="footer-link">
              marketing@gitexnigeria.ng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
