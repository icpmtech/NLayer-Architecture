import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../adr';
import { Pending, GridFlags } from '../classes';

export interface PageableGridComponentProps<T, TSort> {
    btnHandlers: { (): void }[];
    columns: PageableGridColumn<T, TSort>[];
    data: Pending<Dtos.PagedResultDto<T>>;
    onRowSelected: { (index: number): void };
    onDataRequest: { (options: { page: number, sort: Dtos.SortExpression<TSort>, filters: Dtos.FilterExpression<TSort>[] }): void };
    optionFlags: GridFlags;
    pageSize: number;
    toolbar: string | Function | (string | GridToolbarItem)[];
    updateSelection: { (value: T[]): void };
    highlightRow: { (m: any): boolean };
    styleRow: { (value: T): string[] };
    rowToolTip: { (value: T) : { tooltipText?: string, width?: number, showAfter?: number, position?: string } };
    noDataMessage: string;
    filters: Dtos.FilterExpression<TSort>[];
    sort: Dtos.SortExpression<TSort>;
    page: number;
    onRowSave: { (index: number, insertNewTabbedRow: boolean): void };
    qa: string;
    height?: number;
    rowHeight?: number;
    showEmptyMessage?: boolean;
};

export class PageableGridComponent<T, TSort> extends React.Component<PageableGridComponentProps<T, TSort>, {}> {
    private checkboxes: JQuery;
    private linkCells: JQuery;
    private dataSource: kendo.data.DataSource;
    private elem: HTMLDivElement;
    private read: { success: { (data: Dtos.PagedResultDto<{}>): void }, error: { (error: any): void } };
    private widget: kendo.ui.Grid;
    private requiresUpdate: boolean;
    private toolbarNeedsUpdate: boolean = false;
    private shouldStopEventPropagation: boolean = false;
    private highlightedRowIndex = -1;
    private allowEditMode: boolean = this.props.columns.map(x => !!x.setValue).some(x => x == true);
    private currentEditRow: number = -1;
    private maxEditableColumnIndex: number;
    private ignoreBlur: boolean = false;

    constructor(props) {
        super(props);
    }

    private numericEditor(container, fieldName: string, columnName: string, min: number, max: number, decimals: number) {
        $('<input ' + ' name="' + columnName + '" />')
            .appendTo(container)
            .kendoNumericTextBox({
                min: min,
                max: max,
                decimals: decimals || 0,
                restrictDecimals: true
            });
    }

    private dropDownEditor(container, options: { name: string, id: number }[], fieldName: string, columnName: string, isRequired?: boolean) {
        $('<input ' + (isRequired ? 'required' : '') + ' name="' + columnName + '" />')
            .appendTo(container)
            .kendoDropDownList({
                autoBind: true,
                dataTextField: "name",
                dataValueField: "id",
                dataSource: options,
                optionLabel: "-- please select --",
            });
    }

