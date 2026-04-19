import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  void locale;

  return {
    locale: "mk",
    messages: (await import("../messages/mk.json")).default
  };
});
