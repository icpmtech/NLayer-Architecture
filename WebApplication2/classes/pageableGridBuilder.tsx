import * as React from 'react';
import * as Renderers from '../components/stateless';
import { Dtos } from '../adr';
import { Pending } from '../classes';
import { PageableGridComponent } from '../components';

export interface IGridBuilderChangeArgs<TSort> {
    page: number;
    pageSize: number;
    sort: Dtos.SortExpression<TSort>;
    filters: Dtos.FilterExpression<TSort>[];
};

export enum GridFlags {
    Breakable = 1 << 0,
    Filterable = 1 << 1,
    Navigatable = 1 << 2,
    Reorderable = 1 << 3,
    Resizable = 1 << 4,
    Scrollable = 1 << 5,
    Selectable = 1 << 6,
    Sortable = 1 << 7,
    SimpleGrid = 1 << 8
};

/**
 * create a pageable grid for data T
 * T is the data type
 * TSort is a map to allow sorting of columns
 */
export class PageableGridBuilder<T, TSort> {
    // list of columns to be displayed
    private _columns: PageableGridColumn<T, TSort>[] = [];
    // list of functions to be triggered by button events, accessed by index so order is important
    private _btnHandlers: { (): void }[] = [];
    private _flags: GridFlags = 0;
    private _fixedColumns: number = 0;
    private _onRowSelected: { (value: T): void };
    private _onSave: { (index: number, insertNewTabbedRow: boolean): void };
    private _selectable: boolean = false;
    private _templates: Map<string, { (item: T): React.ReactNode }> = new Map();
    private _toolbar: (string | GridToolbarItem)[] = [];
    private _updateSelection: { (value: T[]): void };
    private _highlightRow: { (m: T): boolean };
    private _styleRow: { (value: T): string[] };
    private _rowToolTip: { (value: T): { tooltipText?: string, width?: number, showAfter?: number, position?: string } };
    private _noDataMessage: string;
    private _showNoDataMessage: boolean = true;
    private _height?: number;
    private _rowHeight?: number;
    private _qa: string;
    private _initialState: IGridBuilderChangeArgs<TSort>;

    constructor(
        private data: Pending<Dtos.PagedResultDto<T>>,
        private pageSize: number,
        private onChange: { (options: IGridBuilderChangeArgs<TSort>): void }
    ) { }

    get columns(): PageableGridColumn<T, TSort>[] {
        let columns: PageableGridColumn<T, TSort>[] = [];
        let locked = this._fixedColumns;

        if (this._flags & GridFlags.Selectable) {
            let col: PageableGridColumn<T, TSort> = {
                options: {
                    headerTemplate: '<input type="checkbox" data-check-row="true" data-check-all="true" />',
                    template: '<input type="checkbox" data-check-row="true" data-qa-checked="false" />',
                    locked: !!locked,
                    filterable: false,
                    sortable: false,
                    width: '30px'
                },
                getValue: null,
                setValue: null,
                telericValue: () => null,
                telericDisplayValue: () => null,
                dataType: "boolean",
                sort: null,
                title: "checkbox",
                qa: "PageableGridColumn"
            };

            columns.push(col);
        }

        return columns.concat(
            this._columns.map((column, i) => {
                let options = {
                    locked: i < locked ? true : false,
                    width: locked ? '110px' : null,
                };
                column.options = Object.assign({}, options, column.options);
                return column;
            })
        );
    }

    private addColumn(
        title: string,
        options: ColumnOptions,
        getValue: { (m: T, index?: number): React.ReactNode },
        telericValue: { (m: T): string | number | boolean | Date },
        dataType: GridColumnType,
        sort: TSort,
        qa: string,
        items?: any[],
        setValue?: { (m: T, v: any, index: number): void },
        telericDisplayValue?: { (m: T): string | number | boolean | Date }
    ): this {
        this._columns.push({ title: title, options: options || {}, getValue: getValue, setValue: setValue, dataType: dataType, telericValue: telericValue, telericDisplayValue: telericDisplayValue || telericValue, sort: sort, qa: qa, possibleOptions: items });
        return this;
    }

    addCustomColumn(
        title: string,
        getValue: { (m: T, index?: number): React.ReactNode },
        telericValue: { (m: T): string | number | boolean | Date },
        dataType: GridColumnType,
        sort: TSort,
        qa: string,
        options?: ColumnOptions,
        items?: any[],
        setValue?: { (m: T, v: any, index: number): void },
        telericDisplayValue?: { (m: T): string | number | boolean | Date }
    ): this {
        return this.addColumn(title, options, getValue, telericValue, dataType, sort, qa, items, setValue, telericDisplayValue);
    }

    addString(
        title: string,
        getValue: { (m: T): string },
        sort: TSort,
        qa: string,
        setValue?: { (m: T, v: string): void },
        options?: ColumnOptions
    ): this {
        return this.addColumn(title, options, getValue, getValue, "string", sort, qa, null, setValue);
    }

