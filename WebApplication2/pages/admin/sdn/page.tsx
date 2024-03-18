import * as React from 'react';
import * as Form from "../../../components";
import { Apis, Dtos } from '../../../adr';
import { UploadComponent, Message } from "../../../components";
import { DateTime } from '../../../components/stateless/';
import { connect, Pending, PopupBuilder, SimpleGridBuilder, DialogBuilder, AlertBuilder, LoadingStatus } from "../../../classes";

interface PageProps {
    introText?: string;
}

interface pageState {
    sdnData?: Pending<Dtos.PagedResultDto<Dtos.SdnDto>>;
    updateInProgress?: boolean;
    resetInProgress?: boolean;
    updateError?: boolean;
    updateSuccess?: boolean;
    resetError?: boolean;
    resetSuccess?: boolean;
}

export class SdnUpload extends React.Component<PageProps, pageState> {
    private confirmationPopup: DialogBuilder;
    private uploadPopup: PopupBuilder;
    private alertPopup: AlertBuilder;

    constructor() {
        super();
        this.state = { sdnData: new Pending<Dtos.PagedResultDto<Dtos.SdnDto>>() };
    }

    componentDidMount() {
        this.loadAudit();
        this.fixIntroTextLink();
    }

    private fixIntroTextLink(){ // Makes link in intro to open in a new tab
        $('#sdn-intro-text a[href^="http://"], #sdn-intro-text a[href^="https://"]').attr('target', '_blank');
    }

    private clearMessages() {
        this.setState({ updateError: false, updateSuccess: false, resetError: false, resetSuccess: false });
    }

    private loadAudit() {
        connect(new Apis.SdnApi().search(1, 1000), this.state.sdnData, sdnData => this.setState({ sdnData }));
    }

    private onUploadComplete = (result: boolean) => {
        result && this.loadAudit();
    }

    private revertToPrevious(item: Dtos.SdnDto) {
        this.setState({ resetInProgress: true })
        connect(new Apis.SdnApi().reapply(item), null, response => {
            if (response.state === LoadingStatus.Done) {
                this.loadAudit();
                this.setState({ resetSuccess: true, updateSuccess: false, resetInProgress: false })
            }
            else if (response.state === LoadingStatus.Failed) {
                this.setState({ resetSuccess: false, resetError: true, resetInProgress: false })
            }
        });
    }

    private performUpdate = () => {
        this.setState({ updateInProgress: true, updateError: false });
        connect(new Apis.SdnApi().update(), null, response => {
            if (response.state === LoadingStatus.Done) {
                this.setState({ updateInProgress: false, updateSuccess: true, resetSuccess: false });
                this.loadAudit();
            }
            else if (response.state === LoadingStatus.Failed) {
                this.setState({ updateInProgress: false, updateError: true })
            }
        });
    }

    private showUpdateConfirmationPopup() {
        this.clearMessages();
        const title = "Update to latest";
        const msg = "Are you sure you want to update the SDN list to the latest version that is available on the U.S. Department of the Treasury website?"
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle(title)
            .setMessage(<p style={{ width: '500px' }} data-qa="Message">{msg}</p>)
            .setConfirmHandler(this.performUpdate)
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("UpdateConfirmationPopup")
            .open();
    }

    private showResetConfirmationPopup(item: Dtos.SdnDto) {
        this.clearMessages();
        const title = "Reset to this";
        const msg = "Are you sure you want to set the SDN list to this file?"
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle(title)
            .setMessage(<p style={{ width: '500px' }} data-qa="Message">{msg}</p>)
            .setConfirmHandler(() => this.revertToPrevious(item))
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("ResetConfirmationPopup")
            .open();
    }

    private showAlertPopup(msg: string) {
        const title = "Error uploading XML file";
        const errorMsg = JSON.parse(msg).summary || "Error with XML contents";
        this.alertPopup = new AlertBuilder();
        this.alertPopup
            .setTitle("Error processing XML file")
            .setMessage(<p style={{ width: '500px', color: 'red' }} data-qa="ErrorMessage">{errorMsg}</p>)
            .withQA("ErrorUploadingXMLFilePopup")
            .open();
    }

