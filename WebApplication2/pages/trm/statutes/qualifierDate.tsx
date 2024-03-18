import * as React from 'react';
import { FormBuilder } from '../../../classes';

interface QualifierDateProps {
    onChange: (qi) => void;
    qualifier?: QualifierInfo;
}

interface QualifierDateState {
    availableDays: number;
}

class QualifierInfo {
    month?: number;
    day?: number;
}

export class QualifierDate extends React.Component<QualifierDateProps, QualifierDateState> {

    constructor() {
        super();
        this.state = { availableDays: 31 };
    }

    render() {
        let qualifierMonthName = this.props.qualifier.month ? moment().set("month", this.props.qualifier.month).format("MMMM") : "";
        let months = moment.months().map((m, i) => { return { name: m, id: i + 1 } });
        let availableDays = this.state.availableDays;

        let dayArray = Array(availableDays).fill(0).map((v, i) => { return { name: (i + 1).toString(), id: i + 1 } });

        return FormBuilder.for(this.props.qualifier)
            .isInline(true)
            .setChangeHandler(x => { this.updateDays(x); this.props.onChange(x) })
            .addDropdown("Month ", months, m => m.month && months.find(x => x.id === m.month), (m, v) => m.month = (v && months.find(x => x.id === v.id)).id, "Month", null, { labelPosition: 'right' })
            .addDropdown("Day ", dayArray, x => x.day && dayArray.find(d => d.id == x.day), (m, v) => m.day = v.id, "Day", null, { labelPosition: 'right' })
            .withQA("Form")
            .render();
    }

    private updateDays(info: QualifierInfo) {
        // use a leap year to ensure February 29th displays
        this.setState({ availableDays: info.month ? moment().year(2000).month(info.month - 1).daysInMonth() : 31 });
    }
}
