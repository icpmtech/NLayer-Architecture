import * as React from 'react';
import { Loader, safeClone, Pending, DetailsBuilder, LoadingStatus, connect, PageCache, PagedDataState, IGridBuilderChangeArgs, SimpleGridBuilder, PopupBuilder, DialogBuilder, FormBuilder } from '../../classes';
import { Message } from '../../components';
import { Apis, Dtos } from '../../adr';
import { ClaimSteppedTracker, step } from '../../components/claimSteppedTracker';
import { ValidationFailuresGrid } from './validationFailuresGrid';
import { FileUpload } from './fileUpload';
import { Summary } from './summary';
import { DisclaimerPopup } from './disclaimerPopup';

interface DetailsProps {
    bulkClaim: Pending<Dtos.BulkClaimDto>;
    bulkClaimId: number;
    canCancelAny: boolean;
    canUpload: boolean;
    isGoalUser: boolean;
    canSubmit: boolean;
    currentUserId: number;
    onBack: () => void;
    query: Dtos.GetAvailableEventsListQuery;
    onUploadComplete: () => void;
    onClaimSubmitted: () => void;
    onClaimCancelled: () => void;
    currentStep: number;
}

interface DetailsState {
    errorMessage?: string;
    eventList?: Pending<Dtos.EventSummaryDto[]>;
    summaryList?: Pending<Dtos.BulkClaimUploadSummaryDto[]>;
    detailsList?: Pending<Dtos.BulkClaimUploadDetailsDto[]>;
    errorList?: PagedDataState<Dtos.BulkClaimValidationFailureDto, Dtos.GetListBulkClaimValidationErrorsQuery>;
    disclaimerText?: Pending<string>;
    isUploading?: boolean;
}

export class Details extends React.Component<DetailsProps, DetailsState> {
    private gridPageSize: number = 20;
    private errorStore: PageCache<Dtos.BulkClaimValidationFailureDto, Dtos.GetListBulkClaimValidationErrorsQuery>;
    private steps: step[];
    private componentHasMounted: boolean = false;

    constructor(props: DetailsProps) {
        super(props);

        this.errorStore = new PageCache<Dtos.BulkClaimValidationFailureDto, Dtos.GetListBulkClaimValidationErrorsQuery>(
            (query, page, pageSize) => new Apis.BulkClaimApi().getValidationFailures(query, page, pageSize),
            () => this.state.errorList,
            (errorList) => this.setState({ errorList })
        );
        
        this.steps = [
            { value: 1, name: 'Upload', state: 'none' },
            { value: 2, name: 'Processing', state: 'none' },
            { value: 3, name: 'Failed to Process', state: 'none' },
            { value: 4, name: 'Review Claim', state: 'none' },
            { value: 6, name: 'Submitted', state: 'none' },
        ];

        this.state = { eventList: new Pending<Dtos.EventSummaryDto[]>(LoadingStatus.Preload) };
    }