    private renderUploadPopup = () => {
        this.clearMessages();
        this.uploadPopup = new PopupBuilder()
            .setTitle("Upload SDN List")
            .withQA("UploadPopup")
            .setContent(
                <div className="popup-container" data-qa="UploadSDNListPopup">
                <UploadComponent
                        allowedExtensions={[".xml"]}
                        onComplete={this.onUploadComplete}
                        saveData={{}}
                        saveUrl={"/api/sdn/upload"}
                        onError={(errorMsg: string) => this.showAlertPopup(errorMsg)}
                        qa="UploadSdnList"
                        onCancelAndClose={() => this.uploadPopup.close()}
                       >
                </UploadComponent>
            </div>
            );
        this.uploadPopup.render();
    }

    private renderAuditTrail() {
        return SimpleGridBuilder.ForPending(this.state.sdnData.map(x => x.items), 10)
            .addDateTime("Uploaded On", x => x.uploadedOn, null, "UploadedOn")
            .addString("Uploaded By", x => x.uploadedByName, null, "UploadedBy")
            .addString("File", x => x.uploadedFileName, null, "File")
            .addString("Publish Date", x => x.publishDate, null, "PublishDate")
            .addString("Record Count", x => x.recordCount, null, "RecordCount")
            .addCustomColumn(" ", x => this.renderResetButton(x), (x) => "Reset", "object", null, "ResetButtonColumn", { width: 130 })
            .withQA("Audit")
            .render();
    }

    private renderResetButton(item: Dtos.SdnDto): React.ReactNode {
        if (item === this.state.sdnData.data.items[0]) return null;
        return <button className="btn btn-outline-secondary"data-qa="ResetButton" onClick={() => this.showResetConfirmationPopup(item)}>Reset to this file</button>;
    }

    private renderButtons() {
        return (
            <div style={{ marginBottom: '20px' }}>
                <span style={{ marginRight: '10px' }}>
                    <button className="btn btn-primary" data-qa="UpdateToLatestSDNButton" onClick={() => this.showUpdateConfirmationPopup()}>{!this.state.updateInProgress ? "Update to latest SDN list" : "Updating..."}</button>
                </span>
                <span>
                    <button className="btn btn-primary" data-qa="UploadSDNFileButton" onClick={() => this.renderUploadPopup()}>{"Upload SDN File (XML only)"}</button>
                </span>
            </div>
        );
    }

    private renderAuditTitle() { return <h3>SDN List Audit Trail</h3> }

    private renderIntro() { return <div id={"sdn-intro-text"} dangerouslySetInnerHTML={{ __html: this.props.introText }} /> }

    private renderTitle() { return <div><h2>SDN List</h2><hr /></div>; }

    private renderMessage() {
        if (this.state.resetInProgress) return <Message type="success" message="Resetting to a previous version..." qa="RessetingToPreviousVersionMessage"/>;
        if (this.state.resetSuccess) return <Message type="success" message="SDN reset successfully" qa="SdnResetSuccessfullyMessage"/>;
        if (this.state.resetError) return <Message type="alert" message="SDN failed to reset to the selected file" qa="SdnFailedToResetMessage"/>;
        if (this.state.updateSuccess) return <Message type="success" message="SDN updated successfully" qa="SdnUpdatedSuccessfullyMessage"/>;
        if (this.state.updateError) return <Message type="alert" message="SDN failed to update" qa="SdnFailedToUpdateMessage"/>;
        return null;
    }

    render() {
        return (
            <div>
                {this.renderMessage()}
                {this.renderTitle()}
                {this.renderIntro()}
                {this.renderButtons()}
                {this.renderAuditTitle()}
                {this.renderAuditTrail()}
            </div>
        );
    }
};