    addStrings(
        title: string,
        spacer: string,
        getValue: { (m: T): string[] },
        sort: TSort,
        qa: string,
        options?: ColumnOptions
    ): this {
        return this.addColumn(title, options, null, (m) => {
            var vals = getValue(m)
            if (vals) {
                vals = vals.filter(x => !!x);
                return vals.join(spacer || "").trim();
            }
            return "";
        }, "string", sort, qa);
    }

    addDropdown<TItem extends { name: string, id: number }>(
        title: string,
        getValue: { (m: T): TItem },
        sort: TSort,
        items: TItem[],
        qa: string,
        setValue?: { (m: T, v: TItem, index: number): void },
        options?: ColumnOptions,
    ): this {
        return this.addCustomColumn(title,
            (item) => (<div>{!!item && !!getValue(item) ? getValue(item).name : null}</div>),
            (item) => { return !!item && !!getValue(item) ? getValue(item).id : "" },
            null,
            null,
            qa,
            options || {},
            items,
            setValue,
            (item) => { return !!item && !!getValue(item) ? getValue(item).name : "" }
        );
    }

    addDate(
        title: string,
        getValue: { (m: T): Date },
        sort: TSort,
        qa: string,
        setValue?: { (m: T, v: Date, index: number): void },
        options?: ColumnOptions & { isDateOnly?: boolean }
    ): this {
        return this.addCustomColumn(title, (item) => <Renderers.Date date={getValue(item)} isDateOnly={options && options.isDateOnly} qa={qa}/>, getValue, "date", sort, qa, options, null, setValue,
            (item) => getValue(item)
        );
    }

    addDateTime(
        title: string,
        getValue: { (m: T): Date },
        sort: TSort,
        qa: string,
        setValue?: { (m: T, v: Date, index: number): void },
        options?: DateTimeColumnOptions
    ): this {
        return this.addCustomColumn(title, (item) => <Renderers.DateTime date={getValue(item)} showSuffix={options && options.showSuffix} qa={qa}/>, getValue, "date", sort, qa, options, null, setValue,
            (item) => getValue(item)
        );
    }

    addNumber(
        title: string,
        getValue: { (m: T): number },
        sort: TSort,
        qa: string,
        setValue?: { (m: T, v: number, index: number): void },
        options?: ColumnOptions
    ): this {
        return this.addColumn(title, options, getValue, getValue, "number", sort, qa, null, setValue);
    }

    addPercentage(
        title: string,
        getValue: { (m: T): number },
        sort: TSort,
        qa: string,
        options?: ColumnOptions & { isFraction?: boolean }
    ): this {
        return this.addColumn(title, options, (item) => <Renderers.Percentage value={getValue(item)} isFraction={options && options.isFraction} decimals={options && options.decimals} qa={qa}/>, getValue, "number", sort, qa, null, null);
    }

    addYesNo(
        title: string,
        getValue: { (m: T): boolean },
        sort: TSort,
        qa: string,
        options?: ColumnOptions
    ): this {
        return this.addCustomColumn(title, m => <Renderers.YesNo value={getValue(m)} qa={qa}/>, getValue, "boolean", sort, qa, options, null);
    }

    /**
     * Add text into the header toolbar of the grid
     * @param text - the string to add into the toolbar
     * @param options  - optional object to specify styling and dataQa
     */
    addToolbarText(text: string, options?: { className?: string, dataQA?: string }): this {
        this._toolbar.push({
            template: kendo.template(`<p class="${options && options.className}" data-qa=${options && options.dataQA}>${text}</p></br>`)
        });
        return this;
    }

    addExcelButton(getUrl: { (): string }, className: string = "", qa: string): this {
        this.addCustomExcelButton("Export to Excel", () => getUrl(), qa);
        return this;
    }

    addCustomExcelButton(text: string, getUrl: { (): string }, qa:string, className?: string ): this {
        const guid = this._btnHandlers.length;
        this._toolbar.push({
            template: kendo.template(`<a class="k-button btn btn-outline-secondary btn-grid-toolbar ${className}" data-guid="${guid}" data-qa="${qa}">
            <span class="k-icon k-i-excel"></span>
            ${text}
            </a>`)
        });

        this._btnHandlers.push(() => {
            let url = getUrl();
            if (url) {
                window.open(url);
            }
            else {
                console.log("unable to build url for excel export");
            }
        });
        return this;
    }

    addButton(text: string, onClick: { (): void }, options? : { className ? : string, dataQA ? : string, pushRemainingRight?: boolean }): this {
        const guid = this._btnHandlers.length;
        this._toolbar.push({
            template: kendo.template(`<a class="k-button btn btn-primary btn-grid-toolbar ${options && options.pushRemainingRight ? 'ms-auto': ''} ${options && options.className}" data-guid="${guid}" data-qa=${options && options.dataQA}>${text}</a>`)
        });
        this._btnHandlers.push(onClick);
        return this;
    }

    highlight(fn: { (value: T): boolean }): this {
        this._highlightRow = fn;
        return this;
    }

