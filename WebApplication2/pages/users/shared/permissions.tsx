import * as React from 'react';
import * as Components from '../../../components';
import * as Framework from '../../../classes';
import { DialogBuilder } from '../../../classes/dialogBuilder';
import { Dtos, Apis } from '../../../adr';

interface Props {
    permissions: Dtos.UserPermissionsDto[];
    groupEnums: Dtos.EnumDisplayDto[];
    userId: number;
    allowEdit: boolean;
    allowRemoveAccess: boolean;
    onChange: (dto: Dtos.UserPermissionsDto[], saveChanges: boolean) => void;
}

interface State {
}

export class Permissions extends React.Component<Props, State>
{
    render() {
        return (
            <div data-qa={this.props.allowEdit ? "user-edit-permissions" : "user-permissions"}>
                <h3>Permissions</h3>
                {this.props.permissions && this.props.permissions.length > 0 && this.props.permissions.map(x => this.renderPermission(x, this.props.groupEnums))}
                {!(this.props.permissions && this.props.permissions.length) && (<div className="col-md-12 accordion" data-qa="UserDoesNotHaveAccess">This user does not have access to any participants</div>)}
            </div>
        );
    }
    
    private renderPermission(permission: Dtos.UserPermissionsDto, groupEnums: Dtos.EnumDisplayDto[]) {
        return (
            <div>
                <h4>{permission.groupFullTitle}</h4>
                <div>
                    {this.renderRoles(permission.groupType, permission.groupId, permission.roles, groupEnums, permission.groupName)}
                </div>
            </div>
        );
    }

    private getRolesToRender(groupType: Dtos.GetUserPermissionsQuery_GroupType) {
        switch (groupType) {
            case Dtos.GetUserPermissionsQuery_GroupType.Goal:
                return [Dtos.GroupsEnum.GoalAdroitAdmin, Dtos.GroupsEnum.GoalAdroitManager, Dtos.GroupsEnum.GoalAdroitStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.Participant:
                return [Dtos.GroupsEnum.ParticipantAdmin, Dtos.GroupsEnum.ParticipantManager, Dtos.GroupsEnum.ParticipantStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.DownstreamSubscriber:
                return [Dtos.GroupsEnum.DownstreamSubscriberAdmin, Dtos.GroupsEnum.DownstreamSubscriberManager, Dtos.GroupsEnum.DownstreamSubscriberStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.Trm:
                return [Dtos.GroupsEnum.GoalTrmAdmin, Dtos.GroupsEnum.GoalTrmUser, Dtos.GroupsEnum.TrmReadOnlyUser];
        }
        return [];
    }

    private removeAccess(groupType: Dtos.GetUserPermissionsQuery_GroupType, groupId?: number) {
        let confirmDeleteDialog = new DialogBuilder();
        let isTrmRemoval = groupType == Dtos.GetUserPermissionsQuery_GroupType.Trm;
        let isGoalRemoval = groupType == Dtos.GetUserPermissionsQuery_GroupType.Goal;

        let title = isTrmRemoval ? "Remove Access?" : isGoalRemoval ? "Remove Goal Access?" : "Remove from Participant?";
        let message = isTrmRemoval ? "Are you sure that you want to remove this user from the system?"
            : isGoalRemoval ? "Are you sure that you want to remove Goal access from this user user?"
            : "Are you sure you want to remove access from this participant?";

        message += " This cannot be undone and the user will have to go through the registration process again in order to restore access.";

        confirmDeleteDialog
            .setTitle(title)
            .setMessage(message)
            .setConfirmHandler(() => {
                confirmDeleteDialog.close();
                this.confirmRemoveAccess(groupId);
            })
            .setCancelHandler(() => {
                confirmDeleteDialog.close();
            });

        confirmDeleteDialog.open();
    }

    private confirmRemoveAccess(groupId?: number) {
        let endpoint = new Apis.UserPermissionsApi();
        Framework.connect(endpoint.removeAccess(this.props.userId, groupId), null, d => {
            if (d.isReady()) { this.removeConfirmed(groupId) }
        });
    }

    private removeConfirmed(groupId: number) {
        let newPermissions = Framework.safeClone(this.props.permissions);
        let deletedParticipant = newPermissions.find(x => x.groupId == groupId);
        newPermissions.splice(newPermissions.indexOf(deletedParticipant), 1);
        this.props.onChange(newPermissions, true);
    }

    private renderRoles(groupType: Dtos.GetUserPermissionsQuery_GroupType, groupId: number, currentRoles: Dtos.GroupsEnum[], groupEnums: Dtos.EnumDisplayDto[], groupName: string) {
        let rolesToRender = this.getRolesToRender(groupType);
        if (!rolesToRender || !rolesToRender.length) return null;

        let options = rolesToRender.map(x => { return { name: groupEnums.find(y => y.value == x).label, value: x } });
        let selected = options.filter(x => currentRoles.some(y => x.value === y));

        const TypedInput = Components.CheckBoxGroup as Newable<Components.CheckBoxGroup<{ name: string, value: Dtos.GroupsEnum }>>;
        return (
            <div>
                <TypedInput displayInline={true} options={options} value={selected} disabled={!this.props.allowEdit} horizontal={true} onChange={(v) => this.onChange(groupId, v.map(x => x.value))} qa="RolesInput"/>
                {this.props.allowRemoveAccess && <button className="btn btn-outline-secondary" onClick={() => this.removeAccess(groupType, groupId)} data-qa="RemoveUserFromGroupButton">Remove user from {groupName}</button>}
            </div>
        );
    }

    private onChange(groupId: number, value: Dtos.GroupsEnum[]) {
        let newPermissions = Framework.safeClone(this.props.permissions);
        newPermissions.find(x => x.groupId == groupId).roles = value;
        this.props.onChange(newPermissions, false);
    }
}