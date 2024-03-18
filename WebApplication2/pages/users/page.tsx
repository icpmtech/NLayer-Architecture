import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Grid } from './grid';
import { Details } from './details';
import { Edit } from './edit';
import { EditPermissions } from './editPermissions';
import { ReviewEmailChange } from './reviewEmailChange';
import { UserDtoValidator } from '../../validators/userDtoValidator';
import { CreateEmailChangeRequest } from './createEmailChangeRequest';
import { EmailChangeRequestDtoValidator } from '../../validators/emailChangeRequestDtoValidator';
import { CreateEmailChangeRequestDtoValidator } from '../../validators/createEmailChangeRequestDtoValidator';

interface Props {
    participantId: number;
    canEdit: boolean;
    canViewPermissions: boolean;
    canEditPermissions: boolean;
    canRemovePermissions: boolean;
    canEnableUser: boolean;
    canDisableUser: boolean;
    canUnlockUser: boolean;
    canRequestEmailChange: boolean;
    canVerifyEmailChange: boolean;
    canExportGridToExcel: boolean;
    isGoalUser: boolean;
    currentUserId: number;
    canExpireUser: boolean;
}

interface State {
    currentView?: 'list' | 'details' | 'edit' | 'editPermissions' | 'reviewEmailChange' | 'requestEmailChange';
    pageStore?: Framework.PagedDataState<Dtos.UserSummaryDto, Dtos.UsersQuery>;
    details?: Framework.Pending<Dtos.UserDetailsDto>;
    editor?: Dtos.UserDetailsDto,
    validator?: UserDtoValidator,
    detailsId?: number;
    permissions?: Framework.Pending<Dtos.UserPermissionsDto[]>;
    permissionsId?: number;
    permissionsEditor?: Dtos.UserPermissionsDto[];
    groupEnums?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    participantDetails?: Framework.Pending<Dtos.ParticipantDto>;
    emailChange?: Framework.Pending<Dtos.EmailChangeRequestDto>;
    emailChangeEditor?: Dtos.EmailChangeRequestDto;
    emailChangeValidator?: EmailChangeRequestDtoValidator;
    createChangeEmailRequestDto?: Dtos.CreateEmailChangeRequestDto;
    createChangeEmailRequestValidator?: CreateEmailChangeRequestDtoValidator;
    message?: string;
    error?: Framework.AppError;
}

interface UrlProps {
    id?: number
};

