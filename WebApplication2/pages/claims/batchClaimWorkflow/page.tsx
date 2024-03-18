import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { BeneficialOwnerPage } from './beneficialOwners/beneficialOwnerPage';
import { BatchClaimCategoryElections } from './categoryElections';
import { CreateClaim } from './createClaim';
import { DividendEventSummary } from './dividendEventSummary';
import { FlowProgress } from './flowProgress';
import { ClaimPreviewPage } from './preview/page';
import { SubmitClaimPage } from './submitClaim';
import { ValidationFailuresGrid } from './validationFailuresGrid';

interface WorkflowProps {
    backUrl: string;
    claimId: number;
    eventId: number;
    participantId: number;
    isGoalUser: boolean;
    excelExportLimit: number;
}

interface WorkflowState {
    eventDetails?: Framework.Pending<Dtos.EventDto>;
    claimDetails?: Framework.Pending<Dtos.ClaimDetailsDto>;
    hasBeneficialOwners?: boolean;
    stateChangeInProgress?: boolean;
    saveMode?: 'back' | 'save' | 'next';
    isUploading?: boolean;
    errorMessage?: string;
}

interface UrlProps {
    eventId?: number;
    claimId?: number;
    participantId?: number;
}

export class BatchClaimWorkflow extends React.Component<WorkflowProps, WorkflowState> {
    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    private claimId?: number;
    private positionPopup: Framework.AlertBuilder;
    private positionDialog: Framework.DialogBuilder;
    private confirmationPopup: Framework.DialogBuilder;


    constructor(props: WorkflowProps, state: WorkflowState) {
        super(props, state);

        this.state = {
            eventDetails: new Framework.Pending<Dtos.EventDto>(),
            claimDetails: new Framework.Pending<Dtos.ClaimDetailsDto>(),
            hasBeneficialOwners: false
        }

        this.claimId = this.props.claimId;
    }

    componentDidMount() {
        this.setStateFromPath();
        this.EnsureEventDetails();
        this.EnsureClaimDetails();
    }

    private setStateFromPath() {
        let claimId = this.url.read().claimId;
        if (claimId) {
            this.claimId = claimId;
        }
    }

    private EnsureEventDetails() {
        Framework.connect(new Apis.EventsApi().getById(this.props.eventId), this.state.eventDetails, event => this.setState({eventDetails: event}));
    }

    private EnsureClaimDetails() {
        if (this.claimId) {

            Framework.connect(new Apis.BatchClaimApi().getById(this.claimId), this.state.claimDetails, claim =>
            {
                if (claim.isDone() && claim.data.id == this.claimId) {
                    if (claim.data.currentStage == Dtos.BatchClaimEntrystage.UploadInProgress) {
                        setTimeout(() => { this.EnsureClaimDetails(); }, 5000);
                    }
                    this.setState({ claimDetails: claim })
                };
            });
        } else {
            this.setState(
                {
                    claimDetails: new Framework.Pending<Dtos.ClaimDetailsDto>(Framework.LoadingStatus.Done,
                        { currentStage: Dtos.BatchClaimEntrystage.Creation } as Dtos.ClaimDetailsDto)
                });
        }
    }

    private updateClaimId(claimId: number) {
        this.url.update({claimId: claimId});
        this.claimId = claimId;
    }

    private onbackButtonClicked() {
        this.setState({ saveMode: 'back', stateChangeInProgress: true });

        if (typeof this.claimId == 'undefined' || !this.claimId) {
            window.location.href = this.props.backUrl;
        }

        new Apis.BatchClaimApi().getById(this.claimId).then(claimDetails => {
            let popupBackToFillingMethodMessage = "The Beneficial Owner information entered will be lost. Are you sure you want to go to the previous step?";
            switch (this.state.claimDetails.data.currentStage) {
                case Dtos.BatchClaimEntrystage.Creation:
                    window.location.href = this.props.backUrl;
                    break;
                case Dtos.BatchClaimEntrystage.CategoryElection:
                    this.changeStage(Dtos.BatchClaimEntrystage.Creation, popupBackToFillingMethodMessage, false);
                    break;
                case Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry:
                case Dtos.BatchClaimEntrystage.AddBeneficialOwnersUpload:
                    var message = !claimDetails.categoryElectionsAvailable ? popupBackToFillingMethodMessage : "";
                    this.changeStage(claimDetails.categoryElectionsAvailable
                        ? Dtos.BatchClaimEntrystage.CategoryElection
                        : Dtos.BatchClaimEntrystage.Creation,
                        message,
                        false);
                    break;
                case Dtos.BatchClaimEntrystage.Preview:
                    this.changeStage(claimDetails.beneficialOwnersAvailable
                        ? Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry
                        : Dtos.BatchClaimEntrystage.CategoryElection,
                        message,
                        false);
                    break;
                case Dtos.BatchClaimEntrystage.Submission:
                    this.changeStage(Dtos.BatchClaimEntrystage.Preview, "", false);
                    break;
                default:
                    break;
            }
        });
    }

