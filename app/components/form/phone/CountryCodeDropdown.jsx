"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

import countries from "@/app/data/countries";
import styles from "./PhoneField.module.css";

export default function CountryCodeDropdown({
  value,
  onChange,
  countriesList,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const activeList =
    Array.isArray(countriesList) && countriesList.length > 0
      ? countriesList
      : countries;

  const cleanVal = String(value || "").replace(/^\+/, "");

  const selected =
    activeList.find((country) => {
      const phoneCode = String(
        country.phoneCode || country.phone_code || "",
      ).replace(/^\+/, "");

      return phoneCode === cleanVal;
    }) ||
    activeList.find((country) => country.code === "NG") ||
    activeList[0];

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleSelect(country) {
    const code = String(
      country.phoneCode || country.phone_code || "234",
    ).replace(/^\+/, "");

    onChange?.(code);

    setOpen(false);
    setSearch("");
  }

  function toggleDropdown() {
    setOpen((previous) => {
      const next = !previous;

      if (next) {
        window.setTimeout(() => {
          searchRef.current?.focus();
        }, 0);
      } else {
        setSearch("");
      }

      return next;
    });
  }

  const selectedCode = String(
    selected?.phoneCode || selected?.phone_code || value || "234",
  ).replace(/^\+/, "");

  const selectedFlag = String(selected?.code || "NG").toLowerCase();

  const normalizedSearch = search.trim().toLowerCase();

  const filteredList = activeList.filter((country) => {
    const name = String(country.name || "").toLowerCase();
    const code = String(country.code || "").toLowerCase();

    const dialCode = String(
      country.phoneCode || country.phone_code || "",
    ).toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      code.includes(normalizedSearch) ||
      dialCode.includes(normalizedSearch)
    );
  });

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select country calling code"
      >
        <Image
          src={`https://flagcdn.com/${selectedFlag}.svg`}
          alt=""
          className={styles.flag}
          width={24}
          height={16}
          unoptimized
        />

        <ChevronDown
          size={14}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />

        <span className={styles.dialCode}>+{selectedCode}</span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.searchWrapper}>
            <input
              ref={searchRef}
              type="search"
              className={styles.search}
              placeholder="Search countries..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search countries"
            />
          </div>

          <ul className={styles.optionsList} role="listbox">
            {filteredList.map((country, index) => {
              const phoneCode = String(
                country.phoneCode || country.phone_code || "",
              ).replace(/^\+/, "");

              const isSelected = country.code === selected?.code;

              const flagCode = String(country.code || "NG").toLowerCase();

              return (
                <li
                  key={country.id || `${country.code}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(country)}
                >
                  <Image
                    src={`https://flagcdn.com/${flagCode}.svg`}
                    alt=""
                    className={styles.flag}
                    width={24}
                    height={16}
                    unoptimized
                  />

                  <span className={styles.optionName}>{country.name}</span>

                  <span className={styles.optionCode}>+{phoneCode}</span>
                </li>
              );
            })}

            {filteredList.length === 0 && (
              <li className={styles.noOptions}>No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
