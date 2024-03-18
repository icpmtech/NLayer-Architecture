
import * as React from 'react';
import { Dtos } from '../../adr';

interface SentProps {
    invitations: Dtos.UserInvitationsDto
}

export class Sent extends React.Component<SentProps, {}> {

    listStyle = { display: 'inline-block', marginLeft: '15px' };

    render() {
        return (
            <div>
                <h3>Invitations have been sent</h3>
                <br/>
                <div style={this.listStyle}>
                    <div>You have successfully invited the following users:</div>
                    <br/>
                    <ul style={{ display: 'inline-block', listStyleType: 'none', paddingLeft: '25px' }}>
                        {this.props.invitations.emails.map((email, index) => <li key={index} data-qa="Invitation">{email}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
}

