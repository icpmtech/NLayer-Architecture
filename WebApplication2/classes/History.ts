export interface IHistory {
    push(path: string): void;
    replace(path: string): void;
    pop(): void;
    getCurrentPath(): string;
    isCurrentPath(value: string): boolean;

    addEventListener(onChange: { (e: PopStateEvent): void }): void;
    removeEventListener(onChange: { (e: PopStateEvent): void }): void;
};

/**
 * @class History
 * wrapper class to handle location and history operations
 */
export class History implements IHistory {

    constructor(private logToConsole: boolean) {
    }

    public addEventListener(onChange: { (e: PopStateEvent): void }) {
        if (window.addEventListener) {
            window.addEventListener('popstate', onChange, false);
        } else {
            (<any>window).attachEvent('popstate', onChange);
        }
    }

    public removeEventListener(onChange: { (e: PopStateEvent): void }) {
        if (window.addEventListener) {
            window.removeEventListener('popstate', onChange, false);
        } else {
            (<any>window).detachEvent('popstate', onChange);
        }
    }

    public push(path: string): void {
        if (!this.isCurrentPath(path)) {
            this.log("Pushing", path);
            window.history.pushState({ path: path }, '', path);
        }
    }

    public replace(path: string): void {
        if (!this.isCurrentPath(path)) {
            this.log("Replacing", path);
            window.history.replaceState({ path: path }, '', path);
        }
    }

    private log(type: string, path: string) {
        if (this.logToConsole) {
            console.log(type + " url from '" + this.getCurrentPath() + "' to '" + path + "'");
        }
    }

    public pop(): void {
        window.history.back();
    }

    public getCurrentPath(): string {
        return decodeURIComponent(window.location.pathname + window.location.search);
    }

    public getCurrentEncodedUrl(): string {
        let result = window.location.pathname + window.location.search + window.location.hash;
        result = encodeURIComponent(result);
        return result;
    }

    public getCurrentEncodedUrlBackUrlQueryRemoved(): string {
        let query = decodeURIComponent(window.location.search);
        if (query.startsWith("?backUrl=")) {
            query = query.slice(9);
            let splits = query.split("#");
            query = splits[0];
            if (splits.length > 1) {
                let state = decodeURIComponent(splits[1]);
                let stateObj = JSON.parse(state);
                stateObj["dsGridState"] = {};
                state = JSON.stringify(stateObj);
                query = query + "#" + state;
            }
        }
        query = "?backUrl=" + encodeURIComponent(query);

        let result = window.location.pathname + query + window.location.hash;
        result = encodeURIComponent(result);
        return result;
    }

    public getCurrentHash(): string {
        return window.location.hash;
    }

    public getCurrentQuery(): string {
        let result = window.location.search;
        if (result && result.startsWith("?")) {
            return result.slice(1);
        }
        return result;
    }

    public isCurrentPath(value: string) {
        return value && value.toLowerCase() == this.getCurrentPath().toLowerCase();
    }
}

export class MockHistory implements IHistory {
    private paths: string[];

    constructor() {
        this.paths = [];
    }

    public push(path: string): void {
        if (!this.isCurrentPath(path)) {
            this.log("Pushing", path);
            this.paths.push(path);
        }
    }

    public replace(path: string): void {
        if (!this.isCurrentPath(path)) {
            this.log("Replacing", path);
            this.paths[this.paths.length - 1] = path;
        }
    }

    private log(type: string, path: string) {
        console.log(type + " url from '" + this.getCurrentPath() + "' to '" + path + "'");
    }

    public pop(): void {
        this.paths.pop();
    }

    public getCurrentPath(): string {
        return this.paths[this.paths.length - 1];
    }

    public isCurrentPath(value: string) {
        return value == this.getCurrentPath();
    }

    public addEventListener(onChange: { (e: PopStateEvent): void }) {
    }

    public removeEventListener(onChange: { (e: PopStateEvent): void }) {
    }

}