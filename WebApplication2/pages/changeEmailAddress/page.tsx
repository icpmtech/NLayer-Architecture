import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { CreateEmailChangeRequest } from '../users/createEmailChangeRequest';
import { CreateEmailChangeRequestDtoValidator } from '../../validators/createEmailChangeRequestDtoValidator';

interface Props {
    userId: number;
}

interface State {
    user?: Framework.Pending<Dtos.UserDetailsDto>;
    existingRequest?: Framework.Pending<Dtos.EmailChangeRequestDto>;
    editor?: Dtos.CreateEmailChangeRequestDto;
    validator?: CreateEmailChangeRequestDtoValidator;
    message?: string;
    error?: Framework.AppError;
}

export class Page extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            user: new Framework.Pending<Dtos.UserDetailsDto>()
        };
    }

    componentDidMount() {
        this.enusureUser();
    }

    render() {
        return <div>
            <h2>{this.renderTitle()}</h2>
            {this.state.message ? <Components.Message message={this.state.message} type={"success"} qa="SuccessMessage"/> : null}
            {this.state.error ? <Components.Error error={this.state.error} qa="ChangeEmailAddressError"/> : null}
            {this.renderCreate()}
            {this.renderExists()}
        </div>;
    }

    private renderTitle: () => string = () => {
        return "Request email change";
    }

    private renderCreate() {
        if (this.state.user.data && this.state.user.data.changeEmailRequestPending) return null;
        return <CreateEmailChangeRequest user={this.state.user} editor={this.state.editor} validator={this.state.validator} allowCancel={false} onChange={(dto) => this.onChange(dto)} onSave={() => this.onSave()} onCancel={null}/>;
    }

    private renderExists() {
        return Framework.Loader.for(this.state.existingRequest, existingRequest =>
            <div>
                <Components.Message message={'An email change has been requested'} type={'success'} qa="EmailChangeRequestedMessage"/>
                {
                    Framework.FormBuilder.for(existingRequest)
                        .isWide(true)
                        .isDisabled(true)
                        .addTextInput("New email", x => x.newEmail, null, "NewEmail")
                        .addDateTime("Requested", x => x.requestedOn, null, "Requested")
                        .addTextInput("Requested by", x => x.requestedBy, null, "RequestedBy")
                        .withQA("Form")
                        .render()
                }
            </div>
        );
    }

    private enusureUser() {
        Framework.connect(new Apis.UsersApi().getById(this.props.userId), this.state.user, (user) => {
            let validator = this.state.validator;
            let editor = this.state.editor;
            if (user.isDone()) {
                editor = { userId: this.props.userId, newEmail: "" };
                validator = new CreateEmailChangeRequestDtoValidator(editor, user.data.email, false);
            }
            this.setState({ user, editor, validator, error: null, message: null });
            if (user.data && user.data.changeEmailRequestPending) {
                Framework.connect(new Apis.EmailChangeRequestApi().getCurrent(this.props.userId), this.state.existingRequest, existingRequest => this.setState({ existingRequest }));
            }
        });
    }

    private onChange(editor: Dtos.CreateEmailChangeRequestDto) {
        let existingEmail = this.state.user.map(x => x.email).data;
        let validator = new CreateEmailChangeRequestDtoValidator(editor, existingEmail, this.state.validator.showValidationErrors());
        this.setState({ editor, validator });
    }

    private onSave() {
        let existingEmail = this.state.user.map(x => x.email).data;
        let validator = new CreateEmailChangeRequestDtoValidator(this.state.editor, existingEmail, true);
        if (validator.isValid()) {
            Framework.connect(new Apis.EmailChangeRequestApi().create(this.state.editor), null, result => {
                if (result.isDone()) {
                    this.enusureUser();
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                }
            });
        }
        this.setState({ validator, error: null, message: null });

    }
}
