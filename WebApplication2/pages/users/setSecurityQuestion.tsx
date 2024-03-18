import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';
import { SetSecurityQuestionDtoValidator } from '../../validators/setSecurityQuestionDtoValidator';

interface State {
    model?: Dtos.SetSecurityQuestionDto;
    validator?: SetSecurityQuestionDtoValidator;
    securityQuestions?: Framework.Pending<Dtos.SecurityQuestionDto[]>;
    error?: Framework.AppError;
    pageMode?: 'setQuestion' | 'success';
}

export class SetSecurityQuestion extends React.Component<{}, State> {
    
    constructor() {
        super();

        this.state = {
            securityQuestions: new Framework.Pending<Dtos.SecurityQuestionDto[]>(),
            pageMode: 'setQuestion'
        };
    }

    componentDidMount() {
        let model = {} as Dtos.SetSecurityQuestionDto;
        let validator = new SetSecurityQuestionDtoValidator(model, false);
        this.setState({ model, validator });

        Framework.connect(new Apis.InvitationsApi().getSecurityQuestionSelection(), this.state.securityQuestions, questions => {
            this.setState({ securityQuestions: questions })
        });
    }

    render() {
        return (
            <div>
                {this.state.pageMode == 'setQuestion' && this.renderInitial()}
                {this.state.pageMode == 'success' && this.renderSuccess()}

            </div>
        );
    }

    private renderInitial() {
        return Framework.Loader.for(this.state.securityQuestions, data => (
            <div>
                {this.renderError()}
                {this.renderQuestionForm(data)}
                <div className="d-flex justify-content-end mb-1">
                    <button className="btn btn-primary" onClick={() => this.saveQuestion()} data-qa="SaveButton">Save</button>
                </div>
            </div>
        ));
    }

    private renderError() {
        if (!this.state.error) return null;
        return (
            <Components.Error error={this.state.error} qa="SetSecurityQuestionError"/>
        );
    }

    saveQuestion() {
        let validator = new SetSecurityQuestionDtoValidator(this.state.model, true);

        let connector = new Apis.UsersApi();

        if (validator.isValid()) {
            Framework.connect(connector.setSecurityQuestion(this.state.model), null, x => {
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

    renderQuestionForm(securityQuestions: Dtos.SecurityQuestionDto[]) {

        let mappedQuestions = securityQuestions.map(x => { return { name: x.questionText, id: x.id } });

        let securityQuestionSelected = mappedQuestions.find(x => x.id === (this.state.model && this.state.model.question && this.state.model.question.id));
        let securityQuestionSet = (editor: Dtos.SetSecurityQuestionDto, id: number) => editor.question = securityQuestions.find(x => x.id === id);

        let validator = this.state.validator;

        let form = new Framework.FormBuilder(this.state.model)
        .isWide(true)
        .setChangeHandler((o) => this.onChange(o))
        .addDropdown("Security Question", mappedQuestions, m => securityQuestionSelected, (m, v) => securityQuestionSet(m, v && v.id), "SecurityQuestion", validator.securityQuestion)
        .addTextInput("Security Answer", m => m.answer, (m, v) => m.answer = v, "SecurityAnswer", validator.securityAnswer)
        .withQA("Form")

        return form.render();
    }

    private onChange(model: Dtos.SetSecurityQuestionDto) {
        let validator = new SetSecurityQuestionDtoValidator(model, this.state.validator.showValidationErrors());
        this.setState({ model, validator });
    }

    private renderSuccess() {
        return (<div><h4 data-qa="SecurityQuestionSetCorrectly">Your security question has been set successfully</h4></div>);
    }
}