    private setupDataSource(): kendo.data.DataSource {
        let component = this;

        // If simple grid is used (no server-side paging/sorting/filtering)
        if (!!(this.props.optionFlags & GridFlags.SimpleGrid)) {
            // create the initial sort from column info, as kendo initialDirection flag doesn't work
            let sort = this.props.columns.map((x, i) => ({
                field: "column" + i,
                dir: !!x.options.sortable && typeof x.options.sortable === 'object' ? x.options.sortable.initialDirection : null
            }));
            let fields: kendo.data.DataSourceSchemaModelFields = {};
            this.props.columns.forEach((x, i) => {
                fields["column" + i] = {
                    type: x.dataType,
                    editable: !!x.setValue,
                    validation: {}
                }

                // would be nice to add a limit on the decimals in here too...
                if (x.dataType == "number" && x.options.min != null) {
                    fields["column" + i].validation.min = x.options.min;
                }
                if (x.dataType == "number" && x.options.max != null) {
                    fields["column" + i].validation.max = x.options.max;
                }
            });
            let model = kendo.data.Model.define({ fields });

            let options = {
                data: [],
                pageSize: this.props.pageSize,
                sort: sort,
                schema: { model: model },
                change: function (event) {
                    if (typeof (event.action) == "undefined" || !event.field) return;

                    var column = component.props.columns[parseInt(event.field.replace("column", ""))];

                    if (!!column.setValue) {
                        var index = event.items[0].rowIndex;
                        var updatedValue = event.items[0][event.field];
                        var item = component.props.data.data.items[index];

                        var newValue = !!column.possibleOptions ? column.possibleOptions.find(x => x.id == updatedValue) : updatedValue;

                        column.setValue(item, newValue, index);
                    }
                }
            };

            return new kendo.data.DataSource(options);
        }
        // When using server-side paging/sorting/filtering
        else {
            var originalFilters = this.convertFiltersToTelerik(this.props.filters);
            var originalSort = this.convertSortToTelerik(this.props.sort);

            let fields: kendo.data.DataSourceSchemaModelFields = {};
            this.props.columns.forEach((x, i) => fields["column" + i] = {
                type: x.dataType,
                editable: !!x.setValue,
                validation: {}
            });
            let model = kendo.data.Model.define({ fields });

            var ds = new kendo.data.DataSource({
                page: (this.props.data && this.props.data.data && this.props.data.data.page) || this.props.page,
                pageSize: this.props.pageSize,
                requestStart: (e: any) => {
                    if (this.toolbarNeedsUpdate) {
                        // Every call to kendo's setOption() triggers a red request. Not needed for toolbar update, so block it as it can cause grid freeze
                        e.preventDefault();
                        this.toolbarNeedsUpdate = false;
                    }
                },
                transport: {
                    read: (options) => {
                        let sort = this.getSort(options.data.sort && Array.isArray(options.data.sort) && options.data.sort[0]);
                        let filters = this.getFilters(options.data.filter && options.data.filter.filters && Array.isArray(options.data.filter.filters) && options.data.filter, true);
                        this.requiresUpdate = true;
                        this.props.onDataRequest({ page: options.data.page, sort: sort, filters: filters });
                        this.read = options;
                    }
                },
                schema: {
                    data: function (response) {
                        return response && response.items.map(x => { x.Editable = !!x.SetValue; return x; });
                    },
                    total: (response) => {
                        return response && response.totalCount;
                    },
                    model: model
                },
                serverPaging: true,
                serverAggregates: true,
                serverSorting: true,
                serverFiltering: true,

                sort: originalSort,
                filter: originalFilters,

                change: function (event) {
                    if (typeof (event.action) == "undefined" || !event.field) return;

                    var column = component.props.columns[parseInt(event.field.replace("column", ""))];

                    if (!!column.setValue) {
                        var index = (event.items[0] as any).rowIndex;
                        var updatedValue = event.items[0][event.field];

                        var item = component.props.data.data.items[index];

                        var newValue = !!column.possibleOptions ? column.possibleOptions.find(x => x.id == updatedValue) : updatedValue;

                        column.setValue(item, newValue, index);
                    }
                }
            });

            return ds;
        }
    }

    private getSort(sort: { dir: "asc", field: string }): Dtos.SortExpression<TSort> {
        let field = this.getSortField(sort && sort.field);
        if (field !== null && field !== undefined) {
            let asscending = !(sort.dir != "asc");
            return { field, asscending };
        }
        return null;
    }

    private getFilters(filter: FilterObject, isOr: boolean) {
        if (!filter) return null;

        var results: Dtos.FilterExpression<TSort>[] = [];
        var current: Dtos.FilterExpression<TSort> = null;

        if (filter && filter.filters) {
            var children = filter.filters.map(x => this.getFilters(x, filter.logic == "or"));
            children.forEach(x => x.forEach(y => {
                if (current && current.field == y.field) {
                    current.values = current.values.concat(y.values);
                }
                else if (y) {
                    current = {
                        field: y.field,
                        values: y.values,
                    };
                    results.push(current);
                }
            }));
        }
        else if (filter) {
            let field = this.getSortField(filter.field);
            let val = filter.value;
            if (val instanceof Date) {
                //set if offset is needed
                var dateAsString = val.getFullYear() + "/" + (val.getMonth() + 1) + "/" + val.getDate() + " " + val.getHours() + ":" + val.getMinutes() + ":" + val.getSeconds();
                var offsetRequired = moment(dateAsString).utcOffset() - moment.tz(dateAsString, "America/New_York").utcOffset();
                val = moment.tz(val, 'America/New_York').add(offsetRequired, "minute").toDate();
            }

            if (field) {
                current = {
                    field: field,
                    values: [{
                        isOr: isOr,
                        type: this.getFilterType(filter.operator),
                        options: [val]
                    }]
                };
            }
            results.push(current);
        }

        return results;
    }

