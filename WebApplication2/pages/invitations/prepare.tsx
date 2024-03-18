import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';
import * as Validation from '../../validators/common';
import { PasswordValidator, PasswordNotRequiredValidator } from '../../validators/passwordValidator';
import { ParticipantBanner } from './participantBanner';

class Validator extends Validation.Results<Dtos.PrepareInviteDto> {
    constructor(model: Dtos.PrepareInviteDto, private extendedModel: { passwordCheck: string, termsAndConditions: boolean, privacyAndLegalInformation: boolean }, private invitation: Dtos.UserRegistrationDetailsDto, showValidationErrors: boolean) {
        super(model, showValidationErrors);

        if (invitation.isExistingUser || invitation.isFederatedUser) {
            this.password = Validation.subValidation(this, new PasswordNotRequiredValidator(model.password, showValidationErrors))
        } else {
            this.password = Validation.subValidation(this, new PasswordValidator(model.password, showValidationErrors))
        }
    }

    contactNumber = this.invitation.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.contactNumber, "Contact number is required");
    email = this.invitation.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.email, "Email is required");
    firstName = this.invitation.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.firstName, "First name is required");
    lastName = this.invitation.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.lastName, "Last name is required");
    password: Validation.SubValidationResult<PasswordValidator>;

    passwordCheck = this.invitation.isExistingUser || this.invitation.isFederatedUser ? Validation.valid(this) : Validation.all(this,
        () => Validation.required(this, this.extendedModel.passwordCheck, "Password confirmation is required"),
        () => Validation.isTrue(this, this.model.password === this.extendedModel.passwordCheck, "Passwords must match")
    );

    securityAnswer = this.invitation.isExistingUser || this.invitation.isFederatedUser ? Validation.valid(this) : Validation.all(this,
        () => Validation.required(this, this.model.securityAnswer, "Security answer is required"),
        () => Validation.minLength(this, this.model.securityAnswer, 4),
        () => Validation.maxLength(this, this.model.securityAnswer, 50),
        () => Validation.isTrue(this, this.model.password.indexOf(this.model.securityAnswer) == -1 &&
            this.model.email.indexOf(this.model.securityAnswer) == -1, "Security question answer must not be part of the password or the username")
    );

   securityQuestion = this.invitation.isExistingUser || this.invitation.isFederatedUser ? Validation.valid(this) : Validation.required(this, this.model.securityQuestion, "Security question  is required");

    termsAndConditions = Validation.all(this,
        () => Validation.required(this, this.extendedModel.termsAndConditions, ""),
        () => Validation.isTrue(this, this.extendedModel.termsAndConditions, "You must accept the terms & conditions")
    );

    privacyAndLegalInfo = Validation.all(this,
        () => Validation.required(this, this.extendedModel.privacyAndLegalInformation, ""),
        () => Validation.isTrue(this, this.extendedModel.privacyAndLegalInformation, "You must accept the privacy & legal information"),
    );

}

interface extendedEditorProps {
    passwordCheck: string,
    termsAndConditions: boolean,
    privacyAndLegalInformation: boolean
}

type combinedEditorProps = Dtos.PrepareInviteDto & extendedEditorProps;

interface Props {
    uniqueLink: string;
}

interface State {
    userInvitation?: Framework.Pending<Dtos.UserRegistrationDetailsDto>;
    editor?: combinedEditorProps;
    validation?: Validator;
    error?: Framework.AppError;
    securityQuestions?: Framework.Pending<Dtos.SecurityQuestionDto[]>;
}

