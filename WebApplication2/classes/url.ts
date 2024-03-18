import { History, IHistory } from './History';

/**
 * @class UrlState
 * get / set state T in the url
 * @uses History
 */
export class UrlState<T>{
    private history = new History(true);

    public update(query: T): void {
        let url = this.history.getCurrentPath();
        url = url + "#" + JSON.stringify(query);
        this.history.replace(url);
    }

    public read(): T {
        var hash = this.history.getCurrentHash();
        hash = hash ? hash.substring(1) : null;

        var result = hash ? JSON.parse(decodeURI(hash)) : {} as T;
        return result;
    }

    public push(url: string):void {
        this.history.push(url);
    }

    public set(url: string): void {
        this.history.replace(url);
    }

    public getCurrentPath(): string {
        return this.history.getCurrentPath();
    }

    public getCurrentQuery(): string {
        return this.history.getCurrentQuery();
    }
}