    private convertFiltersToTelerik(filter: Dtos.FilterExpression<TSort>[]) {
        if (!filter) return null;

        let result = { filters: [], logic: "or" } as FilterObject;

        for (var i = 0; i < filter.length; i++) {
            let currentField = filter[i];
            let field = this.convertSortFieldToTelerik(currentField.field);

            let inner = { filters: [], logic: currentField.values[0].isOr ? "or" : "and" } as FilterObject;

            for (var j = 0; j < currentField.values.length; j++) {
                let currentValue = currentField.values[j];

                let f = {
                    field: field,
                    value: currentValue.options[0],
                    logic: currentValue.isOr ? "or" : "and",
                    operator: this.convertFilterTypeToTelerik(currentValue.type)
                } as FilterObject;

                inner.filters.push(f);
            }

            result.filters.push(inner);
        }

        return result;
    }

    private convertSortToTelerik(sort: Dtos.SortExpression<TSort>) {
        if (sort === null) return null;

        return sort !== null ? { dir: sort.asscending ? "asc" : "desc", field: this.convertSortFieldToTelerik(sort.field) } : null;
    }

    private convertSortFieldToTelerik(field: TSort): string {
        let sortColumn = this.props.columns.filter(x => x.sort == field);

        return field && sortColumn && sortColumn.length ? ("column" + this.props.columns.indexOf(sortColumn[0])) : null;
    }

    private convertFilterTypeToTelerik(adroitFilter: Dtos.FilterType): FilterOperators {
        switch (adroitFilter) {
            case Dtos.FilterType.Equals: return "eq";
            case Dtos.FilterType.NotEquals: return "neq";
            case Dtos.FilterType.IsNull: return "isnull";
            case Dtos.FilterType.IsNotNull: return "isnotnull";
            case Dtos.FilterType.LessThan: return "lt";
            case Dtos.FilterType.LessThanOrEqual: return "lte";
            case Dtos.FilterType.GreaterThan: return "gt";
            case Dtos.FilterType.GreaterThanOrEqual: return "gte";
            case Dtos.FilterType.StartsWith: return "startswith";
            case Dtos.FilterType.EndsWith: return "endswith";
            case Dtos.FilterType.Contains: return "contains";
            case Dtos.FilterType.DoesNotContain: return "doesnotcontain";
            case Dtos.FilterType.IsEmpty: return "isempty";
            case Dtos.FilterType.IsNotEmpty: return "isnotempty";
            default: return "eq";
        }
    }

    private getFilterType(telerikFilter: FilterOperators): Dtos.FilterType {
        switch (telerikFilter) {
            case "eq": return Dtos.FilterType.Equals;
            case "neq": return Dtos.FilterType.NotEquals;
            case "isnull": return Dtos.FilterType.IsNull;
            case "isnotnull": return Dtos.FilterType.IsNotNull;
            case "lt": return Dtos.FilterType.LessThan;
            case "lte": return Dtos.FilterType.LessThanOrEqual;
            case "gt": return Dtos.FilterType.GreaterThan;
            case "gte": return Dtos.FilterType.GreaterThanOrEqual;
            case "startswith": return Dtos.FilterType.StartsWith;
            case "endswith": return Dtos.FilterType.EndsWith;
            case "contains": return Dtos.FilterType.Contains;
            case "doesnotcontain": return Dtos.FilterType.DoesNotContain;
            case "isempty": return Dtos.FilterType.IsEmpty;
            case "isnotempty": return Dtos.FilterType.IsNotEmpty;
            default: return Dtos.FilterType.Equals;
        }
    }

    private getUIFilterOperators() {
        return {
            date: {
                eq: "Is equal to",
                neq: "Is not equal to",
                lt: "Is before",
                lte: "Is before or equal to",
                gt: "Is after",
                gte: "Is after or equal to",
                isempty: "Is empty",
                isnotempty: "Is not empty"
            },
            string: {
                eq: "Is equal to",
                neq: "Is not equal to",
                startswith: "Starts with",
                endswith: "Ends with",
                contains: "Contains",
                doesnotcontain: "Does not contain",
                isempty: "Is empty",
                isnotempty: "Is not empty"
            },
            number: {
                eq: "Is equal to",
                neq: "Is not equal to",
                lt: "Is lower than",
                lte: "Is lower or equal to",
                gt: "Is greater than",
                gte: "Is greater or equal to",
                isempty: "Is empty",
                isnotempty: "Is not empty"
            }
        }
    }

    private getSortField(columnName: string): TSort {
        if (!columnName) return null;
        var index = parseInt(columnName.substring("column".length));
        return (index || index === 0) ? this.props.columns[index].sort : null;
    }

    private tryParseJSON(originalString: string): any {
        try {
            var parsed = JSON.parse(originalString);
            console.log('parsed json string ' + originalString);
            return parsed;
        }
        catch (exception) {
            console.log('error parsing json string ' + originalString);
            return null;
        }
    }

