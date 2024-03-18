import * as React from 'react';

interface FileUploadProps {
    onUploadComplete: () => void;
    onUploadError: (message) => void;
    bulkClaimId: number;
    onUploadStart: () => void;
    isUploading?: boolean
}

export class FileUpload extends React.Component<FileUploadProps, {}>
{
    private widget: kendo.ui.Upload;
    private elem: HTMLElement;

    render() {
        return (<div>
            <input id="claim-Beneficial-owners-details-Fileupload" name="claim-Beneficial-owners-details-Fileupload" data-role="upload" type="file" ref={e => this.elem = e} data-qa="FileUpload"/>
            <span data-qa="UploadingUploadBeneficialOwners">{(this.props.isUploading ? "Uploading ..." : "Upload Beneficial Owners") } </span>
        </div>);
    }


    componentDidMount() {
        this.configureUpload();
    }


    private configureUpload() {
        let component = this;

        let options = {
            multiple: false,
            showFileList: false,
            localization: { dropFilesHere: "Drop Template File Here to upload", select: "Upload Beneficial Owners" },
            validation: { allowedExtensions: [".xlsx"], maxFileSize: 15728640 },
            async: { saveUrl: "../../api/bulkclaims/files", autoUpload: false },
            dropZone: ".dropZoneElement",

            upload: function (e) { component.uploadFile(e) },
            success: function (e) { component.uploadSuccess(e) },
            error: function (e) { component.uploadFailure(e) },
            select: function (e) { component.uploadSelect(e) }
        };

        //if (this.props.bulkClaim.data && this.props.bulkClaim.data.status != Dtos.BulkClaimStatus.Processing)
        this.widget = new kendo.ui.Upload(this.elem, options);
    }

    private uploadFile(event: kendo.ui.UploadUploadEvent) {
        console.log('upload');
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", true);
        this.props.onUploadStart();
        var xhr = event.XMLHttpRequest;
        const rvt = $("input[name='__RequestVerificationToken']").val();

        if (rvt != null) {
            xhr.addEventListener("readystatechange", function (e) { if (xhr.readyState == 1 /* OPENED */) { xhr.setRequestHeader("RequestVerificationToken", rvt); } });
        }
    }

    private uploadSuccess(event: kendo.ui.UploadSuccessEvent) {
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", false);
        this.props.onUploadComplete();
    }

    private uploadFailure(event: kendo.ui.UploadErrorEvent) {
        $("#claim-Beneficial-owners-details-Fileupload").prop("disabled", false);
        this.setState({ errorMessage: "There was an error uploading your file - please try again" });
    }

    private confirmOverride(event) {
        console.log('override');

        this.widget.one("upload", e => { e.data = { bulkClaimId: this.props.bulkClaimId, isConfimedToOverride: true }; });
        this.getValidationErrorForFileInfo(event);

        this.widget.upload();
    }

    private uploadSelect(event: kendo.ui.UploadSelectEvent) {
        let component = this;

        //let dialog = new DialogBuilder();

        //dialog.setTitle("Upload confirmation")
        //    .setMessage("You are about to override the previously uploaded Beneficial Owners Details. Are you sure you want to proceed?")
        //    .setConfirmHandler(() => { component.confirmOverride(event) })
        //    .setCancelHandler(() => { dialog.close() })
        //    .open();
        setTimeout(() => component.confirmOverride(event), 100);
    }

    private getValidationErrorForFileInfo(e: kendo.ui.UploadSelectEvent) {
        if (e.sender && e.sender.options && e.sender.options.validation) {
            var validation = e.sender.options.validation;
            var file = e.files[0];
            var allowedExt = validation.allowedExtensions;

            if (allowedExt && allowedExt.length > 0 && $.inArray(`${file.extension}`.toLowerCase(), allowedExt) < 0) {
                this.props.onUploadError("Only XLSX files are supported for upload.");
                e.preventDefault();
            }

            var maxSize = validation.maxFileSize;
            if (maxSize && maxSize > 0 && file.size > maxSize) {
                this.props.onUploadError(`File exceeds maximum upload size of  (${Math.ceil(validation.maxFileSize / 1024)} KB)`);
                e.preventDefault();
            }
        }
    }
}