import * as React from 'react';

type DateProps = InputProps<Date>;

export class DateInput extends React.Component<DateProps, {}> {
    elem: HTMLInputElement;
    widget: kendo.ui.DatePicker;

    componentDidMount() {
        this.widget = new kendo.ui.DatePicker(this.elem, {
            change: (e) => this.handleChange(e)
        });
        this.widget.value(this.getValueAsAString(this.props.value));
    }

    private getValueAsAString(date: Date) {
        return !!date ? moment(date).tz('America/New_York').format() : null;
    }

    componentWillReceiveProps(props: DateProps) {
        this.widget.value(this.getValueAsAString(props.value));
    }

    shouldComponentUpdate() {
        return false;
    }

    handleChange = (event: kendo.ui.DatePickerChangeEvent) => {
        if (!!this.props.onChange) {
            const valueFromKendo = event.sender.value();
            const dateString = valueFromKendo.getFullYear() + '/' + (valueFromKendo.getMonth() + 1) + '/' + valueFromKendo.getDate() + " 00:00:00";
            const newYork = moment.tz(dateString, 'YYYY/M/D HH:mm:ss', 'America/New_York');
            this.props.onChange(newYork.toDate());
        }
    }

    render() {
        return <input type="text" ref={e => this.elem = e} data-qa={this.props.qa + "Input"}/>
    }
}