    componentDidMount() {
        this.dataSource = this.setupDataSource();

        this.widget = new kendo.ui.Grid(this.elem, {
            // configuration
            columns: this.mapColumns(),
            dataSource: this.dataSource,
            height: this.props.height || 'auto',
            noRecords: { template: "&nbsp;" },
            selectable: true,
            toolbar: this.props.toolbar,
            // events
            change: event => this.handleChange(event),
            dataBound: () => this.onGridDataBound(),

            filterMenuInit: event => this.clearEmptyFilterOnClick(event),
            // flags
            navigatable: this.allowEditMode,
            filterable: !!(this.props.optionFlags & GridFlags.Filterable),
            pageable: !!this.props.pageSize,
            reorderable: !!(this.props.optionFlags & GridFlags.Reorderable),
            resizable: !!(this.props.optionFlags & GridFlags.Resizable),
            scrollable: !!(this.props.optionFlags & GridFlags.Scrollable),
            sortable: !!(this.props.optionFlags & GridFlags.Sortable),

            editable: this.allowEditMode ? { mode: "incell" } as kendo.ui.GridEditable : false,
            edit: (e) => { this.ignoreBlur = true; this.bindCustomCells(); this.gridEdit(e) },
            save: (e) => { this.gridSave(e); this.bindCustomCells(); },
            cancel: (e) => { this.bindCustomCells() },
            navigate: (e) => { this.ignoreBlur = true; this.bindCustomCells() }
        });

        let component = this;

        if (this.allowEditMode) {
            if (!!this.widget.content)
                this.widget.content.on("keydown", (e) => { this.onGridKeyDown(e, component) });

            if (!!this.widget.tbody) {
                this.widget.tbody.on("keydown", (e) => { component.ignoreBlur = true; this.onGridKeyDown(e, component); });
                this.widget.tbody.on("mouseenter", (e) => { component.ignoreBlur = true; });
                this.widget.tbody.on("mouseleave", (e) => { component.ignoreBlur = false; });
            }

            if (!!this.widget.lockedTable) {
                this.widget.lockedTable.on("keydown", (e) => { component.ignoreBlur = true; this.onGridKeyDown(e, component); });
                this.widget.lockedTable.on("mouseenter", (e) => { component.ignoreBlur = true; });
                this.widget.lockedTable.on("mouseleave", (e) => { component.ignoreBlur = false; });
            }

            $(this.elem).on("keydown", "*", (e) => { this.onGridKeyDown(e, component); });
            $(this.elem).on("focusout", (e) => {
                if (!component.ignoreBlur) {
                    this.props.onRowSave(this.currentEditRow, false);
                    this.currentEditRow = -1;
                }

                component.bindCustomCells();
                setTimeout(function () { component.bindCustomCells(); }, 10);
            });
        }

        if (!!(this.props.optionFlags & GridFlags.Breakable)) {
            this.widget.table.addClass('allow-word-break')
        }

        this.setGridData();
        this.onGridDataBound();
        this.maxEditableColumnIndex = component.allowEditMode ? component.props.columns.map((x, i) => { return { index: i, value: x } }).filter(x => !!x.value.setValue).reverse()[0].index : 0;
    }

    shouldComponentUpdate(next: PageableGridComponentProps<T, TSort>) {
        const prevData = !!this.props.data && !!this.props.data.data && this.props.data.data.items;
        const nextData = !!next.data && next.data.data && next.data.data.items;
        // might need to re-evaluate this as data could stay the same while props change
        let result = this.requiresUpdate || prevData !== nextData;
        return result;
    }

    componentDidUpdate() {
        this.setGridData();
    }

    private onGridKeyDown(e: any, component: this) {
        if (e.originalEvent.keyCode !== 9) {
            return;
        }

        component.bindCustomCells();

        var activeCell = $(component.elem).find("#aria_active_cell");

        var isPreviousToLastColumn = component.isOnPreviousToLastColumn(activeCell, component);
        var isBottomRow = component.isOnLastRow(activeCell, component);

        if (isPreviousToLastColumn) {
            setTimeout(() => {
                component.widget.saveChanges();

                if (component.props.onRowSave)
                    component.props.onRowSave(component.currentEditRow, isBottomRow);
            }, 0);
        }
    }

    private isOnPreviousToLastColumn(activeCell: any, component): boolean {
        var currentColumnIndex = component.widget.cellIndex(activeCell);
        var isPreviousToLastColumn = component.maxEditableColumnIndex === currentColumnIndex;

        return isPreviousToLastColumn;
    }

