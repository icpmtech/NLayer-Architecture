import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';

interface props {
    userInformation: Framework.Pending<Dtos.UserVerificationDetailsDto>;
}

interface state {
}

export class ParticipantStatus extends React.Component<props, state>
{
    constructor(props: props) {
        super(props);
    }

    render() {
        return Framework.Loader.for(this.props.userInformation, data => {
            let userDetails = Framework.FormBuilder.for(data)
                .isDisabled(true)
                .isWide(true);

            if (data.downstreamSubscriber != null)
                userDetails.addTextInput("Downstream Subscriber:", x => x.participant.name + " (" + x.participant.dtcCode + ")", null, "DownstreamSubscriber");

            userDetails
                .addTextInput("Participant:", x => x.downstreamSubscriber != null
                    ? (x.downstreamSubscriber.name + " (" + x.downstreamSubscriber.dtcCode + ")")
                    : (x.participant.name + " (" + x.participant.dtcCode + ")"), null, "Participant")
                .addTextInput("Email:", x => x.invitedUser.email, null, "Email")
                .addTextInput("Registration Status:", x => x.currentStatusName, null, "RegistrationStatus")
                .addDateTime("Since:", x => x.lastUpdated, null, "LastUpdated")
                .addDateTime("Invited On:", x => x.invitedOn, null, "InvitedOn")
                .addTextInput("Invited By:", x => x.invitedByName, null, "InvitedBy")
                .addDateTime("Link Expires On:", x => x.expiresOn, null, "LinkExpiresOn")
                .addTextInput("Link Expired:", x => x.expiresOn <= new Date() ? "Yes" : "No", null, "LinkExpired");

            return (
                <div>
                    <h1>User Registration Review</h1>
                    {userDetails.render()}
                </div>

            )
        });
    }
}