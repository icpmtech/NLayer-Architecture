import * as React from 'react';
import * as Components from '../../components';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { UserDetails } from './shared/userDetails';
import { Permissions } from './shared/permissions';

interface Props {
    permissions: Framework.Pending<Dtos.UserPermissionsDto[]>;
    editor: Dtos.UserPermissionsDto[];
    user: Framework.Pending<Dtos.UserDetailsDto>;
    groupEnums: Framework.Pending<Dtos.EnumDisplayDto[]>;
    allowRemoveAccess: boolean;
    onChange: (dto: Dtos.UserPermissionsDto[], saveChanges?: boolean) => void;
    onCancel: () => void;
    onSave: () => void;
}

interface State {
}

export class EditPermissions extends React.Component<Props, State>
{
    render() {
        var combined = Framework.Pending.combine(this.props.permissions, this.props.groupEnums, this.props.user, (permissions, groupEnums, user) => { return { permissions, groupEnums, user } });

        return Framework.Loader.for(combined, data =>
            <div>
                <UserDetails user={data.user}/>
                <Permissions userId={data.user.id} allowRemoveAccess={this.props.allowRemoveAccess} groupEnums={data.groupEnums} permissions={this.props.editor} allowEdit={true}
                    onChange={(v, s) => { this.props.onChange(v); if (s) { this.props.onSave() } }}/>
                {this.renderButtons()}
            </div>
        );
    }
    
    private renderButtons() {
        return <div className="text-end">
            <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
            <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="SaveButton">Save</button>
        </div>;
    }
}
