import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';
import { GoalUserInvitationsDtoValidator } from '../../validators/goaluserInvitationsDtoValidator';
import { Create } from './create';
import { Sent } from './sent';
import { Loader } from '../../classes';

interface Props {
    isTrmUser: boolean;
}

interface State {
    success?: boolean;
    validation?: GoalUserInvitationsDtoValidator;
    invitations?: Dtos.GoalUserInvitationsDto;
    error?: Framework.AppError;
    groupEnums?: Framework.Pending<Dtos.EnumDisplayDto[]>;
}

export class Page extends React.Component<Props, State> {

    constructor() {
        super();
        this.state = {
            success: false
        };
    }

    componentWillMount() {
        let invitations: Dtos.GoalUserInvitationsDto = {
            emails:[],
            requestedGoalGroup: null,
            groupType: this.props.isTrmUser ? Dtos.GroupType.GoalTrm : Dtos.GroupType.GoalAdroit
        };

        let validation = new GoalUserInvitationsDtoValidator(invitations, false);

        Framework.connect(new Apis.EnumApi().groups(), null, (groupEnums) => this.setState({ groupEnums }));

        this.setState({ invitations, validation });
    }

    private validate() {
        let validation = new GoalUserInvitationsDtoValidator(this.state.invitations, true);
        this.setState({ validation });
        return validation.isValid();
    }

    private onChange(invitations: Dtos.GoalUserInvitationsDto) {
        let validation = new GoalUserInvitationsDtoValidator(invitations, this.state.validation.showValidationErrors());
        this.setState({ invitations, validation });    }

    private onConfirm() {
        let validation = new GoalUserInvitationsDtoValidator(this.state.invitations, true);
        if (validation.isValid()) {
            Framework.connect(new Apis.InvitationsApi().inviteGoalUsers(this.state.invitations), null, result => {
                if (result.isDone()) {
                    this.setState({ success: true });
                    this.setState({ error: null });
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                }
            });
        }
        this.setState({ validation });
    }

    private renderSuccess() {
        if (!this.state.success) return null;
        return <Sent invitations={this.state.invitations}/>;
    }

    private renderCreate() {
        if (this.state.success) return null;
        return Loader.for(this.state.groupEnums, groupEnums => <Create invitation={this.state.invitations} validation={this.state.validation} onChange={(invitations) => this.onChange(invitations)}
            onSendInvites={() => this.validate()} onConfirm={() => this.onConfirm()} isTrmUser={this.props.isTrmUser} groupEnums={groupEnums} />);
    }

    private renderTitle = () => "User Invitations";

    render() {
        return (
            <div>
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                <Components.Error error={this.state.error} qa="InviteGoalUsersError"/>
                {this.renderCreate()}
                {this.renderSuccess()}
            </div>
        );
    }
}