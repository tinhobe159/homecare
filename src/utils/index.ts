import { clsx, type ClassValue } from 'clsx';
import { format, parseISO, isValid } from 'date-fns';

/**
 * Utility function to conditionally join CSS class names
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format date string to readable format
 */
export function formatDate(
    date: string | Date,
    formatString: string = 'MMM dd, yyyy'
): string {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) {
            return 'Invalid date';
        }
        return format(dateObj, formatString);
    } catch {
        return 'Invalid date';
    }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
    return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Generate a random ID
 */
export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object' && value !== null)
        return Object.keys(value).length === 0;
    return false;
}
