import * as React from 'react';
import { DateInput } from './dateInput';

interface Props extends InputProps<Date> {
    showInvalidFormatError?: boolean;
}

interface State {
    dateError?: boolean,
    dateAsString?: string
}

export class DateTimeInput extends React.Component<Props, State> {
    private dateElem: HTMLInputElement;
    private datePicker: kendo.ui.DateTimePicker;

    constructor(props: Props) {
        super(props);

        this.state = this.getStateFromProps(props);
    }

    componentDidMount() {
        //set it via the elem as we are using on blur rather than on change
        this.dateElem.value = this.state.dateAsString;

        this.datePicker = new kendo.ui.DateTimePicker(this.dateElem, {
            format: "dd MMM yyyy HH:mm",
            timeFormat: "HH:mm"
        });

    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.value != nextProps.value) {
            var newState = this.getStateFromProps(nextProps);
            if (newState.dateAsString != this.state.dateAsString) {
                this.setState(newState);
                //set it via the elem as we are using on blur rather than on change
                this.dateElem.value = newState.dateAsString;

            }
        }
    }

    private getStateFromProps(props: Props): State {
        if (!props.value) {
            return {dateError: false, dateAsString: "" };
        }
        let momentVal = moment(props.value).tz('America/New_York');

        if (momentVal.isValid()) {
            return { dateError: false, dateAsString: momentVal.format("DD MMM YYYY HH:mm") };
        }
        else {
            return {dateError: true, dateAsString: props.value.toString()};
        }
    }

    private onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        let dateAsString = this.dateElem.value;
        if (dateAsString && dateAsString.length) {
            var momentValue = moment.tz(new Date(dateAsString), "America/New_York");
            if (momentValue.isValid()) {
                this.setState({ dateAsString: dateAsString, dateError: false })
                //set if offset is needed
                var offsetRequired = moment(dateAsString).utcOffset() - moment.tz(dateAsString, "America/New_York").utcOffset();
                let jsDateValue = momentValue.add(offsetRequired, "minute").toDate();
                let sendChange = !!this.props.onChange;
                if (this.props.value && this.props.value.getTime && this.props.value.getTime() === jsDateValue.getTime()) {
                    sendChange = false;
                }
                if (sendChange) {
                    this.props.onChange(jsDateValue);
                }
            }
            else {
                this.setState({ dateAsString: dateAsString, dateError: true });
                !!this.props.onChange && this.props.onChange(momentValue.toDate());
            }
        }
        else {
            this.setState({ dateAsString: "", dateError: false });
            !!this.props.onChange && this.props.onChange(null);
        }
    }

    render() {
        return (
            <div style={{ width: '230px' }}>
                <div>
                    <input type="text" ref={e => this.dateElem = e} disabled={this.props.disabled} onBlur={(e) => this.onBlur(e)} data-qa={this.props.qa + "Input"}/>
                </div>
                {this.state.dateError && this.props.showInvalidFormatError !== false ? <span className="text-danger" data-qa={this.props.qa + "Error"}> Please enter a valid date and time</span> : null}
            </div>
        );
    }
};