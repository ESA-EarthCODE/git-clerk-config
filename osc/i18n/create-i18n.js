import merge from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/merge.js";

export default function createI18n(config) {
  const i18n = config.i18n || {};

  return merge(
    {
      locale: "en",
      fallbackLocale: "en",
    },
    i18n,
  );
}
