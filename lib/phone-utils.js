import { COUNTRIES } from '@/lib/countries'

export function getCountryByDial(dial) {
  return COUNTRIES.find(c => c.dial === dial)
}

export function getCountryByCode(code) {
  return COUNTRIES.find(c => c.code === code)
}

export function detectCountryFromPhone(phone) {
  if (!phone) return null
  for (const c of COUNTRIES) {
    if (phone.startsWith(c.dial)) return c
  }
  return null
}

export function formatInternationalPhone(phone, countryCode) {
  if (!phone) return ''
  const country = getCountryByCode(countryCode)
  if (!country) return phone
  let cleaned = phone.replace(/[^0-9]/g, '')
  // Si ya tiene el prefijo, no agregarlo
  if (cleaned.startsWith(country.dial.replace('+',''))) {
    return `+${cleaned}`
  }
  // Si empieza con 0, quitarlo
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  return `${country.dial}${cleaned}`
}
