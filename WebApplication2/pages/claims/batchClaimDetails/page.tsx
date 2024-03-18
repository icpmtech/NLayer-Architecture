import * as React from 'react';
import * as Form from "../../../components";
import * as PageComponents from "./index";
import { Apis, Dtos } from '../../../adr';
import { History } from '../../../classes/History';
import { connect, Loader, Pending, PopupBuilder, UrlState, PagedDataState, PageCache, UrlHelpers, DialogBuilder } from "../../../classes";
import { UpdateBOStatus } from './updateBOStatus';


interface PageProps {
    claimId: number;
    isGoal: boolean;
    canDeleteBatchClaimDocuments: boolean;
    canUpdateBeneficialOwnerStatus: boolean;
    continueClaimUrl: string;
    fileUploadUrl: string;
    backUrl: string;
    canRegenerateClaimDocuments: boolean;
    excelExportLimit: number;
};

interface PageState {
    claimDetails?: Pending<Dtos.ClaimDetailsDto>;
    documents?: Pending<Dtos.BatchClaimDocumentDto[]>;
    documentErrors?: Pending<Dtos.BatchClaimDocumentErrorDto[]>;
    documentTemplateErrors?: Pending<Dtos.BatchClaimDocumentTemplateErrorDto[]>;
    docRegenerationLoading: boolean;
    selectedTab?: number;
    cancel?: Pending<void>;
    fileDeleteError?: boolean;
    claimContinueError?: boolean;
    benOwnersData?: PagedDataState<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    categories?: Pending<Dtos.CategoryPositionDto[]>;
};

interface UrlProps {
    selectedTab: number;
};

export class BatchClaimDetails extends React.Component<PageProps, PageState> {
    private cancelPopup: PopupBuilder;
    private uploadPopup: PopupBuilder;
    private updatePopup: PopupBuilder;
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private batchClaimDetailsApi: Apis.BatchClaimApi;
    private beneficialOwnerApi: Apis.BeneficialOwnerApi;
    private batchClaimDocumentsApi: Apis.BatchClaimDocumentsApi;
    private batchClaimApi: Apis.BatchClaimApi;
    private benOwnersStore: PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    private categoryApi: Apis.CategoryElectionsApi;
    private urlHistory: History;
    private errorCount: number;

    constructor(props: PageProps) {
        super(props);
        let urlProps = this.url.read();
        this.urlHistory = new History(false);
        this.errorCount = 0;

        this.state = {
            claimDetails: new Pending<Dtos.ClaimDetailsDto>(),
            documents: new Pending<Dtos.BatchClaimDocumentDto[]>(),
            documentErrors: new Pending<Dtos.BatchClaimDocumentErrorDto[]>(),
            documentTemplateErrors: new Pending<Dtos.BatchClaimDocumentTemplateErrorDto[]>(),
            docRegenerationLoading: false,
            selectedTab: urlProps.selectedTab || 0,
            fileDeleteError: false,
            claimContinueError: false
        };
        this.batchClaimDetailsApi = new Apis.BatchClaimApi();
        this.beneficialOwnerApi = new Apis.BeneficialOwnerApi();
        this.batchClaimDocumentsApi = new Apis.BatchClaimDocumentsApi();
        this.categoryApi = new Apis.CategoryElectionsApi();
        this.batchClaimApi = new Apis.BatchClaimApi();

        this.benOwnersStore = new PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>(
            (query, page, pageSize) => this.beneficialOwnerApi.getAllByClaimId(query, page, pageSize),
            () => this.state.benOwnersData,
            (benOwnersData) => this.setState({ benOwnersData })
        );
    }

    componentDidMount() {
        this.loadBatchClaimData(false);
        this.loadDocuments();
        this.loadCategorySummary();
    }

    private disableExcelExport = (): boolean => {
        let currentData = this.benOwnersStore.getCurrentData();
        if (currentData.data && currentData.data.totalCount > this.props.excelExportLimit) {
            return true;
        }
        return false;
    }

    private loadCategorySummary() {
        connect(new Apis.CategoryElectionsApi().getCategoryPositions(this.props.claimId, true),
            this.state.categories,
            categories => {
                this.setState({ categories: categories });
            });
    }

    private docsNotReady(docStatus: Dtos.BatchClaimDocumentStatus) {
        if (docStatus === Dtos.BatchClaimDocumentStatus.AnalysingDocReqs ||
            docStatus === Dtos.BatchClaimDocumentStatus.DocsGenerationInProgress ||
            docStatus === Dtos.BatchClaimDocumentStatus.DocsImportInProgress) {
                return true;
            }
        return false;
    }

