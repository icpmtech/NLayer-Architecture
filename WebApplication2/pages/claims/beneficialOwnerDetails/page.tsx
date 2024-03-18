import * as React from 'react';
import { BeneficialOwnerDetailsGrid } from './beneficialOwnerDetailsGrid';
import { BeneficialOwnerClaimTrailGrid } from './beneficialOwnerClaimTrailGrid';
import { BeneficialOwnerDocuments } from './beneficialOwnerDocuments';
import { FormGroup, GridTitle, Message } from "../../../components";
import { UpdateClaimStatus } from './updateClaimStatus';
import { connect, Pending, LoadingStatus, PopupBuilder, Loader } from '../../../classes';
import { Apis, Dtos } from '../../../adr';

interface PageProps {
    id: number;
    backUrl?: string;
    canAddDocumentComments: boolean;
    canViewClaimTrail: boolean;
    canViewDocumentComments: boolean;
    canUpdateBeneficialOwnerStatus: boolean;
    canAddBeneficialOwnerComment: boolean;
    canUpdateBeneficialOwnerDuplicate: boolean;
};

interface PageState {
    trail?: Pending<Dtos.BeneficialOwnerClaimTrailDto[]>;
    details?: Pending<Dtos.BeneficialOwnerDetailsDto>;
    documents?: Pending<Dtos.BeneficialOwnerDocumentsDto[]>;
    eventDetails?: Pending<Dtos.EventDto>;
    updateDuplicate?: Pending<void>;
    submittedComment?: boolean;
    commentSuccess?: boolean;
    commentAdded?: boolean;
}

export class BeneficialOwnerDetails extends React.Component<PageProps, PageState> {
    private popup: PopupBuilder;

    constructor(props: PageProps) {
        super(props);
        this.state = {
            trail: new Pending<Dtos.BeneficialOwnerClaimTrailDto[]>(),
            details: new Pending<Dtos.BeneficialOwnerDetailsDto>(),
            updateDuplicate: new Pending<void>(),
            documents: new Pending<Dtos.BeneficialOwnerDocumentsDto[]>(),
            submittedComment: false,
            commentSuccess: true,
            eventDetails: new Pending<Dtos.EventDto>()
        };
    }

    componentDidMount() {
        this.updateBODetails();
    }

    ensureEventDetails(eventId: number) {
        connect(new Apis.EventsApi().getById(eventId), this.state.eventDetails, event => this.setState({ eventDetails: event }));
    }
    
    updateBODetails() {
        this.updateDetails();
        connect(new Apis.BeneficialOwnerDocumentsApi().getAllByBeneficialId(this.props.id), this.state.documents, documents => this.setState({ documents }));
        this.updateClaimTrail();
    }

    updateDetails() {
        connect(new Apis.BeneficialOwnerApi().getById(this.props.id), this.state.details, details => { this.setState({ details }); if (details.isDone()) { this.ensureEventDetails(details.data.eventId); } });
    }

    updateClaimTrail() {
        if (this.props.canViewClaimTrail) {
            connect(new Apis.ClaimTrailApi().getById(this.props.id), this.state.trail, trail => this.setState({ trail }));
        }
    }

    updateIsDuplicate = () => {
        this.setState({ updateDuplicate: new Pending<void>() });
        connect(new Apis.BeneficialOwnerApi().updateIsPossibleDuplicate(this.props.id,
            { isPossibleDuplicate: !this.state.details.data.isPossibleDuplicate }), null,
            updateDuplicate => {
                this.setState({ updateDuplicate });
                if (updateDuplicate.state === LoadingStatus.Done) {
                    this.updateDetails();
                    this.updateClaimTrail();
                }
            });
    }

