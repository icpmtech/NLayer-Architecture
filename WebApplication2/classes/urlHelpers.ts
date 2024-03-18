export class UrlHelpers {
    public static buildUrl = (segments: any[], params?: { [key: string]: any }) => {
        params = params || {};

        let url = segments.filter(segment => !!segment).join("/");
        if (!url.startsWith("/")) {
            url = "/api/" + url;
        }

        const suppliedParamKeys = Object.keys(params)
                .filter(key => params[key] !== undefined && params[key] != null);

        const qs = suppliedParamKeys
                .map(key => encodeKeyAndValue(key, params[key]))
                .join("&");

        if (qs && qs.length > 0) {
            return url + (url.indexOf("?") === -1 ? "?" : "&") + qs;
        }
        return url;
    }
}

function encodeKeyAndValue(key: string, value: any) {
    if (Array.isArray(value)) {
        return encodeArray(key, value);
    }
    // check date before object as it technically is an object
    if (value instanceof Date) {
        return encodeDate(key, value);
    }

    if ((typeof value) === 'object') {
        return encodeObject(key, value);
    }

    return key + "=" + encodeURIComponent(value);
}

function encodeArray(key: string, array: any[]) {
    const uriElements = array.map((item, index) => {
        let itemKey = `${key}[${index}]`;
        return encodeKeyAndValue(itemKey, item);
    });

    return uriElements.join("&");
}

function encodeDate(key: string, value: Date) {
    let uriEncodableValue = value.toISOString();
    return key + "=" + encodeURIComponent(uriEncodableValue);
}

function encodeObject(key: string, item: {}) {
    if (item === null || item === undefined) return "";
    let uriElements = Object.keys(item).map(k => {
        let itemKey = `${key}.${k}`;
        return encodeKeyAndValue(itemKey, item[k]);
    });
    return uriElements.join("&");
}