    private isOnLastRow(target: JQuery, component: this) {
        // assumes command column is last column and to the right
        var rowCount = component.widget.dataSource.data().length;
        var row = target.closest("tr");
        var rowIndex = row.closest("tbody").find("tr").index(row);

        var isLastCell = rowIndex === (rowCount - 1);

        return isLastCell;
    }

    private gridEdit(event: kendo.ui.GridEditEvent) {
        var editRowIndex = $(event.container).closest("tr").index();

        this.widget.table.find('tr').toggleClass('k-grid-edit-row', false).toggleClass('k-state-selected', false);

        if (this.widget.lockedTable)
            this.widget.lockedTable.find('tr').toggleClass('k-grid-edit-row', false).toggleClass('k-state-selected', false);

        if (editRowIndex != this.currentEditRow) {
            this.currentEditRow = editRowIndex;
        }
    }

    private gridSave(event: kendo.ui.GridSaveEvent) {
        var editRowIndex = $(event.container).closest("tr").index();

        this.widget.table.find(`tr:eq(${editRowIndex}) td:eq(0)`).toggleClass('row-as-saved', false).toggleClass('row-as-unsaved', true);

        if (this.widget.lockedTable)
            this.widget.lockedTable.find(`tr:eq(${editRowIndex}) td:eq(0)`).toggleClass('row-as-saved', false).toggleClass('row-as-unsaved', true);
    }

    private setGridData() {
        this.updateToolBar();
        const props = this.props;
        let errorFlag: boolean = false;

        // Sets grid data when no server-side paging/filtering/sorting is used
        if (!!(props.optionFlags & GridFlags.SimpleGrid)) {
            if (!!this.widget && props.data && props.data.isReady()) {
                let mappedData = this.mapData(props.data.data);
                this.displayEmptyMessage(mappedData.totalCount);
                let ds = !!mappedData && !!mappedData.items ? mappedData.items : null;
                this.widget.dataSource.data(ds);

                let ps = this.widget.dataSource.pageSize();
                props.pageSize != ps && this.widget.dataSource.pageSize(props.pageSize);
            }
            else if (props.data.error) {
                errorFlag = true;
            }
        }
        // Sets grid data when server-side paging/filtering/sorting is used
        else {
            if (props.data && props.data.isReady()) {
                if (this.read) {
                    let mapped = this.mapData(props.data.data);
                    this.displayEmptyMessage(mapped.totalCount);
                    this.read.success(mapped);
                }
                this.requiresUpdate = false;
            }
            else if (props.data.error) {
                if (this.read) {
                    this.read.error(props.data.error);
                }
                errorFlag = true;
                this.requiresUpdate = false;
            }
        }

        if (errorFlag) {
            const message = this.props.data.error.userMessage || "An unexpected error occurred";
            const gridContent = $('.k-grid-content', this.elem);
            const gridContentLocked = $('.k-grid-content-locked', this.elem); // For when there are fixed/locked columns
            gridContentLocked.html(`<div class="flash-message alert-danger text-center">&nbsp;</div >`).css('height', 'auto');
            gridContent.html(`<div class="flash-message alert-danger text-center">${message}</div >`);
        }
    }

    private displayEmptyMessage(count: number) {
        if (count === 0 && (!!this.props.showEmptyMessage)) { // Display message when grid empty
            setTimeout(() => {
                const emptyGridContent = $('.k-grid-norecords', this.elem);
                $('.k-grid-content-locked', this.elem).css("background-color", "#dff0d8"); // For when there are fixed/locked columns
                emptyGridContent.html(`<div class="flash-message alert-success text-center w-100">${this.props.noDataMessage || 'No data to display'}</div>`);
            });
        }
        else { // Make sure locked columns revert to transparent background when grid has data
            $('.k-grid-content-locked', this.elem).css("background-color", "inherit");
        }
    }

    private getFilterOption(index: number, value: string) {
        var r = {};
        r["column" + index] = value;
        return r;
    }