    private onsaveExitButtonClicked() {
        this.setState({ saveMode: 'save', stateChangeInProgress: true });

        switch (this.state.claimDetails.data.currentStage) {
        case Dtos.BatchClaimEntrystage.Creation:
            window.location.href = this.props.backUrl;
            break;
        case Dtos.BatchClaimEntrystage.CategoryElection:
            window.location.href = this.props.backUrl;
            break;
        case Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry:
        case Dtos.BatchClaimEntrystage.AddBeneficialOwnersUpload:
        case Dtos.BatchClaimEntrystage.UploadInProgress:
        case Dtos.BatchClaimEntrystage.UploadFailed:
            window.location.href = this.props.backUrl;
            break;
        case Dtos.BatchClaimEntrystage.Preview:
            this.checkPosition(() => {
                window.location.href = this.props.backUrl;
            });
            break;
        case Dtos.BatchClaimEntrystage.Submission:
            this.checkPosition(() => {
                window.location.href = this.props.backUrl;
            });
            break;
        default:
            break;
        }
    }

    private onnextButtonClicked() {
        console.log('next clicked');

        this.setState({ saveMode: 'next', stateChangeInProgress: true });

        new Apis.BatchClaimApi().getById(this.claimId).then(claimDetails => {
            switch (claimDetails.currentStage) {
            case Dtos.BatchClaimEntrystage.Creation:
                var nextStage = claimDetails.categoryElectionsAvailable
                    ? Dtos.BatchClaimEntrystage.CategoryElection
                    : Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry;
                this.changeStage(nextStage, "", false);
                break;
            case Dtos.BatchClaimEntrystage.CategoryElection:
                var nextStage = claimDetails.beneficialOwnersAvailable
                    ? Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry
                    : Dtos.BatchClaimEntrystage.Preview;
                this.changeStage(nextStage, "", false);
                break;
            case Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry:
            case Dtos.BatchClaimEntrystage.AddBeneficialOwnersUpload:
                if (!this.state.hasBeneficialOwners) {
                    var msg = this.getNoEntriesErrorMessage(claimDetails);

                    if (claimDetails.categoryElectionsAvailable) {
                        if (claimDetails.claimedADRPosition === 0) {
                            this.positionPopup = new Framework.AlertBuilder();
                            this.positionPopup
                                .setTitle("Claims Process")
                                .setMessage(msg)
                                .withQA("ClaimsProcessAlertCategoryElectionsAvailable")
                                .open();

                            this.setState({ stateChangeInProgress: false });
                        } else {
                            this.changeStage(Dtos.BatchClaimEntrystage.Preview, "", true);
                        }
                    } else {
                        this.positionPopup = new Framework.AlertBuilder();
                        this.positionPopup
                            .setTitle("Claims Process")
                            .setMessage(msg)
                            .withQA("ClaimsProcessAlert")
                            .open();

                        this.setState({ stateChangeInProgress: false });
                    }
                } else {
                    this.changeStage(Dtos.BatchClaimEntrystage.Preview, "", true);
                }
                break;
            case Dtos.BatchClaimEntrystage.Preview:
                new Apis.ParticipantClaimSummaryApi().getClaimedAdrPositionSummaryForEventId({
                    eventId: this.props.eventId,
                    participantId: this.props.participantId,
                    includeInPreparationClaims: false,
                    includeInPrepClaim: this.claimId
                }).then((positionSummary) => {
                    if (positionSummary.allocatedClaimed + positionSummary.unallocatedClaimed === 0) {
                        this.positionPopup = new Framework.AlertBuilder();
                        this.positionPopup
                            .setTitle("Claims Process")
                            .setMessage(this.getNoEntriesErrorMessage(claimDetails))
                            .withQA("ClaimsProcessPreview")
                            .open();

                        this.setState({ stateChangeInProgress: false });
                    } else {
                        this.changeStage(Dtos.BatchClaimEntrystage.Submission, "", true);
                    }
                });
                break;
            case Dtos.BatchClaimEntrystage.Submission:
                if (this.props.isGoalUser) {
                    window.location.href = `ListBatchClaims#{"showClaimConfirmation":"true"}`;
                } else {
                    window.location.href =
                        `ListParticipant?eventId=${this.props.eventId}&participantId=${this.props.participantId
                        }#{"showClaimConfirmation":"true"}`;
                }
                break;
            default:
                break;
            }
        });
    }

