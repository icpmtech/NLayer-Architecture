import * as React from 'react';
import * as Form from '../../../components';
import { UpdateClaimStatusDtoValidator } from '../../../validators/updateClaimStatusDtoValidator';
import { AppError, connect, Pending, Loader, FormBuilder, PopupBuilder, } from '../../../classes';
import { Apis, Dtos } from '../../../adr';

export type UpdateClaimStatusProps = PopupContentProps & {
    onSuccess: { (): void };
    boDetails?: Dtos.BeneficialOwnerDetailsDto;
    bulk?: boolean;
    selected?: Dtos.BeneficialOwnerSearchResultDto[];
    statusCheck?: { (status: Dtos.BeneficialOwnerClaimStatus): boolean };
    onDataLoaded: { (): void };
};
export interface UpdateClaimStatusState {
    statuses?: Pending<Dtos.BenownerClaimStatusDto[]>;
    updateDto?: Pending<Dtos.BenownerUpdateStatusByIdsDto>;
    validation?: UpdateClaimStatusDtoValidator;
};

export class UpdateClaimStatus extends React.Component<UpdateClaimStatusProps, UpdateClaimStatusState> {
    private confirmation: PopupBuilder;


    constructor(props) {
        super(props);
        this.state = {
            updateDto: Pending.done<Dtos.BenownerUpdateStatusByIdsDto>({} as Dtos.BenownerUpdateStatusByIdsDto),
            validation: new UpdateClaimStatusDtoValidator(Pending.done<Dtos.BenownerUpdateStatusByIdsDto>({} as Dtos.BenownerUpdateStatusByIdsDto).data, false)
        };
    }

    componentDidMount() {
        connect(new Apis.BeneficialOwnerClaimStatusesApi().getAll(), this.state.statuses, statuses => { this.setState({ statuses }); this.props.onDataLoaded(); });
    }

    handleUpdate = () => {
        let validation = new UpdateClaimStatusDtoValidator(this.state.updateDto.data, true);
        if (validation.isValid()) {
            !!this.props.bulk ? this.showConfirmationPopup() : this.handleConfirmation();
        }
        else {
            this.setState({ validation });
        }
    }

    handleConfirmation = () => {
        const dto: Dtos.BenownerUpdateStatusByIdsDto = Object.assign({}, this.state.updateDto.data);
        dto.benownerIds = !!this.props.bulk ? this.mapSelectedIds(this.props.selected) : [this.props.boDetails.id];
        connect(new Apis.BeneficialOwnerApi().updateStatusByIds(dto), null, response => this.handleResponse(response));
    }

    handleResponse(response: Pending<void>) {
        const updateDto = this.state.updateDto.and(response, (p1, p2) => p1);

        if (response.isReady()) {
            !!this.props.onSuccess && this.props.onSuccess();
        }
        this.setState({ updateDto });
    }

    mapSelectedIds(selected: Dtos.BeneficialOwnerSearchResultDto[]) {
        return selected
            .filter(x => !x.roundLocked
                && x.eventStatusId !== Dtos.EventStatusLookup_Status.Closed
                && x.eventStatusId !== Dtos.EventStatusLookup_Status.Canceled
                && this.props.statusCheck(x.benificalOwnerStatusId))
            .map(x => x.id);
    }

    showConfirmationPopup = () => {
        if (!this.confirmation) {
            this.confirmation = new PopupBuilder();
            this.confirmation.setTitle("Confirm Update");
            this.confirmation.withQA("UpdateConfirmationPopup")
        }

        const status = this.state.updateDto.data.benownerClaimStatusId;
        // exclude those in the same status
        const a = this.props.selected.filter(x => x.benificalOwnerStatusId != status);
        // exclude those that are attached to a closed event
        const b = a.filter(x => x.eventStatusId !== Dtos.EventStatusLookup_Status.Closed);
        // exclude those that are attached to a Canceled event
        const c = b.filter(x => x.eventStatusId !== Dtos.EventStatusLookup_Status.Canceled);
        // exclude those which are locked
        const d = c.filter(x => !x.roundLocked);
        // exlcude those that fail the status check
        const e = d.filter(x => this.props.statusCheck(x.benificalOwnerStatusId));
        // the number of selected that will be updated
        const updating = e.length;
        // the number that won't be updated because they failed the status check
        const failedStatus = d.length - e.length;
        // the number that won't be updated because they're locked
        const locked = c.length - d.length;
        // the number that won't be updated as their event is canceled
        const failedEventStatusCanceled = b.length - c.length;
        // the number that won't be updated as their event is closed
        const failedEventStatusClosed = a.length - b.length;
        // the number that won't be updated because they're in the same status as that chosen
        const sameStatus = this.props.selected.length - a.length;

        this.confirmation.setContent(<UpdateConfirmation
            onClose={() => this.confirmation.close()}
            onConfirm={() => { this.confirmation.close(); this.handleConfirmation() }}
            statusName={this.state.statuses.data.filter(x => x.id === status).map(x => x.name)[0]}
            updating={updating}
            sameStatus={sameStatus}
            failedStatus={failedStatus}
            failedEventStatusCanceled={failedEventStatusCanceled}
            failedEventStatusClosed={failedEventStatusClosed}
            locked={locked}
           
        />);

        this.confirmation.render();
    }

