import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos, Apis } from '../../adr';
import { ParticipantBanner } from './participantBanner';
import { UserRegistrationDtoValidator } from '../../validators/userRegistrationDtoValidator';
import { PasswordValidator } from '../../validators/passwordValidator';
import { Result } from "../../validators/common";

interface Props {
    uniqueLink: string;
    termsAndConditionsUrl: string;
    privacyAndLegalUrl: string;
}

interface PageState {
    userInvitation?: Framework.Pending<Dtos.UserRegistrationDetailsDto>;
    editor?: Dtos.UserRegistrationDetailsDto;
    pageMode?: string;
    validation?: UserRegistrationDtoValidator;
    error?: Framework.AppError;
}

interface UrlProps {
    pageMode: string;
}

export class Page extends React.Component<Props, PageState> {
    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();

    constructor(props: Props) {
        super(props);

        this.state = {
            userInvitation: new Framework.Pending<Dtos.UserRegistrationDetailsDto>(),
            pageMode: "register",
            validation: null,
            error: null,
            editor: null
        };
    }

    render() {
        return Framework.Loader.for(this.state.userInvitation, data => {
            if (this.state.pageMode === "register") {
                return (
                    <div>
                        {!data.isValidLink && this.renderErrorMessage()}
                        {data.isValidLink && (data.isExpiredLink || data.currentStatus != Dtos.UserRegStatus.PendingRegistration) && this.renderExpiredMessage()}
                        {data.isValidLink && !data.isExpiredLink && data.currentStatus === Dtos.UserRegStatus.PendingRegistration && this.renderForm()}
                    </div>
                );
            }

            else if (this.state.pageMode === "success") {
                return (
                    <div>
                        <h3 data-qa="AccessGrantedRequestSent">{data.currentStatus === Dtos.UserRegStatus.Completed ? 'Registration Successful. Access is now granted.' : 'Your request has been sent for approval.'}</h3>
                    </div>
                );
            }
        });
    }

    private renderForm() {
        return (
            <div>
                <h3>Confirm Registration</h3>
                {this.renderError()}
                {this.state.editor.isExistingUser ? this.renderExistingRegistrationDetails() : this.renderBasicRegistrationDetails()}
                {this.renderInviteDetails()}
                {this.renderTCInfo()}
                <div className="float-end">
                    <button className="btn btn-primary" onClick={() => this.submitRegistration()} data-qa="RegisterButton">Register</button>
                </div>
            </div>
        );
    }

    private renderError() {
        if (!this.state.error) return null;
        return (
            <Components.Error error={this.state.error} qa="UserRegistrationError"/>
        );
    }

    private renderErrorMessage() {
        return (<h3>The selected link is invalid</h3>);
    }

    private renderExpiredMessage() {
        return (<h3>Sorry, the selected link has expired</h3>);
    }

    private renderInviteDetails() {
        return Framework.Loader.for(this.state.userInvitation, ui => {
            return (ui.participant &&
                <div>
                    <h3>About your company</h3>
                <ParticipantBanner particpant={ui.participant} downstreamSubscriber={ui.downstreamSubscriber} qa="InviteDetails"/>
                </div>
            )
        });
    }

    private renderTCInfo() {
        let validator = this.state.validation;

        let plLink = (<span>I agree with the <a href={this.props.privacyAndLegalUrl} target="_blank" data-qa="PrivacyAndLegalInformationLink">Privacy and Legal information</a></span>);
        let tcLink = (<span>I agree with the <a href={this.props.termsAndConditionsUrl} target="_blank" data-qa="TermsAndConditionsLink">Terms and Conditions</a></span>);

        let tandcForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(v => this.validate(v))
            .withQA("TermsAndConditionsInfo")
            .addCheckBox("", m => m.privacyAndLegalInformation, (m, v) => m.privacyAndLegalInformation = v, "PrivacyAndLegalInformation", plLink, validator.privacyAndLegalInfo, { noTitle: true })
            .addCheckBox("", m => m.termsAndConditions, (m, v) => m.termsAndConditions = v, "TermsAndConditions", tcLink, validator.termsAndConditions, { noTitle: true });

        return tandcForm.render();
    }

