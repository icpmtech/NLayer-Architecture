interface Newable<T> {
    new (): T;
}

interface InputProps<T> {
    qa: string
    value?: T;
    name?: string;
    disabled?: boolean;
    validators?: any[];
    onChange?: { (v: T): void };
    onSelect?: { (v: T): void };
    isFormControl?: boolean;
    placeholder?: string;
}

interface YesNoInputProps extends InputProps<boolean> {
    yesCaption?: string;
    noCaption?: string;
}

interface InputState {
    value: string;
}


interface ValidatorFn {
    (v?: any): string;
}

interface PopupContentProps {
    onClose?: { (): void };
}

// grid interfaces
type GridColumnType = "string" | "number" | "boolean" | "date" | "object";

interface GridToolbarItem extends kendo.ui.GridToolbarItem {
    className?: string;
    imageClass?: string;
}

interface GridColumn<T> {
    options: kendo.ui.GridColumn;
    getValue?: { (m: T): any };
}

interface PageableGridColumn<T, TSort> {
    options: ColumnOptions;
    getValue: { (m: T, index: number): any };
    setValue: { (m: T, v: any, index: number): void },
    telericValue: { (m: T): string | Date | number | boolean };
    telericDisplayValue: { (m: T): string | Date | number | boolean };
    dataType: GridColumnType;
    sort: TSort;
    title: string;
    qa: string;
    possibleOptions?: { id: number, name: string }[];
}

interface ColumnOptions {
    filterItems?: string[];
    width?: number | string;
    headerTemplate?: string;
    locked?: boolean;
    template?: string;
    filterable?: boolean;
    selectAllFilter?: boolean;
    sortable?: boolean | SortableColumnOption;
    decimals?: number;
    columnPropertyName?: string;
    min?: number;
    max?: number;
}

interface DateTimeColumnOptions extends ColumnOptions {
    showSuffix?: boolean;
}

interface SortableColumnOption {
    initialDirection: "asc" | "desc";
}

interface FilterObject {
    field: string;
    operator: FilterOperators;
    value: any;
    logic: "or" | "and";
    filters?: FilterObject[];
}

type FilterOperators = "eq" | "neq" | "isnull" | "isnotnull" | "lt" | "lte" | "gt" | "gte" | "startswith" | "endswith" | "contains" | "doesnotcontain" | "isempty" | "isnotempty";
