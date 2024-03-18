import * as React from 'react';
import { Apis } from '../../adr';
import { Message } from './../../components';
import { connect, LoadingStatus, PopupBuilder, Pending, Loader } from "../../classes";

interface PageProps {
    roundId: number;
    onClose: () => void;
};

interface PageState {
    exportError?: boolean;
    exportSuccess?: boolean;
    displayWarning: Pending<boolean>;
};

export class ExportRpaChangePopup extends React.Component<PageProps, PageState> {

    constructor(props: PageProps) {
        super(props);
        this.state = { exportError: false, exportSuccess: false, displayWarning: new Pending<boolean>(LoadingStatus.Preload) };
    }

    render() {
        return Loader.for(this.state.displayWarning, display =>
            <div className="popup-container-small">
                {this.renderError()}
                {this.renderSuccess()}
                {this.renderWarning()}
                {this.renderText()}
                {this.renderButtons()}
            </div>
        );
    }

    componentDidMount() {
        connect(new Apis.RoundApi().get(this.props.roundId), null, x => { if (x.isDone()) this.setState({ displayWarning: new Pending<boolean>(LoadingStatus.Done, !x.data.reconciliationComplete) }) });
    }

    private renderWarning() {
        return this.state.displayWarning.data && <Message type="info" message={"There are unresolved reconciliation items, your report may contain incorrect or out of date data"} qa="UnresolvedReconcilationItemsMessage"/>;
    }

    private renderError() {
        return this.state.exportError && <Message type="alert" message={"Error exporting RPA Change Report"} qa="ErrorExportingRpaChangeReportMessage"/>;
    }

    private renderSuccess() {
        return this.state.exportSuccess && <Message type="success" message={"Successfully started export process"} onClose={this.props.onClose} qa="SuccesslyStartedExportProcessMessage"/>;
    }

    private renderText() {
        return (
            <div>
                {!this.state.exportSuccess ? <p>Click the button below to start the RPA export process.</p> : null}
                <p>When the files are ready for download you will be notified by email.</p>
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

    private onExportClick = () => {
        connect(new Apis.ReportsApi().queueRpaChangeReport({ eventRoundId: this.props.roundId }), null, response => {
            response.state === LoadingStatus.Failed && this.setState({ exportError: true });
            response.state === LoadingStatus.Done && this.setState({ exportSuccess: true, exportError: false });
        })
    }
};