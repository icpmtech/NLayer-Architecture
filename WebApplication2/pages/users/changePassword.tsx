import * as React from 'react';
import { Dtos, Apis } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { ChangePasswordDtoValidator } from '../../validators/changePasswordDtoValidator';
import { PasswordValidator } from '../../validators/passwordValidator';

interface Props {
    username: string;
}

interface State {
    model?: Dtos.ChangePasswordDto;
    validator?: ChangePasswordDtoValidator;
    error?: Framework.AppError;
    pageMode?: 'passwordChange' | 'success';
}

export class ChangePassword extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        var initialModel = { newPassword: null, currentPassword: null, newPasswordCheck: null };

        this.state = {
            model: initialModel,
            validator: new ChangePasswordDtoValidator(initialModel, false),
            error: null,
            pageMode: 'passwordChange'
        };
    }

    render() {
        return (
            <div>
                {this.state.pageMode == 'passwordChange' && this.renderInitial()}
                {this.state.pageMode == 'success' && this.renderSuccess()}
            </div>
        );
    }

    private renderSuccess() {
        return (<div><h4 data-qa="PasswordChangedSuccessly">Your password was changed successfully</h4></div>);
    }

    private renderInitial() {
        return (
            <div>
                {this.renderError()}
                {this.renderPasswordForm()}
                <div className="d-flex justify-content-end mb-1">
                    <button className="btn btn-primary" onClick={() => this.updatePassword()} data-qa="ChangePasswordButton">Change Password</button>
                </div>
            </div>
        );
    }

    private renderError() {
        if (!this.state.error) return null;
        return (
            <Components.Error error={this.state.error} qa="ChangePasswordError"/>
        );
    }

    updatePassword() {
        let validator = new ChangePasswordDtoValidator(this.state.model, true);

        let connector = new Apis.UsersApi();

        if (validator.isValid()) {
            Framework.connect(connector.changePassword(this.state.model), null, x => {
                if (x.isDone()) {
                    this.setState({ pageMode: 'success' });
                }
                else if (x.isFailed()) {
                    this.setState({ error: x.error });
                }
            });
        }

        this.setState({ validator: validator });
    }

    renderPasswordForm() {
        let validator = this.state.validator;

        let form = new Framework.FormBuilder(this.state.model)
            .isWide(true)
            .setChangeHandler((o) => this.validate(o))
            .addPasswordInput("Current Password", m => m.currentPassword, (m, v) => m.currentPassword = v, "CurrentPassword", validator.currentPassword, { additionalContent: this.renderSpace() })
            .addPasswordInput("New Password", m => m.newPassword, (m, v) => m.newPassword = v, "NewPassword", validator.password, {  handleKeyPress: true })
            .addPasswordInput("Confirm New Password", m => m.newPasswordCheck, (m, v) => m.newPasswordCheck = v, "ConfirmNewPassword", validator.passwordCheck, { additionalContent: this.renderPasswordRules(validator.password.results) })
            .withQA("PasswordForm");
        return form.render();
    }

    private renderSpace() {
        return <div style={{height: "65px"}}></div>
    }

    private validate(editor: Dtos.ChangePasswordDto) {
        var validation = new ChangePasswordDtoValidator(editor, this.state.validator && this.state.validator.showValidationErrors());
        this.setState({ validator: validation, model: editor });
    }

    private renderPasswordRules(val: PasswordValidator) {
        var results = [val.minLength, val.hasLowercase, val.hasUppercase, val.hasNumber];
        return (
            <div className="offset-md-3 col-md-6" style={{ left: "17%", paddingTop: "10px" }}>
                {results.map(x => <div style={{ color: x.isValid() ? "green" : "orange" }}>
                    <span className={x.isValid() ? "fa fa-check-circle" : "fa fa-exclamation-triangle"} style={{ marginRight: "5px" }} data-qa="ErrorMessage"/>
                    {x.errorMessage}
                </div>)}
            </div>
        );
    }
}