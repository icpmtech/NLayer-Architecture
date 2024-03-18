import * as React from 'react';
import * as Components from '../../components';
import * as Framework from '../../classes';
import { Dtos, Apis } from '../../adr';
import { Permissions } from './shared/permissions';
import { UserDetails } from './shared/userDetails';

interface Props {
    user: Framework.Pending<Dtos.UserDetailsDto>;
    permissions: Framework.Pending<Dtos.UserPermissionsDto[]>;
    groupEnums: Framework.Pending<Dtos.EnumDisplayDto[]>;
    currentUserId: number;
    canEdit: boolean;
    canViewPermissions: boolean;
    canEditPermissions: boolean;
    canRequestEmailChange: boolean;
    canVerifyEmailChange: boolean;
    canEnableUser: boolean;
    canDisableUser: boolean;
    canUnlockUser: boolean;
    canExpireUser: boolean;
    onBack: () => void;
    onEdit: () => void;
    onEditPermissions: () => void;
    onReviewEmailChange: () => void;
    onRequestEmailChange: () => void;
    onStatusChange: (enable: boolean, unlock: boolean) => void;
    onExpirePassword: () => void;
}

export class Details extends React.Component<Props, {}>
{
    render() {
        let combined = Framework.Pending.combine(this.props.permissions, this.props.groupEnums, this.props.user, (permissions, groupEnums, user) => { return { permissions, groupEnums, user } });

        return Framework.Loader.for(combined, data =>
            <div>
                <UserDetails user={data.user}/>
                {data.permissions ? <Permissions permissions={data.permissions} userId={data.user.id} groupEnums={data.groupEnums} allowEdit={false} allowRemoveAccess={false} onChange={(v) => { }}/> : null}
                {this.renderButtons(data.user)}
            </div>
        );
    }

    private renderButtons(user: Dtos.UserDetailsDto) {
        return <div className="text-end">
            <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
            {this.props.canRequestEmailChange && this.props.user.data && !this.props.user.data.changeEmailRequestPending ? <button className="btn btn-outline-secondary" onClick={() => this.props.onRequestEmailChange()} data-qa="ChangeEmailButton">Change email</button> : null}
            {this.props.canVerifyEmailChange && this.props.user.data && this.props.user.data.changeEmailRequestPending ? <button className="btn btn-outline-secondary" onClick={() => this.props.onReviewEmailChange()} data-qa="ReviewChangeEmailrequestButton">Review change email request</button> : null}
            {this.props.canEdit && !user.isFederated ? <button className="btn btn-primary" onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button> : null}
            {this.props.canEditPermissions && this.props.user.data && this.props.user.data.id != this.props.currentUserId && this.props.permissions.isDone && this.props.permissions && this.props.permissions.data.length > 0 ? <button className="btn btn-primary" onClick={() => this.props.onEditPermissions()} data-qa="EditPermissionsButton">Edit Permissions</button> : null}
            {this.props.canEnableUser && this.props.user.data && this.props.user.data.id != this.props.currentUserId && !this.props.user.data.active ? <button className="btn btn-primary" onClick={() => this.props.onStatusChange(true, false)} data-qa="EnableUserButton">Enable User</button> : null}
            {this.props.canDisableUser && this.props.user.data && this.props.user.data.id != this.props.currentUserId && this.props.user.data.active ? <button className="btn btn-primary" onClick={() => this.props.onStatusChange(false, false)} data-qa="DisableUserButton">Disable User</button> : null}
            {this.props.canUnlockUser && this.props.user.data && this.props.user.data.id != this.props.currentUserId && this.props.user.data.active && this.props.user.data.locked ? <button className="btn btn-primary" onClick={() => this.props.onStatusChange(true, true)} data-qa="UnlockUserButton">Unlock User</button> : null}
            {this.props.canExpireUser && this.props.user.data && this.props.user.data.id != this.props.currentUserId && this.props.user.data.active && !this.props.user.data.locked && !user.isFederated ? <button className="btn btn-primary" onClick={() => this.props.onExpirePassword()} data-qa="ResetPasswordButton">Reset Password</button> : null}
        </div>;//we dont display 'unlock' and 'enable' buttons at the same as they call the same query
    }
}