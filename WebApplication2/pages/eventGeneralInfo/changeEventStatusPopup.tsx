import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { AppError, connect, DialogBuilder, FormBuilder, Loader, LoadingStatus, Pending } from '../../classes';
import * as Form from '../../components';
import { ChangeEventStatusDtoValidator } from '../../validators/changeEventStatusDtoValidator';

export type ChangeEventStatusPopupProps = PopupContentProps & {
    eventId: number;
    onDataLoaded: { (): void };
    onStatuschanged: { (): void };
};

export interface ChangeEventStatusPopupState {
    statuses?: Pending<Dtos.EventStatusDto[]>;
    submitted?: boolean;
    updateDto?: Pending<Dtos.ChangeEventStatusDto>;
    updateError?: AppError;
    validation?: ChangeEventStatusDtoValidator;
};

export class ChangeEventStatusPopup extends React.Component<ChangeEventStatusPopupProps, ChangeEventStatusPopupState> {
    private form: FormBuilder<Dtos.ChangeEventStatusDto>;
    private confirmationPopup: DialogBuilder;

    constructor(props) {
        super(props);
        this.state = {
            updateDto: Pending.done<Dtos.ChangeEventStatusDto>({} as Dtos.ChangeEventStatusDto),
            updateError: null,
            validation: new ChangeEventStatusDtoValidator(Pending.done<Dtos.ChangeEventStatusDto>({} as Dtos.ChangeEventStatusDto).data, false)
        };
    }

    componentDidMount() {
        connect(new Apis.EventStatusApi().getAll(), this.state.statuses, statuses => { this.setState({ statuses }); this.props.onDataLoaded(); });
    }

    onUpdateStatusClick = () => {
        let validation = new ChangeEventStatusDtoValidator(this.state.updateDto.data, true);
        this.setState({ submitted: true, updateError: null, validation: validation });
        if (validation.isValid()) {
            this.handleStatusChange();
        }
    }

    handleStatusChange() {
        switch (this.state.updateDto.data.eventStatus) {
            case Dtos.EventStatusLookup_Status.Canceled:
                this.handleCancelEventConfirmation();
                break;
            case Dtos.EventStatusLookup_Status.Closed:
                this.handleCloseEventConfirmation();
                break;
            case Dtos.EventStatusLookup_Status.Unavailable:
                this.saveEventStatusChange();
                break;
        }
    }

    handleCancelEventConfirmation() {
        let message = "This event will be canceled and all its claims rejected automatically. Are you sure you want to proceed?";
        this.showEventChangeConfirmationPopup("Cancel Live Event", message);
    }

    handleCloseEventConfirmation() {
        connect(new Apis.EventsApi().closeWarning(this.props.eventId), null, response => {
            if (response.state === LoadingStatus.Done) {
                let message = response.data === true
                    ? "This event has Beneficial Owner claims in a not-final status. After closing the event those claims will not be able to be changed. Are you sure you want to proceed?"
                    : "Are you sure you want to close this event?";
                this.showEventChangeConfirmationPopup("Close Live Event", message);
            }
            if (response.state === LoadingStatus.Failed) {
                this.setState({ updateError: response.error });
            }
        });
    }

    showEventChangeConfirmationPopup(title: string, message: string) {
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle(title)
            .setMessage(<p>{message}</p>)
            .setConfirmHandler(this.saveEventStatusChange)
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("ShowEventChangeConfirmationPopup")
            .open();
    }

    saveEventStatusChange = () => {
        connect(new Apis.EventsApi().changeStatus(this.props.eventId, this.state.updateDto.data), null, response => this.handleEventStatusChangeResponse(response));
    }

    handleEventStatusChangeResponse(response: Pending<Dtos.EventDto>) {
        if (response.state === LoadingStatus.Done) {
            //window.location.reload();
            this.props.onStatuschanged();
        }
        if (response.state === LoadingStatus.Failed) {
            this.setState({ updateError: response.error });
        }
    }

    renderForm = () => {
        let exludedStatus = [Dtos.EventStatusLookup_Status.Draft, Dtos.EventStatusLookup_Status.Live];
        let availableStatuses = !!this.state.statuses ? this.state.statuses.map(x => x.filter(y => exludedStatus.indexOf(y.id) == -1)) : null
        return Loader.for(availableStatuses, statuses => {
            this.form = new FormBuilder(this.state.updateDto.data)
                .setChangeHandler(updateDto => {
                    this.setState({
                        updateDto: Pending.done(updateDto),
                        validation: new ChangeEventStatusDtoValidator(updateDto, this.state.validation.showValidationErrors())
                    });
                })
                .addDropdown(
                "Status",
                statuses,
                m => statuses.find(x => x.id === m.eventStatus),
                    (m, v) => m.eventStatus = !!v ? v.id : null,
                "Status",
                this.state.validation.status
                )
                .addTextArea(
                "Comments",
                m => m.comment,
                    (m, v) => m.comment = v,
                    "Comments",
                this.state.validation.comment
                );

            return (
                <div>
                    {this.form.render()}
                </div>
            );
        });
    }

    renderError = () => (
        <div>
            <Form.Message
                type="alert"
                hide={!this.state.updateError}
                message={this.state.updateError && this.state.updateError.userMessage ? this.state.updateError.userMessage : "There has been an error"}
                qa="ErrorMessage"
            />
        </div>
    )

    render() {
        return (
            <div className="popup-container">
                {this.renderError()}
                {Loader.for(this.state.statuses, this.renderForm)}

                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={this.props.onClose}data-qa="CloseButton">Close</button>
                    <button className="btn btn-primary" onClick={this.onUpdateStatusClick} data-qa="UpdateButton">Update Status</button>
                </div>
            </div>
        );
    }
}