import * as React from 'react';

interface DropdownProps<T> extends InputProps<T> {
    options: T[];
    hasOptionsLabel?: boolean;
    map?: { (m: T): string };
};

export class Dropdown<T extends { name: string }> extends React.Component<DropdownProps<T>, {}> {  // Enforce the existence of a 'name' property in the Dto
    elem: HTMLSelectElement;
    widget: kendo.ui.DropDownList;

    componentDidMount() {
        this.widget = new kendo.ui.DropDownList(this.elem, {
            dataSource: this.props.options,
            change: (e) => this.handleChange(e),
            optionLabel: this.props.hasOptionsLabel === false ? "" : "Please select",
            dataTextField: "name",
            dataValueField: "id",
            enable: !this.props.disabled,
        });
        this.updateSelected(this.props);
    }

    handleChange(event: kendo.ui.DropDownListChangeEvent) {
        let index = event.sender.select();
        index = this.props.hasOptionsLabel === false ? index : index - 1;        
        !!this.props.onChange && this.props.onChange(this.props.options[index]);
    }

    componentWillReceiveProps(props: DropdownProps<T>) {
        !!props.options && this.widget.dataSource.data(props.options);
        this.updateSelected(props);
    }

    shouldComponentUpdate() {
        return false;
    }

    updateSelected(props: DropdownProps<T>) {
        let selectedIndex = props.options.indexOf(props.value); // Props.options index is 0-based
        selectedIndex = this.props.hasOptionsLabel === false ? selectedIndex : selectedIndex + 1;
        !!this.widget && this.widget.select(selectedIndex); // Zero is the 'Please select' entry (when present)
        !!this.widget && this.widget.enable(!props.disabled)
    }

    render(): JSX.Element {
        return (
            <div className={this.props.isFormControl ? "wideDropdown" : ""}>
                <select
                    ref={e => this.elem = e}
                    name={this.props.name}
                    data-qa={this.props.qa + "Select"}
                />
            </div>
        );
    }
};
