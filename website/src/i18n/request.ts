import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {mergeMessages, supplementForLocale, type MessageCatalog} from '../messages/supplements';
import {metrologyCalibrationSupplementForLocale} from '../messages/metrology-calibration-supplements';
import {adminSettingsSupplementForLocale} from '../messages/admin-settings-supplements';
import {toolsSupplementForLocale} from '../messages/tools-supplements';
import {adjustmentImportSupplementForLocale} from '../messages/adjustment-import-supplements';
import {smtpGuideSupplementForLocale} from '../messages/smtp-guide-supplements';
import {authResetSupplementForLocale} from '../messages/auth-reset-supplements';
import {alarmAcknowledgementSupplementForLocale} from '../messages/alarm-acknowledgement-supplements';
import {legalSupplementForLocale} from '../messages/legal-supplements';
import {systemHealthSupplementForLocale} from '../messages/system-health-supplements';
import {adminServiceCardsSupplementForLocale} from '../messages/admin-service-cards-supplements';
import {helpSupportSupplementForLocale} from '../messages/help-support-supplements';
 
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
  const messagesWithAuthReset = mergeMessages(messagesWithSupplements, authResetSupplementForLocale(locale));
  const messagesWithAlarmAcknowledgement = mergeMessages(messagesWithAuthReset, alarmAcknowledgementSupplementForLocale(locale));
  const messagesWithAdminSettings = mergeMessages(messagesWithAlarmAcknowledgement, adminSettingsSupplementForLocale(locale));
  const messagesWithLegal = mergeMessages(messagesWithAdminSettings, legalSupplementForLocale(locale));
  const messagesWithSystemHealth = mergeMessages(messagesWithLegal, systemHealthSupplementForLocale(locale));
  const messagesWithAdminServiceCards = mergeMessages(messagesWithSystemHealth, adminServiceCardsSupplementForLocale(locale));
  const messagesWithHelpSupport = mergeMessages(messagesWithAdminServiceCards, helpSupportSupplementForLocale(locale));
  const messagesWithSmtpGuide = mergeMessages(messagesWithHelpSupport, smtpGuideSupplementForLocale(locale));
  const messagesWithMetrology = mergeMessages(messagesWithSmtpGuide, metrologyCalibrationSupplementForLocale(locale));
  const messagesWithTools = mergeMessages(messagesWithMetrology, toolsSupplementForLocale(locale));
 
  return {
    locale,
    messages: mergeMessages(messagesWithTools, adjustmentImportSupplementForLocale(locale))
  };
});