    render() {
        return (
            <div>
                {this.renderDetails()}
                {this.renderProgressBar()}
                {this.state.errorMessage && <Message type="alert" message={this.state.errorMessage} qa="ErrorMessage"/>}
                <div className="row col-md-12">
                    <div className="col-md-7" data-qa="Progress">
                        {this.props.bulkClaim.data && this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.FailedToProcess && this.renderErrorGrid()}
                        {this.props.bulkClaim.data && this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.New && this.renderEventList()}
                        {this.props.bulkClaim.data && (this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Review || this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Submitted)
                            && <Summary bulkClaimId={this.props.bulkClaimId} eventSummary={this.state.summaryList} eventDetails={this.state.detailsList} showSubmittedColumns={this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Submitted}/>}
                    </div>
                    <div className="col-md-1"></div>
                    <div className="col-md-3" data-qa="UploadComponent">
                        {this.props.bulkClaim.data
                            && this.props.bulkClaim.data.status != Dtos.BulkClaimStatus.Submitted
                            && this.props.bulkClaim.data.status != Dtos.BulkClaimStatus.Submitting
                            && this.props.canUpload
                            && this.renderUploadComponent()
                        }
                    </div>
                </div>

                <div className="text-end" data-qa="Buttons">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }

    componentDidUpdate(previousProps: DetailsProps) {
        if (this.props.bulkClaim.data && previousProps.bulkClaim.data && previousProps.bulkClaim.data.status != this.props.bulkClaim.data.status) {
            this.ensureDetails();
        }
    }

    componentDidMount() {
        this.ensureDetails();
    }

    private ensureDetails() {
        if (this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.New) {
            this.ensureEventList();
        }

        if (this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Review) {
            this.ensureEventDetails();
        }

        if (this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Review || this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Submitted) {
            this.ensureEventSummary();
        }
    }
        
    renderUploadComponent() {
        return (<div>
            <h3>Upload</h3>

            {this.props.bulkClaim.data && this.props.bulkClaim.data.status != Dtos.BulkClaimStatus.Processing && this.renderUploadArea()}
            {this.props.bulkClaim.data && this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Processing && this.renderProcessingMessage()}
        </div>);
    }

    renderErrorGrid() {
        return <ValidationFailuresGrid
            validationErrors={this.errorStore.getCurrentData()}
            onPageChanged={(query) => this.onGridChanged(query)}
            currentFilter={this.errorStore.getCurrentFilter()}
        />
    }

    renderProcessingMessage() {
        return (<div><p>Your upload is complete and is now being processed, which may take some time.</p><p>We will notify you by email when your claim is ready for review.</p></div>);
    }

    renderUploadArea() {
        return (<div>
            <h5><b>Step 1:</b> Download Template</h5>
            <div style={{ padding: "11.2px" }}>
                <button className="btn btn-outline-secondary" onClick={() => this.downloadTemplate(`../../api/bulkclaims/${this.props.bulkClaim.data.id}/template`)} data-qa="DownloadTemplateButton">Download Template</button>
            </div>

            <h5><b>Step 2:</b> Upload completed file</h5>
            <div className="k-upload k-upload-empty hide-upload-status" style={{borderColor: 'transparent'}}>
                {/* This is implemented in an odd way. Currently using the above style to hide a border, but this really needs to be reimplemented. 
                    This is hiding the fact that this is kind of a drag and drop kendo component, but hidden and not working properly #TODO */}
                <div>
                    <div className={"k-upload-button btn btn-primary" + (this.state.isUploading ? " btn-loading" : "")} aria-label="Upload Beneficial Owners" data-qa="UploadBeneficialOwnersButton">
                        <FileUpload bulkClaimId={this.props.bulkClaim.data.id} isUploading={this.state.isUploading} onUploadStart={() => { this.setState({ isUploading: true }); }} onUploadComplete={() => { this.setState({ isUploading: false }); this.props.onUploadComplete() }} onUploadError={(msg) => this.setState({ isUploading: false, errorMessage: msg })}/>
                    </div>
                </div>
            </div>
            <p>You can have a maximum of 15,000 Beneficial Owners per Event</p>
            <p>Your maximum file size cannot exceed 15,360 KB</p>
        </div>);
    }

    renderDetails() {
        let detailsBuilder = DetailsBuilder.ForPending(this.props.bulkClaim, true);

        detailsBuilder.addColumn(" ", () => " ", 300, "BulkClaimDetailsColumnOne")
            .addString("Bulk Claim #", m => m.reference, "BulkClaimNumber")
            .addString("Country of Issuance", m => m.countryOfIssuance.countryName, "CountryOfIssuance")
            .addDate("ADR Record Date", m => m.date, "AdrRecordDate", true)

        if (this.props.isGoalUser)
            detailsBuilder.columns[0].addString("Participant", m => m.participantName + ' (' + m.dtcCode + ')', "Participant");

        detailsBuilder.addColumn(" ", () => " ", 300, "BulkClaimDetailsColumnTwo")
            .addString("Round Type", m => m.roundTypeName, "RoundType")
            .addString("Status", m => m.bulkClaimStatusName, "Status")
            .addNumber("Number of Events", m => m.numberOfEvents, "NumberOfEvents");

        return detailsBuilder.render();
    }

    renderProgressBar() {
        let steps = safeClone(this.steps);

        if (this.props.currentStep == 3)
            steps = steps.filter(x => x.value != 4);

        else
            steps = steps.filter(x => x.value != 3);

        steps = steps.map((x, i) => {
            if (x.value === this.props.currentStep) x.state = 'active';
            else if (x.value < this.props.currentStep) x.state = 'complete';
            else x.state = 'none';

            return x;
        });
        
        return <ClaimSteppedTracker steps={steps}/>
    }

    renderEventList() {
        return Loader.for(this.props.bulkClaim, claim => {
            let grid = SimpleGridBuilder.ForPending(this.state.eventList)
                .addString("B#", m => m.bNum, Dtos.ListEventsQuery_SortField.BNum, "BatchNumber")
                .addString("Issuer", m => m.issuer, Dtos.ListEventsQuery_SortField.Issuer, "Issuer")
                .addString("CUSIP", m => m.cusip, Dtos.ListEventsQuery_SortField.Cusip, "Cusip")
                .withQA("EventList");

            return (<div>
                <h3>Eligible Events</h3>
                <p>Your Bulk Claim can be for any of the following events:</p>
                <div data-qa="EligibleEventsGrid">{grid.render()}</div>
            </div>);
        });
    }

    renderButtons() {
        return (<div className="d-flex justify-content-end" style={{ marginTop: 25 }}>
            <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
            {this.props.bulkClaim.data &&
                (this.props.bulkClaim.data.status === Dtos.BulkClaimStatus.New || this.props.bulkClaim.data.status === Dtos.BulkClaimStatus.Review || this.props.bulkClaim.data.status === Dtos.BulkClaimStatus.FailedToProcess) &&
                (this.props.canCancelAny || this.props.currentUserId === this.props.bulkClaim.data.createdBy) &&
                <button className="btn btn-outline-secondary" onClick={() => this.showCancelDialog()} data-qa="CancelButton">Cancel Claim</button>}
            {this.props.bulkClaim.data && this.props.bulkClaim.data.status == Dtos.BulkClaimStatus.Review && this.props.canSubmit && <button className="btn btn-primary" onClick={() => this.showSubmitDialog()} data-qa="SubmitClaimButton">Submit Claim</button>}
        </div>);
    }

    private submitPopup: PopupBuilder;

    private showSubmitDialog() {

        this.submitPopup = new PopupBuilder()
            .setTitle("Submit Bulk Claim")
            .setHeight(550)
            .setWidth(800)
            .setContent(
                <DisclaimerPopup
                    bulkClaimId={this.props.bulkClaimId}
                    onSubmit={() => { this.submitPopup.close(); this.submitClaim(); }}
                    onCancel={() => this.submitPopup.close()}
                />)
            .withQA("SubmitBulkClaimDialog")
            ;
        
        this.submitPopup.open();
    }

    private cancelDialog: DialogBuilder;

    private showCancelDialog() {
        this.cancelDialog = new DialogBuilder();

        this.cancelDialog
            .setTitle("Cancel Bulk Claim")
            .setMessage(<p>Are you sure you wish to cancel this bulk claim, all information currently entered will be lost</p>)
            .setWidth(600)
            .setConfirmText("Yes")
            .setCancelText("No")
            .setConfirmHandler(() => this.cancelClaim())
            .setCancelHandler(() => this.cancelDialog.close())
            .withQA("CancelBulkClaimDialog")
            .open();
    }

    private submitClaim() {
        connect(new Apis.BulkClaimApi().submitClaim(this.props.bulkClaimId), null, ret => {
            if (ret.isDone()) {
                this.props.onClaimSubmitted();
            }
            else if (ret.isFailed()) {
                this.setState({ errorMessage: ret.error.userMessage });
            }
        });
    }

    private cancelClaim() {
        connect(new Apis.BulkClaimApi().cancelClaim(this.props.bulkClaimId), null, ret => {
            if (ret.isDone()) {
                this.props.onClaimCancelled();
            }
            else if (ret.isFailed()) {
                this.setState({ errorMessage: ret.error.userMessage });
            }
        });
    }

    private ensureEventList() {
        connect(new Apis.BulkClaimApi().getEventsForClaim(this.props.query), this.state.eventList, events => {
            if (events.isDone()) {
                this.setState({ eventList: events });
            }
        });
    }

    private ensureEventSummary() {
        connect(new Apis.BulkClaimApi().getSummary(this.props.bulkClaimId), this.state.summaryList, summary => {
            this.setState({ summaryList: summary });
        });
    }

    private ensureEventDetails() {
        connect(new Apis.BulkClaimApi().getUploadDetails(this.props.bulkClaimId), this.state.detailsList, details => {
            this.setState({ detailsList: details });
        });
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField>) {
        this.errorStore.setCurrent({
            sort: options.sort,
            uiFilters: options.filters,
            bulkClaimId: this.props.bulkClaim.data.id
        }, options.page, options.pageSize, false);
    }

    private downloadTemplate(templateUrl: string) {
        window.open(templateUrl);
    }
}