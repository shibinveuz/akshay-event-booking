import Image from "next/image";
import Link from "next/link";

import defaultBannerImg from "@/public/assets/img/ng-hedear.png";
import SubHeader from "./SubHeader";

export default function Header({
  isAuthenticated = false,
  bannerSrc = defaultBannerImg,
  bannerUrl = "https://gitexnigeria.ng/",
  altText = "GITEX Nigeria 2026 banner",
}) {
  return (
    <header className="top-header-out">
      <Link
        href={bannerUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit GITEX Nigeria website"
      >
        <Image
          src={bannerSrc || defaultBannerImg}
          alt={altText}
          className="banner-main-web"
          priority
        />
      </Link>

      <SubHeader isAuthenticated={isAuthenticated} />
    </header>
  );
}