    private mapColumns(): kendo.ui.GridColumn[] {
        return this.props.columns.map((c, i) => {
            let template = c.options.template;
            let component = this;

            if (c.getValue) {
                let columnTitle = this.allowEditMode ? `data-column-name=\"${c.options.columnPropertyName || c.title || i.toString()}\"` : "";
                let columnIndicator = this.allowEditMode && i == 0 ? '<span class="validation-block"></span>' : '';
                template = `<div>${columnIndicator}<div ${columnTitle} data-custom-template=\"${i}\">#: column${i} #</div><span class='validation-arrow'></span></div>`;
            }
            let options: kendo.ui.GridColumn = {};

            options.sortable = typeof c.options.sortable !== "undefined"
                ? c.options.sortable
                : !!c.sort || !!(this.props.optionFlags & GridFlags.SimpleGrid)

            options.width = c.options.width;
            options.headerTemplate = c.options.headerTemplate;
            options.title = c.title;

            // Set a custom checkbox filter (with its own datasource) for current column, if the 'filterItems' option has been set
            if (c.options.filterItems) {
                options.filterable = {
                    multi: true,
                    checkAll: typeof c.options.selectAllFilter !== "undefined" ? c.options.selectAllFilter : true, // hide or show the 'Select All' option in the filter
                    dataSource: c.options.filterItems.map(s => this.getFilterOption(i, s))
                };
            }

            // Set the text label for the filter is current column datatype is boolean and filtering is enabled
            else if (c.dataType === "boolean" && c.options.filterable !== false) {
                options.filterable = {
                    messages: { isTrue: "Yes", isFalse: "No" }
                } as kendo.ui.GridColumnFilterable;
            }

            // Set date format for filter if current column datatype is date and filtering is enabled
            else if (c.dataType === "date" && c.options.filterable !== false) {
                options.filterable = {
                    ui: function (element) {
                        element.kendoDatePicker({
                            format: "dd MMM yyyy"
                        });
                    }
                } as kendo.ui.GridColumnFilterable;
            }

            else if (c.dataType === "number" && c.options.filterable !== false) {
                options.filterable = {
                    ui: function (element) {
                        element.kendoNumericTextBox({
                            format: "n" + c.options.decimals || 0,
                            decimals: c.options.decimals || 0,
                            restrictDecimals: true
                        });
                    }
                }
            }

            else {
                options.filterable = typeof c.options.filterable !== "undefined"
                    ? c.options.filterable
                    : !!c.sort || !!(this.props.optionFlags & GridFlags.SimpleGrid);
            }

            // Set available filter operators if column is filterable and datatype is string/number and no custom filtering has been set        
            if (options.filterable === true && (c.dataType === "string" || c.dataType === "number")) {
                options = Object.assign({}, options, { filterable: { operators: this.getUIFilterOperators() } });
            }
            // Set available filter operators if column is filterable and datatype is date                     
            if (c.dataType === "date" && c.options.filterable !== false) {
                options = Object.assign({}, options, { filterable: Object.assign({}, options.filterable, { operators: this.getUIFilterOperators() }) });
            }

            options.locked = c.options.locked;

            options.editor = (c.possibleOptions)
                ? function (container, options) { return component.dropDownEditor(container, c.possibleOptions, c.title, "column" + i) }
                : (c.dataType == 'number' ? function (container, options) { return component.numericEditor(container, c.title, "column" + i, c.options.min, c.options.max, c.options.decimals) } : null);
            
            return Object.assign({}, options, { field: "column" + i, template });
        });
    }

    private mapData(data: Dtos.PagedResultDto<T>): Dtos.PagedResultDto<{}> {
        if (!!data.items) {
            let mappedItems = data.items.map((row, rowIndex) => {
                var rowData = { rowIndex };
                this.props.columns.forEach((c, i) => {
                    if (!!c.telericValue)
                        rowData["column" + i] = c.telericValue(row);
                });
                return rowData;
            });

            return {
                count: data.count,
                items: mappedItems,
                page: data.page,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                totalPages: data.totalPages
            };
        }
        return null;
    }

    private handleChange(event: kendo.ui.GridChangeEvent) {
        if (this.allowEditMode) {
            var item = event.sender.select();

            if (this.currentEditRow != -1 && this.currentEditRow != item.index()) {
                this.props.onRowSave(this.currentEditRow, false);
            }

            this.currentEditRow = item.index();

            return;
        }

        if (this.shouldStopEventPropagation === true) {
            /* Maintain the selected row before the 'change' event was triggered. 
              'ShouldStopEventPropagation' should only be true when a click event 
              on an 'a' or 'i' element a gridcell with 'react-link' class happens */
            this.widget.items().each((index, row) => {
                if (index == this.highlightedRowIndex && !$(row).hasClass("k-state-selected")) {
                    console.log('adding row highlight');
                    $(row).addClass("k-state-selected");
                }
                else {
                    console.log('removing row highlight');
                    $(row).removeClass("k-state-selected");
                }
            });
            this.shouldStopEventPropagation = false;
        }
        else { // Only call 'onChange' props when 'shouldStopEventPropagation' is false
            if (!!this.props.onRowSelected) {
                const grid = event.sender;
                const data = grid.dataSource.data();
                const uid = grid.select().data().uid;
                let index = null;

                data.some((x: any, i) => {
                    if (x.uid === uid) {
                        index = i;
                        return true;
                    }
                    return false;
                });

                this.props.onRowSelected(index);
            }
        }
    }

