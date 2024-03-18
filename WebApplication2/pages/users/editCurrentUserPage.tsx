import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Edit } from './edit';
import { UserDtoValidator } from '../../validators/userDtoValidator';

interface State {
    error?: Framework.AppError;
    details?: Framework.Pending<Dtos.UserDetailsDto>;
    editor?: Dtos.UserDetailsDto,
    validator?: UserDtoValidator,
}

export class EditCurrentUserPage extends React.Component<{}, State>
{
    constructor() {
        super();
        this.state = {
            details: new Framework.Pending<Dtos.UserDetailsDto>()
        };
    }

    componentDidMount() {
        Framework.connect(new Apis.UsersApi().getCurrent(), this.state.details, details => {
            let validator = this.state.validator;
            let editor = this.state.editor;
            if (details.isDone()) {
                editor = Framework.safeClone(details.data);
                validator = new UserDtoValidator(editor, false);
            }
            this.setState({ details, editor, validator })
        });
    }

    render() {
        return (
            <div>
                <h2>Edit user profile</h2>
                <Components.Error error={this.state.error} qa="EditCurrentUserError"/>
                <Edit user={this.state.details} editor={this.state.editor} validation={this.state.validator} onChange={(dto) => this.onChange(dto)} onSave={() => this.onSave()} onCancel={() => this.onCancel()}/>
            </div>
        );
    }

    private onChange(dto: Dtos.UserDetailsDto) {
        let val = new UserDtoValidator(dto, this.state.validator.showValidationErrors());
        this.setState({ editor: dto, validator: val });
    }

    private saveConfirmation: Framework.DialogBuilder;
    private onSave() {
        let validator = new UserDtoValidator(this.state.editor, true);
        if (validator.isValid()) {
            this.saveConfirmation = new Framework.DialogBuilder();
            this.saveConfirmation
                .setTitle("Update user profile?")
                .setMessage(<p>{'Are you sure you want to update your user profile?'}</p>)
                .setCancelHandler(() => {
                    this.saveConfirmation.close();
                    this.saveConfirmation = null;
                })
                .setConfirmHandler(() => {
                    Framework.connect(new Apis.UsersApi().updateCurrent(this.state.editor), null, result => {
                        if (result.isFailed()) {
                            this.setState({ error: result.error });
                            this.saveConfirmation.close();
                        }
                        else if (result.isReady()) {
                            this.saveConfirmation.close();
                            window.location.href = "/?message=User profile was successfully updated";
                        }
                    });
                })
                .open();
        }
        this.setState({ validator });
    }

    private onCancel() {
        window.location.href = "/";
    }

}