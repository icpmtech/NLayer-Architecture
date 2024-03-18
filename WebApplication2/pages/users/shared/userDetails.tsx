import * as React from 'react';
import * as Components from '../../../components';
import * as Framework from '../../../classes';
import { Dtos } from '../../../adr';
import { UserDtoValidator } from '../../../validators/userDtoValidator';


interface Props {
    user: Dtos.UserDetailsDto;
}

export class UserDetails extends React.Component<Props, {}>
{
    render() {
        let status = user => !user.active ? 'Disabled' : user.locked ? 'Locked' : 'Active'; 

        return new Framework.FormBuilder(this.props.user)
            .withQA("user-details")
            .isDisabled(true)
            .isWide(true)
            .addTextInput("Email", x => x.email, null, "Email", null)
            .addTextInput("First name", x => x.firstName, null, "FirstName", null)
            .addTextInput("Last name", x => x.lastName, null, "LastName", null)
            .addTextInput("Contact number", x => x.telephoneNumber, null, "ContactNumber", null)
            .addLabel("Status", status, "Status")
            .addDateTime("Last Updated", x => x.statusChangedDate, null, "LastUpdated", null)
            .render();
    }
}


