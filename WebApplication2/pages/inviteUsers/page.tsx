import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';
import { UserInvitationsDtoValidator } from '../../validators/userInvitationsDtoValidator';
import { Create } from './create';
import { Sent } from './sent';
import { ParticipantBanner } from './participantBanner';
 
interface Props {
    participantId: number;
};

interface PageState {
    success?: boolean;
    participant?: Framework.Pending<Dtos.ParticipantDto>;
    validation?: UserInvitationsDtoValidator;
    userInvitations?: Dtos.UserInvitationsDto;
    error?: Framework.AppError;
};

export class Page extends React.Component<Props, PageState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            success: false,
            participant: new Framework.Pending<Dtos.ParticipantDto>(),
        };
    }

    componentWillMount() {
        Framework.connect(new Apis.ParticipantsApi().getById(this.props.participantId), this.state.participant, participant => {
            if (participant.isDone()) {

                let userInvitations : Dtos.UserInvitationsDto = {
                    participantId: participant.data.id,
                    groupType: participant.data.parent ? Dtos.GroupType.DownstreamSubscriber : Dtos.GroupType.Participant,
                    emails:[]
                };
                
                let validation = new UserInvitationsDtoValidator(userInvitations, false);
                
                this.setState({ participant, userInvitations, validation});
            } else {
                this.setState({ participant});
            }
        });
    }

    private renderSuccess() {
        if(!this.state.success) return null;
        return <Sent invitations={this.state.userInvitations}/>;
    }

    private renderCreate() {
        if(this.state.success || !this.state.participant || !this.state.participant.isDone()) return null;
        return <Create invitation={this.state.userInvitations} validation={this.state.validation} onChange={(invitations) => this.onChange(invitations)}
            onSendInvites={() => this.validate()} onConfirm={() => this.onConfirm()}/>;
    }

    private onChange(userInvitations: Dtos.UserInvitationsDto){
        let validation = new UserInvitationsDtoValidator(userInvitations, this.state.validation.showValidationErrors());
        this.setState({userInvitations, validation});
    }

    private validate() : boolean {
        let validation = new UserInvitationsDtoValidator(this.state.userInvitations, true);
        this.setState({validation});
        return validation.isValid();
    }

    private onConfirm() {
        let validation = new UserInvitationsDtoValidator(this.state.userInvitations, true);
        if(validation.isValid())
        {
            Framework.connect(new Apis.InvitationsApi().inviteUsers(this.state.userInvitations), null, result => {
                if(result.isDone())
                {
                    this.setState({ success: true });
                    this.setState({ error: null });
                }
                else if(result.isFailed())
                {
                    this.setState({error:result.error});
                }
            });
        }
        this.setState({validation});
    }

    private renderTitle = () => "User Invitations";

    private renderBanner() {
        return <ParticipantBanner particpant={this.state.participant}/>;
    }

    render() {
        return (
            <div>
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderBanner()}
                <Components.Error error={this.state.error} qa="InviteUsersError"/>
                {this.renderCreate()}
                {this.renderSuccess()}
            </div>
        );
    }
}