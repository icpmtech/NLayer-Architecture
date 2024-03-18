import { Dtos } from '../adr';
import { Pending, LoadingStatus } from './pending';
import { AppError } from "./appError";
import { QAIndicator } from "./qa";

export interface PagedDataState<TData, TKey> {
    cache: { [key: string]: Pending<Dtos.PagedResultDto<TData>> };
    current: { page: number, pageSize: number, filter: TKey };
}

export class PageCache<TData, TKey>
{
    constructor(
        private api: { (filter: TKey, page: number, pageSize: number): JQueryPromise<Dtos.PagedResultDto<TData>> },
        private getState: { (): PagedDataState<TData, TKey> },
        private setState: { (state: PagedDataState<TData, TKey>): void }
    ) { }

    private getCurrentState() {
        var state = this.getState() || { cache: {}, current: null };
        return state;
    }

    private getCacheKey = (filter: TKey, page: number, pageSize: number) => {
        let key = JSON.stringify(Object.assign({}, filter, { page, pageSize }));
        return key;
    }

    private loaded = (filter: TKey, page: number, pageSize: number, data: Pending<Dtos.PagedResultDto<TData>>) => {
        let current = this.getCurrentState();
        current.cache[this.getCacheKey(filter, page, pageSize)] = data;
        this.setState(current);
    }

    setCurrent(filter: TKey, page: number, pageSize: number, clear: boolean) {
        var state = this.getCurrentState();
        let key = this.getCacheKey(filter, page, pageSize);

        state.current = { filter, page, pageSize };

        var currentResult = state.cache[key];
        if (clear || !currentResult || currentResult.state == LoadingStatus.Preload || currentResult.state == LoadingStatus.Stale) {
            state.cache[key] = new Pending(LoadingStatus.Loading, currentResult && currentResult.data, null);

            QAIndicator.IncrementLoadingCount();

            this.api(filter, page, pageSize)
                .done(x => {
                    this.loaded(filter, page, pageSize, new Pending(LoadingStatus.Done, x));
                    QAIndicator.DecrementLoadingCount();
                })
                .fail(x => {
                    this.loaded(filter, page, pageSize, new Pending(LoadingStatus.Failed, null, x as AppError));
                    QAIndicator.IncrementErrorCount((x as AppError).userMessage);
                });
        }

        this.setState(state);
    }

    getCurrentData() {
        let state = this.getCurrentState();
        let pageInfo = state.current;
        let key = pageInfo && this.getCacheKey(pageInfo.filter, pageInfo.page, pageInfo.pageSize);
        let current = key && state.cache[key];
        return current || new Pending<Dtos.PagedResultDto<TData>>();
    }

    getCurrentFilter() {
        let state = this.getCurrentState();
        return state && state.current && state.current.filter;
    }

    getCurrentPageSize() {
        let state = this.getCurrentState();
        return state && state.current && state.current.pageSize;
    }

    getCurrentPage() {
        let state = this.getCurrentState();
        return state && state.current && state.current.page;
    }

    refresh() {
        let current = this.getCurrentState();
        Object.keys(current.cache).forEach(key => { current.cache[key].setStale(); })
        this.setState(current);
        this.setCurrent(
            this.getCurrentFilter(),
            this.getCurrentPage(),
            this.getCurrentPageSize(),
            false
        );

    }
}