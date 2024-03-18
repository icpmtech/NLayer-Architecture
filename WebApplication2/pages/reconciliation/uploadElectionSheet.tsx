import * as React from 'react';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';

interface Props {
    onFileUploaded: { (roundId: number): void };
    round: Dtos.RoundDto;
    disabled: boolean;
    jpmElectionSheetSummary: Dtos.JpmElectionSheetSummaryDto;
    reconciliationWarning: boolean;
};

interface State {
    uploadError?: boolean;
    isUploading?: boolean;
    errorMessage?: string;
};

export class UploadElectionSheet extends React.Component<Props, State> {

    private widget: kendo.ui.Upload;
    private elem: HTMLElement;

    constructor() {
        super();

        this.state = {
            isUploading: false,
            uploadError: false
        };
    }

    componentDidMount() {
        this.configureUpload();
    }

    render() {
        return (
            <div className="election-sheet-FileuploadContainer" data-qa="FileUploadContainer">
                {this.renderUploadWarnings()}
                {this.props.jpmElectionSheetSummary.sentAt &&
                    <p data-qa="LastSentAt">Last sent at {moment(
                        new Date(this.props.jpmElectionSheetSummary.sentAt)).format("DD MMM YYYY HH:mm")} by {
                            this.props.jpmElectionSheetSummary.downloadedBy}</p>}
                {!this.props.jpmElectionSheetSummary.sentAt && <p><i>No report currently uploaded</i></p>}
                {this.renderUploadElement()}
            </div>
        );
    }

    private renderUploadElement() {
        let buttonText = this.state.isUploading ? "Uploading ..." : "Upload and Send Election Sheet";
        let classes = "k-upload-button btn btn-primary" + (this.state.isUploading ? " btn-loading" : "");

        return (
            <div className="k-upload hide-upload-status">
                <div className={classes} aria-label={buttonText}>
                    <input id="election-sheet-Fileupload" name="election-sheet-Fileupload" data-role="upload" type="file" ref={e => this.elem = e} data-qa="FileUploadInput"/>
                    <span>{buttonText}</span>
                </div>
                
            </div>);
    }

    private renderUploadWarnings() {
        return (
            <div>
                {this.state.isUploading &&
                    <div id="claim-Beneficial-owners-details-Fileupload-warning" className="flash-message alert alert-danger alert-dismissible" data-qa="FileUploadWarning">
                        If you leave or refresh this page before the upload completes then the data will not be loaded
                    </div>}
                {this.state.uploadError &&
                    <div id="election-sheet-Fileupload-error" className="flash-message alert alert-danger alert-dismissible" data-qa="FileUploadError">
                    <button type='button' className='close' data-dismiss='alert'data-qa="CloseButton">&times; </button>
                        {!this.state.errorMessage && <p>There was an error while uploading, please try again</p>}
                        {this.state.errorMessage && <p>{this.state.errorMessage}</p>}
                    </div>}
            </div>
        );
    }

    private configureUpload() {
        let component = this;

        let options = {
            multiple: false,
            showFileList: false,
            enabled: !this.props.disabled,

            localization: {
                dropFilesHere: "Drop Report File Here to upload",
                select: "Upload and Send Election Sheet"
            },

            validation: {
                allowedExtensions: [".xlsx"],
                maxFileSize: 15728640
            },

            async: {
                saveUrl: "../../../api/jpmreporting/upload",
                autoUpload: false
            },

            upload: function (e) { component.uploadFile(e) },
            success: function (e) { component.uploadSuccess(e) },
            error: function (e) { component.uploadFailure(e) },
            select: function (e) { component.uploadSelect(e) }
        };

        this.widget = new kendo.ui.Upload(this.elem, options);
    }

    private uploadFile(event: kendo.ui.UploadUploadEvent) {
        $("#election-sheet-Fileupload").prop("disabled", true);
        this.setState({ isUploading: true });

        var xhr = event.XMLHttpRequest;
        const rvt = $("input[name='__RequestVerificationToken']").val();

        if (rvt != null) {
            xhr.addEventListener("readystatechange", function (e) { if (xhr.readyState == 1 /* OPENED */) { xhr.setRequestHeader("RequestVerificationToken", rvt); } });
        }
    }

    private uploadSuccess(event: kendo.ui.UploadSuccessEvent) {
        $("#election-sheet-Fileupload").prop("disabled", false);
        this.setState({ isUploading: false, uploadError: false });
        this.props.onFileUploaded(this.props.round.id);
    }

    private uploadFailure(event: kendo.ui.UploadErrorEvent) {
        $("#election-sheet-Fileupload").prop("disabled", false);
        this.setState({ isUploading: false, uploadError: true });

        this.showValidationErrors(event.XMLHttpRequest)
    }

    private uploadSelect(event: kendo.ui.UploadSelectEvent) {
        let component = this;

        if (this.props.reconciliationWarning) {
            let dialog = new Framework.DialogBuilder();

            dialog.setTitle("Send Election Sheet")
                .setMessage(<p>This round has not been fully reconciled. Are you sure you want to continue ?</p>)
                .setConfirmHandler(() => { component.uploadSheet(event) })
                .setCancelHandler(() => { dialog.close() })
                .open();
        }
        else {
            setTimeout(function () { component.uploadSheet(event); }, 200);
        }
    }

    private uploadSheet(event) {
        this.widget.one("upload", e => { e.data = { roundId: this.props.round.id }; });
        this.getValidationErrorForFileInfo(event);

        this.widget.upload();
    }

    private getValidationErrorForFileInfo(e: kendo.ui.UploadSelectEvent) {
        if (e.sender && e.sender.options && e.sender.options.validation) {
            var validation = e.sender.options.validation;
            var file = e.files[0];
            var allowedExt = validation.allowedExtensions;

            if (allowedExt && allowedExt.length > 0 && $.inArray(`${file.extension}`.toLowerCase(), allowedExt) < 0) {
                this.setState({ errorMessage: "Only XLSX files are supported for upload.", uploadError: true });
                e.preventDefault();
            }

            var maxSize = validation.maxFileSize;
            if (maxSize && maxSize > 0 && file.size > maxSize) {
                this.setState({ errorMessage: `File exceeds maximum upload size of  (${Math.ceil(validation.maxFileSize / 1024)} KB)`, uploadError: true });
                e.preventDefault();
            }
        }
    }

    private showValidationErrors(error: any) {
        let errorMessages: any[] = JSON.parse(error.responseText).failures;
        this.widget.clearAllFiles();

        let innerHtml: string = errorMessages.slice(0, 20).map(x => `<li>${x.message}</li>`).join('');

        let popup = new Framework.PopupBuilder();

        if (errorMessages.length > 20) {
            innerHtml += `and ${errorMessages.length - 20} more errors`;
        }

        popup.setTitle("Election Sheet upload validations")
            .setContent(
            <div className="validation-summary-valid field-validation-error d-flex flex-column col-md-12" data-valmsg-summary="true">
                <ul dangerouslySetInnerHTML={{ __html: innerHtml }} />
                <div className="col-md-2 align-self-end">
                        <span className="btn btn-primary" onClick={() => popup.close()} data-qa="OkButton">OK</span>
                </div>
            </div>)
            .open();
    }
}