import * as React from 'react';
import { Apis } from '../../adr';
import { connect, LoadingStatus } from "../../classes";
import { Message } from './../../components';

interface PageProps {
    eventId: number;
    onClose: () => void;
};

interface PageState {
    exportError?: boolean;
    exportSuccess?: boolean;
    errorMessage?: string;
};

export class ExportDwtPopup extends React.Component<PageProps, PageState> {

    constructor(props: PageProps) {
        super(props);
        this.state = { exportError: false, exportSuccess: false };
    }

    private onExportClick = () => {
        connect(new Apis.ReportsApi().queueCommonStockDwtReport({ eventId: this.props.eventId }), null, response => {
            response.state === LoadingStatus.Failed && this.setState({ exportError: true, errorMessage: response.error.serverError.failures.map(x => x.message).join('<br />') });
            response.state === LoadingStatus.Done && this.setState({ exportSuccess: true, exportError: false, errorMessage: null });
        })
    }

    private renderError() {
        return this.state.exportError ? <Message type="alert" message={this.state.errorMessage} qa="ErrorMessage"/> : null;
    }

    private renderSuccess() {
        return this.state.exportSuccess ? <Message type="success" message={"Successfully started export process"} onClose={this.props.onClose} qa="SuccessMessage"/> : null;
    }

    private renderText() {
        return (
            <div>
                {!this.state.exportSuccess ? <p>Click the button below to start the DWT export process.</p> : null}
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