    renderForm = () => {
        let exludedStatus = [Dtos.BeneficialOwnerClaimStatus.InPreparation, Dtos.BeneficialOwnerClaimStatus.Canceled];
        if (this.props.boDetails) {
            exludedStatus.push(this.props.boDetails.benOwnerClaimStatusId);
        }

        let availableStatuses = !!this.state.statuses ? this.state.statuses.map(x => x.filter(y => exludedStatus.indexOf(y.id) == -1)) : null

        return Loader.for(availableStatuses, statuses => {
            let form = new FormBuilder(this.state.updateDto.data)
                .setChangeHandler(updateDto => {
                    this.setState({
                        updateDto: Pending.done(updateDto),
                        validation: new UpdateClaimStatusDtoValidator(updateDto, this.state.validation.showValidationErrors())
                    });
                })
                .withQA("BeneficialOwnerClaimStatus")
                .addDropdown(
                "Status",
                statuses,
                m => statuses.find(x => x.id === m.benownerClaimStatusId),
                    (m, v) => m.benownerClaimStatusId = !!v ? v.id : null,
                "Status",
                this.state.validation.status
                )
                .addTextArea(
                "Comments",
                m => m.benownerClaimStatusComment,
                    (m, v) => m.benownerClaimStatusComment = v,
                "Comments",
                this.state.validation.comment
                );


            return (
                <div>
                    {this.renderSelected()}
                    {form.render()}
                </div>
            );
        });
    }

    renderError = (error: AppError) => (
        <div>
            <Form.Message type="alert" message={error.userMessage || "There has been an error"} qa="ErrorMessage"/>
            {this.renderForm()}
        </div>
    )

    renderLoading = () => {
        return <div data-qa="Updating">Updating...</div>
    }

    renderSelected() {
        if (!!this.props.bulk) {
            const notClosedEvent = this.props.selected.filter(x => x.eventStatusId !== Dtos.EventStatusLookup_Status.Closed);
            const notCanceledEvent = notClosedEvent.filter(x => x.eventStatusId !== Dtos.EventStatusLookup_Status.Canceled);
            const notLockedRound = notCanceledEvent.filter(x => !x.roundLocked);
            const numOfClosedEvent = this.props.selected.length - notClosedEvent.length;
            const numOfCanceledEvent = notClosedEvent.length - notCanceledEvent.length;
            const numOflocked = notCanceledEvent.length - notLockedRound.length;
            const numInWrongState = notLockedRound.filter(x => !this.props.statusCheck(x.benificalOwnerStatusId)).length;
            return (
                <div>
                    <p>You have selected {this.props.selected.length} beneficial owners.</p>
                    {!!numOfClosedEvent ? <p>{numOfClosedEvent} Beneficial Owners will not be updated as their event is closed.</p> : null}
                    {!!numOfCanceledEvent ? <p>{numOfCanceledEvent} Beneficial Owners will not be updated as their event is canceled.</p> : null}
                    {!!numOflocked ? <p>{numOflocked} Beneficial Owners will not be updated as their round is locked.</p> : null}
                    {!!numInWrongState ? <p>{numInWrongState} Beneficial Owners will not be updated as they are either Canceled or In Preparation.</p> : null}
                </div>
            );
        }

        return null;
    }

    render() {
        const disabled = this.props.bulk && this.props.selected.length == 0;
        return (
            <div className="popup-container">
                {Loader.for(this.state.updateDto, this.renderForm, this.renderError, this.renderLoading)}

                <div className="text-end">
                    <button className="btn btn-outline-secondaryry" onClick={this.props.onClose}data-qa="CloseButton">Close</button>
                    <button className="btn btn-primary" disabled={disabled} onClick={this.handleUpdate} data-qa="UpdateButton">Update Status</button>
                </div>
            </div>
        );
    }
}

interface UpdateConfirmationProps {
    onClose: { (): void };
    onConfirm: { (): void };
    updating: number;
    sameStatus: number;
    failedStatus: number;
    failedEventStatusCanceled: number;
    failedEventStatusClosed: number;
    statusName: string;
    locked: number;
};

class UpdateConfirmation extends React.Component<UpdateConfirmationProps, {}> {
    render() {
        return (
            <div className="popup-container">
                <p data-qa="UpdatingStatusToFrom">You are updating the status of {this.props.updating} Beneficial Owners to {this.props.statusName}.</p>
                {this.props.sameStatus ? <p data-qa="SameStatus">{this.props.sameStatus} Beneficial Owners are already in that status and will not be updated.</p> : null}
                {this.props.locked ? <p data-qa="RoundLocked">{this.props.locked} Beneficial Owners will not be updated as their round is locked.</p> : null}
                {this.props.failedStatus ? <p data-qa="InCancelOrInPreparation">{this.props.failedStatus} Beneficial Owners will not be updated as they are either Canceled or In Preparation.</p> : null}
                {this.props.failedEventStatusCanceled ? <p data-qa="EventCanceled">{this.props.failedEventStatusCanceled} Beneficial Owners will not be updated as their event is canceled.</p> : null}
                {this.props.failedEventStatusClosed ? <p data-qa="EventClosed">{this.props.failedEventStatusClosed} Beneficial Owners will not be updated as their event is closed.</p> : null}
                <p data-qa="SelectConfirm">Select confirm to complete the action.</p>

                <div className="text-end">
                    <button className="btn btn-outline-secondaryry" onClick={this.props.onClose} data-qa="CancelButton">Cancel</button>
                    <button className="btn btn-primary" disabled={this.props.updating === 0} onClick={this.props.onConfirm} data-qa="ConfirmButton">Confirm</button>
                </div>
            </div>
        );
    }
}