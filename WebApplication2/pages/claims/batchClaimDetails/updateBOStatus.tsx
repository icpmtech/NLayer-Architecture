import * as React from 'react';
import * as Form from '../../../components';
import { AppError, connect, Pending, Loader, FormBuilder, DialogBuilder, LoadingStatus } from '../../../classes';
import { Apis, Dtos } from '../../../adr';
import { BenOwnerUpdateStatusDtoValidator } from '../../../validators/benOwnerUpdateStatusDtoValidator';

export type UpdateBOStatusProps = PopupContentProps & {
    claimId: number;
    onSuccess: { (): void };
    onDataLoaded: { (): void };
    allClaimsAreElectionType: boolean;
};

export interface UpdateBOStatusState {
    bosSummary?: Pending<Dtos.ClaimBeneficialOwnerSummaryDto>;
    statuses?: Pending<Dtos.BenownerClaimStatusDto[]>;
    submitted?: boolean;
    updateDto?: Pending<Dtos.BenownerUpdateStatusInClaimDto>;
    updateError?: AppError;
    validation?: BenOwnerUpdateStatusDtoValidator;
};

export class UpdateBOStatus extends React.Component<UpdateBOStatusProps, UpdateBOStatusState> {
    private confirmationPopup: DialogBuilder;

    constructor(props) {
        super(props);
        this.state = {
            bosSummary: new Pending<Dtos.ClaimBeneficialOwnerSummaryDto>(),
            statuses: new Pending<Dtos.BenownerClaimStatusDto[]>(),
            updateDto: Pending.done<Dtos.BenownerUpdateStatusInClaimDto>({ claimId: this.props.claimId } as Dtos.BenownerUpdateStatusInClaimDto),
            updateError: null,
            validation: new BenOwnerUpdateStatusDtoValidator(Pending.done<Dtos.BenownerUpdateStatusInClaimDto>({} as Dtos.BenownerUpdateStatusInClaimDto).data, false)
        };
    }

    componentDidMount() {
        connect(new Apis.BeneficialOwnerClaimStatusesApi().getAll(), this.state.statuses, statuses => { this.setState({ statuses }); this.props.onDataLoaded(); });
        connect(new Apis.ClaimBeneficialOwnerSummaryApi().getById(this.props.claimId), this.state.bosSummary, bosSummary => { this.setState({ bosSummary }); this.props.onDataLoaded(); });
    }

    onUpdateStatusClick = () => {
        let validation = new BenOwnerUpdateStatusDtoValidator(this.state.updateDto.data, true);
        this.setState({ submitted: true, updateError: null, validation: validation });
        validation.isValid() && this.handleStatusChange();
    }

    handleStatusChange() {
        let fromStatusIds = this.state.updateDto.data.fromStatusIds.filter(x => x != this.state.updateDto.data.toStatusId);
        if (fromStatusIds.length) {
            let statusesSelected = this.state.bosSummary.data.status
                .filter(x => this.state.updateDto.data.fromStatusIds.indexOf(x.status) !== -1);

            let statusesToUpdate = this.state.bosSummary.data.status
                .filter(x => x.status != this.state.updateDto.data.toStatusId)
                .filter(x => this.state.updateDto.data.fromStatusIds.indexOf(x.status) !== -1);

            const dto: Dtos.BenownerUpdateStatusInClaimDto = Object.assign({}, this.state.updateDto.data, { fromStatusIds: statusesToUpdate.map(x => x.status) });
            this.setState({ updateDto: Pending.done(dto) });

            const bosSelected = statusesSelected.reduce((sum, x) => sum + x.count, 0);
            const bosToUpdate = statusesToUpdate.reduce((sum, x) => sum + x.count, 0);
            const newStatus = this.state.statuses.data.filter(x => x.id === this.state.updateDto.data.toStatusId)[0].name;
            const changeMsg = `You are updating the status of ${bosToUpdate} elections to '${newStatus}'.`;
            const warningMsg = bosSelected - bosToUpdate > 0 ? `${bosSelected - bosToUpdate} elections are already in that status and will not be updated.` : "";
            const confirmationMsg = `Select confirm to complete the action. `;
            this.showConfirmationPopup("Confirm status change", changeMsg, warningMsg, confirmationMsg);
        }
        else {
            this.setState({
                updateError: new AppError(`The selected elections are already in the selected status`, null, null)
            });
        }
    }

    showConfirmationPopup(title: string, changeMessage: string, warningMessage: string, confirmationMessage: string) {
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle(title)
            .setMessage(<span><p>{changeMessage}</p><p>{warningMessage}</p><p>{confirmationMessage}</p></span>)
            .setConfirmHandler(() => this.onConfirm())
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("ConfirmationDialog")
            .open();
    }

    onConfirm() {
        this.confirmationPopup.close();
        connect(new Apis.BeneficialOwnerApi().updateStatusByClaimId(this.state.updateDto.data), null, response => this.handleResponse(response));
    }

    handleResponse(response: Pending<void>) {
        response.state === LoadingStatus.Done && this.props.onSuccess();
        response.state === LoadingStatus.Failed && this.setState({ updateError: response.error });
    }

    renderForm = () => {
        let combined = this.state.statuses.and(this.state.bosSummary, (statuses, bosSummary) => { return { statuses, bosSummary } });

        return Loader.for(combined, p => {
            let checkboxItems = p.bosSummary.status.filter(x => x.count).map(x => { return { name: x.count + " " + x.statusName, value: x.status }; });
            let form = new FormBuilder(this.state.updateDto.data)
                .setChangeHandler(updateDto => {
                    this.setState({
                        updateDto: Pending.done(updateDto),
                        updateError: null,
                        validation: new BenOwnerUpdateStatusDtoValidator(updateDto, this.state.validation.showValidationErrors())
                    });
                })
                .addCheckBoxGroup(`Please select the elections you wish to change: `,
                    checkboxItems,
                    m => checkboxItems.filter(x => m.fromStatusIds && m.fromStatusIds.some(y => y == x.value)),
                    (m, v) => m.fromStatusIds = v.map(x => x.value),
                    "ElectionsSelect",
                    this.state.validation.fromStatusIds
                )
                .addDropdown("Status",
                    p.statuses.filter(x => x.id != Dtos.BeneficialOwnerClaimStatus.InPreparation && x.id != Dtos.BeneficialOwnerClaimStatus.Canceled),
                    m => p.statuses.find(x => x.id === m.toStatusId),
                    (m, v) => m.toStatusId = !!v ? v.id : null,
                    "Status",
                    this.state.validation.status
                )
                .addTextArea("Comments",
                    m => m.benownerClaimStatusComment,
                    (m, v) => m.benownerClaimStatusComment = v,
                    "Comments",
                    this.state.validation.comment
                );

            return form.render();
        });
    }

    renderError = () => {
        let msg = this.state.updateError && this.state.updateError.userMessage ? this.state.updateError.userMessage : "There has been an error";
        return <Form.Message type="alert" hide={!this.state.updateError} message={msg} qa="ErrorMessage"/>
    }

    render() {
        return (
            <div className="popup-container" data-qa="UpdateBeneficialOwnerStatusPopUp">
                {this.renderError()}
                {Loader.for(this.state.statuses, this.renderForm)}
                <div className="text-end">
                    <button className="btn btn-outline-secondary"data-qa="CloseButton" onClick={this.props.onClose}>Close</button>
                    <button className="btn btn-primary" data-qa="UpdateButton" onClick={this.onUpdateStatusClick}>Update Status</button>
                </div>
            </div>
        );
    }
}