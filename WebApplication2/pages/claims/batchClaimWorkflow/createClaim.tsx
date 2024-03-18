import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { Error } from '../../../components';

interface CreateClaimProps {
    eventId: number;
    claimId?: number;
    participantId?: number;
    roundId?: number;
    onClaimCreated: (claimId: number) => void;
    onBack: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
    saveMode?: 'back' | 'save' | 'next';
    stateChangeInProgress?: boolean;
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    onSaveCancelled: () => void;
}

interface CreateClaimState {
    rounds?: Framework.Pending<Dtos.RoundSummaryDto[]>;
    selectedRoundId?: number;
    error?: Framework.AppError;
}

export class CreateClaim extends React.Component<CreateClaimProps, CreateClaimState> {

    constructor(props: CreateClaimProps, state: CreateClaimState) {
        super(props, state);
        this.state = { rounds: null, selectedRoundId: this.props.roundId || 0 }
    }

    componentDidMount(): void {
        Framework.connect(new Apis.RoundApi().getAvailable(this.props.eventId),
            this.state.rounds,
            rounds => {
                this.setState({ rounds: rounds });
            });
    }

    create(saveAndExit: boolean) {
        this.props.onSaveInProgress(saveAndExit ? 'save' : 'next');

        if (this.props.claimId) {
            Framework.connect(new Apis.BatchClaimApi().reset(this.props.claimId, { claimId: this.props.claimId, roundId: this.state.selectedRoundId, skipSettingToNextState: true }),
                null,
                x => {
                    if (x.isFailed()) { this.setState({ error: x.error }); this.props.onSaveCancelled(); }
                    else if (x.isDone()) {
                        if (saveAndExit) { this.props.onSaveAndExit(); }
                        else { this.props.onNext(); }
                    }
                }
            );
        }
        else {
            Framework.connect(new Apis.BatchClaimApi().create({ eventId: this.props.eventId, roundId: this.state.selectedRoundId, participantId: this.props.participantId }),
                null,
                x => {
                    if (x.isFailed()) { this.setState({ error: x.error }); this.props.onSaveCancelled(); }
                    else if (x.isDone()) {
                        this.props.onClaimCreated(x.data.id);
                        if (saveAndExit) { this.props.onSaveAndExit(); }
                        else { this.props.onNext(); }
                    }
                }
            );
        }
    }

    renderForm(filingMethods: Dtos.RoundSummaryDto[]) {
        let form = new Framework.FormBuilder(filingMethods)
            .isWide(true)
            .addDropdown("Filing Method Type / Round",
            filingMethods,
            x => filingMethods.find(x => (x.id == this.state.selectedRoundId && x.isAvailiable)),
                (m, v) => this.setState({ selectedRoundId: v.id }), "FilingMethodTypeRound", null, { className: "required" })
            .withQA("RoundSummary");

        return form.render();
    }

    private renderError() {
        return <Error error={this.state.error} qa="CreateBatchClaimError"/>
    }

    private renderButtons() {
        return (
            <div className="text-end">
                {!this.props.claimId && <button disabled={this.props.stateChangeInProgress} className="btn btn-outline-secondary" data-qa="CancelButton" onClick={() => this.props.onBack()}>Cancel</button>}

                {this.props.claimId > 0 && <button id="saveExitBtn"
                    className={"btn btn-outline-secondary" + (this.props.stateChangeInProgress && this.props.saveMode == 'save' ? " btn-loading" : "")}
                    disabled={this.props.stateChangeInProgress}
                    onClick={() => this.create(true)}
                    data-qa="SaveButton"
                >
                    {this.props.stateChangeInProgress && this.props.saveMode == 'save' ? "Saving Claim..." : "Save and Exit"}
                </button>}

                <button disabled={this.props.stateChangeInProgress} className={"btn btn-primary" + (this.props.stateChangeInProgress && this.props.saveMode == 'next' ? " btn-loading" : "")} onClick={() => this.create(false)}data-qa="NextButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'next' ? "Creating Claim..." : "Start Batch Claim"}
                </button>
            </div>
        );
    }

    render() {
        return Framework.Loader.for(this.state.rounds,
            data => (
                <div>
                    {this.renderError()}
                    {this.renderForm(data)}
                    <br />
                    {this.renderButtons()}
                </div>
            ));
    }
}