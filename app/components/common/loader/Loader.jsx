"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Fallbacks for the referrer functions if they don't exist
const getReferrerSource = () => {
  if (typeof document !== "undefined") {
    return document.referrer ? new URL(document.referrer).hostname : "direct";
  }
  return "";
};
const getReferrerMedium = () => {
  if (typeof document !== "undefined") {
    return document.referrer ? "referral" : "none";
  }
  return "";
};

const loaderImg = "/assets/img/loader.gif";

const LoaderContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loader = document.getElementById("initial-loader");
    if (loader) {
      loader.style.display = "flex";
      loader.classList.remove("fade-out");
    }
    document.body.style.overflow = "hidden"; // Prevent scrolling

    fetchUtm();

    // Hide loader after a short delay to allow the new page to render
    const timer = setTimeout(() => {
      if (loader) {
        loader.classList.add("fade-out");
        setTimeout(() => {
          if (loader && loader.classList.contains("fade-out")) {
            loader.style.display = "none";
          }
        }, 300);
      }
      document.body.style.overflow = "auto";
    }, 800); 

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  const fetchUtm = async () => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem("first_visit")) {
      sessionStorage.setItem("first_visit", new Date().toISOString());
      const params = new URLSearchParams(window.location.search);
      const utmParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "utm_id",
      ];
      utmParams.forEach((param) => {
        let value = "";
        if (param === "utm_source") {
          value =
            params.get(param) ||
            sessionStorage.getItem(param) ||
            getReferrerSource();
        } else if (param === "utm_medium") {
          value =
            params.get(param) ||
            sessionStorage.getItem(param) ||
            getReferrerMedium();
        } else {
          value = params.get(param) || sessionStorage.getItem(param) || "";
        }
        if (value) {
          sessionStorage.setItem(param, value);
        }
      });
    }
  };

  return (
    <div className="main-loader" id="initial-loader">
      <img src={loaderImg} alt="Loading..." />
    </div>
  );
};

const Loader = () => {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  );
};

export default Loader;
