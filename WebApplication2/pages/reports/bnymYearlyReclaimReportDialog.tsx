import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { DateTime, ReportDocumentLink, Dropdown, Error, NumberInput } from '../../components';
import { connect, Pending, Loader, PagedDataState, PageCache, PageableGridBuilder, AppError, PopupBuilder, FormBuilder, LoadingStatus } from "../../classes";

interface Props {
    onSave: (year: number) => void;
    onCancel: () => void;
}

interface State {
    selectedYear: number;
}

export class BnymYearlyReclaimReportDialog extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { selectedYear: new Date().getFullYear() };
    }

    render() {
        return (<div className="">
            <div className="row col-md-10">
                <div className="col-md-3">Select Year</div>
                <div className="col-md-6"><NumberInput format="0000" onChange={(d) => this.setState({ selectedYear: d })} value={this.state.selectedYear} qa="SelectYearInput"/></div>
            </div>
            <div className="float-end" style={{ marginTop: '10px' }}>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave(this.state.selectedYear)} data-qa="RunReportButton">Run Report</button>
            </div>
        </div>);
    }
}