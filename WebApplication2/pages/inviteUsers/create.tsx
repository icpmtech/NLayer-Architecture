import * as React from 'react';
import { Dtos } from '../../adr';
import { DialogBuilder, FormBuilder } from '../../classes';
import { UserInvitationsDtoValidator } from '../../validators/userInvitationsDtoValidator';

interface CreateProps {
    invitation: Dtos.UserInvitationsDto;
    validation: UserInvitationsDtoValidator;
    onChange: (invitation: Dtos.UserInvitationsDto) => void;
    onSendInvites: () => boolean;
    onConfirm: () => void;
}

export class Create extends React.Component<CreateProps, {}> {

    private popup: DialogBuilder;

    private renderConfirmationPopup = () => {
        this.popup = new DialogBuilder();
        this.popup
            .setTitle("Confirm Invitations")
            .setMessage("Are you sure you want to proceed with the invitation of these " + this.props.invitation.emails.length + " users?")
            .setConfirmHandler(() => this.props.onConfirm())
            .setCancelHandler(this.popup.close)
            .withQA("ConfirmInvitationsDialog")
            .open();
    }

    renderForm() {
        return FormBuilder.for(this.props.invitation)
            .setChangeHandler(m => this.props.onChange(m))
            .isWide(true)
            .narrowErrors(true)
            .addEmailList("", m => m.emails, (m, v) => m.emails = v, "EmailList", this.props.validation.emails, this.props.validation.emails.results.map(x => x.email), {listDisplayLimit: 10, noTitle: true })
            .withQA('emails-form')
            .render();
    }

    renderButtons() {
        return (
            <div className="float-end">
                <button className="btn btn-primary" onClick={() => this.props.onSendInvites() && this.renderConfirmationPopup()} data-qa="SendInvitesButton">Send invites</button>
            </div>
        );
    }

    render(){
        return (
            <div>
                <h3>Add email addresses</h3>
                <br/>
                {this.renderForm()}
                {this.renderButtons()}
            </div>
        );
    }
}