    private getNoEntriesErrorMessage(claimDetails: Dtos.ClaimDetailsDto): string {
        return (claimDetails.categoryElectionsAvailable &&
            claimDetails.beneficialOwnersAvailable
            ? 'In order to proceed, you must enter either at least one Beneficial Owner or Category ADR.'
            : (claimDetails.categoryElectionsAvailable)
            ? 'In order to proceed, you must enter at least one category ADR.'
            : 'In order to proceed, you must first supply Beneficial Owner details.');
    }

    private changeStage(stage: Dtos.BatchClaimEntrystage, message?: string, checkPositions?: boolean) {
        if (message === "" || message == undefined) {
            if (checkPositions) {
                this.checkPosition(() => this.updateStage(stage));
            } else {
                this.updateStage(stage);
            }
        } else {
            this.confirmationPopup = new Framework.DialogBuilder();
            this.confirmationPopup
                .setTitle("Claims Process")
                .setMessage(<p style={{ width: '500px' }}>{message}</p>)
                .setConfirmHandler(() => {
                    if (checkPositions) {
                        this.checkPosition(() => this.updateStage(stage));
                    } else {
                        this.updateStage(stage);
                    }
                })
                .setCancelHandler(() => { this.confirmationPopup.close(); this.setState({ stateChangeInProgress: false }) })
                .withQA("ClaimsProcessDialog")
                .open();
        }
    }

    private updateStage(state: Dtos.BatchClaimEntrystage) {
        Framework.connect(
            new Apis.BatchClaimApi().update(this.claimId, { claimId: this.claimId, workflowStep: state }),
            this.state.claimDetails,
            claim => {
                this.setState({ claimDetails: claim });

                if (claim.isDone()) {
                    this.setState({ stateChangeInProgress: false });
                }
            });
    }

    private checkPosition(onSuccess: () => void) {
        var msgTemplate =
            "The position claimed exceeds the overall position by {0} ADRs, please make the necessary amendments before submitting the Batch Claim";

        new Apis.ParticipantClaimSummaryApi().getClaimedAdrPositionSummaryForEventId({
            eventId: this.props.eventId,
            participantId: this.props.participantId,
            includeInPreparationClaims: false,
            includeInPrepClaim: this.claimId
        }).then((positionSummary) => {
            if (positionSummary &&
                positionSummary !== null &&
                positionSummary.sprHasBeenDefined &&
                positionSummary.totalOpenPosition < 0) {
                var message = msgTemplate.replace("{0}", `${(positionSummary.totalOpenPosition * -1)}`);

                this.positionDialog = new Framework.DialogBuilder();
                this.positionDialog
                    .setTitle("Position Exceeded")
                    .setMessage(<p style={{ width: '500px' }}>{message}</p>)
                    .setConfirmText("Confirm")
                    .setCancelText("Cancel")
                    .setConfirmHandler(onSuccess)
                    .setCancelHandler(() => { this.positionDialog.close(); this.setState({ stateChangeInProgress: false }); })
                    .withQA("PositionExceededDialog")
                    .open();

                return;
            } else {
                onSuccess && onSuccess();
            }
        });
    }

