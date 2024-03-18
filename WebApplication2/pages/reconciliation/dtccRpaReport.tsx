import * as React from 'react';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { UploadDtccRpaReport } from './uploadDtccRpaReport';

interface Props {
    dtccRpaSummary: Dtos.DtccReportSummaryDto;
    onFileUploaded: {(roundId: number): void};
    round: Dtos.RoundDto;
    onDelete: { (summary: Dtos.DtccReportSummaryDto): void };
    deletingReport: boolean;
};

interface State {
    uploadError?: boolean;
    isUploading?: boolean;
    errorMessage?: string;
};

export class DtccRpaReport extends React.Component<Props, State> {

    private widget: kendo.ui.Upload;
    private elem: HTMLElement;

    constructor() {
        super();

        this.state = {
            isUploading: false,
            uploadError: false
        };
    }
    
    render() {
        return (
            <div className="dtcc-rpa-report-FileuploadContainer" data-qa="FileUploadContainer">
                <h4>DTCC RPA report</h4>
                {!this.props.dtccRpaSummary.reportUploaded && <UploadDtccRpaReport dtccRpaSummary={this.props.dtccRpaSummary} onFileUploaded={(roundId) => this.props.onFileUploaded(roundId)} round={this.props.round}/>}
                {this.props.dtccRpaSummary.reportUploaded && this.renderSummary()}
                {this.props.dtccRpaSummary.reportUploaded && this.renderDeleteButton()}
            </div>
        );
    }

    private renderSummary() {
        return (<p data-qa="ReportUploaded">Report uploaded - {moment(new Date(this.props.dtccRpaSummary.uploadedAt)).format("dddd, MMMM Do YYYY [at] HH:mm")} by {this.props.dtccRpaSummary.uploadedBy}</p>);
    }

    private renderDeleteButton() {
        return (<div>
            <button className="k-upload-button btn btn-outline-secondary" onClick={() => this.props.onDelete(this.props.dtccRpaSummary)} data-qa="DeleteDtccRpaReportButton">Delete DTCC RPA Report</button>
            {this.props.deletingReport && <span data-qa="DeletingIcon"><img src={"/Content/Images/please-wait.gif"} alt="please wait" /> - Deleting</span>}
        </div>);
    }
}