    /**
     * Style a row based on the row contents
     * @param applyStyle - function to return an array of class names to be applied for the given row data
     */
    styleRow(applyStyle: { (value: T): string[] }): this {
        this._styleRow = applyStyle;
        return this;
    }

    /**
     * Conditionally display a tooltip for each row
     * @param func - function to determine whether to show a tooltip based on the row contents
     *                   Set to tooltipText to null if no tooltip should be shown
     */
    displayRowTooltip(func: { (value: T): { tooltipText?: string, width?: number, showAfter?: number, position?: string } }): this {
        this._rowToolTip = func;
        return this;
    }

    isFilterable(): this {
        return this.addFlag(GridFlags.Filterable);
    }

    /**
     * set the first number of columns to be fixed
     * @param columns - the number of columns to fix in place
     */
    isFixed(columns: number): this {
        this._fixedColumns = columns;
        return this;
    }

    isNavigatable(): this {
        return this.addFlag(GridFlags.Navigatable);
    }

    isResizable(): this {
        return this.addFlag(GridFlags.Resizable);
    }

    isScrollable(): this {
        return this.addFlag(GridFlags.Scrollable);
    }

    /**
     * allow grid cell contents to be broken into a new line at any random
     * point within a string when the cell is not wide enough
     */
    isWordBreakable(): this {
        return this.addFlag(GridFlags.Breakable);
    }

    /**
     * allow a row to be selected
     * @param update - function which gets passed new selection when updates happen
     */
    isSelectable(update: { (value: T[]): void }): this {
        this._updateSelection = update;
        return this.addFlag(GridFlags.Selectable);
    }

    isSimpleGrid(): this {
        return this.addFlag(GridFlags.SimpleGrid);
    }

    isSortable(): this {
        return this.addFlag(GridFlags.Sortable);
    }

    withQA(qa: string) {
        this._qa = qa;
        return this;
    }

    /**
     * retrieve the row details when you click on one
     * @param fn - function to call with row details
     */
    setRowChangeHandler(fn: { (value: T): void }): this {
        this._onRowSelected = fn;
        return this;
    }

    setSaveHandler(fn: { (index: number, insertNewTabbedRow: boolean): void }): this {
        this._onSave = fn;
        return this;
    }

    setInitialState(state: IGridBuilderChangeArgs<TSort>): this {
        this._initialState = state;
        return this;
    }

    private addFlag(flag: GridFlags): this {
        this._flags = this._flags | flag;
        return this;
    }

    private handleSave = (index: number, insertNewTabbedRow: boolean): void => {
        !!this._onSave && this._onSave(index, insertNewTabbedRow);
    }

    private handleRowSelected = (index: number): void => {
        !!this._onRowSelected && this._onRowSelected(this.data.data.items[index]);
    }

    setShowNoDataMessage(show: boolean): this {
        this._showNoDataMessage = show;
        return this;
    }

    setNoDataMessage(message: string): this {
        this._noDataMessage = message;
        return this;
    }

    setRowHeight(height: number): this {
        this._rowHeight = height;
        return this;
    }

    setHeight(height: number): this {
        this._height = height;
        return this;
    }

    render() {
        const TypedGridComponent = PageableGridComponent as Newable<PageableGridComponent<T, TSort>>;
        return <TypedGridComponent
            columns={this.columns}
            data={this.data}
            pageSize={this._initialState && this._initialState.pageSize ? this._initialState.pageSize : this.pageSize}
            onDataRequest={e => this.onChange(Object.assign({ pageSize: this.pageSize }, e))}
            toolbar={this._toolbar.length ? this._toolbar : null}
            btnHandlers={this._btnHandlers}
            updateSelection={this._updateSelection}
            optionFlags={this._flags}
            onRowSelected={this.handleRowSelected}
            onRowSave={this.handleSave}
            highlightRow={this._highlightRow}
            styleRow={this._styleRow}
            rowToolTip={this._rowToolTip}
            noDataMessage={this._noDataMessage}
            qa={this._qa}
            filters={this._initialState && this._initialState.filters ? this._initialState.filters : null}
            sort={this._initialState && this._initialState.sort ? this._initialState.sort : null}
            page={this._initialState && this._initialState.page ? this._initialState.page : null}
            height={this._height}
            showEmptyMessage={this._showNoDataMessage}
            rowHeight={this._rowHeight}
        />;
    }

    public static ForPage<T, TSort>(pageSize: number, data: Dtos.PagedResultDto<T>, onChange: { (options: IGridBuilderChangeArgs<TSort>): void }) {
        return new PageableGridBuilder<T, TSort>(Pending.done<Dtos.PagedResultDto<T>>(data), pageSize, onChange);
    }

    public static ForPendingPage<T, TSort>(pageSize: number, data: Pending<Dtos.PagedResultDto<T>>, onChange: { (options: IGridBuilderChangeArgs<TSort>): void }) {
        return new PageableGridBuilder<T, TSort>(data || new Pending<Dtos.PagedResultDto<T>>(), pageSize, onChange);
    }
}
