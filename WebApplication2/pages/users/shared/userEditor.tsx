import * as React from 'react';
import * as Components from '../../../components';
import * as Framework from '../../../classes';
import { Dtos } from '../../../adr';
import { UserDtoValidator } from '../../../validators/userDtoValidator';


interface Props {
    editor: Dtos.UserDetailsDto;
    validation: UserDtoValidator;
    onChange: (dto: Dtos.UserDetailsDto) => void;
}

export class UserEditor extends React.Component<Props, {}>
{
    render() {
        let val = this.props.validation;
        return Framework.FormBuilder.for(this.props.editor)
            .withQA("user-edit-details")
            .setChangeHandler(dto => this.props.onChange(dto))
            .isWide(true)
            .addTextInput("Email", x => x.email, null, "Email", null, { disabled: true })
            .addTextInput("First name", m => m.firstName, (m, v) => m.firstName = v, "FirstName", val.firstName)
            .addTextInput("Last name", m => m.lastName, (m, v) => m.lastName = v, "LastName", val.lastName)
            .addTextInput("Contact number", m => m.telephoneNumber, (m, v) => m.telephoneNumber = v, "ContactNumber", val.telephoneNumber)
            .render();
    }
}