    private loadBatchClaimData(isRetry: boolean) {
        connect(this.batchClaimDetailsApi.getById(this.props.claimId), this.state.claimDetails, claimDetails => {

            // Check previously known claim details for document availability, false if data not available
            let docsPreviouslyNotReady = this.state.claimDetails.map(x => this.docsNotReady(x.documentStatusId), () => false).data;
            let wasSubmitting = this.state.claimDetails.map(x => x.statusId === Dtos.BatchClaimStatus.Submitting, () => false).data;

            if (claimDetails.isFailed() && isRetry && this.errorCount < 5) {
                this.errorCount++;
                setTimeout(() => this.loadBatchClaimData(true), 5000);
            } else {
                this.setState({ claimDetails });

                if (claimDetails.isDone()) {
                    
                    let pollClaimDetails = false;
                    if (claimDetails.data.statusId === Dtos.BatchClaimStatus.Submitting) {
                        pollClaimDetails = true;
                    } else if (wasSubmitting) {
                        this.benOwnersStore.refresh();
                    }
                    if (this.docsNotReady(claimDetails.data.documentStatusId)) {
                        pollClaimDetails = true;
                    } else if (docsPreviouslyNotReady) {
                        this.loadDocuments();
                    }
                    if (claimDetails.data.documentStatusId === Dtos.BatchClaimDocumentStatus.Error) {
                        if (this.props.isGoal) 
                            this.loadDocumentErrors();
                        else 
                            this.setState({ documentErrors: Pending.done([]), documentTemplateErrors: Pending.done([]) });
                    }
                    if (pollClaimDetails) {
                        setTimeout(() => this.loadBatchClaimData(true), 5000);
                    } 
                }
            }
        });
    }

    private loadDocuments = () => {
        connect(this.batchClaimDocumentsApi.getDocuments(this.props.claimId, null), this.state.documents, documents => {
            this.setState({ documents });
        });
    }

    private loadDocumentErrors = () => {
        connect(this.batchClaimApi.getDocumentGenerationErrors(this.props.claimId), this.state.documentErrors, documentErrors => this.setState({ documentErrors }));
        connect(this.batchClaimApi.getDocumentGenerationTemplateErrors(this.props.claimId), this.state.documentTemplateErrors, documentTemplateErrors => this.setState({ documentTemplateErrors }));
    }

    private regenerateDocuments = () => {
        this.setState({docRegenerationLoading: true});
        
        this.batchClaimApi.regenerateDocuments(this.props.claimId).always(() => {
            this.loadBatchClaimData(false);
            this.setState({docRegenerationLoading: false});
        });
    }

    private canClaimBeContinued(details: Dtos.ClaimDetailsDto): boolean {
        return (details.canContinueClaim
            && details.statusId === Dtos.BatchClaimStatus.InPreparation
            && !details.round.isLocked);
    }

    private canBOStatusBeUpdated(): boolean {
        let allowedClaimStatus = [
            Dtos.BatchClaimStatus.Submitted,
            Dtos.BatchClaimStatus.InProcess,
            Dtos.BatchClaimStatus.Filed,
            Dtos.BatchClaimStatus.Rejected
        ];
        let notAllowedEventStatus = [
            Dtos.EventStatusLookup_Status.Closed,
            Dtos.EventStatusLookup_Status.Canceled
        ];

        return (this.props.canUpdateBeneficialOwnerStatus
            && allowedClaimStatus.indexOf(this.state.claimDetails.data.statusId) !== -1
            && notAllowedEventStatus.indexOf(this.state.claimDetails.data.event.status) === -1
            && !this.state.claimDetails.data.round.isLocked
        );
    }

    private allClaimsAreElectionType(): boolean {
        return this.state.categories.data.every(x => x.hasCategoryAdrs);
    }