    private editDocumentComment = (document: Dtos.BeneficialOwnerDocumentsDto) => {
        connect(new Apis.BeneficialOwnerDocumentsApi().addDocumentComment(document), null, (response) => this.handleEditComment(response));
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        }
        else {
            let claimId = this.state.details.map(x => x.batchClaimId).data;
            if (claimId) {
                window.location.href = '/claims/BatchClaimDetails/' + claimId.toString();
            }
        }
    }

    private handleEditComment = (response: Pending<void>) => {
        if (response.isReady()) {
            this.setState({ submittedComment: true });
            if (!response.error) {
                this.setState({ commentSuccess: true });
                this.updateBODetails();
            }
            else {
                this.setState({ commentSuccess: false });
            }
        }
        else if (response.isFailed()) {
            this.setState({ submittedComment: true, commentSuccess: false });
        }
    }

    private handleClaimCommentSuccess = () => {
        this.setState({ commentAdded: true });
        this.updateClaimTrail();
    }

    private handleUpdate = () => {
        this.updateBODetails();
        this.popup.destroy();
        delete this.popup;
    }

    private renderButtons() {
        return (
            <FormGroup qa="BeneficialOwnerDetailsButtons">
                <div className="d-flex justify-content-end mb-1">
                    <button className="btn btn-outline-secondary" onClick={this.handleBack} data-qa="BackButton">Back</button>
                    {this.renderDuplicateButton()}
                    {this.renderUpdateButton()}
                </div>
            </FormGroup>
        );
    }

    renderUpdatePopup = () => {
        if (!this.popup) {
            this.popup = new PopupBuilder();
            this.popup.setContent(<UpdateClaimStatus
                onClose={() => this.popup.close()}
                onSuccess={this.handleUpdate}
                boDetails={this.state.details.data}
                statusCheck={this.statusCheck}
                onDataLoaded={() => this.popup.centreWindow()}
               
            />);
            this.popup.setTitle("Update Status");
            this.popup.withQA("UpdateStatusPopUp");
        }
        this.popup.render();
    }

    private renderClaimTrail() {
        if (this.props.canViewClaimTrail) {
            return Loader.for(this.state.trail, trail => (
                <FormGroup qa="ClaimTrailForm">
                    <GridTitle title="Claim Trail" qa="ClaimTrailTitle"/>
                    <BeneficialOwnerClaimTrailGrid
                        claims={trail}
                        boId={this.props.id}
                        onCommentAdd={this.handleClaimCommentSuccess}
                        canAddBeneficialOwnerComment={this.props.canAddBeneficialOwnerComment}
                    />
                </FormGroup>
            ));
        }
        return null;
    }

    private renderCommentEditResult = () => {
        return (
            <div>
                <Message
                    hide={this.state.submittedComment ? false : true}
                    type={this.state.commentSuccess ? "success" : "alert"}
                    message={this.state.commentSuccess ? "Document comment successfully updated" : "Error updating comment"}
                    onClose={() => this.setState({ submittedComment: false })}
                    qa="CommentEditMessage"
                />
            </div>
        );
    }

    private showDuplicateButton(): boolean {
        if (this.state.details.isReady()) {
            let preventShowing = [Dtos.BeneficialOwnerClaimStatus.InPreparation, Dtos.BeneficialOwnerClaimStatus.Canceled];
            if (preventShowing.indexOf(this.state.details.data.benOwnerClaimStatusId) === -1) {
                return true;
            }
        }
        return false;
    }

    private renderPossibleDuplicateSuccess = () => {
        if (this.state.updateDuplicate) {
            if (this.state.updateDuplicate.state === LoadingStatus.Done) {
                return <Message type={"success"} message={"Possible Duplicate successfully updated"} qa="PossibleDuplicateSuccessfullyUpdatedMessage"/>
            }
            if (this.state.updateDuplicate.state === LoadingStatus.Failed) {
                return <Message type={"alert"} message={"Error updating Possible Duplicate"} qa="ErrorUpdatingPossibleDuplicateMessage"/>
            }
        }
        return null;
    }

    private renderDetails(details: Dtos.BeneficialOwnerDetailsDto, eventDetails: Dtos.EventDto) {
        return (
            <FormGroup qa="BeneficialOwnerDetailsForm">
                <BeneficialOwnerDetailsGrid ownerDetails={new Pending(LoadingStatus.Done, details)} eventDetails={eventDetails}/>
            </FormGroup>
        );
    }

    private renderDocumentGrid(details: Dtos.BeneficialOwnerDetailsDto, docs: Pending<Dtos.BeneficialOwnerDocumentsDto[]>) {
        if (this.statusCheck(details.benOwnerClaimStatusId)) {
            return (
                <FormGroup qa="DocumentsForm">
                    <GridTitle title={'Documents'} qa="DocumentsFormTitle"/>
                    <BeneficialOwnerDocuments
                        documents={docs}
                        canViewComments={this.props.canViewDocumentComments}
                        canAddComments={this.props.canAddDocumentComments}
                        editCommentHandler={this.editDocumentComment}
                       
                    />
                </FormGroup>
            );
        }
        return null;
    }

    statusCheck(status: Dtos.BeneficialOwnerClaimStatus): boolean {
        const naStatuses = [Dtos.BeneficialOwnerClaimStatus.InPreparation, Dtos.BeneficialOwnerClaimStatus.Canceled];
        return naStatuses.indexOf(status) === -1;
    }

    renderUpdateButton() {
        return this.props.canUpdateBeneficialOwnerStatus && this.props.canViewClaimTrail && this.statusCheck(this.state.details.data.benOwnerClaimStatusId) && !this.state.details.data.roundLocked
            ? <button className="btn btn-primary" onClick={this.renderUpdatePopup} data-qa="UpdateButton">Update Status</button>
            : null;
    }

    renderDuplicateButton() {
        return this.showDuplicateButton() && this.props.canUpdateBeneficialOwnerDuplicate
            ? <button className="btn btn-outline-secondary" data-qa="DuplicateButton" onClick={this.updateIsDuplicate}>Set Duplicate to {this.state.details.data &&
                this.state.details.data.isPossibleDuplicate
                ? "No"
                : "Yes"}</button>
            : null;
    }

    renderMessages() {
        return !!this.state.commentAdded
            ? <Message type="success" message="Comment added successfully" onClose={() => this.setState({ commentAdded: false })} qa="CommentAddedSuccessfullyMessage"/>
            : null;

    }

    render() {
        let combined = Pending.combine(this.state.details, this.state.eventDetails, (bo, event) => { return { bo, event }; });

        return Loader.for(combined, details =>
            <div>
                <h1>Beneficial Owner Details</h1>
                {this.renderPossibleDuplicateSuccess()}
                {this.renderDetails(details.bo, details.event)}
                {this.renderCommentEditResult()}
                {this.renderDocumentGrid(details.bo, this.state.documents)}
                {this.renderMessages()}
                {this.renderClaimTrail()}
                {this.renderButtons()}
            </div>
        );
    }
};