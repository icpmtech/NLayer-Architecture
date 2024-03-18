import * as React from 'react';

interface MultiSelectDropdownProps<T> extends InputProps<T[]> {
    options: T[];
    hasOptionsLabel?: boolean;
    map?: { (m: T[]): string };
    noneSelectedText?: string;
};

export class MultiSelectDropdown<T extends { name: string, id: number }> extends React.Component<MultiSelectDropdownProps<T>, {}> {  // Enforce the existence of a 'name' property in the Dto
    elem: HTMLSelectElement;
    widget: kendo.ui.MultiSelect;

    componentDidMount() {
        this.widget = new kendo.ui.MultiSelect(this.elem, {
            dataSource: this.props.options,
            change: (e) => this.handleChange(e),
            dataTextField: "name",
            dataValueField: "id",
            enable: !this.props.disabled,
            select: (e) => this.handleSelect(e),
            deselect: (e) => this.handleDeselect(e),
            placeholder: this.props.noneSelectedText || "(All)"
        });
        this.updateSelected(this.props);
    }

    handleSelect(event: kendo.ui.MultiSelectSelectEvent) {
        this.handleChange(null);
    }

    handleDeselect(event: kendo.ui.MultiSelectDeselectEvent) {
        this.handleChange(null);
    }

    handleChange(event: kendo.ui.MultiSelectChangeEvent) {
        let selectedItems = this.props.options.filter(x => this.widget.value().some(y => y == x.id));

        !!this.props.onChange && this.props.onChange(selectedItems);
    }

    componentWillReceiveProps(props: MultiSelectDropdownProps<T>) {
        !!props.options && this.widget.dataSource.data(props.options);
        //this.updateSelected(props);
    }

    updateSelected(props: MultiSelectDropdownProps<T>) {
        if (!!this.props.value) {
            this.widget.value(this.props.value.map(x => x.id));
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    render(): JSX.Element {
        return (
            <div className={this.props.isFormControl ? "wideDropdown" : ""}>
                <select
                    ref={e => this.elem = e}
                    name={this.props.name}
                    data-qa={this.props.qa + "MultiSelect"}
                />
            </div>
        );
    }
}

