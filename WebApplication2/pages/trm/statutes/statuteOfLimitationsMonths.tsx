import * as React from 'react';
import { FormBuilder } from '../../../classes';

interface StatuteMonthsProps {
    onMonthsChange: (months) => void;
    onDaysChange: (days) => void;
    months?: number;
    days?: number;
}

interface StatuteMonthsState {
    years?: number;
    months?: number;
    days?: number;
}

export class StatuteOfLimitationsMonths extends React.Component<StatuteMonthsProps, StatuteMonthsState> {

    public constructor() {
        super();
        this.state = { years: 0, months: 0, days: 0 };
    }

    componentDidMount() {
        this.setState({
            years: this.props.months ? Math.floor(this.props.months / 12) : 0,
            months: this.props.months ? this.props.months % 12 : 0,
            days: this.props.days || 0
        });
    }

    render() {
        return new FormBuilder(this.props.months)
            .isInline(true)
            .addNumber("Years", x => this.state.years, (m, v) => { this.setState({ years: v }); this.props.onMonthsChange(this.state.years * 12 + this.state.months); }, "Years", null, { width: '100px', labelPosition: 'right' })
            .addNumber("Months", x => this.state.months, (m, v) => { this.setState({ months: v }); this.props.onMonthsChange(this.state.years * 12 + this.state.months); }, "Months", null, { width: '100px', labelPosition: 'right' })
            .addNumber("Days", x => this.state.days, (m, v) => { this.setState({ days: v }); this.props.onDaysChange(v); }, "Days", null, { width: '100px', labelPosition: 'right' })
            .render();
    }
}
