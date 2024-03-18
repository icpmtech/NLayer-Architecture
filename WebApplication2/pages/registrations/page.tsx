import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Grid } from './grid';
import { Apis, Dtos } from '../../adr';
import { Details } from './details';
import { VerifyUserDtoValidator } from '../../validators/verifyUserDtoValidator';


interface Props {
    currentUserGroupType: Dtos.GroupType;
    participantId?: number;
}

interface State {
    pageStore?: Framework.PagedDataState<Dtos.UserRegistrationSummaryDto, Dtos.ListPendingUserRegistrationsQuery>;
    currentView?: 'grid' | 'details';
    currentId?: number;
    userVerification?: Framework.Pending<Dtos.UserVerificationDetailsDto>;
    groupEnums?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    editor?: Dtos.VerifyUserDto;
    validator?: VerifyUserDtoValidator;
    error?: Framework.AppError;
    message?: string;
}

interface UrlProps {
    id?: number
};

export class Page extends React.Component<Props, State>{

    private pageCache: Framework.PageCache<Dtos.UserRegistrationSummaryDto, Dtos.ListPendingUserRegistrationsQuery>;
    private url = new Framework.UrlState<UrlProps>();

    constructor(props: Props) {
        super(props);

        this.state = {
            currentView: 'grid',
            statusOptions: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            groupEnums: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            userVerification: new Framework.Pending<Dtos.UserVerificationDetailsDto>()
        };

        this.pageCache = new Framework.PageCache<Dtos.UserRegistrationSummaryDto, Dtos.ListPendingUserRegistrationsQuery>(
            (query, page, pageSize) => new Apis.InvitationsApi().search(query, page, pageSize),
            () => this.state.pageStore,
            (pageStore) => this.setState({ pageStore })
        );
    }


