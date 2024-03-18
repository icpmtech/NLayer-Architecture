import * as React from 'react';
import * as Framework from '../../../classes';
import * as Components from "../../../components";
import { Apis } from '../../../adr';

export interface Props{
    onClose: () => void;
}

export interface State {
    exportError?: Framework.AppError;
    exportSuccess?: boolean;
    startDate?: Date;
}

export class RequestClientMatrix extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { exportError: null, exportSuccess: false, startDate: new Date() };
    }

    private onExportClick = (startDate) => {
        let api = new Apis.ReportsApi();
        let method = api.queueClientMatrixExport({ startDate: this.state.startDate });
        
        Framework.connect(method, null, response => {
            if (response.isFailed()) {
                this.setState({ exportError : response.error });
            }
            else if (response.isDone()) {
                this.setState({ exportSuccess: true, exportError: null });
            }
        })
    }
    
    private renderSuccess() {
        return this.state.exportSuccess ? <Components.Message type="success" message={"Successfully started export process"} onClose={() => this.props.onClose()} qa = { "SuccessfullyStartedExportMessage"}/> : null;
    }

    private renderText() {
        return (
            <div>
                {!this.state.exportSuccess ? <p>Select the date from which the report will be generated.</p> : null}
                {!this.state.exportSuccess ? <div style={{ width: '100%' }}><Components.DateInput value={this.state.startDate} onChange={(d) => this.setState({ startDate: d })} qa="GenerateReportStartDate"/></div> : null}
                {!this.state.exportSuccess ? <p>Click the button below to start the export process.</p> : null}
                <p>When the export is ready for download you will be notified by email.</p>
                <p>To download the exported files go to the <a href="/reports/export" data-qa="ReportsLink">Reports</a> page.<br /><br /></p>
            </div>
        );
    }

    private renderButtons() {
        return (
            <div className={"col-md-6 float-end mb-1"} style={{ paddingRight: '5px' }}>
                <button className="btn btn-primary float-end" disabled={this.state.exportSuccess} onClick={() => this.onExportClick(this.state.startDate)} data-qa="ExportButton">Export </button>
                <button className="btn btn-outline-secondary float-end" style={{ marginRight: '5px' }} onClick={this.props.onClose}data-qa="CloseButton">Close</button>
            </div>
        );
    }

    render() {
        return (
            <div className="popup-container-small">
                {this.renderSuccess()}
                {this.renderText()}
                {this.renderButtons()}
            </div>
            );
    }
}