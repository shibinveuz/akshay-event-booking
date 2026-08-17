import Image from "next/image";

const loaderImg = "/assets/img/loader.gif";

export default function Loader() {
  return (
    <div className="main-loader" role="status" aria-live="polite">
      <Image
        src={loaderImg}
        width={96}
        height={96}
        alt="Loading..."
        priority
        unoptimized
      />
    </div>
  );
}
