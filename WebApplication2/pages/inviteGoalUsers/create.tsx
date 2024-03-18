import * as React from 'react';
import * as Components from '../../components';
import { FormBuilder, DialogBuilder } from '../../classes';
import { Dtos } from '../../adr';
import { GoalUserInvitationsDtoValidator } from "../../validators/goaluserInvitationsDtoValidator";

interface Props {
    groupEnums: Dtos.EnumDisplayDto[];
    invitation: Dtos.GoalUserInvitationsDto;
    validation: GoalUserInvitationsDtoValidator;
    onChange: (invitation: Dtos.GoalUserInvitationsDto) => void;
    onSendInvites: () => boolean;
    onConfirm: () => void;
    isTrmUser: boolean;
}

export class Create extends React.Component<Props, {}> {

    private popup: DialogBuilder;
    //private radioButtonGroupItems: 

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

        let roles: Dtos.GroupsEnum[];
        let prefix = "";
        
        if (this.props.isTrmUser) {
            roles = [
                Dtos.GroupsEnum.GoalTrmAdmin,
                Dtos.GroupsEnum.GoalTrmUser,
                Dtos.GroupsEnum.TrmReadOnlyUser,
            ];
            prefix = "TRM ";
        }
        else {
            roles = [
                Dtos.GroupsEnum.GoalAdroitAdmin,
                Dtos.GroupsEnum.GoalAdroitManager,
                Dtos.GroupsEnum.GoalAdroitStandard
            ];

            prefix = "GOAL ";
        }

        const radioButtonItems = roles.map(r => ({name: prefix + this.props.groupEnums.filter(x => x.value === r).map(x => x.label)[0], value: r}))

        return FormBuilder.for(this.props.invitation)
            .setChangeHandler(m => this.props.onChange(m))
            .isWide(true)
            .addGroupHeading("Add email addresses:", "required")
            .addEmailList("", m => m.emails, (m, v) => m.emails = v, "EmailList", this.props.validation.emails, this.props.validation.emails.results.map(x => x.email), { listDisplayLimit: 10, noTitle: true })
            .addGroupHeading("Choose which role to assign to these users:", "required")
            .addRadioButtonGroup("",
                radioButtonItems,
                m => radioButtonItems.find(x => m.requestedGoalGroup == x.value),
                (m, v) => m.requestedGoalGroup = v.value,
                "RequestGoalGroup",
                this.props.validation.requestedGoalGroup,
            )
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

    render() {
        return (
            <div>
                <br />
                {this.renderForm()}
                {this.renderButtons()}
            </div>
        );
    }
}