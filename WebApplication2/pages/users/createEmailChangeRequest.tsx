import * as React from 'react';
import { Dtos } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { CreateEmailChangeRequestDtoValidator } from '../../validators/createEmailChangeRequestDtoValidator';

interface Props {
    user: Framework.Pending<Dtos.UserDetailsDto>;
    editor: Dtos.CreateEmailChangeRequestDto;
    validator: CreateEmailChangeRequestDtoValidator;
    onChange: (dto: Dtos.CreateEmailChangeRequestDto) => void;
    onSave: () => void;
    allowCancel?: boolean;
    onCancel: () => void;
}

export class CreateEmailChangeRequest extends React.Component<Props, {}> {
    render() {
        return (
            <div>
                {this.renderForm()}
                {this.renderButtons()}
            </div>
        );
    }

    private renderForm() {
        return Framework.Loader.for(this.props.user, user =>
            Framework.FormBuilder.for(this.props.editor)
                .setChangeHandler(dto => this.props.onChange(dto))
                .isWide(true)
                .addTextInput("First name", m => user.firstName, null, "FirstName",  null, { disabled: true })
                .addTextInput("Last name", m => user.lastName, null, "LastName", null, { disabled: true })
                .addTextInput("Email", m => user.email, null, "Email", null, { disabled: true })
                .addTextInput("Contact number", m => user.telephoneNumber, null, "ContactNumber", null, { disabled: true })
                .addTextInput("New email", m => m.newEmail, (m, v) => m.newEmail = v, "NewEmail", this.props.validator.newEmail)
                .withQA("Form")
                .render()
        );
    }

    private renderButtons() {
        return <div className="text-end">
            {this.props.allowCancel !== false ? <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button> : null}
            <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="SubmitRequestButton">Submit Request</button>
        </div>;
    }
}
