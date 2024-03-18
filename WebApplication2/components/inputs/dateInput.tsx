import * as React from 'react';

type DateProps = InputProps<Date>;

export class DateInput extends React.Component<DateProps, { dateError?: boolean, valueAsString?: string }> {
    elem: HTMLInputElement;
    widget: kendo.ui.DatePicker;

    constructor(props: DateProps) {
        super(props);
        this.state = {
            valueAsString: props.value && moment.tz(props.value, "UTC").format("DD MMM YYYY") || "",
            dateError: false
        }
    }

    componentDidMount() {
        //set it via the elem as we are using on blur rather than on change
        this.elem.value = this.state.valueAsString;
        this.widget = new kendo.ui.DatePicker(this.elem, {
            format: "dd MMM yyyy"
        });
    }

    componentWillReceiveProps(nextProps: DateProps) {
        if (this.props.value != nextProps.value) {
            let val = nextProps.value && moment.tz(new Date(nextProps.value), "UTC").format("DD MMM YYYY");
            if (val != this.state.valueAsString) {
                this.setState({ valueAsString: val });
                //set it via the elem as we are using on blur rather than on change
                this.elem.value = val;
            }
        }
    }

    onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        let dateAsString = this.elem.value;
        if (dateAsString && dateAsString.length) {

            var parsedDate = Date.parse(dateAsString);

            if (isNaN(parsedDate)) {
                this.setState({ valueAsString: "", dateError: false });
                !!this.props.onChange && this.props.onChange(null);
            }
            else {
                let sendChange = !!this.props.onChange;
                let date = new Date(parsedDate);

                this.setState({ valueAsString: dateAsString, dateError: false })
                var val = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

                if (this.props.value && this.props.value.getTime && this.props.value.getTime() === val.getTime()) {
                    sendChange = false;
                }
                if (sendChange) {
                    this.props.onChange(val);
                }
            }
        }
    }

    render() {
        return (
            <div>
                <span>
                    <input style={{ width: '100%' }} type="text" ref={e => this.elem = e} disabled={this.props.disabled} onBlur={this.onBlur} data-qa={this.props.qa}/>
                </span>
                {this.state.dateError ? <span className="text-danger" data-qa={this.props.qa + "Error"}> Please enter a valid date</span> : null}
            </div>
        );
    }
}