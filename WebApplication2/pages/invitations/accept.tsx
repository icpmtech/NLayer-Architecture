import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';

interface Props {
    uniqueLink: string;
}

interface State {
    userInvitation?: Framework.Pending<Dtos.UserRegistrationDetailsDto>;
    error?: Framework.AppError;
}

export class Accept extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            userInvitation: new Framework.Pending<Dtos.UserRegistrationDetailsDto>(),
        };
    }

    componentDidMount() {
        //get inivite... if its in status pending send accept then get again, if it then returns null redirect to switch account page
        Framework.connect(new Apis.InvitationsApi().getInvitationDetails(this.props.uniqueLink, true), this.state.userInvitation, initialInvite => {
            if (initialInvite.isDone() && !initialInvite.data) {
                //its null so its done so go to switch account page
                window.location.href = "/account/switchaccount";
            }
            else if (initialInvite.isDone() && initialInvite.data.currentStatus === Dtos.UserRegStatus.PendingRegistration) {
                //its not null and its pending so send accept request
                Framework.connect(new Apis.InvitationsApi().acceptInvitation(this.props.uniqueLink), null, acceptResult => {
                    if (acceptResult.isDone()) {
                        Framework.connect(new Apis.InvitationsApi().getInvitationDetails(this.props.uniqueLink, true), this.state.userInvitation, processedInvite => {
                            if (processedInvite.isDone() && !processedInvite.data) {
                                //its done so go to switch account page
                                window.location.href = "/account/switchaccount";
                            }
                            else if (processedInvite.isDone()) {
                                this.setState({ userInvitation: processedInvite });
                            }
                            else if (processedInvite.isFailed()) {
                                this.setState({ error: processedInvite.error });
                            }
                        });
                    }
                    else if (acceptResult.isFailed()) {
                        this.setState({ error: acceptResult.error });
                    }
                });
            }
            else if (initialInvite.isFailed()) {
                //its not null and its not pending so show
                this.setState({ error: initialInvite.error });
            }
            else {
                //its still loading or its not failed, not null and its not pending so show
                this.setState({ userInvitation: initialInvite });
            }
        });
    }

    render() {
        return (
            <div>
                <Components.Error error={this.state.error || this.state.userInvitation.error} qa="AcceptInvitationsError"/>
                {Framework.Loader.for(this.state.userInvitation, invite => this.renderInvite(invite))}
            </div>
        );
    }

    private renderInvite(invitation: Dtos.UserRegistrationDetailsDto) {
        return (
            <div>
                <h3>Registration in progress</h3>
                {this.renderInviteMessage(invitation)}
            </div>
        );
    }

    private renderInviteMessage(invitation: Dtos.UserRegistrationDetailsDto) {
        switch (invitation.currentStatus) {
            case Dtos.UserRegStatus.PendingDownstreamSubscriberVerification:
                return <p>Currently awaiting approval by {invitation.downstreamSubscriber && invitation.downstreamSubscriber.name}</p>;
            case Dtos.UserRegStatus.PendingParticipantVerification:
                return <p>Currently awaiting approval by {invitation.participant && invitation.participant.name}</p>;
            case Dtos.UserRegStatus.PendingGoalVerification:
                return <p>Currently awaiting approval by Goal Group</p>;
            default:
                return null;
        }
    }

}

