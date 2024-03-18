import { DownstreamSubscriberDtoValidator } from '../../validators/downstreamSubscriberDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { connect, LoadingStatus, Pending, IGridBuilderChangeArgs, UrlState, PagedDataState, PageCache, UrlHelpers, AppError, DialogBuilder } from "../../classes";
import { Search } from './search';
import { Create } from './create';
import { Details } from './details';
import { Message } from '../../components';

interface PageProps {
    canAddDownstreamSubscriber: boolean;
    canEditDownstreamSubscriber: boolean;
    canDeleteDownstreamSubscriber: boolean;
    canSearchDownstreamSubscriber: boolean;
    canViewDownstreamSubscriber: boolean;
    canInviteUsers: boolean;
    inviteUsersUrl: string;
    isGoalUser: boolean;
    canViewUsers: boolean;
    usersUrl: string;
    usersUrlDsToken: string;
};

interface PageState {
    downSubId?: number;
    downSubList?: PagedDataState<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    participants?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    downSub?: Pending<Dtos.ParticipantDto>;
    edited?: Pending<Dtos.ParticipantDto>;
    validation?: DownstreamSubscriberDtoValidator;
    message?: string;
    saveError?: AppError;
};

interface UrlProps {
    downstreamSubscriberId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private downSubStore: PageCache<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>;

    constructor(props: PageProps) {
        super(props);

        this.downSubStore = new PageCache<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>(
            (query, page, pageSize) => new Apis.ParticipantsApi().search(query, page, pageSize),
            () => this.state.downSubList,
            (downSubList) => this.setState({ downSubList })
        );

        this.state = {
            pageMode: "search",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            participants: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(),
            downSub: new Pending<Dtos.ParticipantDto>()
        };
    }

    private initNewDownSub(): Dtos.ParticipantDto {
        return {
            id: null,
            dtcCode: null,
            address1: null,
            address2: null,
            address3: null,
            city: null,
            contactEmail: null,
            contactName: null,
            country: null,
            name: null,
            postCode: null,
            state: null,
            telephoneNumber: null,
            userSupplied: null,
            notificationGroup: [],
            parentNotificationGroup: [],
            parent: null,
            createdBy: null,
            createdOn: null,
            lastUpdatedBy: null,
            lastUpdatedOn: null
        } as Dtos.ParticipantDto;
    }