    private deleteUploadedFile = (id: number) => {
        connect(this.batchClaimDocumentsApi.deleteDocument(id), null, response => {
            if (response.isReady()) {
                if (response.error) {
                    this.setState({ fileDeleteError: true });
                }
                else {
                    this.loadDocuments();
                    this.setState({ fileDeleteError: false });
                }
            }
        });
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        }
        else {
            let eventId = this.state.claimDetails.map(x => x.event.id);
            let participantId = this.state.claimDetails.map(x => x.downstreamSubscriber);

            if (eventId.isReady() && participantId.isReady()) {
                let url = this.props.isGoal ? "/claims/listbatchclaims" : "/claims/listparticipant?EventId=" + eventId.data + (participantId.data ? "&ParticipantId=" + participantId.data.id : "");
                window.location.href = url;
            }
        }
    }

    private handleUploadClose = () => {
        this.uploadPopup.close();
    }

    private handleCancel = () => {
        this.cancelPopup.close();
        connect(this.batchClaimDetailsApi.cancel(this.props.claimId), this.state.cancel, cancel => {
            this.handleBack();
        });
    }

    private handleContinueButton = () => {
        connect(
            this.batchClaimDetailsApi.getById(this.props.claimId),
            this.state.claimDetails,
            response => this.continueClaim(response)
        );
    }

    private handleBeneficialOwnerChange(query: Dtos.GetBatchClaimBenOwnersQuery, page: number, pageSize: number) {
        const current = Object.assign(query, { id: this.props.claimId });
        this.benOwnersStore.setCurrent(current, page, pageSize, false);
    }

    private continueClaim = (claimDetails: Pending<Dtos.ClaimDetailsDto>) => {
        if (claimDetails.isDone()) {
            if (this.canClaimBeContinued(claimDetails.data)) {
                window.location.href = UrlHelpers.buildUrl([this.props.continueClaimUrl], { ClaimId: this.props.claimId });
            }
            else {
                this.setState({ claimDetails: claimDetails, claimContinueError: true });
            }
        }
        else {
            this.setState({ claimDetails: claimDetails, claimContinueError: false });
        }
    }

    private showCancelPopup = (claim: Dtos.ClaimDetailsDto) => {
        if (!this.cancelPopup) {
            this.cancelPopup = new PopupBuilder()
                .setTitle("Claim Cancellation Confirmation")
                .withQA("CancelPopUp")
                .setContent(
                    <div className="popup-content" data-qa="ClaimCancellationConfirmationPopUp">
                    <div className="mb-3">
                        Are you sure you want to cancel the Batch Claim # {claim.batchClaimReference}
                    </div>
                    <div className="text-end">
                            <button className="btn btn-outline-secondary" onClick={() => this.cancelPopup.close()} data-qa="ClaimCancellationCancel">Cancel</button>
                            <button className="btn btn-primary" onClick={this.handleCancel} data-qa="ClaimCancellationConfirm">Confirm</button>
                    </div>
                </div>
                );
        }

        this.cancelPopup.render();
    }

    private updateSelectedTab(i: number) {
        if (!this.props.backUrl) {
            this.setState({ selectedTab: i });
            this.url.update({ selectedTab: i });
        }
    }

    private renderCancel() {
        return Loader.for(this.state.cancel,
            cancel => <Form.Message message="Batch Claim successfully canceled" type="success" qa="SuccessMessage"/>,
            error => <Form.Message message={error.userMessage || "There has been an error"} type="alert" qa="ErrorMessage"/>
        );
    }

    private renderUploadPopup = () => {
        this.uploadPopup = new PopupBuilder()
            .setTitle("Upload Completed Documents")
            .withQA("UploadPopUp")
            .setContent(
            <PageComponents.BatchClaimDocUploader
                    dataId={this.props.claimId.toString()}
                    onClosePopup={this.handleUploadClose}
                    fileUploaded={() => { this.loadDocuments(); this.benOwnersStore.refresh(); }}
                    saveUrl={this.props.fileUploadUrl}
            />
            );
        this.uploadPopup.render();
    }

    private renderClaimDetails(claims: Dtos.ClaimDetailsDto) {
        return (
            <Form.FormGroup qa="BatchClaimDetailsGrid">
                <PageComponents.BatchClaimDetailsGrid claimDetails={Pending.done(claims)}/>
            </Form.FormGroup>
        );
    }

    private renderTabs(claimDetails: Dtos.ClaimDetailsDto) {
        let tabsToRender = ["Categories"];

        if (!this.state.categories.data.every(x => x.hasCategoryAdrs)) {
            tabsToRender.unshift("Beneficial Owners");
        }

        let showDocumentsTab = [Dtos.BatchClaimStatus.InPreparation, Dtos.BatchClaimStatus.Canceled].indexOf(claimDetails.statusId) === -1;
        if (showDocumentsTab) {
            tabsToRender.push("Documents");
        }

        return (
            <Form.FormGroup qa="DocumentsForm">
                <Form.TabComponent tabs={tabsToRender} selectedTab={this.state.selectedTab} onSelectedTabChange={i => this.updateSelectedTab(i)} qa="DocumentsTab">
                    {this.renderOwnersTab()}
                    {this.renderCategoriesTab()}
                    {(showDocumentsTab) ? this.renderDocumentsTab(claimDetails) : null}
                </Form.TabComponent>
            </Form.FormGroup>
        );
    }

    private renderCategoriesTab() {
        let isIrishCommonStockEvent = this.state.claimDetails.data.event.securityType == Dtos.SecurityType.CommonStock && this.state.claimDetails.data.event.countryofIssuance.countryCode == "IRL";
        
        return (
            <Form.FormGroup qa="BatchClaimCategoriesGrid">
                <Form.GridTitle title="Category elections" qa="BatchClaimCategoriesGridTitle"/>
                <PageComponents.BatchClaimCategoriesGrid categories={this.state.categories} isIrishCommonStockEvent={isIrishCommonStockEvent}/>
            </Form.FormGroup>
        );
    }

    private renderOwnersTab() {
        if (!this.state.categories.data.every(x => x.hasCategoryAdrs))
            return (
                <Form.FormGroup qa="BatchClaimBeneficialOwnersGrid">
                    <Form.GridTitle title="Beneficial Owners" qa="BatchClaimBeneficialOwnersGridTitle"/>
                    <PageComponents.BatchClaimOwnersGrid
                        isIrishCommonStockEvent={this.state.claimDetails.data.event.securityType == Dtos.SecurityType.CommonStock && this.state.claimDetails.data.event.countryofIssuance.countryCode == "IRL"}
                        benOwners={this.benOwnersStore.getCurrentData()}
                        query={this.benOwnersStore.getCurrentFilter()}
                        onChange={(query, page, pageSize) => this.handleBeneficialOwnerChange(query, page, pageSize)}
                        onSelected={x => this.navigateToDetails(x)}
                        disableExcelExport={this.disableExcelExport()}
                       
                    />
                </Form.FormGroup>
            );
    }

    private navigateToDetails(dto: Dtos.BeneficialOwnerDetailsDto) {
        let encodedUrl = this.urlHistory.getCurrentEncodedUrlBackUrlQueryRemoved(); // remove one of the grid filters to keep back url below max length
        window.location.href = '/claims/viewbodetails/' + dto.id + "?backurl=" + encodedUrl;
    }

    private renderDocumentsTab(claimDetails: Dtos.ClaimDetailsDto) {
        let systemGeneratedDocuments = this.state.documents.map(x => x.filter(doc => doc.systemGenerated));
        let uploadedDocuments = this.state.documents.map(x => x.filter(doc => !doc.systemGenerated));

        return (
            <div>
                <Form.FormGroup qa="BatchClaimGeneratedDocuments">
                    <Form.GridTitle title="ADROIT&trade; Generated Documents for Participant Completion" qa="BatchClaimGeneratedDocumentsTitle"/>
                    <PageComponents.BatchClaimGeneratedDocs
                        documentStatusId={claimDetails.documentStatusId}
                        documents={systemGeneratedDocuments}
                        documentErrors={this.state.documentErrors}
                        documentTemplateErrors={this.state.documentTemplateErrors}
                        isGoal={this.props.isGoal}
                        canRegenerateClaimDocuments={this.props.canRegenerateClaimDocuments}
                        regenerateDocuments={this.regenerateDocuments}
                        docRegenerationLoading={this.state.docRegenerationLoading}
                    />
                </Form.FormGroup>
                <Form.FormGroup qa="UploadCompletedDocumentsForm">
                    <div className="col-md-11 float-end">
                        <button className="btn btn-primary col-md-3 float-end" data-qa="UploadCompletedDocumentsButton" onClick={this.renderUploadPopup}>Upload Completed Documents</button>
                    </div>
                </Form.FormGroup>
                <Form.FormGroup qa="BatchClaimUploadedDocuments">
                    <Form.GridTitle title="Uploaded Claim Documents" qa="BatchClaimUploadedDocumentsTitle"/>
                    <PageComponents.BatchClaimUploadedDocs
                        documents={uploadedDocuments}
                        handleDeleteFile={this.deleteUploadedFile}
                        canDeleteFile={this.props.canDeleteBatchClaimDocuments}
                    />
                    <br />
                    <Form.Message type="alert" hide={!this.state.fileDeleteError} message="Unable to delete file" qa="UnableToDeleteFileMessage"/>
                </Form.FormGroup>
            </div>
        );
    }

    private renderCancelButton(claim: Dtos.ClaimDetailsDto) {
        return claim.canCancelClaim && (claim.statusId === Dtos.BatchClaimStatus.InPreparation || claim.statusId === Dtos.BatchClaimStatus.Failed)
            ? <button className="btn btn-primary" data-qa="CancelClaimButton" onClick={() => this.showCancelPopup(claim)}>Cancel Batch Claim</button>
            : null;
    }

    private renderDeleteButton(claim: Dtos.ClaimDetailsDto) {
        return claim.canDeleteClaim && (claim.statusId === Dtos.BatchClaimStatus.InPreparation || claim.statusId === Dtos.BatchClaimStatus.Canceled || claim.statusId === Dtos.BatchClaimStatus.Failed)
            ? <button className="btn btn-primary" data-qa="DeleteClaimButton" onClick={this.renderDeletePopup}>Delete Batch Claim</button>
            : null;
    }

    private renderContinueButton() {
        return this.canClaimBeContinued(this.state.claimDetails.data)
            ? <button className="btn btn-outline-secondary" data-qa="ContinueClaimButton" onClick={this.handleContinueButton}>Continue Batch Claim</button>
            : null;
    }

    private renderBOStatusUpdateButton() {
        return this.canBOStatusBeUpdated()
            ? <button className="btn btn-primary" data-qa="UpdateBeneficialOwnerStatusButton" onClick={this.renderUpdatePopup}>{`Change Elections Status`}</button>
            : null;
    }

    private renderClaimContinueError = () => {
        let errorMsgLocked = "The round for this Batch Claim is Locked. Please cancel the claim if you want to free its position";
        let errorMsgNotInPrep = "This Batch Claim is no longer In Preparation and cannot be continued";
        return this.state.claimContinueError
            ? this.state.claimDetails.data.round.isLocked
                ? <Form.Message type="alert" message={errorMsgLocked} qa="RoundLockedMessage"/>
                : <Form.Message type="alert" message={errorMsgNotInPrep} qa="RoundNotInPreparationMessage"/>
            : null
    }

    confirmBatchClaimDelete() {
        connect(this.batchClaimApi.deleteBatchClaim(this.props.claimId), null, d => {
            if (d.isDone()) {
                this.handleBack();
            }
            else if (d.isFailed()) {
                // display error message
            }
        });
    }

    renderDeletePopup = () => {
        let deletePopup = new DialogBuilder()
            .setTitle(`Confirm Batch Claim Delete`)
            .setMessage("Are you sure that you want to delete this Batch Claim? This action cannot be reversed.")
            .withQA("ConfirmBatchClaimDeleteDialog")
            .setCancelHandler(() => deletePopup.close())
            .setConfirmHandler(() => { this.confirmBatchClaimDelete(); deletePopup.close(); });
        deletePopup.open();
    }

    renderUpdatePopup = () => {
        this.updatePopup = new PopupBuilder();
        this.updatePopup.withQA("UpdatePopUp")
        this.updatePopup.setContent(<UpdateBOStatus
            claimId={this.props.claimId}
            allClaimsAreElectionType={this.allClaimsAreElectionType()}
            onClose={() => this.updatePopup.close()}
            onSuccess={() => { this.updatePopup.close(); this.benOwnersStore.refresh(); this.loadBatchClaimData(false); this.loadCategorySummary(); }}
            onDataLoaded={() => this.updatePopup.centreWindow()}
        />);
        this.updatePopup.setTitle(`Update Elections Status`);
        this.updatePopup.render();
    }

    render() {

        return Loader.for(this.state.claimDetails, claimDetails =>
            Loader.for(this.state.categories, details =>
                <div>
                    {this.renderClaimContinueError()}
                    <h1>Batch Claim Details</h1>
                    {this.renderCancel()}
                    {this.renderClaimDetails(claimDetails)}
                    {this.renderTabs(claimDetails)}
                    <div className="d-flex justify-content-end mb-1">
                        <button className="btn btn-outline-secondary" data-qa="BatchClaimDetailsBackButton" onClick={() => this.handleBack()} disabled={!this.state.claimDetails.isReady()}>Back</button>
                        {this.renderDeleteButton(claimDetails)}
                        {this.renderCancelButton(claimDetails)}
                        {this.renderContinueButton()}
                        {this.renderBOStatusUpdateButton()}
                    </div>
                </div>)
        );

    }
};