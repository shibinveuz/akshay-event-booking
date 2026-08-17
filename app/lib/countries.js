export function getCountryItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  for (const candidate of [
    payload.countries,
    payload.data,
    payload.results,
  ]) {
    const countries = getCountryItems(candidate);
    if (countries.length > 0) return countries;
  }

  return [];
}

export function mapCountryOptions(payload, { requirePhoneCode = false } = {}) {
  return getCountryItems(payload)
    .map((country) => {
      const value =
        country.value ||
        country.country_code ||
        country.code ||
        country.iso2 ||
        country.iso_code ||
        country.id ||
        "";
      const dialCode =
        country.phoneCode ||
        country.phone_code ||
        country.dial_code ||
        country.calling_code ||
        "";

      return {
        value,
        code: country.code || value,
        label:
          country.label ||
          country.country ||
          country.name ||
          country.country_name ||
          String(value),
        phoneCode: String(dialCode).replace(/^\+/, ""),
      };
    })
    .filter(
      (country) =>
        country.value && country.label &&
        (!requirePhoneCode || country.phoneCode),
    );
}