    private onGridDataBound() {
        if (!this.widget) return;
        this.clearCheckAll();
        this.updateSelection();
        this.bindButtons();
        this.bindCheckboxes();
        this.bindLinkCells();
        this.bindCustomCells();
        this.highlightSelectedRow();
        this.styleSelectedRow();
        this.setCellTooltips();
        this.setRowTooltip();
        this.resize();
    }

    private clearCheckAll() {
        $('input[type="checkbox"][data-check-all="true"]', this.elem).prop('checked', false);
    }

    private updateSelection(data: T[] = []) {
        !!this.props.updateSelection && this.props.updateSelection(data);
    }

    private updateToolBar() {
        if (this.hasToolbarChanged()) {
            this.toolbarNeedsUpdate = true;
            this.widget.setOptions({ toolbar: this.props.toolbar })
        }
    }

    private bindButtons() {
        this.props.btnHandlers.forEach((fn, index) => $(`.k-toolbar.k-grid-toolbar a.btn-grid-toolbar[data-guid="${index}"]`, this.elem).off().on("click", event => fn()));
    }

    private bindCheckboxes() {
        this.checkboxes = $('input[type="checkbox"][data-check-row="true"]', this.elem)
            .off()
            .on("click", event => event.stopPropagation())
            .on("change", event => this.handleCheckboxChange(event.currentTarget))

        this.checkboxes.parent().off().on("click", event => this.handleCheckboxClick(event));
    }

    private bindLinkCells() {
        setTimeout(() => { // Make unclickable (i.e. default Kendo click event) all grid cells that contain elements with the 'react-link' class...
            this.linkCells = $('.react-link', this.elem)
                .parents('td[role="gridcell"]')
                .off()
                .on("click", event => {
                    let elemTypeName = event.target.localName;
                    if (elemTypeName !== "a" && elemTypeName !== "i") { // ...but allow click events on 'a' and 'i' elements within the 'react-link' grid cells
                        event.stopPropagation();
                    }
                    else { // allow event propagation for 'a' and 'i' elements, so the 'change' event of the grid will be triggered
                        this.shouldStopEventPropagation = true;    // Will be used to stop the grid calling its 'onChange' props                     
                        this.widget.items().each((index, row) => { // Get the highlighted/selected row index (if any) 
                            this.highlightedRowIndex = $(row).hasClass("k-state-selected") ? index : this.highlightedRowIndex;
                        });
                    }
                });
        });
    }

    private bindCustomCells() {
        let items = !!this.props.data && !!this.props.data.data && this.props.data.data.items;

        if (!!items) {
            $(this.elem).find('div[data-custom-template]').each((i, e) => {
                const $e = $(e);
                var templateId = $e.data("custom-template");
                const tr = $e.closest("tr");
                const uid = tr.data().uid;
                const telerikDataItem = this.widget.dataSource.getByUid(uid) as any;

                if (!!telerikDataItem) {
                    const actualDataItem = items[telerikDataItem.rowIndex];
                    const content = this.props.columns[templateId].getValue(actualDataItem, telerikDataItem.rowIndex);
                    ReactDOM.render(<div>{content}</div>, e);
                }
            });
        }
    }

    private clearEmptyFilterOnClick(event: kendo.ui.GridFilterMenuInitEvent) {
        event.container.on("click", "[type='submit']", () => {
            setTimeout(() => { // Need to use timeout, otherwise this runs before filter() is available
                var dataSource = this.widget.dataSource;
                var len = !!dataSource.filter() ? dataSource.filter().filters.length : -1; // the number of filters to be applied
                if (len === 0) {
                    dataSource.filter({}) // Clears the datasource applied filters
                }
            });
        });
    }

    private handleCheckboxClick(event: JQueryEventObject) {
        event.stopPropagation();
        const box = $(event.currentTarget.querySelector("input"));
        const checked = !box.is(":checked");
        box.prop("checked", checked).change();
    }

    private handleCheckboxChange(checkbox: Element) {
        const box = $(checkbox);
        const checked = !!box.is(":checked");
        box.attr("data-qa-checked", checked ? "true" : "false");

        // if we're clicking the checkall box, then apply change to all checkboxes
        if (box.data("checkAll")) {
            this.checkboxes.not(box).prop("checked", checked).attr("data-qa-checked", checked ? "true" : "false");
        }

        this.updateSelection(
            this.checkboxes.not("[data-check-all]").filter(":checked").get().map(element => {
                const $e = $(element);
                const uid = $e.closest('tr').data().uid;
                const telerik = this.widget.dataSource.getByUid(uid) as any;
                return this.props.data.data.items[telerik.rowIndex];
            })
        );
    }