    componentDidMount() {
        this.setStateFromUrl();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromUrl();
        }

    }

    private setStateFromUrl() {
        let path = this.url.getCurrentPath();
        var urlProps = this.url.read() || {};
        if (path.startsWith("/invitations/list/details") && urlProps.id) {
            this.goToDetails(urlProps.id);
        }
        else {
            this.goToGrid();
        }
    }

    private setUrl() {
        var qs = "?" + this.url.getCurrentQuery();
        if (qs == "?") {
            qs = "";
        }
        switch (this.state.currentView) {
            case 'details':
                this.url.push("/invitations/list/details" + qs);
                this.url.update({ id: this.state.currentId });
                break;
            case 'grid':
            default:
                this.url.push("/invitations/list" + qs);
                this.url.update({});
                break;
        }
    }

    private onGridChanged(args: Framework.IGridBuilderChangeArgs<Dtos.ListPendingUserRegistrationsQuery_SortField>) {
        let query: Dtos.ListPendingUserRegistrationsQuery = {
            sort: args.sort,
            uiFilters: args.filters
        };
        this.pageCache.setCurrent(query, args.page, args.pageSize, false);
    }

    private ensureStatusOptions() {
        var statusOptions = this.state.statusOptions;
        if (!statusOptions || statusOptions.state == Framework.LoadingStatus.Preload || statusOptions.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().userRegistrationStatus(), statusOptions, statusOptions => this.setState({ statusOptions }));
        }
    }

    private ensureGroupEnums() {
        var groupEnums = this.state.groupEnums;
        if (!groupEnums || groupEnums.state == Framework.LoadingStatus.Preload || groupEnums.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().groups(), groupEnums, groupEnums => this.setState({ groupEnums }));
        }
    }

    private ensureUserVerification(id: number) {
        var userVerification = this.state.userVerification;
        if (!userVerification || userVerification.state == Framework.LoadingStatus.Preload || userVerification.state == Framework.LoadingStatus.Stale || (userVerification.data && userVerification.data.id != id)) {
            Framework.connect(new Apis.VerificationsApi().getById(id), userVerification, result => {
                if (result.isDone()) {
                    let editor: Dtos.VerifyUserDto = { groupId: result.data.requestedGroupType, reason: null };
                    let validator = new VerifyUserDtoValidator(editor, false, false);
                    this.setState({ userVerification: result, editor, validator })
                }
                else {
                    this.setState({ userVerification })
                }
            });
        }
    }

    private goToGrid(message: string = null) {
        this.ensureStatusOptions();
        this.setState({ currentView: "grid", currentId: null, error: null, message }, () => this.setUrl());
    }

    private goToDetails(id: number) {
        this.ensureGroupEnums();
        this.ensureUserVerification(id);
        this.setState({ currentView: "details", currentId: id, error: null, message: null}, () => this.setUrl());
    }

    private onRecordSelected(userRegDto: Dtos.UserRegistrationSummaryDto) {
        this.goToDetails(userRegDto.id);
    }

    private getTitle(): string {
        switch (this.state.currentView) {
            case 'details':
                return "User Registration Review";
            case 'grid':
            default:
                return "User Registrations";
        }
    }

    private renderView = () => {
        switch (this.state.currentView) {
            case ('grid'): {
                return <Grid
                    onChange={options => this.onGridChanged(options)}
                    userRegs={this.pageCache.getCurrentData()}
                    onSelect={userRegDto => this.onRecordSelected(userRegDto)}
                    statusOptions={this.state.statusOptions}
                    currentUserGroupType={this.props.currentUserGroupType}
                    participantId={this.props.participantId}
                   
                />;
            }
            case ('details'): {
                return <Details
                    currentUserGroupType={this.props.currentUserGroupType}
                    groupEnums={this.state.groupEnums}
                    userVerification={this.state.userVerification}
                    editor={this.state.editor}
                    validator={this.state.validator}
                    onChange={(dto, rejecting) => this.onChange(dto, rejecting)}
                    onCancel={() => this.goToGrid()}
                    onApprove={() => this.onApprove()}
                    onReject={(dto) => this.onReject(dto)}
                    onResendInvite={() => this.resendInvite()}
                   
                    />;
            }
        }
    }

    private onChange(dto: Dtos.VerifyUserDto, isRejecting: boolean) {
        let validator = new VerifyUserDtoValidator(dto, isRejecting, this.state.validator.showValidationErrors());
        this.setState({editor:dto, validator});
    }

    private onApprove() {
        let validator = new VerifyUserDtoValidator(this.state.editor, false, true);
        if (validator.isValid()) {
            Framework.connect(new Apis.VerificationsApi().approveUser(this.state.currentId, this.state.editor), null, result => {
                if (result.isDone()) {
                    this.pageCache.refresh();
                    this.goToGrid("User was approved");
                }
                else if (result.isFailed()) {
                    this.setState({error: result.error });
                }
            });
        }
        this.setState({ validator });
    }

    private onReject(dto: Dtos.VerifyUserDto) {
        let validator = new VerifyUserDtoValidator(dto, true, true);
        if (validator.isValid()) {
            Framework.connect(new Apis.VerificationsApi().rejectUser(this.state.currentId, dto), null, result => {
                if (result.isDone()) {
                    this.pageCache.refresh();
                    this.goToGrid("User was rejected");
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                }
            });
        }
        this.setState({ validator });
    }

    private resendInviteConfirmation: Framework.DialogBuilder;
    private resendInvite() {
        this.resendInviteConfirmation = new Framework.DialogBuilder()
            .setTitle("Resend user invitation")
            .setMessage("Are you sure you want to resend the invitation?")
            .withQA("ResendUserInvitationDialog")
            .setCancelHandler(() => {
                this.resendInviteConfirmation.close();
                this.resendInviteConfirmation = null;
            })
            .setConfirmHandler(() => {
                this.resendInviteConfirmation.close();
                this.resendInviteConfirmation = null;
                Framework.connect(new Apis.InvitationsApi().reinviteUsers(this.state.currentId), null, result => {
                    if (result.isDone()) {
                        this.pageCache.refresh();
                        this.goToGrid("User invitation has been resent");
                    }
                    else if (result.isFailed()) {
                        this.setState({ error: result.error });
                    }
                });
            });
        this.resendInviteConfirmation.open();
    }

    render() {
        return (
            <div>
                <h2>{this.getTitle()}</h2>
                {this.state.message ? <Components.Message type={"success"} message={this.state.message} qa="SuccessMessage"/> : null}
                <Components.Error error={this.state.error} qa="RegistrationsError"/>
                {this.renderView()}
            </div>);

    }
}