import * as React from 'react';
import * as Framework from '../../classes';

interface AutoCompleteProps<T> extends InputProps<T> {
    options: T[];
    map?: { (m: T): string };
    textField?: string;
    allowAddNew?: boolean;
    onClear?: { (): void};
};

interface AutoCompleteState<T> extends InputState {
    options: T[];
}

export class AutoComplete<T> extends React.Component<AutoCompleteProps<T>, AutoCompleteState<T>> {
    elem: HTMLInputElement;
    widget: kendo.ui.ComboBox;
    addButton: kendo.ui.Button;

    constructor(props: AutoCompleteProps<T>) {
        super(props);

        var clonedOptions = Framework.safeClone(props.options);
    }

    componentDidMount() {
        this.widget = new kendo.ui.ComboBox(this.elem, {
            dataSource: this.mapData(this.props.options),
            dataTextField: !!this.props.map ? 'custom' : (this.props.textField || 'text'),
            filter: 'contains',
            change: (e) => this.handleChange(e),
            select: (e) => this.handleSelect(e)
        });
        let selectedIndex = this.props.options.indexOf(this.props.value);
        this.widget.select(selectedIndex);
    }

    componentWillReceiveProps(props: AutoCompleteProps<T>) {
        this.widget.dataSource.data(this.mapData(props.options));
        let selectedIndex = props.options.indexOf(props.value);
        this.widget.select(selectedIndex);
    }

    handleChange(event: kendo.ui.ComboBoxChangeEvent) {
        if (event.sender.select() == -1) {
            this.handleClear();
            return;
        }
            const s = event.sender;
            !!this.props.onChange && this.props.onChange(s.dataItem(s.select()))
    }

    handleClear() {
        !!this.props.onClear && this.props.onClear();
    }

    addNewOption(newItem: T) {
        this.props.options.push(newItem);        
        //this.componentDidMount();

        var item = newItem as any as string;
        this.widget.value(item);

        !!this.props.onChange && this.props.onChange(newItem);
    }

    handleSelect(event: kendo.ui.ComboBoxSelectEvent) {
        const s = event.sender;
        var item: T;
        
        if (this.props.allowAddNew && !event.item && !!event.sender.text()) {
            // need to check that we're only using strings here
            var newItem = event.sender.text() as any as T;
            this.addNewOption(newItem);
        }
        else if (event.item) {
            item = this.widget.dataItem(event.item.index());
        }
        else {
            this.widget.value("");
        }

        !!this.props.onSelect && this.props.onSelect(item);
    }

    mapData(options: T[]) {
        return !this.props.map
            ? options
            : options.map(option => Object.assign(option, { custom: this.props.map(option) }));
    }

    render() {
        return <input ref={e => this.elem = e} style={{ display: 'none', width: '100%' }} disabled={this.props.disabled} data-qa={this.props.qa + "Input"}/>;
    }
}