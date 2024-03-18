import * as React from 'react';
import { Dtos, Apis } from '../../../../adr';
import { DialogBuilder, Pending, PopupBuilder } from '../../../../classes';
import { ValidationFailuresGrid } from '../validationFailuresGrid';
import * as Framework from '../../../../classes';

interface UploadProps {
    claimId: number;
    roundId: number;
    onFileUploaded: () => void;
    onFileFailed: () => void;
    dataHasBeenUploaded?: boolean;
    returnUrl: string;
    onBack: () => void;
    hasCategoryElections: boolean;
    saveChanges: (moveToNextStep: boolean) => void;
    saveMode?: 'back' | 'save' | 'next';
    saveInProgress?: boolean;
    onSaveInProgress: (mode: 'back'|'save'|'next') => void;
    securityType: Dtos.SecurityType;
    fileUploadTabSelected: boolean;
    currentStage: Dtos.BatchClaimEntrystage;
};

interface UploadState {
    categoryInfo?: Pending<Dtos.FlattenedAllEventRoundCategoryInfoDto>;
    uploadError?: boolean;
    isUploading?: boolean;
    errorMessage?: string;
    errorList?: Framework.PagedDataState<Dtos.BatchClaimValidationFailureDto, Dtos.GetListBatchClaimValidationErrorsQuery>;
};

export class BeneficialOwnerUpload extends React.Component<UploadProps, UploadState> {

    private widget: kendo.ui.Upload;
    private elem: HTMLElement;
    private templateUrl: string;
    private errorStore: Framework.PageCache<Dtos.BatchClaimValidationFailureDto, Dtos.GetListBatchClaimValidationErrorsQuery>;

    constructor() {
        super();

        this.state = {
            isUploading: false,
            uploadError: false,
            categoryInfo: new Pending<Dtos.FlattenedAllEventRoundCategoryInfoDto>()
        };

        this.errorStore = new Framework.PageCache<Dtos.BatchClaimValidationFailureDto, Dtos.GetListBatchClaimValidationErrorsQuery>(
            (query, page, pageSize) => new Apis.BatchClaimApi().getValidationFailures(query, page, pageSize),
            () => this.state.errorList,
            (errorList) => this.setState({ errorList })
        );
    }

    render() {
        return (<div>
            <div>
                {this.props.currentStage == Dtos.BatchClaimEntrystage.UploadFailed 
                    ? <div className="col-md-12" >
                        <div className="col-md-3">{this.renderUploadSteps(false)}</div>
                        <div className="col-md-8" data-qa="ValidationFailuresGrid">
                            <ValidationFailuresGrid
                                onPageChanged={(query) => this.onGridChanged(query)}
                                validationErrors={this.errorStore.getCurrentData()}
                                currentFilter={this.errorStore.getCurrentFilter()}
                               
                            />
                        </div>
                     </div>
                    : this.renderUploadSteps(true)
                }
            </div>
            {this.renderUploadWarnings()}
            {this.renderButtons()}
        </div>);
    }

    componentDidMount() {
        this.configureUpload();
        this.templateUrl = `../api/batchclaim/${this.props.claimId}/template`;
    }

    private renderButtons() {
        let savingText = this.props.currentStage == Dtos.BatchClaimEntrystage.UploadFailed ? "Exiting..." : "Saving Claim..."
        let saveAndExitText = this.props.currentStage == Dtos.BatchClaimEntrystage.UploadFailed ? "Exit" : "Save and Exit";

        return (
            <div className="text-end" style={{ marginTop: 10 }}>
                {
                    this.props.currentStage != Dtos.BatchClaimEntrystage.UploadFailed && 
                    <button className={"btn btn-outline-secondary" + ((this.props.saveInProgress && this.props.saveMode == 'back') ? " btn-loading" : "")} disabled={this.props.saveInProgress} onClick={() => this.props.onBack()} data-qa="BackButton">
                        {this.props.saveInProgress && this.props.saveMode == 'back' ? 'Working...' : (this.props.hasCategoryElections ? 'Category Elections' : 'Filing Method')}
                    </button>
                }
                {
                    <button className={"btn btn-outline-secondary" + ((this.props.saveInProgress && this.props.saveMode == 'save') ? " btn-loading" : "")} disabled={this.props.saveInProgress} id="saveExitBtn" onClick={() => this.props.saveChanges(false)} data-qa="SaveButton">
                        {this.props.saveInProgress && this.props.saveMode == 'save' ? savingText : saveAndExitText}
                    </button>
                }
                {
                    !this.props.fileUploadTabSelected &&
                    <button className={"btn btn-primary" + ((this.props.saveInProgress && this.props.saveMode == 'next') ? " btn-loading" : "")} disabled={this.props.saveInProgress || this.props.fileUploadTabSelected} hidden={this.props.fileUploadTabSelected} id="nextBtn" onClick={() => this.props.saveChanges(true)}data-qa="NextButton">
                        {this.props.saveInProgress && this.props.saveMode == 'next' ? "Saving Claim..." : "Preview"}
                    </button>
                }
            </div>
        );
    }

