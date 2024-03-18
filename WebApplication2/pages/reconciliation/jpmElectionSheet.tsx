import * as React from 'react';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { UploadElectionSheet } from './uploadElectionSheet';

interface Props {
    jpmElectionSheetSummary: Dtos.JpmElectionSheetSummaryDto;
    onDownloadElectionSheet: (boolean) => void;
    dtccRpaSummary: Dtos.DtccReportSummaryDto;
    roundDetails: Dtos.RoundDto;
    eventBalanceSheetUpload: boolean;
    downloadingElectionSheet: boolean;
    hasElectionMismatches: boolean;
    newClaimSubmitted: boolean;
    onSendElctionSheet: { (): void };
}

interface State {
    errorMessage?: string;
}

export class JpmElectionSheet extends React.Component<Props, State> {

    render() {

        var downloadEnabled = this.props.eventBalanceSheetUpload &&
            this.props.dtccRpaSummary.reportUploaded &&
            !this.props.downloadingElectionSheet
            ;

        var reconciliationWarning =
            !this.props.roundDetails.reconciliationRun ||
            this.props.hasElectionMismatches ||
            this.props.roundDetails.reconciliationRunDate < this.props.dtccRpaSummary.uploadedAt ||
            this.props.newClaimSubmitted;

        return (
            <div>
                <h4>JPM Election Sheet</h4>
                <p><b>Step 1:</b> Download original information</p>
                {this.props.jpmElectionSheetSummary.downloadedAt &&
                    <p data-qa="LastDownloadedAt">Last downloaded at {moment(
                        new Date(this.props.jpmElectionSheetSummary.downloadedAt)).format("DD MMM YYYY HH:mm")} by {
                            this.props.jpmElectionSheetSummary.downloadedBy}</p>}
                {!this.props.jpmElectionSheetSummary.downloadedAt && <p><i>Current report has not been downloaded</i></p>}

                <button className="btn btn-primary" disabled={!downloadEnabled} onClick={() =>
                    this.props.onDownloadElectionSheet(reconciliationWarning)} data-qa="DownloadElectionSheetButton">{
                            this.props.downloadingElectionSheet ? "Downloading ..." : "Download Election Sheet"}</button>
                {!this.props.dtccRpaSummary.reportUploaded && <p>DTCC RPA Report upload required</p>}
                {!this.props.eventBalanceSheetUpload && <p>Event Balance Sheet upload required</p>}
                <p><b>Step 2:</b> Upload and Send Election Sheet</p>
                <UploadElectionSheet
                    disabled={!downloadEnabled ||
                        (this.props.jpmElectionSheetSummary &&
                            !this.props.jpmElectionSheetSummary.downloaded)}
                    onFileUploaded={() => this.props.onSendElctionSheet()}
                    round={this.props.roundDetails}
                    jpmElectionSheetSummary={this.props.jpmElectionSheetSummary}
                    reconciliationWarning={reconciliationWarning}
                   
                    />
            </div>
        );
    }
}