    renderCurrentStage() {
        var combined = Framework.Pending.combine(this.state.claimDetails, this.state.eventDetails, (claim, event) => { return { claim, event } });

        return Framework.Loader.for(combined, data => {
            switch (this.state.claimDetails.data.currentStage) {
                case Dtos.BatchClaimEntrystage.Creation:
                    return <CreateClaim
                        eventId={this.props.eventId}
                        claimId={this.claimId}
                        participantId={this.props.participantId}
                        onClaimCreated={(claimdId: number) => this.updateClaimId(claimdId)}
                        saveMode={this.state.saveMode}
                        stateChangeInProgress={this.state.stateChangeInProgress}
                        onSaveInProgress={(mode) => this.setState({ saveMode: mode, stateChangeInProgress: true })}
                        onSaveCancelled={() => this.setState({ stateChangeInProgress: false })}
                        onBack={() => this.onbackButtonClicked()}
                        onNext={() => this.onnextButtonClicked()}
                        onSaveAndExit={() => this.onsaveExitButtonClicked()}
                    />
                case Dtos.BatchClaimEntrystage.CategoryElection:
                    return <BatchClaimCategoryElections
                        batchClaimId={this.claimId}
                        nextStepId={this.state.claimDetails.data.beneficialOwnersAvailable
                            ? Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry
                            : Dtos.BatchClaimEntrystage.Preview}
                        editMode={true}
                        returnUrl={""}
                        beneficialOwnersAvailable={this.state.claimDetails.data.beneficialOwnersAvailable}
                        saveMode={this.state.saveMode}
                        stateChangeInProgress={this.state.stateChangeInProgress}
                        onSaveInProgress={(mode) => this.setState({ saveMode: mode, stateChangeInProgress: true })}
                        onSaveCancelled={() => this.setState({ stateChangeInProgress: false })}
                        onBack={() => this.onbackButtonClicked()}
                        onNext={() => this.onnextButtonClicked()}
                        onSaveAndExit={() => this.onsaveExitButtonClicked()}
                    />
                case Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry:
                case Dtos.BatchClaimEntrystage.AddBeneficialOwnersUpload:
                case Dtos.BatchClaimEntrystage.UploadFailed:
                    return <BeneficialOwnerPage
                        claimId={this.claimId}
                        roundId={this.state.claimDetails.data.round.id}
                        returnUrl={""}
                        saveMode={this.state.saveMode}
                        stateChangeInProgress={this.state.stateChangeInProgress}
                        hasCategoryElections={this.state.claimDetails.data.categoryElectionsAvailable}
                        pageMode={this.state.claimDetails.data.benOwnerEnteredInViaStep ===
                            Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry
                            ? 'manual'
                            : 'upload'}
                        hasBeneficialOwners={(hasBenOwners: boolean) => { this.setState({ hasBeneficialOwners: hasBenOwners }); }}
                        onSaveInProgress={(mode) => this.setState({ saveMode: mode, stateChangeInProgress: true })}
                        onSaveCancelled={() => this.setState({ stateChangeInProgress: false })}
                        onBack={() => this.onbackButtonClicked()}
                        onNext={() => this.onnextButtonClicked()}
                        onSaveAndExit={() => this.onsaveExitButtonClicked()}
                        securityType={this.state.eventDetails.data.securityType}
                        isIrishEvent={this.state.eventDetails.data.countryofIssuance.countryCode == "IRL"}
                        onFileUploaded={() => this.EnsureClaimDetails()}
                        currentStage={this.state.claimDetails.data.currentStage}
                    />
                case Dtos.BatchClaimEntrystage.UploadInProgress:

                    return (
                        <div>
                            <h3>Your upload is complete and is now being processed, which may take some time.</h3>

                            <div className="text-end" style={{ marginTop: 10 }}>
                                <button className={"btn btn-outline-secondary" + (this.state.stateChangeInProgress ? " btn-loading" : "")}
                                    disabled={this.state.stateChangeInProgress} id="saveExitBtn"
                                    onClick={() => this.onsaveExitButtonClicked()} data-qa="SaveExitButton">
                                    Exit
                                </button>
                            </div>
                        </div>);

                case Dtos.BatchClaimEntrystage.Preview:
                    return <ClaimPreviewPage
                        claimId={this.claimId}
                        event={this.state.eventDetails}
                        beneficialOwnersAvailable={this.state.claimDetails.data.beneficialOwnersAvailable}
                        onBack={() => this.onbackButtonClicked()}
                        onNext={() => this.onnextButtonClicked()}
                        onSaveAndExit={() => this.onsaveExitButtonClicked()}
                        saveMode={this.state.saveMode}
                        stateChangeInProgress={this.state.stateChangeInProgress}
                        onSaveInProgress={(mode) => this.setState({ saveMode: mode, stateChangeInProgress: true })}
                        onSaveCancelled={() => this.setState({ stateChangeInProgress: false })}
                        excelExportLimit={this.props.excelExportLimit}
                    />
                case Dtos.BatchClaimEntrystage.Submission:
                    return <SubmitClaimPage
                        eventDetails={data.event}
                        batchClaimId={this.claimId}
                        onBack={() => this.onbackButtonClicked()}
                        onNext={() => this.onnextButtonClicked()}
                        onSaveAndExit={() => this.onsaveExitButtonClicked()}
                        saveMode={this.state.saveMode}
                        stateChangeInProgress={this.state.stateChangeInProgress}
                        onSaveInProgress={(mode) => this.setState({ saveMode: mode, stateChangeInProgress: true })}
                        onSaveCancelled={() => this.setState({ stateChangeInProgress: false })}
                    />
                default:
                    return null;
            }
        });
    }

    renderProgressTracker() {
        return Framework.Loader.for(this.state.claimDetails,
            claimDetails => {
                return <FlowProgress
                    beneficialOwners={claimDetails.beneficialOwnersAvailable}
                    elections={claimDetails.categoryElectionsAvailable}
                    currentStep={claimDetails.currentStage}
                   
                />
            });
    }

    render() {
        return (
            <div>
                <h1>Claim in Preparation</h1>
                <DividendEventSummary eventDetails={this.state.eventDetails} claimDetails={this.state.claimDetails} />
                { this.renderProgressTracker() }
                { this.renderCurrentStage() }
            </div>
        );
    }
}