    componentDidMount = () => {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let currPath = this.url.getCurrentPath();
        if (currPath.indexOf('/downstreamsubscribers/list/createNew') !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf('/downstreamsubscribers/list/details') !== -1) {
            this.goToDetails(this.url.read().downstreamSubscriberId, null, true);
        }
        else if (currPath.indexOf('/downstreamsubscribers/list/edit') !== -1) {
            this.goToEdit(this.url.read().downstreamSubscriberId, null);
        }
        else {
            this.goToSearch();
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "details") {
            this.url.push(UrlHelpers.buildUrl(['/downstreamsubscribers', 'list', 'details']))
            this.url.update({ downstreamSubscriberId: state.downSubId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(UrlHelpers.buildUrl(['/downstreamsubscribers', 'list', 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(UrlHelpers.buildUrl(['/downstreamsubscribers', 'list', 'edit']))
            this.url.update({ downstreamSubscriberId: state.downSubId })
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/downstreamsubscribers', 'list']));
        }
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.ParticipantSortField>) {
        const sort = this.props.isGoalUser ? options.sort : (options.sort || { field: Dtos.ParticipantSortField.Name, asscending: true }); // Modify default sort for Participants' view
        this.downSubStore.setCurrent({ sort, uiFilters: options.filters, includeDownstreamSubscribers: true, includeParticipants: false }, options.page, options.pageSize, false);
        if (this.state.message) {
            this.setState({ message: null });
        }
    }

    private EnsureCountries() {
        if (this.state.countries.state === LoadingStatus.Preload || this.state.countries.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
        return this.state.countries;
    }

    private EnsureParticipants() {
        if (this.state.participants.state === LoadingStatus.Preload || this.state.participants.state === LoadingStatus.Stale) {
            let query: Dtos.ParticipantsListQuery = {
                includeParticipants: true,
                includeDownstreamSubscribers: false,
                sort: { field: Dtos.ParticipantSortField.Name, asscending: true },
                uiFilters: null
            };
            connect(new Apis.ParticipantsApi().search(query, 1, 10000), this.state.participants, participants => this.setState({ participants }));
        }
        return this.state.countries;
    }

    private goToSearch() {
        this.setPageState({
            pageMode: 'search',
            downSubId: null,
            downSub: new Pending<Dtos.ParticipantDto>(),
            edited: new Pending<Dtos.ParticipantDto>(),
            message: null
        });
    }

    private goToCreate() {
        if (!this.props.canAddDownstreamSubscriber) {
            this.goToSearch();
            return;
        }
        let newDto = this.initNewDownSub();
        this.EnsureParticipants();
        this.EnsureCountries();

        this.setPageState({
            pageMode: 'createNew',
            downSubId: null,
            downSub: new Pending<Dtos.ParticipantDto>(),
            edited: new Pending(LoadingStatus.Done, newDto),
            validation: new DownstreamSubscriberDtoValidator(newDto, false),
            message: null,
            saveError: null
        });

    }

    private goToDetails(id: number, message: string, reload: boolean) {
        if (!this.props.canViewDownstreamSubscriber) {
            this.goToSearch();
            return;
        }

        let preload = new Pending<Dtos.ParticipantDto>();
        if (!reload && this.state.downSub && this.state.downSub.data && this.state.downSub.data.id == id) {
            preload = this.state.downSub
        }

        this.setPageState({
            pageMode: 'details',
            message: message,
            downSubId: id,
            downSub: preload,
            edited: new Pending<Dtos.ParticipantDto>(),
            validation: null,
            saveError: null
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.ParticipantsApi().getById(id), preload, (downSub) => {
                if (this.state.downSubId === id) {
                    this.setState({ downSub })
                }
            });
        }
    }

    private deleteConfirmation: DialogBuilder;
    private deleteDS(id: number) {
        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete downstream subscriber?")
            .setMessage(<p>{'Are you sure you want to delete this downstream subscriber?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                connect(new Apis.ParticipantsApi().delete(this.state.downSubId), null, x => {
                    if (x.state === LoadingStatus.Failed) {
                        this.setState({ saveError: x.error });
                    }
                    else if (x.state === LoadingStatus.Done) {
                        this.downSubStore.refresh();
                        this.goToSearch();
                        this.setState({ message: "Downstream Subscriber was successfully deleted" });
                    }
                });
            })
            .withQA("DeleteDownstreamSubscriberDialog")
            .open();
    }

    private goToEdit(id: number, message: string) {
        if (!this.props.canEditDownstreamSubscriber) {
            this.goToSearch();
            return;
        }
        this.EnsureCountries();
        let preload = new Pending<Dtos.ParticipantDto>();
        if (this.state.downSub && this.state.downSub.data && this.state.downSub.data.id == id) {
            preload = this.state.downSub
        }

        this.setPageState({
            pageMode: 'edit',
            message: message,
            downSubId: id,
            downSub: preload,
            edited: preload.map(x => JSON.parse(JSON.stringify(x)) as Dtos.ParticipantDto),
            validation: preload.map(x => new DownstreamSubscriberDtoValidator(x, false)).data
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.ParticipantsApi().getById(id), preload, (downSub) => {
                if (this.state.downSubId === id) {
                    let edited = downSub.map(x => JSON.parse(JSON.stringify(x)) as Dtos.ParticipantDto);
                    let validation = downSub.map(x => new DownstreamSubscriberDtoValidator(x, false)).data;
                    this.setState({ downSub, edited, validation });
                }
            });
        }
    }

    private saveNewDownSub() {
        let validation = new DownstreamSubscriberDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.ParticipantsApi().create(this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ saveError: x.error, validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.downSubStore.refresh();
                    this.goToDetails(x.data.id, "Downstream subscriber was successfully created", true);
                }
                else {
                    this.setState({ edited: new Pending(x.state, this.state.edited.data), validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private updateDownSub() {
        let validation = new DownstreamSubscriberDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.ParticipantsApi().update(this.state.downSubId, this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ saveError: x.error, validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.downSubStore.refresh();
                    this.goToDetails(x.data.id, "Downstream Subscriber was successfully updated", true);
                }
                else {
                    this.setState({ edited: new Pending(x.state, this.state.edited.data), validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Create
                    countries={this.state.countries}
                    downSub={this.state.edited}
                    notificationGroupLimit={20}
                    onCancel={() => this.goToSearch()}
                    onChange={(dto) => this.setState({ edited: new Pending(LoadingStatus.Done, dto), validation: new DownstreamSubscriberDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    onSave={() => this.saveNewDownSub()}
                    participants={this.state.participants.map(x => x.items)}
                    saveError={this.state.saveError}
                    validation={this.state.validation}
                    isGoalUser={this.props.isGoalUser}
                />;
            case 'edit':
                return <Create
                    countries={this.state.countries}
                    downSub={this.state.edited}
                    isEditScreen={true}
                    notificationGroupLimit={20}
                    onCancel={() => this.goToSearch()}
                    onChange={(dto) => this.setState({ edited: new Pending(LoadingStatus.Done, dto), validation: new DownstreamSubscriberDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    onSave={() => this.updateDownSub()}
                    participants={new Pending(LoadingStatus.Done, [{ id: null, dtcCode: null, name: null, parent: null, countryName: null }])}
                    saveError={this.state.saveError}
                    validation={this.state.validation}
                    isGoalUser={this.props.isGoalUser}
                />;
            case 'details':
                return <Details
                    canEdit={this.props.canEditDownstreamSubscriber}
                    canDelete={this.props.canDeleteDownstreamSubscriber}
                    downSub={this.state.downSub}
                    onBack={() => this.goToSearch()}
                    onEdit={() => this.goToEdit(this.state.downSubId, null)}
                    onDelete={() => this.deleteDS(this.state.downSubId)}
                    canInviteUsers={this.props.canInviteUsers}
                    onInviteUsers={() => window.location.href = this.props.inviteUsersUrl.replace(/PARTICIPANT_ID_HERE/, this.state.downSubId.toString())}
                    saveError={this.state.saveError}
                    isGoalUser={this.props.isGoalUser}
                    canGoToUsers={this.props.canViewUsers}
                    onGoToUsers={() => this.goToUsers()}
                    />;
            default:
                return <Search
                    canAddDownstreamSubscriber={this.props.canAddDownstreamSubscriber}
                    canSearchDownstreamSubscriber={this.props.canSearchDownstreamSubscriber}
                    canViewDownstreamSubscriber={this.props.canViewDownstreamSubscriber}
                    currentFilter={this.downSubStore.getCurrentFilter()}
                    isGoalUser={this.props.isGoalUser}
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    downstreamSubscribers={this.downSubStore.getCurrentData()}
                    onDownstreamSubscriberSelected={(downSub) => this.goToDetails(downSub.id, null, false)}
                />;
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create Downstream Subscriber"
            case "details":
                return "View Downstream Subscriber"
            case "edit":
                return "Edit Downstream Subscriber"
            default:
                return "Downstream Subscribers"
        }
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    render() {
        return (
            <div>
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderMessage()}
                {this.renderView()}
            </div>
        );
    }

    private goToUsers() {
        let url = this.props.usersUrl.split(this.props.usersUrlDsToken).join(this.state.downSubId.toString());
        window.location.href = url;
    }
}