    private hasToolbarChanged(): boolean {
        let prev = this.widget.getOptions().toolbar;
        let next = this.props.toolbar
        let hasChanged: boolean = false;
        if (!prev && !next) {
            return false;
        }
        if (prev instanceof Array && next instanceof Array) {
            hasChanged = !((prev.length == next.length) && prev.every((element, index) => typeof element === 'string' ? element === next[index] : String(element.template) === String(next[index].template)));
        }
        return hasChanged;
    }

    private getNonEditableRows(): { tr: JQuery, uid: any, kendoItem: any, dataItem: T }[] {
        let items = !!this.props.data && !!this.props.data.data && this.props.data.data.items;
        let rows = [];

        if (!!items && !this.allowEditMode) {
            this.widget.items().each((index, row) => {
                const tr = $(row);
                const uid = tr.data().uid;
                const kendoItem = this.widget.dataSource.getByUid(uid) as any;
                const dataItem = items[kendoItem.rowIndex];

                rows.push({
                    tr: tr,
                    uid: uid,
                    kendoItem: kendoItem,
                    dataItem: dataItem
                });
            });
        }
        return rows;
    }

    private highlightSelectedRow() {
        
        if (!this.props.highlightRow) return;

        this.getNonEditableRows().forEach(row => {
            if (!!row.dataItem && this.props.highlightRow(row.dataItem)) {
                row.tr.addClass("k-state-selected")
            }
        });
    }

    private styleSelectedRow() {

        if (!this.props.styleRow) return;

        this.getNonEditableRows().forEach(row => {
            if(!!row.dataItem) {
                const classNames = this.props.styleRow(row.dataItem);
                if (!classNames) return;

                row.tr.removeClass('k-alt');
                classNames.forEach(className => row.tr.addClass(className));
            }
        });
    }

    private resize() {
        // queue this to happen after kendo has finished it's rendering
        setTimeout(() => {
            this.widget.wrapper.children(".k-grid-content-locked").height("");
            this.widget.wrapper.children(".k-grid-content").height("");
            this.widget.wrapper.height("");
            this.widget.resize();
            this.toggleScrollbar();
        });
    }

    private toggleScrollbar() {
        let gridWrapper = this.widget.wrapper;
        let gridDataTable = this.widget.table;
        let gridDataArea = gridDataTable.closest(".k-grid-content");
        if (!!gridDataTable[0] && !!gridDataArea[0]) {
            gridWrapper.toggleClass("no-scrollbar", gridDataTable[0].offsetHeight <= gridDataArea[0].offsetHeight);
        }
    }

    private setRowTooltip() {

        if (!this.props.rowToolTip) return;

        this.getNonEditableRows().forEach(row => {
            if (!!row.dataItem) {
                const rowToolTip = this.props.rowToolTip(row.dataItem);
                if (!rowToolTip) return;

                this.widget.wrapper.kendoTooltip({
                    filter: `tr[data-uid=${row.uid}]`,
                    content: (e: Event) => rowToolTip.tooltipText,
                    show: function (e: kendo.ui.TooltipEvent) {
                    this.content.parent().css("visibility", "visible");
                    },
                    hide: function (e: kendo.ui.TooltipEvent) {
                        this.content.parent().css("visibility", "hidden");
                    },
                    position: rowToolTip.position || "right",
                    width: rowToolTip.width,
                    showAfter: rowToolTip.showAfter
                });
            }
        });
    }

    private setCellTooltips() {
        this.widget.wrapper.kendoTooltip({
            filter: "td",
            content: (e: Event) => {
                let gridCell: HTMLElement = !!e.target[0] ? e.target[0] : null;
                // Generate tooltip text only if text is too wide to be shown in cell (...)
                return !!gridCell && !!gridCell.innerText && gridCell.scrollWidth > gridCell.offsetWidth
                    ? gridCell.innerText
                    : ""
            },
            show: function (e: kendo.ui.TooltipEvent) {
                if (this.content.text() !== "") {
                    this.content.parent().css("visibility", "visible");
                }
            },
            hide: function (e: kendo.ui.TooltipEvent) {
                this.content.parent().css("visibility", "hidden");
            },
            position: "right"
        });
    }


    render() {
        return <div className="react-grid" style={{ marginBottom: "10px" }} ref={e => this.elem = e} data-qa={this.props.qa}></div>
    }
}
