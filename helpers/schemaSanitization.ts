import { sanitizeString } from './textSanitization';

export const sanitizeSchema = (obj: any): any => {
    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeSchema);
    }
    if (obj && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = sanitizeSchema(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};
