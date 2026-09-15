import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {mergeMessages, supplementForLocale, type MessageCatalog} from '../messages/supplements';
import {metrologyCalibrationSupplementForLocale} from '../messages/metrology-calibration-supplements';
import {adminSettingsSupplementForLocale} from '../messages/admin-settings-supplements';
import {toolsSupplementForLocale} from '../messages/tools-supplements';
import {adjustmentImportSupplementForLocale} from '../messages/adjustment-import-supplements';
import {smtpGuideSupplementForLocale} from '../messages/smtp-guide-supplements';
 
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
  const messagesWithAdminSettings = mergeMessages(messagesWithSupplements, adminSettingsSupplementForLocale(locale));
  const messagesWithSmtpGuide = mergeMessages(messagesWithAdminSettings, smtpGuideSupplementForLocale(locale));
  const messagesWithMetrology = mergeMessages(messagesWithSmtpGuide, metrologyCalibrationSupplementForLocale(locale));
  const messagesWithTools = mergeMessages(messagesWithMetrology, toolsSupplementForLocale(locale));
 
  return {
    locale,
    messages: mergeMessages(messagesWithTools, adjustmentImportSupplementForLocale(locale))
  };
});
