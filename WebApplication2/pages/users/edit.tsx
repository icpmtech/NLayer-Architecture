import * as React from 'react';
import * as Components from '../../components';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { UserDtoValidator } from '../../validators/userDtoValidator';
import { UserEditor } from './shared/userEditor';

interface Props {
    user: Framework.Pending<Dtos.UserDetailsDto>;
    editor: Dtos.UserDetailsDto;
    validation: UserDtoValidator;
    onChange: (dto: Dtos.UserDetailsDto) => void;
    onSave: () => void;
    onCancel: () => void;
}

interface State {
}

export class Edit extends React.Component<Props, State>
{
    render() {
        return Framework.Loader.for(this.props.user, user =>
            <div>
                <UserEditor editor={this.props.editor} validation={this.props.validation} onChange={dto => this.props.onChange(dto)}/>
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
