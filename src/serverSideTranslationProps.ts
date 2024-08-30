/* eslint-disable prefer-destructuring */
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const config = require('../next-i18next.config');

export const defaultLocale : string = config.i18n.defaultLocale;
export const locales : string[] = config.i18n.locales;

export async function translationProps(additionalNamespaces: string[] = []) {
  return serverSideTranslations(
    defaultLocale,
    ['common', ...additionalNamespaces],
    null,
    locales,
  );
}
