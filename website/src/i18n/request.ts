import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {mergeMessages, supplementForLocale, type MessageCatalog} from '../messages/supplements';
 
export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const baseMessages = (
    await import(`../messages/${locale}.json`)
  ).default as MessageCatalog;
 
  return {
    locale,
    messages: mergeMessages(baseMessages, supplementForLocale(locale))
  };
});