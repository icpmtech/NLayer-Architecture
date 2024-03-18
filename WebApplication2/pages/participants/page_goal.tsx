import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { AppError, connect, IGridBuilderChangeArgs, LoadingStatus, PageCache, PagedDataState, Pending, UrlHelpers, UrlState } from "../../classes";
import { Message } from '../../components';
import { ParticipantDtoValidator } from '../../validators/participantDtoValidator';
import { Create } from './create';
import { Details } from './details';
import { Edit } from './edit';
import { Search } from './search';

interface PageProps {
    canViewParticipantDetails: boolean;
    canViewUsers: boolean;
    canInviteUsers: boolean;
    canEditParticipant: boolean;
    viewUsersUrl: string;
    inviteUsersUrl: string;
    isGoalUser: boolean;
};

interface PageState {
    participantId?: number;
    participantList?: PagedDataState<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    participant?: Pending<Dtos.ParticipantDto>;
    edited?: Dtos.ParticipantDto;
    validation?: ParticipantDtoValidator;
    saveError?: AppError;
    message?: string;
    saveInProgress: boolean;
    saveAndInviteInProgress: boolean;
};

interface UrlProps {
    participantId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private participantStore: PageCache<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>;

    constructor(props: PageProps) {
        super(props);

        this.participantStore = new PageCache<Dtos.ParticipantListSummaryDto, Dtos.ParticipantsListQuery>(
            (query, page, pageSize) => new Apis.ParticipantsApi().search(query, page, pageSize),
            () => this.state.participantList,
            (participantList) => this.setState({ participantList })
        );

        this.state = {
            pageMode: "search",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            participant: new Pending<Dtos.ParticipantDto>(),
            saveInProgress: false,
            saveAndInviteInProgress: false
        };
    }

