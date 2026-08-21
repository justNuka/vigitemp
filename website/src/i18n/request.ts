import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {mergeMessages, supplementForLocale, type MessageCatalog} from '../messages/supplements';
import {metrologyCalibrationSupplementForLocale} from '../messages/metrology-calibration-supplements';
 
export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const baseMessages = (
    await import(`../messages/${locale}.json`)
  ).default as MessageCatalog;
  const messagesWithSupplements = mergeMessages(baseMessages, supplementForLocale(locale));
 
  return {
    locale,
    messages: mergeMessages(messagesWithSupplements, metrologyCalibrationSupplementForLocale(locale))
  };
});