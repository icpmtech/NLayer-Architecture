import * as React from 'react';

export interface NumberProps extends InputProps<number> {
    min?: number;
    decimals?: number;
    format?: string;
    width?: string;
}

export class NumberInput extends React.Component<NumberProps, {}> {
    elem: HTMLInputElement;
    widget: kendo.ui.NumericTextBox;

    componentDidMount() {
        this.widget = new kendo.ui.NumericTextBox(this.elem, {
            min: (!!this.props.min || this.props.min === null) ? this.props.min : 0,
            decimals: (!!this.props.decimals || this.props.decimals === 0) ? this.props.decimals : 6,
            format: !!this.props.format ? this.props.format : "#,##0.######",
            change: (e) => this.handleKendoChange(e),
            spin: (e) => this.handleKendoChange(e),
            value: this.props.value,
            restrictDecimals: !!this.props.decimals,
        });
    }

    componentWillReceiveProps(props: NumberProps) {
        this.widget.value(props.value);
    }

    handleKendoChange = (event: kendo.ui.NumericTextBoxChangeEvent) => {
        !!this.props.onChange && this.props.onChange(event.sender.value());
    }

    render() {
        return (<div style={{ width: this.props.width }}>
            <input type="text" ref={e => this.elem = e}  disabled={this.props.disabled} data-qa={this.props.qa + "Number"}/>
        </div>);
    }
}