// utils/converter.ts
import { NBURate, CurrencyForConverter } from '../services/api';

/**
 * Конвертация валют через гривну
 * @param amount - сумма для конвертации
 * @param fromCurrency - исходная валюта
 * @param toCurrency - целевая валюта
 * @param rates - курсы валют к гривне от НБУ
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: NBURate[]
): number {
  // Если конвертируем в ту же валюту
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Если одна из валют - гривна
  if (fromCurrency === 'UAH') {
    const toRate = rates.find(r => r.cc === toCurrency);
    if (!toRate) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }
    return amount / toRate.rate;
  }

  if (toCurrency === 'UAH') {
    const fromRate = rates.find(r => r.cc === fromCurrency);
    if (!fromRate) {
      throw new Error(`Rate not found for ${fromCurrency}`);
    }
    return amount * fromRate.rate;
  }

  // Конвертация через гривну: EUR -> UAH -> USD
  const fromRate = rates.find(r => r.cc === fromCurrency);
  const toRate = rates.find(r => r.cc === toCurrency);

  if (!fromRate || !toRate) {
    throw new Error(`Rates not found for ${fromCurrency} or ${toCurrency}`);
  }

  // Сначала конвертируем в гривны, потом в целевую валюту
  const amountInUAH = amount * fromRate.rate;
  const result = amountInUAH / toRate.rate;

  return result;
}

/**
 * Получение курса обмена между двумя валютами
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rates: NBURate[]
): number {
  return convertCurrency(1, fromCurrency, toCurrency, rates);
}

/**
 * Форматирование результата конвертации
 */
export function formatConversionResult(value: number | null, decimals: number = 4): string {
  if (value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(decimals);
}

/**
 * Получение информации о валюте для конвертера
 */
export function getCurrencyForConverter(rates: NBURate[]): CurrencyForConverter[] {
  const currencies: CurrencyForConverter[] = [
    { code: 'UAH', name: 'Ukrainian Hryvnia', rate: 1, symbol: '₴' }, // Базовая валюта
    ...rates.map(rate => ({
      code: rate.cc,
      name: rate.txt,
      rate: rate.rate,
      symbol: getCurrencySymbol(rate.cc),
    })),
  ];

  return currencies;
}

/**
 * Получение символа валюты
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'Fr',
    CAD: 'C$',
    AUD: 'A$',
    NZD: 'NZ$',
    CNY: '¥',
    PLN: 'zł',
  };
  return symbols[currencyCode] || currencyCode;
}

/**
 * Фильтрация основных валют
 */
export function filterMainCurrencies(rates: NBURate[]): NBURate[] {
  const mainCurrencies = ['USD', 'EUR', 'GBP', 'PLN', 'CHF', 'CAD', 'JPY', 'CNY', 'AUD', 'NZD'];
  return rates.filter(rate => mainCurrencies.includes(rate.cc));
}

/**
 * Валидация суммы для конвертации
 */
export function validateAmount(amount: string): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  const trimmed = amount.trim();

  if (!trimmed) {
    return { isValid: false, value: 0, error: 'Amount is required' };
  }

  const value = parseFloat(trimmed);

  if (isNaN(value)) {
    return { isValid: false, value: 0, error: 'Invalid number format' };
  }

  if (value <= 0) {
    return { isValid: false, value: 0, error: 'Amount must be greater than zero' };
  }

  if (value > 1000000000) {
    return { isValid: false, value: 0, error: 'Amount is too large' };
  }

  return { isValid: true, value };
}

/**
 * Форматирование строки курса обмена
 */
export function formatExchangeRateString(
  fromCurrency: string,
  toCurrency: string,
  rates: NBURate[]
): string {
  try {
    const rate = getExchangeRate(fromCurrency, toCurrency, rates);
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  } catch {
    return '';
  }
}