    private validate(editor:Dtos.UserRegistrationDetailsDto) {
        var validation = new UserRegistrationDtoValidator(editor, this.state.validation && this.state.validation.showValidationErrors());
        this.setState({ validation, editor });
    }

    private renderBasicRegistrationDetails() {
        let validator = this.state.validation;

        let emailForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(v => this.validate(v))
            .addTextInput("Email", m => m.email, (m, v) => m.email = v, "Email", validator.email)
            .addPasswordInput("Password", m => m.password, (m, v) => m.password = v, "Password", validator.password, { additionalContent: this.renderPasswordRules(validator.password.results), handleKeyPress: true })
            .addPasswordInput("Confirm Password", m => m.passwordCheck, (m, v) => m.passwordCheck = v, "ConfirmPassword", validator.passwordCheck)
            .withQA("BasicRegistrationDetails")
            ;

        let userDetailsForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(v => this.validate(v))
            .addTextInput("First name", x => x.firstName, (m, v) => m.firstName = v, "FirstName", validator.firstName)
            .addTextInput("Last name", x => x.surname, (m, v) => m.surname = v, "LastName", validator.lastName)
            .addTextInput("Phone number", x => x.contactNumber, (m, v) => m.contactNumber = v, "PhoneNumber", validator.contactNumber)
            .withQA("UserDetailsForm")
            ;

        return (<div>
            <h4>Your login information</h4>
            <p style={{ marginBottom: '15px' }}>These are the details that you will use to login to the ADROIT™ system.</p>

            {emailForm.render()}

            <h4>About you</h4>
            How we can get in touch.
            {userDetailsForm.render()}
        </div>);
    }

    private renderPasswordRules(val: PasswordValidator) {
        var results = [val.minLength, val.hasLowercase, val.hasUppercase, val.hasNumber ];
        return (
            <div style={{ display: "inline-block", paddingLeft: "15px" }}>{results.map(x => <div style={{ color: x.isValid() ? "green" : "orange" }}><span className={x.isValid() ? "fa fa-check-circle" : "fa fa-exclamation-triangle"} style={{ marginRight: "5px" }} data-qa="ErrorMessage"/>{x.errorMessage}</div>)}</div>
            );
    }

    private renderExistingRegistrationDetails() {
        let validator = this.state.validation;

        let emailForm = new Framework.FormBuilder(this.state.editor)
            .isWide(true)
            .setChangeHandler(v => this.validate(v))
            .addTextInput("Email", m => m.email, (m, v) => m.email = v, "Email", validator.email)
            .addPasswordInput("Password", m => m.password, (m, v) => m.password = v, "Password", validator.password)
            .withQA("ExistingRegistrationDetails")
            ;

        return (
            <div>
                You have been invited to register in Adroit(tm). However it appears that your details are already registered in our system. Please confirm your email address and password below for verification.
                {emailForm.render()}
            </div>
        );
    }

    private submitRegistration() {
        let validation = new UserRegistrationDtoValidator(this.state.editor, true);

        this.setState({ validation });
      
        if (validation.isValid()) {
            Framework.connect(new Apis.InvitationsApi().registerUser(this.state.editor), null, result => {
                if (result.isDone()) {
                    this.goToSuccess();
                }
                else if (result.isFailed()) {
                    this.setState({ error: new Framework.AppError(result.error.userMessage, null, null) });
                }
            });
        }

    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "register") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/register', 'view']));
            this.url.update({ pageMode: "register" });
        }
        else if (state.pageMode === "success") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/register', 'success']));
            this.url.update({ pageMode: "success" });
        }
    }

    private goToRegister() {
        this.setPageState({ pageMode: 'register' } as PageState);
    }

    private goToSuccess() {
        this.setPageState({ pageMode: 'success' } as PageState);
    }

    componentDidMount() {
        Framework.connect(new Apis.InvitationsApi().getInvitationDetails(this.props.uniqueLink), this.state.userInvitation, invite => {
            if (invite.isDone()) {
                let editor = invite.data;

                let validation = new UserRegistrationDtoValidator(editor, false);

                this.setState({ validation: validation, userInvitation: invite, editor });
            }
        });
    }
}