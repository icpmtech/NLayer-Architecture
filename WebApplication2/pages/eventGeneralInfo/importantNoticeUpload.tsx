import * as React from 'react';
import { Apis } from '../../adr';
import { connect, DialogBuilder, LoadingStatus, Pending, PopupBuilder } from "../../classes";
import { UploadComponent } from "../../components";

interface PageProps {
    eventId: number;
    fileExists?: boolean;
};

interface PageState {
    fileDeleteError?: boolean;
};

export class ImportantNoticeUpload extends React.Component<PageProps, PageState> {

    private deletePopup: DialogBuilder;
    private uploadPopup: PopupBuilder;
    private fileUploaded: boolean = false;

    constructor(props: PageProps) {
        super(props);
        this.state = { fileDeleteError: false };
    }

    private closeUploadPopup = () => {
        this.uploadPopup.close();
        this.onUploadPopupClose();
    };

    private onUploadPopupClose = () => {
        this.fileUploaded && window.location.reload(true);
    }

    private onUploadComplete = (res: boolean) => {
        this.fileUploaded = this.fileUploaded ? this.fileUploaded : res;
    }

    private onDeleteButtonConfirm = () => {
        connect(new Apis.EventsApi().deleteImportantNotice(this.props.eventId), null, response => this.handleDeleteResponse(response));
    }

    private handleDeleteResponse(response: Pending<void>) {
        if (response.state === LoadingStatus.Done) {
            window.location.reload(true);
        }
        if (response.state === LoadingStatus.Failed) {
            this.setState({ fileDeleteError: true })
        }
    }

    private renderDeletePopup = () => {
        this.setState({ fileDeleteError: false });
        this.deletePopup = new DialogBuilder();
        this.deletePopup
            .setTitle("Delete Important Notice File")
            .setMessage(<p>{"Are you sure you want to delete the file attached to the Important Notice of this event?"}</p>)
            .setConfirmHandler(this.onDeleteButtonConfirm)
            .setCancelHandler(this.deletePopup.close)
            .withQA("DeleteImportantNoticeFileDialog")
            .open();
    }

    private renderUploadPopup = () => {
        this.fileUploaded = false;
        this.uploadPopup = new PopupBuilder()
            .setTitle("Upload Important Notice PDF File")
            .setOnCloseAction(this.onUploadPopupClose)
            .withQA("UploadImportantNoticePdfFilePopup")
            .setContent(
            <div className="popup-container">
                <UploadComponent
                        allowedExtensions={[".pdf"]}
                        onComplete={this.onUploadComplete}
                        saveData={{ id: this.props.eventId }}
                        saveUrl={"/api/events/importantnotice"}
                        qa="PdfUpload"
                        onCancelAndClose={this.closeUploadPopup}
                >
                </UploadComponent>
            </div>
            );
        this.uploadPopup.render();
    }

    render() {
        return (
            <div>
                <button className="btn btn-primary" onClick={() => this.renderUploadPopup()} data-qa="UploadButton">Upload</button>
                <button className="btn btn-primary" disabled={!this.props.fileExists} onClick={() => this.renderDeletePopup()} data-qa="DeleteButton">Delete</button>
                {this.state.fileDeleteError ? <div style={{ 'color': 'red' }} data-qa="ErrorDeletingFile">Error deleting file</div> : null}
            </div>
        );
    }
};