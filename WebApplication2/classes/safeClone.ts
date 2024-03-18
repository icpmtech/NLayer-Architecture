import { customJSONParse } from './customJSONParse';

export function safeClone<T>(item: T) {
    if (item === null) return null;
    if (item === undefined) return undefined;
    return customJSONParse(JSON.stringify(item)) as T;
}