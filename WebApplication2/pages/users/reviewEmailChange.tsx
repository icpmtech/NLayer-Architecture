import * as React from 'react';
import * as Components from '../../components';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { EmailChangeRequestDtoValidator } from '../../validators/emailChangeRequestDtoValidator';
import { RejectPopup } from './rejectEmailChangePopup';

interface Props {
    user: Framework.Pending<Dtos.UserDetailsDto>;
    changeRequest: Framework.Pending<Dtos.EmailChangeRequestDto>;
    editor: Dtos.EmailChangeRequestDto;
    validator: EmailChangeRequestDtoValidator;
    onSave: (dto: Dtos.EmailChangeRequestDto) => void;
    onCancel: () => void;
}

export class ReviewEmailChange extends React.Component<Props, {}>
{
    private popup: Framework.PopupBuilder;

    render() {
        var combined = this.props.user.and(this.props.changeRequest, (user, changeRequest) => { return { user, changeRequest }; });
        return (
            <div>
                {
                    Framework.Loader.for(combined, (data) => [
                        this.renderDetails(data.user),
                        this.renderForm(data.changeRequest),
                        this.renderButtons(data.changeRequest),
                    ])
                }
            </div>
        );
    }

    private renderDetails(user: Dtos.UserDetailsDto) {
        return Framework.FormBuilder.for(user)
            .isWide(true)
            .isDisabled(true)
            .addTextInput("Email", x => x.email, null, "Email")
            .addTextInput("First name", x => x.firstName, null, "FirstName")
            .addTextInput("Last name", x => x.lastName, null, "LastName")
            .addTextInput("Contact number", x => x.telephoneNumber, null, "ContactNumber")
            .withQA("UserDetails")
            .render();
    }

    private renderForm(request: Dtos.EmailChangeRequestDto) {
        let form = Framework.FormBuilder.for(request)
            .isWide(true)
            .isDisabled(false)
            .addTextInput("New Email", m => m.newEmail, null, "NewEmail", null, { disabled: true })
            .addTextInput("Requested by", m => m.requestedBy, null, "RequestedBy", null, { disabled: true })
            .addDateTime("Requested on", m => m.requestedOn, null, "RequestedOn", null, { disabled: true })
            .withQA("EmailChangeRequest")
            ;

        return form.render();
    }
    
    private confirmRejection(dto: Dtos.EmailChangeRequestDto) {
        var val = new EmailChangeRequestDtoValidator(dto, true);
        this.popup.close();
        this.props.onSave(dto);
    }

    private acceptEmailChange() {
        let dto = Framework.safeClone(this.props.changeRequest.data);
        dto.approved = true;
        this.props.onSave(dto);
    }

    private renderRejectPopup() {
        let rejectPopup = <RejectPopup id={this.props.changeRequest.data.id}
            onClose={() => this.popup.close()}
            onDone={(dto) => this.confirmRejection(dto)}
           
        />;

        this.popup = new Framework.PopupBuilder()
            .setTitle("Reject User")
            .setContent(rejectPopup);
        this.popup.open();
    }

    private renderButtons(request: Dtos.EmailChangeRequestDto) {
        return <div className="text-end">
            <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
            <button className="btn btn-primary" onClick={() => this.renderRejectPopup()} data-qa="RejectButton">Reject</button>
            <button className="btn btn-primary" onClick={() => this.acceptEmailChange()} data-qa="AcceptButton">Accept</button>
        </div>;
    }
}
