import * as React from 'react';
import { Apis } from '../../adr';
import { connect, LoadingStatus } from "../../classes";
import { Message } from './../../components';

interface PageProps {
    roundId: number;
    onClose: () => void;
};

interface PageState {
    exportError?: boolean;
    exportSuccess?: boolean;
};

export class ExportBnymOfacPopup extends React.Component<PageProps, PageState> {

    constructor(props: PageProps) {
        super(props);
        this.state = { exportError: false, exportSuccess: false };
    }

    private onExportClick = () => {
        connect(new Apis.ReportsApi().queueBnymFinalOfacReport({ roundId: this.props.roundId }), null, response => {
            response.state === LoadingStatus.Failed && this.setState({ exportError: true });
            response.state === LoadingStatus.Done && this.setState({ exportSuccess: true, exportError: false });
        })
    }

    private renderError() {
        return this.state.exportError ? <Message type="alert" message={"Error exporting BNYM Final OFAC Report"} qa="ErrorExportingBnymFinalOfacReportMessage"/> : null;
    }

    private renderSuccess() {
        return this.state.exportSuccess ? <Message type="success" message={"Successfully started export process"} onClose={this.props.onClose} qa="SuccessfullyStartedExportProccessMessage"/> : null;
    }

    private renderText() {
        return (
            <div>
                {!this.state.exportSuccess ? <p>Click the button below to start the Final OFAC Report export process.</p> : null}
                <p>When the file is ready for download you will be notified by email.</p>
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
        return (
            <div className="popup-container-small">
                {this.renderError()}
                {this.renderSuccess()}
                {this.renderText()}
                {this.renderButtons()}
            </div>
        );
    }
};