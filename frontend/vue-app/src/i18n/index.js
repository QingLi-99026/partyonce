import { createI18n } from 'vue-i18n'

import zh from '@/locales/zh.json'
import en from '@/locales/en.json'
import ko from '@/locales/ko.json'
import ar from '@/locales/ar.json'

export const LOCALE_STORAGE_KEY = 'partyonce_locale'

export const supportedLocales = [
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ko', label: '한국어', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' }
]

const fallbackLocale = 'zh'
const supportedLocaleCodes = supportedLocales.map((locale) => locale.code)

const normalizeLocale = (value) => (
  supportedLocaleCodes.includes(value) ? value : fallbackLocale
)

const getSavedLocale = () => {
  if (typeof window === 'undefined') {
    return fallbackLocale
  }

  return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY))
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getSavedLocale(),
  fallbackLocale,
  messages: {
    zh,
    en,
    ko,
    ar
  }
})

export const getLocaleDirection = (locale) => (
  supportedLocales.find((item) => item.code === locale)?.dir || 'ltr'
)

export const setLocale = (locale) => {
  const nextLocale = normalizeLocale(locale)
  i18n.global.locale.value = nextLocale

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }

  return nextLocale
}

export const getCurrentLocale = () => i18n.global.locale.value

export default i18n