export class Prepare extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            userInvitation: new Framework.Pending<Dtos.UserRegistrationDetailsDto>(),
            validation: null,
            error: null,
            editor: null,
            securityQuestions: new Framework.Pending<Dtos.SecurityQuestionDto[]>()
        };
    }

    componentDidMount() {
        Framework.connect(new Apis.InvitationsApi().getInvitationDetails(this.props.uniqueLink, true), this.state.userInvitation, invite => {
            if (invite.isDone() && invite.data && invite.data.currentStatus !== Dtos.UserRegStatus.PendingRegistration) {
                //its null so its done so go to accept page
                window.location.href = "/register/" + this.props.uniqueLink + "/accept";
            }
            else if (invite.isDone() && invite.data) {
                let editor = {} as combinedEditorProps;
                let validation = new Validator(editor, editor, invite.data, false);
                this.setState({ userInvitation: invite, editor, validation });
            }
            else {
                this.setState({ userInvitation: invite });
            }
        });

        Framework.connect(new Apis.InvitationsApi().getSecurityQuestionSelection(), this.state.securityQuestions, questions => {
               this.setState({ securityQuestions: questions })
        });
    }

    render() {
        return Framework.Loader.for(this.state.userInvitation, invite => {
            return <div>
                {this.renderError()}
                {this.renderInvite(invite)}
            </div>
        });
    }

    private renderError() {
        if (!this.state.error) return null;
        return (
            <Components.Error error={this.state.error} qa="InvitationsPrepareError"/>
        );
    }

    private renderInvite(invite: Dtos.UserRegistrationDetailsDto) {
        if (!invite || !invite.isValidLink) {
            return (<h3>The selected link is invalid</h3>);
        }

        if (invite.isExpiredLink) {
            return (<h3>Sorry, the selected link has expired</h3>);
        }

        return (
            <div>
                <h3>Confirm Registration</h3>
                {invite.isExistingUser ? this.renderExistingUserDetails() : null}
                {!invite.isExistingUser && invite.isFederatedUser ? this.renderFederatedUserLoginDetails() : null}
                {!invite.isExistingUser && !invite.isFederatedUser ? this.renderNewUserLoginDetails() : null}
                {!invite.isExistingUser ? this.renderUserDetailsForm(): null}
                {this.renderInviteDetails(invite)}
                {this.renderTCInfo()}
                <div className="float-end">
                    <button className="btn btn-primary" onClick={() => this.submitRegistration()} data-qa="SignInButton">Sign in to Continue Registration</button>
                </div>
            </div>
        );
    }

    private renderExistingUserDetails() {
        return (
            <div data-qa="ExistingUser">
                You have been invited to register in Adroit(tm). However it appears that your details are already registered in our system. Please click the button below to login for verification.
            </div>
        );

    }

    private renderFederatedUserLoginDetails() {
        let validator = this.state.validation;

        let emailForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(e => this.onChange(e))
            .addTextInput("Email", m => m.email, (m, v) => m.email = v, "EmailTextInput", validator.email)
            .withQA("EmailForm")
            ;

        return (
            <div>
                <h4>Your login information</h4>
                <p style={{ marginBottom: '15px' }}>This is the email you will use to login to the ADROIT™ system.</p>
                {emailForm.render()}
            </div>
        );
    }

    private renderEmailForm(securityQuestions: Dtos.SecurityQuestionDto[]) {

        let mappedQuestions = securityQuestions.map(x => { return { name: x.questionText, id: x.id }});

        let securityQuestionSelected = mappedQuestions.find(x => x.id === (this.state.editor && this.state.editor.securityQuestion && this.state.editor.securityQuestion.id));
        let securityQuestionSet = (editor: combinedEditorProps, id: number) => editor.securityQuestion = securityQuestions.find(x => x.id === id);

        let validator = this.state.validation;

        let emailForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(e => this.onChange(e))
            .addTextInput("Email", m => m.email, (m, v) => m.email = v, "EmailInput", validator.email)
            .addPasswordInput("Password", m => m.password, (m, v) => m.password = v, "PasswordInput", validator.password, { additionalContent: this.renderPasswordRules(validator.password.results), handleKeyPress: true })
            .addPasswordInput("Confirm Password", m => m.passwordCheck, (m, v) => m.passwordCheck = v, "ConfirmPasswordInput", validator.passwordCheck)
            .addDropdown("Security Question", mappedQuestions, m => securityQuestionSelected, (m, v) => securityQuestionSet(m, v && v.id), "SecurityQuestionDropdown", validator.securityQuestion)
            .addTextInput("Security Answer", m => m.securityAnswer, (m, v) => m.securityAnswer = v, "SecurityAnswerInput",  validator.securityAnswer)
            ;
        return emailForm.render();
    }

    private renderNewUserLoginDetails() {
        return Framework.Loader.for(this.state.securityQuestions, data => (
           
            <div>
                <h4>Your login information</h4>
                <p style={{ marginBottom: '15px' }}>These are the details that you will use to login to the ADROIT™ system.</p>
                {this.renderEmailForm(data)}

            </div>));
    }

    private renderUserDetailsForm() {
        let {validation} = this.state;

        let userDetailsForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(e => this.onChange(e))
            .addTextInput("First name", x => x.firstName, (m, v) => m.firstName = v, "FirstNameInput", validation.firstName)
            .addTextInput("Last name", x => x.lastName, (m, v) => m.lastName = v, "LastNameInput", validation.lastName)
            .addTextInput("Phone number", x => x.contactNumber, (m, v) => m.contactNumber = v, "ContactNumberInput", validation.contactNumber)
            .withQA("UserDetailsForm")
            ;

        return (
            <div>
                <h4>About you</h4>
                <p>How we can get in touch.</p>
                {userDetailsForm.render()}
            </div>
        );
    }

    private renderPasswordRules(val: PasswordValidator) {
        let results = [val.minLength, val.hasLowercase, val.hasUppercase, val.hasNumber].map(x => 
            <div style={{ color: x.isValid() ? "green" : "orange" }}>
                <span className={x.isValid() ? "fa fa-check-circle" : "fa fa-exclamation-triangle"} style={{ marginRight: "5px" }} data-qa="PasswordValidator"/>
                {x.errorMessage}
            </div>
            );

        return (
            <div style={{ display: "inline-block", paddingLeft: "15px" }}>
                {results}
            </div>
        );
    }

    private renderInviteDetails(invite: Dtos.UserRegistrationDetailsDto) {
        if (!invite.participant && !invite.downstreamSubscriber) return null;
        return (
            <div>
                <h3>About your company</h3>
                <ParticipantBanner particpant={invite.participant} downstreamSubscriber={invite.downstreamSubscriber}/>
            </div>
        );
    }

    private renderTCInfo() {
        let validator = this.state.validation;

        let plLink = (<span>I agree with the <a href="" target="_blank" data-qa="PrivacyAndLegalInformationLink">Privacy and Legal information</a></span>);
        let tcLink = (<span>I agree with the <a href="" target="_blank" data-qa="TermsAndConditionsLink">Terms and Conditions</a></span>);

        let tandcForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(e => this.onChange(e))
            .addCheckBox("", m => m.privacyAndLegalInformation, (m, v) => m.privacyAndLegalInformation = v, "PrivacyAndLegalInformationCheckbox", plLink, validator.privacyAndLegalInfo, { noTitle: true })
            .addCheckBox("", m => m.termsAndConditions, (m, v) => m.termsAndConditions = v, "TermsAndConditionsCheckbox", tcLink, validator.termsAndConditions, { noTitle: true });

        return tandcForm.render();
    }

    private onChange(editor: combinedEditorProps) {
        let validation = new Validator(editor, editor, this.state.userInvitation.data, this.state.validation.showValidationErrors());
        this.setState({ editor, validation });
    }

    private submitRegistration() {
        let { editor } = this.state;
        let validation = new Validator(editor, editor, this.state.userInvitation.data, true);
        if (validation.isValid()) {
            Framework.connect(new Apis.InvitationsApi().prepareInvitation(this.props.uniqueLink, editor), null, result => {
                if (result.isDone()) {
                    window.location.href = "/register/" + this.props.uniqueLink + "/accept";
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                }
            });
        }
        this.setState({ editor, validation });
    }
}