export class Page extends React.Component<Props, State>
{
    private pageCache: Framework.PageCache<Dtos.UserSummaryDto, Dtos.UsersQuery>;
    private url = new Framework.UrlState<UrlProps>();
    private confirmationPopUp: Framework.DialogBuilder;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: 'list',
            details: new Framework.Pending<Dtos.UserDetailsDto>(),
            permissions: new Framework.Pending<Dtos.UserPermissionsDto[]>(),
            participantDetails: new Framework.Pending<Dtos.ParticipantDto>()
        };

        this.pageCache = new Framework.PageCache<Dtos.UserSummaryDto, Dtos.UsersQuery>(
            (query, page, pageSize) => new Apis.UsersApi().search(query, page, pageSize),
            () => this.state.pageStore,
            (pageStore) => this.setState({ pageStore })
        );
    }

    componentDidMount() {
        if (this.props.participantId) {
            Framework.connect(new Apis.ParticipantsApi().getById(this.props.participantId), this.state.participantDetails, participantDetails => this.setState({ participantDetails }));
        } else {
            this.setState({ participantDetails: new Framework.Pending<Dtos.ParticipantDto>(Framework.LoadingStatus.Done, null) });
        }

        this.setStateFromUrl();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromUrl();
        }

    }

    private setStateFromUrl() {
        let path = this.url.getCurrentPath();
        var urlProps = this.url.read() || {};
        if (path.startsWith("/users/list/emailchange/review") && urlProps.id) {
            this.gotoReviewEmailChange(urlProps.id);
        }
        else if (path.startsWith("/users/list/emailchange/request") && urlProps.id) {
            this.gotoRequestEmailChange(urlProps.id);
        }
        else if (path.startsWith("/users/list/editpermissions") && urlProps.id) {
            this.gotoEditPermissions(urlProps.id);
        }
        else if (path.startsWith("/users/list/edit") && urlProps.id) {
            this.gotoEdit(urlProps.id);
        }
        else if (path.startsWith("/users/list/details") && urlProps.id) {
            this.gotoDetails(urlProps.id);
        }
        else {
            this.gotoList();
        }
    }

    private setUrl() {
        var qs = "?" + this.url.getCurrentQuery();
        if (qs == "?") {
            qs = "";
        }
        console.log("qs", this.url.getCurrentQuery(), qs);
        switch (this.state.currentView) {
            case 'reviewEmailChange':
                this.url.push("/users/list/emailchange/review" + qs);
                this.url.update({ id: this.state.detailsId });
                break;
            case 'requestEmailChange':
                this.url.push("/users/list/emailchange/request" + qs);
                this.url.update({ id: this.state.detailsId });
                break;
            case 'editPermissions':
                this.url.push("/users/list/editpermissions" + qs);
                this.url.update({ id: this.state.detailsId });
                break;
            case 'edit':
                this.url.push("/users/list/edit" + qs);
                this.url.update({ id: this.state.detailsId });
                break;
            case 'details':
                this.url.push("/users/list/details" + qs);
                this.url.update({ id: this.state.detailsId });
                break;
            case 'list':
            default:
                this.url.push("/users/list" + qs);
                this.url.update({});
                break;
        }
    }

    render() {
        return (
            <div>
                <h2>{this.renderTitle()}</h2>
                {this.state.message ? <Components.Message message={this.state.message} type={"success"} qa="SuccessMessage"/> : null}
                {this.state.error ? <Components.Error error={this.state.error} qa="UserError"/> : null}
                {this.renderView()}
            </div>
        );
    }

    private renderTitle: () => string = () => {
        switch (this.state.currentView) {
            case 'reviewEmailChange':
                return "Review email change";
            case 'requestEmailChange':
                return "Request email change";
            case 'editPermissions':
                return "Edit user permissions";
            case 'edit':
                return "Edit user details";
            case 'details':
                return "User details";
            case 'list':
            default:
                let participant = this.state.participantDetails.data;
                if (participant && participant.parent) {
                    return `Users of ${participant.name} (${participant.dtcCode} - DTC: ${participant.parent.dtcCode})`;
                }
                else if (participant) {
                    return `Users of ${participant.name} (${participant.dtcCode})`;
                }
                else {
                    return "Users";
                }
        }
    }

    private renderView = () => {
        switch (this.state.currentView) {
            case 'reviewEmailChange':
                return <ReviewEmailChange
                    user={this.state.details}
                    changeRequest={this.state.emailChange}
                    editor={this.state.emailChangeEditor}
                    validator={this.state.emailChangeValidator}
                    onSave={(dto) => this.onReviewEmailChangeSave(dto)}
                    onCancel={() => this.gotoDetails(this.state.detailsId)}
                   
                    />;
            case 'requestEmailChange':
                return <CreateEmailChangeRequest
                    user={this.state.details}
                    editor={this.state.createChangeEmailRequestDto}
                    validator={this.state.createChangeEmailRequestValidator}
                    onChange={(dto) => this.onCreateChangeEmailRequestChange(dto)}
                    onCancel={() => this.gotoDetails(this.state.detailsId)}
                    onSave={() => this.onCreateChangeEmailRequestSave()}
                   
                    />;
            case 'editPermissions':
                return <EditPermissions
                    allowRemoveAccess={this.props.canRemovePermissions}
                    permissions={this.state.permissions}
                    groupEnums={this.state.groupEnums}
                    editor={this.state.permissionsEditor}
                    user={this.state.details}
                    onCancel={() => this.gotoDetails(this.state.detailsId)}
                    onChange={(dto) => this.onPermissionsChange(dto)}
                    onSave={() => this.onPermissionsSave()}
                   
                    />;
            case 'edit':
                return <Edit
                    user={this.state.details}
                    editor={this.state.editor}
                    validation={this.state.validator}
                    onCancel={() => this.gotoDetails(this.state.detailsId)}
                    onChange={(dto) => this.onEditorChange(dto)}
                    onSave={() => this.onEditorSave()}
                   
                    />;
            case 'details':
                return <Details
                    user={this.state.details}
                    permissions={this.state.permissions}
                    groupEnums={this.state.groupEnums}
                    canEdit={this.props.canEdit}
                    currentUserId={this.props.currentUserId}
                    canViewPermissions={this.props.canViewPermissions}
                    canEditPermissions={this.props.canEditPermissions}
                    canRequestEmailChange={this.props.canRequestEmailChange}
                    canVerifyEmailChange={this.props.canVerifyEmailChange}
                    canDisableUser={this.props.canDisableUser}
                    canEnableUser={this.props.canEnableUser}
                    canUnlockUser={this.props.canUnlockUser}
                    canExpireUser={this.props.canExpireUser}
                    onBack={() => this.gotoList()}
                    onEdit={() => this.gotoEdit(this.state.detailsId)}
                    onEditPermissions={() => this.gotoEditPermissions(this.state.detailsId)}
                    onReviewEmailChange={() => this.gotoReviewEmailChange(this.state.detailsId)}
                    onRequestEmailChange={() => this.gotoRequestEmailChange(this.state.detailsId)}
                    onStatusChange={(enable, unlock) => this.onStatusChange(enable, unlock)}
                    onExpirePassword={() => this.expirePassword(this.state.detailsId)}
                   
                    />;
            case 'list':
            default:
                return <Grid
                    users={this.pageCache.getCurrentData()}
                    onChange={(options) => this.onGridChanged(options)}
                    onSelect={x => this.gotoDetails(x.id)}
                    onExport={() => new Apis.UsersApi().getUsersExportUrl(this.pageCache.getCurrentFilter())}
                    canExportGridToExcel={this.props.canExportGridToExcel}
                    isGoalUser={this.props.isGoalUser}
                   
                    />;

        }
    };

    private onGridChanged(args: Framework.IGridBuilderChangeArgs<Dtos.UsersQuery_SortField>) {
        let query: Dtos.UsersQuery = {
            participantId: this.props.participantId,
            sort: args.sort,
            uiFilters: args.filters
        };
        this.pageCache.setCurrent(query, args.page, args.pageSize, false);
    }

    private onEditorChange(editor: Dtos.UserDetailsDto) {
        let validator = new UserDtoValidator(editor, this.state.validator && this.state.validator.showValidationErrors());
        this.setState({ editor, validator });
    }

    private onEditorSave() {
        let validator = new UserDtoValidator(this.state.editor, true);
        if (validator.isValid()) {
            Framework.connect(new Apis.UsersApi().update(this.state.detailsId, this.state.editor), null, (result) => {
                if (result.isDone()) {
                    let id = this.state.detailsId;
                    if (id == result.data.id) {
                        this.pageCache.refresh();
                        this.setState({ details: result });
                        this.gotoDetails(id, "Updated details");
                    }
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error, validator: validator });
                }
            });
        }
        else {
            this.setState({ validator });
        }
    }

    private onPermissionsChange(dto: Dtos.UserPermissionsDto[]) {
        this.setState({ permissionsEditor: dto });
    }

    private onPermissionsSave() {
        let id = this.state.detailsId;
        if (!this.state.permissionsEditor.length) {
            this.setState({ permissions: new Framework.Pending<Dtos.UserPermissionsDto[]>(Framework.LoadingStatus.Done, this.state.permissionsEditor) });
            this.pageCache.refresh();
            this.gotoList("Updated permissions");
            return;
        }
        Framework.connect(new Apis.UserPermissionsApi().update(id, this.state.permissionsEditor), null, (result) => {
            if (result.isDone()) {
                if (id == this.state.detailsId) {
                    this.setState({ permissions: result });
                    this.gotoDetails(id, "Updated permissions");
                }
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });
    }

    private ensureDetails(id: number) {
        let current = this.state.detailsId === id ? this.state.details : null;
        if (!current || current.state == Framework.LoadingStatus.Preload || current.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.UsersApi().getById(id), current, (details) => {
                if (this.state.currentView === 'edit' && details.isDone()) {
                    let editor = Framework.safeClone(details.data);
                    let validator = new UserDtoValidator(editor, false);
                    this.setState({ details, detailsId: id, editor, validator })
                }
                if (this.state.currentView === 'requestEmailChange' && details.isDone()) {
                    let createChangeEmailRequestDto: Dtos.CreateEmailChangeRequestDto = { userId: details.data.id, newEmail: "" };
                    let createChangeEmailRequestValidator = new CreateEmailChangeRequestDtoValidator(createChangeEmailRequestDto, details.data.email, false);
                    this.setState({ details, detailsId: id, createChangeEmailRequestDto, createChangeEmailRequestValidator })
                }
                else {
                    this.setState({ details, detailsId: id })
                }
            });
        }
    }

    private ensureEmailChange(id: number) {
        let current = this.state.detailsId === id ? this.state.emailChange : null;
        if (!current || current.state == Framework.LoadingStatus.Preload || current.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EmailChangeRequestApi().getCurrent(id), current, (emailChange) => {
                let emailChangeEditor = this.state.emailChangeEditor;
                let emailChangeValidator = this.state.emailChangeValidator;
                if (emailChange.isDone()) {
                    emailChangeEditor = Framework.safeClone(emailChange.data);
                    emailChangeValidator = new EmailChangeRequestDtoValidator(emailChangeEditor, false);
                }
                this.setState({ emailChange, emailChangeEditor, emailChangeValidator, detailsId: id })
            });
        }
    }

    private ensurePermissions(id: number) {
        let current = id === this.state.permissionsId ? this.state.permissions : null;
        if (!current || current.state == Framework.LoadingStatus.Preload || current.state == Framework.LoadingStatus.Stale) {
            if (this.props.canViewPermissions) {
                Framework.connect(new Apis.UserPermissionsApi().getPermissionsById(id), current, (permissions) => {
                    if (this.state.currentView === 'editPermissions' && permissions.isDone()) {
                        let permissionsEditor = Framework.safeClone(permissions.data);
                        this.setState({ permissions, permissionsId: id, permissionsEditor });
                    }
                    else {
                        this.setState({ permissions, permissionsId: id });
                    }
                });
            }
            else {
                this.setState({ permissions: new Framework.Pending<Dtos.UserPermissionsDto[]>(Framework.LoadingStatus.Done), permissionsId: id });
            }
        }
    }

    private ensureGroupEnums() {
        let current = this.state.groupEnums;
        if (!current || current.state == Framework.LoadingStatus.Preload || current.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().groups(), current, (groupEnums) => this.setState({ groupEnums }));
        }
    }

    private gotoList(message: string = null) {
        this.setState({
            detailsId: null,
            currentView: 'list',
            message,
            error: null
        }, () => this.setUrl());
    }

    private gotoDetails(id: number, message: string = null) {
        this.ensureDetails(id);
        this.ensurePermissions(id);
        this.ensureGroupEnums();
        this.setState({
            detailsId: id,
            currentView: 'details',
            editor: null,
            emailChange: null,
            emailChangeEditor: null,
            emailChangeValidator: null,
            permissionsEditor: null,
            message,
            error: null
        }, () => this.setUrl());
    }

    private gotoEdit(id: number) {
        let editor: Dtos.UserDetailsDto = null;
        let validator: UserDtoValidator = null;

        if (this.state.detailsId === id && this.state.details.data) {
            editor = Framework.safeClone(this.state.details.data);
            validator = new UserDtoValidator(editor, false);
        }

        this.ensureDetails(id);

        this.setState({
            detailsId: id,
            currentView: 'edit',
            message: null,
            error: null,
            editor,
            validator
        }, () => this.setUrl());
    }

    private gotoEditPermissions(id: number) {
        let permissionsEditor: Dtos.UserPermissionsDto[] = null;

        if (this.state.detailsId === id && this.state.permissions.data) {
            permissionsEditor = Framework.safeClone(this.state.permissions.data);
        }

        this.ensureDetails(id);
        this.ensurePermissions(id);
        this.ensureGroupEnums();

        this.setState({
            detailsId: id,
            currentView: 'editPermissions',
            message: null,
            error: null,
            permissionsEditor,
        }, () => this.setUrl());
    }

    private expirePassword(userId: number) {
        Framework.connect(new Apis.UsersApi().expirePassword(this.state.details.data.id), null, (result) => {
            if (result.isDone()) {
                this.setState({ details: result, message: "Password expired" });
                this.pageCache.refresh();
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });
    }

    private onStatusChange(enable: boolean, unlock: boolean) {

        this.confirmationPopUp = new Framework.DialogBuilder();

        let action: string;
        if (unlock) {
            action = "unlock";
        } else {
            action = enable ? "enable" : "disable";
        }

        this.confirmationPopUp
            .setMessage(<p>{'Are you sure you want to ' + action + ' this user?'}</p>)
            .setCancelHandler(this.confirmationPopUp.close)
            .setConfirmHandler(() => {
                this.confirmationPopUp.close();
                this.onConfirm(enable, unlock);
            })
            .open();
    }

    private onConfirm(enable: boolean, unlock: boolean) {

        let action: string;
        if (unlock) {
            action = "unlocked";
        } else {
            action = enable ? "enabled" : "disabled";
        }
        
        let api = enable ? new Apis.UsersApi().enable(this.state.details.data.id) : new Apis.UsersApi().disable(this.state.details.data.id);

        Framework.connect(api, null, (result) => {
            if (result.isDone()) {
                this.setState({ details: result, message: "User was successfully " + action });
                this.pageCache.refresh();
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });

    }

    private gotoReviewEmailChange(id: number) {
        this.ensureDetails(id);
        this.ensureEmailChange(id);
        this.setState({
            detailsId: id,
            currentView: 'reviewEmailChange',
            message: null,
            error: null
        }, () => this.setUrl());
    }

    private gotoRequestEmailChange(id: number) {
        this.ensureDetails(id);
        let createChangeEmailRequestDto: Dtos.CreateEmailChangeRequestDto = {
            userId: this.state.detailsId,
            newEmail: ""
        };
        let createChangeEmailRequestValidator = new CreateEmailChangeRequestDtoValidator(createChangeEmailRequestDto, this.state.details.data && this.state.details.data.email, false);
        this.setState({
            detailsId: id,
            currentView: 'requestEmailChange',
            createChangeEmailRequestDto,
            createChangeEmailRequestValidator,
            message: null,
            error: null
        }, () => this.setUrl());
    }

    private onReviewEmailChangeSave(dto: Dtos.EmailChangeRequestDto) {
        let emailChangeValidator = new EmailChangeRequestDtoValidator(dto, true);

        if (emailChangeValidator.isValid()) {
            Framework.connect(new Apis.EmailChangeRequestApi().review(dto.id, dto), null, result => {
                if (result.isDone()) {
                    this.state.details.setStale();
                    this.pageCache.refresh();
                    this.gotoDetails(this.state.detailsId, dto.approved ? "Email change approved" : "Email change rejected");
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                }
            });
        }
        this.setState({ emailChangeValidator });
    }

    private onCreateChangeEmailRequestChange(createChangeEmailRequestDto: Dtos.CreateEmailChangeRequestDto) {
        let createChangeEmailRequestValidator = new CreateEmailChangeRequestDtoValidator(createChangeEmailRequestDto, this.state.details.data.email, this.state.createChangeEmailRequestValidator.showValidationErrors());
        this.setState({
            createChangeEmailRequestDto,
            createChangeEmailRequestValidator
        });
    }

    private onCreateChangeEmailRequestSave() {
        let createChangeEmailRequestDto = this.state.createChangeEmailRequestDto;
        let createChangeEmailRequestValidator = new CreateEmailChangeRequestDtoValidator(createChangeEmailRequestDto, this.state.details.data.email, true);
        if (createChangeEmailRequestValidator.isValid()) {
            Framework.connect(new Apis.EmailChangeRequestApi().create(createChangeEmailRequestDto), null, result => {
                if (result.isDone()) {
                    this.state.details.setStale();
                    this.pageCache.refresh();
                    this.gotoDetails(createChangeEmailRequestDto.userId, "Created change email request");
                }
                else if (result.isFailed()) {
                    this.setState({error: result.error});
                }
            });
        }
        this.setState({ createChangeEmailRequestValidator });
    }
}