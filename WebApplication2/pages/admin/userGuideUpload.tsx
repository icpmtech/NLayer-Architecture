import * as React from 'react';
import * as Form from "../../components";
import { Apis, Dtos } from '../../adr';
import { UploadComponent } from "../../components";
import { DateTime } from '../../components/stateless/';
import { connect, Pending, PopupBuilder, Loader } from "../../classes";

interface pageState {
    userGuideFile?: Pending<Dtos.StaticFileContentDto>;
    dsUserGuideFile?: Pending<Dtos.StaticFileContentDto>;
}

export class UserGuideUpload extends React.Component<{}, pageState> {

    private uploadPopup: PopupBuilder;

    constructor() {
        super();
        this.state = {
            userGuideFile: new Pending<Dtos.StaticFileContentDto>(),
            dsUserGuideFile: new Pending<Dtos.StaticFileContentDto>()
        };
    }

    componentDidMount() {
        this.loadParticipantUserGuideFile();
        this.loadDSUserGuideFile();
    }

    private loadParticipantUserGuideFile() {
        connect(new Apis.StaticContentApi().getStaticFileByKey(Dtos.StaticFileConentKey.UserGuide), this.state.userGuideFile, userGuideFile => this.setState({ userGuideFile }));
    }

    private loadDSUserGuideFile() {
        connect(new Apis.StaticContentApi().getStaticFileByKey(Dtos.StaticFileConentKey.DSUserGuide), this.state.dsUserGuideFile, dsUserGuideFile => this.setState({ dsUserGuideFile }));
    }

    private renderUploadPopup = (title: string, url: string, saveData: {}, onComplete: { (): void }) => {
        this.uploadPopup = new PopupBuilder()
            .setTitle(title)
            .withQA("Popup")
            .setContent(
            <div className="popup-container" data-qa="UploadPopup">
                <UploadComponent
                    allowedExtensions={[".pdf"]}
                    onComplete={() => onComplete()}
                    saveData={saveData}
                    saveUrl={url}
                    qa="UploadComponent"
                    onCancelAndClose={() => this.uploadPopup.close()}
                    >
                        
                </UploadComponent>
            </div>
            );
        this.uploadPopup.render();
    }

    private renderUploadButton = (type: Dtos.StaticFileConentKey, text: string, onComplete: { (): void }) => {
        let url = "/api/staticcontent/file";
        let saveData = { key: type };
        return (
            <div className="col-md-12">
                <button className="btn btn-primary" onClick={() => this.renderUploadPopup(text, url, saveData, () => onComplete())} data-qa="UploadButton">{text}</button>
            </div>
        );
    }

    private renderUserGuideDownload = (file: Pending<Dtos.StaticFileContentDto>) => {
        return Loader.for(
            file,
            (f) => {
                return <span><a href={new Apis.StaticContentApi().downloadUrl(f.key)} data-qa="DownloadButton" target="_blank">{f.name} </a></span>;
            },
            (error) => {
                return error.serverError == "Not Found" ? <span data-qa="ServerError">Not Applicable</span> : <span>Error getting file info</span>;
            }
        );
    }

    private renderUserGuideLastUploaded = (file: Pending<Dtos.StaticFileContentDto>) => {
        return Loader.for(file,
            (f) => {
                return <span><DateTime qa="UserGuideLastUploadedDateTime" date={f.lastUploaded} /> by {f.lastUploadedBy}</span>;
            },
            (error) => {
                return error.serverError == "Not Found" ? <span data-qa="UserGuideNeverUpdated">Never</span> : <span>Error getting file info</span>;
            }
        );
    }

    private renderTitle = () => { return <div><h2>User Guides</h2><hr /></div>; }


    private renderAuditTrail(file: Pending<Dtos.StaticFileContentDto>) {
        return (
            <div className={"col-md-12"} style={{ marginTop: '20px', paddingBottom: "50px" }}>
                <div className={"row"}>
                    <label className="col-md-2"><strong>Last Uploaded</strong></label>
                    <div className="col-md-10" data-qa="UserGuideLastUploaded">{this.renderUserGuideLastUploaded(file)}</div>
                </div>
                <div className={"row"}>
                    <label className="col-md-2"><strong>File Name</strong></label>
                    <div className="col-md-10" data-qa="UserGuideDownloadFileName">{this.renderUserGuideDownload(file)}</div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderTitle()}
                {this.renderUploadButton(Dtos.StaticFileConentKey.UserGuide, "Upload Participant User Guide", () => this.loadParticipantUserGuideFile())}
                {this.renderAuditTrail(this.state.userGuideFile)}
                {this.renderUploadButton(Dtos.StaticFileConentKey.DSUserGuide, "Upload Downstream Subscriber User Guide", () => this.loadDSUserGuideFile())}
                {this.renderAuditTrail(this.state.dsUserGuideFile)}
            </div>
        );
    }
};