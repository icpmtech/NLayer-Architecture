import * as React from 'react';
import { Apis } from '../../../adr';
import * as Framework from "../../../classes";
import * as Components from '../../../components';

interface Props {
    onClose: () => void;
};

interface State {
    outstandingEdits?: Framework.Pending<boolean>;
    exportError?: Framework.AppError;
    exportSuccess?: boolean;
};

export class StatutesExportPopup extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { outstandingEdits: null, exportError: null, exportSuccess: false };
    }

    private componentDidMount() {
        Framework.connect(
            new Apis.TrmApi().hasOutstandingEdits({
                checkTreaty: false,
                checkWht: false,
                checkTaxCredit: false,
                checkStatute: true,
                checkNews: false,
                includeAwaitingVerification: true,
                includeDraft: false,
                reclaimMarketId: null,
                countryOfResidenceId: null
            }),
            this.state.outstandingEdits,
            outstandingEdits => this.setState({ outstandingEdits: outstandingEdits }));
    }

    private onExportClick = () => {
        let api = new Apis.ReportsApi();
        let method = api.queueStatuteExportReport();
        
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
        return this.state.exportSuccess ? <Components.Message type="success" message={"Successfully started export process"} onClose={() => this.props.onClose()} qa="SuccessfullyStartedExportProcessMessage"/> : null;
    }

    private renderWarning() {
        return (
            <div className="flash-message alert alert-info" data-qa="RecordsAwaitingApprovalAlert">Please be advised there are records awaiting approval, therefore the data in the export file may be incorrect.</div>
        );
    }

    private renderText() {
        return (
            <div>
                {!this.state.exportSuccess ? <p>Click the button below to start the export process.</p> : null}
                <p>When the export is ready for download you will be notified by email.</p>
                <p>To download the exported files go to the <a href="/reports/export" data-qa="ReportsLink">Reports</a> page.<br /><br /></p>
            </div>
        );
    }

    private renderButtons() {
        return (
            <div className={"col-md-6 float-end mb-1"} style={{ paddingRight: '5px' }}>
                <button className="btn btn-primary float-end" disabled={this.state.exportSuccess} onClick={() => this.onExportClick()} data-qa="ExportButton">Export </button>
                <button className="btn btn-outline-secondary float-end" style={{ marginRight: '5px' }} onClick={this.props.onClose}data-qa="CloseButton">Close</button>
            </div>
        );
    }

    render() {
        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {return (
            <div className="popup-container-small">
                <Components.Error error={this.state.exportError} qa="StatutesExportPopupError"/>
                {hasEdits && this.renderWarning()}
                {this.renderSuccess()}
                {this.renderText()}
                {this.renderButtons()}
            </div>
        );})
    }

};