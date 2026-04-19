import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';

import enMessages from '../messages/en.json';
import mkMessages from '../messages/mk.json';

type MessageMap = { [key: string]: string | MessageMap };

function mergeMessages(base: MessageMap, overrides: MessageMap): MessageMap {
  const merged: MessageMap = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const baseValue = merged[key];
    const isPlainObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isBasePlainObject = baseValue !== null && typeof baseValue === 'object' && !Array.isArray(baseValue);

    if (isPlainObject && isBasePlainObject) {
      merged[key] = mergeMessages(baseValue as MessageMap, value as MessageMap);
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

export default getRequestConfig(async ({ locale }) => {
  void locale;

  return {
    locale: "mk",
    // mk takes priority; any missing keys fall back to en so pages never break.
    messages: mergeMessages(enMessages as MessageMap, mkMessages as MessageMap) as AbstractIntlMessages
  };
});