    private initNewParticipant(): Dtos.ParticipantDto {
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
        if (currPath.indexOf('/participant/search/createNew') !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf('/participant/search/details') !== -1) {
            this.goToDetails(this.url.read().participantId, null, true);
        }
        else if (currPath.indexOf('/participant/search/edit') !== -1) {
            this.goToEdit(this.url.read().participantId, null);
        }
        else {
            this.goToSearch();
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "details") {
            this.url.push(UrlHelpers.buildUrl(['/participant', 'search', 'details']))
            this.url.update({ participantId: state.participantId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(UrlHelpers.buildUrl(['/participant', 'search', 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(UrlHelpers.buildUrl(['/participant', 'search', 'edit']))
            this.url.update({ participantId: state.participantId })
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/participant', 'search']));
        }
    }


    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.ParticipantSortField>) {
        this.participantStore.setCurrent({ sort: options.sort, uiFilters: options.filters, includeDownstreamSubscribers: false, includeParticipants: true }, options.page, options.pageSize, false);
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

    private goToSearch() {
        this.setPageState({
            pageMode: 'search',
            participantId: null,
            participant: new Pending<Dtos.ParticipantDto>(),
            edited: null,
            message: null,
            saveError: null,
            saveInProgress: false,
            saveAndInviteInProgress: false
        });
    }

    private goToCreate() {
        let newDto = this.initNewParticipant();

        this.EnsureCountries();

        this.setPageState({
            pageMode: 'createNew',
            participantId: null,
            participant: new Pending<Dtos.ParticipantDto>(),
            edited: newDto,
            validation: new ParticipantDtoValidator(newDto, false),
            message: null,
            saveError: null,
            saveInProgress: false,
            saveAndInviteInProgress: false
        });

    }

    private goToDetails(id: number, message: string, reload: boolean) {
        let preload = new Pending<Dtos.ParticipantDto>();
        if (!reload && this.state.participant && this.state.participant.data && this.state.participant.data.id == id) {
            preload = this.state.participant
        }

        this.setPageState({
            pageMode: 'details',
            message: message,
            participantId: id,
            participant: preload,
            edited: null,
            validation: null,
            saveError: null,
            saveInProgress: false,
            saveAndInviteInProgress: false
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.ParticipantsApi().getById(id), preload, (participant) => {
                if (this.state.participantId === id) {
                    this.setState({ participant })
                }
            });
        }
    }

    private goToEdit(id: number, message: string) {
        this.EnsureCountries();
        let preload = new Pending<Dtos.ParticipantDto>();
        if (this.state.participant && this.state.participant.data && this.state.participant.data.id == id) {
            preload = this.state.participant
        }

        this.setPageState({
            pageMode: 'edit',
            message: message,
            participantId: id,
            participant: preload,
            edited: JSON.parse(JSON.stringify(preload.data)) as Dtos.ParticipantDto,
            validation: preload.map(x => new ParticipantDtoValidator(x, false)).data || new ParticipantDtoValidator(this.initNewParticipant(), false),
            saveError: null,
            saveInProgress: false,
            saveAndInviteInProgress: false
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.ParticipantsApi().getById(id), preload, (participant) => {
                if (this.state.participantId === id) {
                    let edited = JSON.parse(JSON.stringify(participant.data)) as Dtos.ParticipantDto;
                    let validation = participant.map(x => new ParticipantDtoValidator(x, false)).data || new ParticipantDtoValidator(this.initNewParticipant(), false);
                    this.setState({ participant, edited, validation });
                }
            });
        }
    }

    private saveNewParticpant(inviteNewUsers: boolean) {
        let validation = new ParticipantDtoValidator(this.state.edited, true);

        if (validation.isValid()) {
            this.setState({ saveInProgress: !inviteNewUsers, saveAndInviteInProgress: inviteNewUsers });
            connect(new Apis.ParticipantsApi().create(this.state.edited), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    this.setState({ saveInProgress: false, saveAndInviteInProgress: false, saveError: x.error, validation });
                }
                else if (x.state === LoadingStatus.Done && inviteNewUsers) {
                    window.location.href = this.props.inviteUsersUrl.replace(/PARTICIPANT_ID_HERE/, x.data.id.toString());
                }
                else if (x.state === LoadingStatus.Done && !inviteNewUsers) {
                    this.participantStore.refresh();
                    this.goToDetails(x.data.id, "Participant was successfully created", true);
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private updateParticipant(inviteNewUsers: boolean) {
        let validation = new ParticipantDtoValidator(this.state.edited, true);

        if (validation.isValid()) {
            this.setState({ saveInProgress: !inviteNewUsers, saveAndInviteInProgress: inviteNewUsers });
            connect(new Apis.ParticipantsApi().update(this.state.participantId, this.state.edited), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ saveInProgress: false, saveAndInviteInProgress: false, saveError: x.error, validation });
                }
                else if (x.state === LoadingStatus.Done && inviteNewUsers) {
                    window.location.href = this.props.inviteUsersUrl.replace(/PARTICIPANT_ID_HERE/, x.data.id.toString());
                }
                else if (x.state === LoadingStatus.Done && !inviteNewUsers) {
                    this.participantStore.refresh();
                    this.goToDetails(x.data.id, "Participant was successfully updated", true);
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
                    canInviteUsers={this.props.canInviteUsers}
                    countries={this.state.countries}
                    participant={this.state.edited}
                    validation={this.state.validation}
                    onChange={(dto) => this.setState({ edited: dto, validation: new ParticipantDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    onCancel={() => this.goToSearch()}
                    saveInProgress={this.state.saveInProgress}
                    saveAndInviteInProgress={this.state.saveAndInviteInProgress}
                    onSave={(invite) => this.saveNewParticpant(invite)}
                    notificationGroupLimit={20}
                    error={this.state.saveError}
                   
                />;
            case 'details':
                return <Details
                    participant={this.state.participant}
                    onBack={() => this.goToSearch()}
                    canEdit={this.props.canEditParticipant}
                    onEdit={() => this.goToEdit(this.state.participantId, null)}
                    canInviteUsers={this.props.canInviteUsers}
                    onInviteUsers={() => window.location.href = this.props.inviteUsersUrl.replace(/PARTICIPANT_ID_HERE/, this.state.participantId.toString())}
                    canViewUsers={this.props.canViewUsers}
                    onViewUsers={() => window.location.href = this.props.viewUsersUrl.replace(/PARTICIPANT_ID_HERE/, this.state.participantId.toString())}
                    asGoalUser={this.props.isGoalUser}
                   
                />;
            case 'edit':
                return <Edit
                    canInviteUsers={this.props.canInviteUsers}
                    countries={this.state.countries}
                    participant={this.state.edited}
                    validation={this.state.validation}
                    onCancel={() => this.goToDetails(this.state.participantId, null, true)}
                    onChange={(dto) => this.setState({ edited: dto, validation: new ParticipantDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    saveInProgress={this.state.saveInProgress}
                    saveAndInviteInProgress={this.state.saveAndInviteInProgress}
                    onSave={(invite) => this.updateParticipant(invite)}
                    notificationGroupLimit={20}
                    error={this.state.saveError}
                    asGoalUser={this.props.isGoalUser}
                />;
            default:
                return <Search
                    canViewParticipantDetails={this.props.canViewParticipantDetails}
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    participants={this.participantStore.getCurrentData()}
                    onParticipantSelected={(participant) => this.goToDetails(participant.id, null, false)}
                    currentFilter={this.participantStore.getCurrentFilter()}
                   
                />;
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create Participant"
            case "details":
                return "View Participant"
            case "edit":
                return "Edit Participant"
            default:
                return "Participants"
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
}