
import * as React from 'react';
import { Dtos } from '../../adr';

interface SentProps {
    invitations: Dtos.GoalUserInvitationsDto
}

export class Sent extends React.Component<SentProps, {}> {

    listStyle = { display: 'inline-block', marginLeft: '15px' };

    render() {
        let role = null;

        switch (this.props.invitations.requestedGoalGroup) {
            case Dtos.GroupsEnum.GoalAdroitAdmin: role = "GOAL Admin"; break;
            case Dtos.GroupsEnum.GoalAdroitManager: role = "GOAL Manager"; break;
            case Dtos.GroupsEnum.GoalAdroitStandard: role = "GOAL Standard"; break;
            case Dtos.GroupsEnum.GoalTrmAdmin: role = "TRM Admin"; break;
            case Dtos.GroupsEnum.GoalTrmUser: role = "TRM User"; break;
        }

        return (
            <div>
                <h3>Invitations have been sent</h3>
                <br/>
                <div style={this.listStyle}>
                    <div>You have successfully invited the following users with the role {role}:</div>
                    <br/>
                    <ul style={{ display: 'inline-block', listStyleType: 'none', paddingLeft: '25px' }}>
                        {this.props.invitations.emails.map((email, index) => <li key={index} data-qa="Invitation">{email}</li>)}
                    </ul>
                </div>
            </div>
        );
    }
}

