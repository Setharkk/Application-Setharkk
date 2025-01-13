import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type DateLike = string | number | Date;
type FormatNumberOptions = Intl.NumberFormatOptions;

// Formatage des dates
export const formatDate = (date: DateLike, formatStr: string = 'PPp'): string => {
  return format(new Date(date), formatStr, { locale: fr });
};

// Formatage des nombres
export const formatNumber = (number: number, options: FormatNumberOptions = {}): string => {
  return new Intl.NumberFormat('fr-FR', options).format(number);
};

// Formatage des prix
export const formatPrice = (price: number): string => {
  return formatNumber(price, {
    style: 'currency',
    currency: 'EUR'
  });
};

// Troncature de texte
export const truncate = (text: string | null | undefined, length: number = 100): string => {
  if (!text || text.length <= length) return text || '';
  return text.slice(0, length).trim() + '...';
};

// Génération de slug
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// Debounce
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Validation d'email
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// Génération d'ID unique
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deep clone
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
    ) as any;
  }
  return obj;
};

// Extraction des paramètres d'URL
export const getUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  new URL(url).searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

// Conversion de taille de fichier
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 