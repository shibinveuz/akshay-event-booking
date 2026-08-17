"use client";

import { useEffect } from "react";

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
];

function getReferrerSource() {
  return document.referrer ? new URL(document.referrer).hostname : "direct";
}

function getReferrerMedium() {
  return document.referrer ? "referral" : "none";
}

function captureUtm() {
  if (sessionStorage.getItem("first_visit")) return;

  sessionStorage.setItem("first_visit", new Date().toISOString());
  const params = new URLSearchParams(window.location.search);

  UTM_PARAMS.forEach((param) => {
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

    if (value) sessionStorage.setItem(param, value);
  });
}

export default function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);

  return null;
}
