import * as React from 'react';
import { DialogBuilder, AppError } from '../classes';
import { Error } from '../components/stateless';

interface UploadProps {
    allowedExtensions?: string[]; // Needs to be a string array of file extensions (e.g. [".pdf", ".doc"])
    onComplete: (success:boolean) => void;
    saveData: {[key:string]:any};
    saveUrl: string;
    qa: string;
    onError?: { (errorMsg: string): void };
    onCancelAndClose: () => void;
};

interface UploadState {
    uploadDisabled?: boolean;
    isUploading?: boolean;
    error?: AppError;
};

export class UploadComponent extends React.Component<UploadProps, UploadState> {
    private widget: kendo.ui.Upload;
    private fileSelector: HTMLInputElement;
    private uploadConfirmation: DialogBuilder;
    private activeError: boolean = false;
    private fileUploaded: boolean = false;
    private maxFileSize: number = 52428800;
    private allowedExtensionsMessage: string = "";

    constructor(props: UploadProps) {
        super(props);
        this.state = { uploadDisabled: true, isUploading: false };
    }

    componentDidMount() {
        this.allowedExtensionsMessage = this.props.allowedExtensions ? "Allowed extensions: " + this.props.allowedExtensions.join(", ") : "";
        this.initFileUploader();
        this.attachSelectHandler();
    }

    private attachSelectHandler = () => {
        this.widget.wrapper.find(".k-upload-button").on("click", () => this.onSelectClick());
    }

    private uploadDisabled(status: boolean = true) {
        this.setState({ uploadDisabled: status });
    }

    private setStatusVisibility(visible: boolean = true) {
        visible ? this.widget.wrapper.find(".k-upload-status").show() : this.widget.wrapper.find(".k-upload-status").hide();
    }

    private initFileUploader = () => {
        this.widget = new kendo.ui.Upload(this.fileSelector, {
            async: {
                saveUrl: this.props.saveUrl,
                autoUpload: false
            },
            localization: {
                invalidFileExtension: "File type not allowed. " + this.allowedExtensionsMessage,
                invalidMaxFileSize: "Please select a file smaller than 50Mb",
                select: "Choose a file..."
            },
            multiple: false,
            validation: {
                allowedExtensions: this.props.allowedExtensions ? this.props.allowedExtensions : null,
                maxFileSize: this.maxFileSize
            },
            complete: this.onUploadComplete,
            error: this.onUploadError,
            remove: this.onFileRemoved,
            success: this.onUploadSuccess,
            select: this.onFileSelected,
            upload: this.onUploadStart
        });
    }

    private onFileRemoved = () => {
        this.activeError = false;
        this.statusTotalButton().html('');
        this.setState({ error: null });
        setTimeout(() => {
            if (!this.widget.getFiles()[0]) {
                this.uploadDisabled();
            }
        }, 10);
    }

    private onFileSelected = () => {
        this.activeError = false;
        this.setState({ error: null });
        setTimeout(() => {
            this.widget.wrapper.find("button.k-clear-selected").hide();
            this.widget.wrapper.find("button.k-upload-selected").hide();
            const fileSelected = this.widget.getFiles()[0];

            if (fileSelected) {
                if (fileSelected.size < this.maxFileSize) {
                    this.uploadDisabled(false);
                }
                else {
                    this.statusTotalButton()
                        .css('color', 'red')
                        .html('<span class="k-icon k-i-warning"></span> File size exceeded!');
                }
            }
        }, 1);
    }

    private onSelectClick = () => {
        const filesSelected: {}[] = this.widget.getFiles();
        if (filesSelected.length == 0) {
            this.uploadDisabled();
        }
    }

    private onUploadButtonClick = () => {
        this.uploadConfirmation = new DialogBuilder();
        this.uploadConfirmation
            .setTitle("File Upload")
            .setMessage(<p>{"Are you sure you want to upload this file: " + this.widget.getFiles()[0].name + "?"}</p>)
            .setConfirmHandler(this.onUploadButtonConfirm)
            .setCancelHandler(this.uploadConfirmation.close)
            .withQA("UploadConfirmationDialog")
            .open();
    }

    private onUploadButtonConfirm = () => {
        this.activeError ? this.retryUpload() : this.widget.upload();
    }

    private onUploadComplete = () => {
        this.setState({ isUploading: false });
        this.widget.enable();
        this.setStatusVisibility(true);

        this.props.onComplete(this.fileUploaded);
        this.fileUploaded = false;
    }

    private onUploadError = (e) => {
        this.setState({ isUploading: false });
        this.widget.enable();
        this.setStatusVisibility(true);

        !!this.props.onError && this.props.onError(e.XMLHttpRequest.responseText as string);
        let passedError = JSON.parse(e.XMLHttpRequest.responseText);
        if (passedError && passedError.failures && passedError.failures.length && passedError.failures.map) {
            this.setState({ error: new AppError("An error occured uploading file", passedError, null) });
        }
        this.activeError = true;
        this.fileUploaded = false;
        this.statusTotalButton()
            .css('color', 'red')
            .html('<span class="k-icon k-i-warning" data-qa="UploadError"></span> Upload error!');
    }

    private onUploadStart = (e: any) => {
        this.setState({ isUploading: true });
        this.widget.disable();
        this.setStatusVisibility(false);

        e.data = this.props.saveData;

        const rvt = $("input[name='__RequestVerificationToken']").val();
        var xhr = e.XMLHttpRequest;

        if (rvt != null && xhr) {
            xhr.addEventListener("readystatechange", ae => {
                if (xhr.readyState == 1) {
                    xhr.setRequestHeader("RequestVerificationToken", rvt);
                }
            });
        }
    }

    private onUploadSuccess = () => {
        this.fileUploaded = true;
        this.uploadDisabled();
    }

    private retryUpload = () => {
        try {
            this.widget.wrapper.find("button.k-upload-action").click();
        }
        catch (error) { }
    }

    private statusTotalButton() {
        return this.widget.wrapper.find(".k-upload-status-total");
    }

    render() {
        return (
            <div data-qa={this.props.qa + "Wrapper"}>
                {this.renderErrorSummary()}
                <br />
                <div>Choose a file or drag &amp; drop it here:</div>
                <input ref={e => this.fileSelector = e} type="file" />
                <br />
                <div className="d-flex justify-content-between">
                    <button
                        className={"btn btn-primary col-md-2" + (this.state.isUploading ? " btn-loading" : "") }
                        onClick={this.onUploadButtonClick}
                        disabled={this.state.uploadDisabled || this.state.isUploading}
                        data-qa={this.props.qa + "Button"}
                    >
                        {(this.state.isUploading ? "Uploading ..." : "Upload")}
                    </button>
                    <button className="btn btn-outline-secondary col-md-2" onClick={() => this.props.onCancelAndClose()}data-qa="CloseButton">Close</button>
                </div>
            </div>
        );
    }

    private renderErrorSummary() {
        if (!this.state.error) return null;
        return (
            <Error error={this.state.error} qa={this.props.qa + "Error"}/>
        );
    }
};