    private saveChanges(moveToNextStep: boolean) {
        this.props.onSaveInProgress(moveToNextStep ? 'next' : 'save');

        if (moveToNextStep) {
            var form = $("form[name='stageChangeForm']");
            let previewStepId = Dtos.BatchClaimEntrystage.Preview as number;
            $("form[name='stageChangeForm']").find("#SetWorkflowStep").val(previewStepId);

            form.submit();
        }
        else {
            window.location.href = this.props.returnUrl;
        }
    }

    private configureUpload() {
        let component = this;

        let options = {
            multiple: false,
            showFileList: false,

            localization: {
                dropFilesHere: "Drop Template File Here to upload",
                select: "Upload Beneficial Owners"
            },
            dropZone: ".dropZoneElement",

            validation: {
                allowedExtensions: [".xlsx"],
                maxFileSize: 15728640
            },

            async: {
                saveUrl: "../api/batchclaimfileupload/details/fileasync",
                autoUpload: false
            },

            upload: function (e) { component.uploadFile(e) },
            success: function (e) { component.uploadSuccess(e) },
            error: function (e) { component.uploadFailure(e) },
            select: function (e) { component.uploadSelect(e) }
        };

        this.widget = new kendo.ui.Upload(this.elem, options);
    }

    private renderUploadSteps(includeDropTarget: boolean) {
        let infoTitle = `Considerations for the file to upload:
    - Please use an XLSX template provided in step1.
    - Do not alter the structure of the file as it will hinder successful uploading of the Beneficial Owners Details.`;

        return (<div>
            <div className="uploadStepLine">
                <i className="fa fa-play fa-goal-primary upload-step-icon" aria-hidden="true"></i>
                Step 1: <a id="downloadTemplateLink" onClick={(e) => this.downloadTemplate()} data-qa="DownloadTemplateLink">Download Template</a>
                <i className="fa fa-cloud-download fa-2x upload-step-download-icon" aria-hidden="true"></i>
            </div>
            <div className="uploadStepLine">
                <i className="fa fa-play fa-goal-primary upload-step-icon" aria-hidden="true"></i> Step 2: Upload file
                <div id="infoBtnUploadIcon" className="custom-upload-info-icon" style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "10px" }}>
                    <span className="fa fa-info-circle" aria-hidden="true" title={infoTitle} style={{ fontSize: "1.5em", fontFamily: "FontAwesome" }}></span>
                </div>
            </div>
            <div className="uploadStepLine row col-md-12">
                <div className="col-md-4">
                    <div className="claim-Beneficial-owners-details-FileuploadContainer" data-qa="UploadElement">
                        {this.renderUploadElement()}
                    </div>
                </div>
                { includeDropTarget && this.renderDropTarget() }
            </div>
        </div>);
    }

    private renderDropTarget() {
        return (<div className="wrapper col-md-4 k-content">
            <div className="dropZoneElement k-upload k-header">
                <div className="textWrapper">
                    <p className="dropImageHereText" data-qa="UploadDropTarget">Drag + Drop Beneficial Owners Details here to upload</p>
                </div>
            </div>
        </div>)
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField>) {
        this.errorStore.setCurrent({ sort: options.sort, uiFilters: options.filters, batchClaimId: this.props.claimId }, options.page, options.pageSize, false);
    }

    private renderUploadElement() {
        return (
            <div className="k-upload k-upload-empty hide-upload-status">
                <div>
                    <div className={"k-upload-button btn btn-primary" + (this.state.isUploading ? " btn-loading" : "")} aria-label="Upload Beneficial Owners" id="claim-Beneficial-Fileupload-Button" data-qa="FileUploadButton">
                        <input id="claim-Beneficial-owners-details-Fileupload" name="claim-Beneficial-owners-details-Fileupload" data-qa="FileUploadInput"data-role="upload" type="file" ref={e => this.elem = e} />
                        <span data-qa="UploadingUploadBeneficialOwners">{(this.state.isUploading ? "Uploading ..." : "Upload Beneficial Owners")} </span>
                    </div>
                </div>
            </div>);
    }

    private renderUploadWarnings() {
        return (
            <div>
                <div className="uploadStepLine row col-md-12 fileuploadContainerSummary">
                    {this.state.isUploading && <div id="claim-Beneficial-owners-details-Fileupload-warning" className="flash-message alert alert-danger alert-dismissible" data-qa="FileUploadWarning">
                        If you leave or refresh this page before the upload completes then the data will not be loaded
                </div>}
                    {this.state.uploadError && <div id="claim-Beneficial-owners-details-Fileupload-error" className="flash-message alert alert-danger alert-dismissible" data-qa="FileUploadError">
                        <p>There was an error while uploading, please try again</p>
                        {this.state.errorMessage}
                    </div>}
                </div>
            </div>
        );
    }

    private downloadTemplate() {
        window.open(this.templateUrl);
    }

    private uploadSelect(event: kendo.ui.UploadSelectEvent) {
        let component = this;

        if (this.props.dataHasBeenUploaded) {
            let dialog = new DialogBuilder();

            dialog.setTitle("Upload confirmation")
                .setMessage("You are about to override the previously uploaded Beneficial Owners Details. Are you sure you want to proceed?")
                .setConfirmHandler(() => { component.confirmOverride(event) })
                .setCancelHandler(() => { dialog.close() })
                .withQA("UploadOverrideConfirmationDialog")
                .open();
        }
        else {
            setTimeout(function () { component.confirmOverride(event); }, 200);
        }
    }

    private showValidationErrors(error: any) {
        let errorMessages: any[] = JSON.parse(error.responseText).failures;
        this.widget.clearAllFiles();

        let innerHtml: string = errorMessages.slice(0, 20).map(x => `<li>${x.message}</li>`).join('');

        let popup = new PopupBuilder();

        if (errorMessages.length > 20) {
            innerHtml += `and ${errorMessages.length - 20} more errors`;
        }

        popup.setTitle("Beneficial Owners upload validations")
            .setContent(
                <div className="validation-summary-valid field-validation-error d-flex flex-column col-md-12" data-valmsg-summary="true" //data-qa="UploadValidations"
                >
                <ul dangerouslySetInnerHTML={{ __html: innerHtml }} />
                <div className="col-md-2">
                        <span className="btn btn-primary" onClick={() => popup.close()} //data-qa="ValidationClose"
                        >OK</span>
                </div>
            </div>)
            .open();
    }

    private confirmOverride(event) {
        this.widget.one("upload", e => { e.data = { claimId: this.props.claimId, isConfirmedToOverride: true }; });
        this.getValidationErrorForFileInfo(event);

        this.widget.upload();
    }

    private uploadFile(event: kendo.ui.UploadUploadEvent) {
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", true);
        this.setState({ isUploading: true });
        this.props.onFileUploaded();
        var xhr = event.XMLHttpRequest;
        const rvt = $("input[name='__RequestVerificationToken']").val();

        if (rvt != null) {
            xhr.addEventListener("readystatechange", function (e) { if (xhr.readyState == 1 /* OPENED */) { xhr.setRequestHeader("RequestVerificationToken", rvt); } });
        }
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

    private uploadSuccess(event: kendo.ui.UploadSuccessEvent) {
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", false);
        this.setState({ isUploading: false, uploadError: false });
        this.props.onFileUploaded();
    }

    private uploadFailure(event: kendo.ui.UploadErrorEvent) {
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", false);
        this.setState({ isUploading: false, uploadError: true });
        this.showValidationErrors(event.XMLHttpRequest);
        this.props.onFileFailed();
    }
}