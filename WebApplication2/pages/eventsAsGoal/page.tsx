import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { AppError, connect, IGridBuilderChangeArgs, LoadingStatus, PageCache, PagedDataState, Pending, UrlHelpers, UrlState } from "../../classes";
import { Message } from '../../components';
import { EventDtoValidator } from '../../validators/eventDtoValidator';
import { Edit } from '../event/edit';
import { Search } from './search';

interface PageProps {
    canCreateEvent?: boolean;
};

interface PageState {
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    edited?: Dtos.EventDto;
    saveError?: AppError,
    event?: Pending<Dtos.EventDto>;
    eventId?: number;
    eventList?: PagedDataState<Dtos.EventDto, Dtos.ListEventsQuery>;
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
    eventStatuses?: Pending<Dtos.EventStatusDto[]>;
    securityTypes?: Pending<Dtos.SecurityTypeDto[]>;
    currencies?: Pending<Dtos.CurrencySummaryDto[]>;
    message?: string;
    pageMode?: 'createNew' | 'search';
    showDeleteSuccessMsg?: boolean;
    validation?: EventDtoValidator;
    saveInProgress: boolean;
};

interface UrlProps {
    eventId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private eventStore: PageCache<Dtos.EventDto, Dtos.ListEventsQuery>;

    constructor(props: PageProps) {
        super(props);

        this.eventStore = new PageCache<Dtos.EventDto, Dtos.ListEventsQuery>(
            (query, page, pageSize) => new Apis.EventsApi().search(query, page, pageSize) as JQueryPromise<Dtos.PagedResultDto<Dtos.EventDto>>,
            () => this.state.eventList,
            (eventList) => this.setState({ eventList })
        );

        this.state = {
            pageMode: "search",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            event: new Pending<Dtos.EventDto>(),
            eventTypes: new Pending<Dtos.EventTypeDto[]>(),
            eventStatuses: new Pending<Dtos.EventStatusDto[]>(),
            securityTypes: new Pending<Dtos.SecurityTypeDto[]>(),
            currencies: new Pending<Dtos.CurrencySummaryDto[]>(),
            showDeleteSuccessMsg: false,
            saveInProgress:false
        };
    }

    private initNewEvent(): Dtos.EventDto {
        return {
            securityType: null,
            securityTypeName: null,
            sponsored: true,
            statutoryWhtRate: null,
            ordRecordDate: null,
            approxOrdPayDate: null,
            finalOrdPayDate: null,
            approxAdrGrossDivRate: null,
            approxOrdGrossDivRate: null,
            approxOrdGrossDivCurr: { id: 142, name: "US Dollar", code: "USD" },
            finalAdrGrossDivRate: null,
            finalOrdGrossDivRate: null,
            finalOrdGrossDivCurr: { id: 142, name: "US Dollar", code: "USD" },
            approxFxRate: null,
            finalFxRate: null,
            publicationDate: null,
            importantNoticeLastUploaded: null,
            importantNoticeLastByName: null,
            isin: null,
            exDate: null,
            approxAdrPayDate: null,
            finalAdrPayDate: null,
            ratioAdr: null,
            ratioOrd: null,
            depositoryDb: null,
            depositoryCb: null,
            depositoryBnym: null,
            depositoryJpm: null,
            id: null,
            countryofIssuance: null,
            cusip: null,
            issuer: null,
            issuerAddressLine1: null,
            issuerAddressLine2: null,
            issuerAddressLine3: null,
            issuerAddressLine4: null,
            custodian: null,
            eventType: { id: Dtos.EventType.CashAndStockOption as number, name: "Cash and Stock Option", code: "" },
            bNum: null,
            adrRecordDate: null,
            status: Dtos.EventStatusLookup_Status.Draft,
            statusName: null,
            hasImportantNotice: null,
            createdBy: null,
            createdOn: null,
            madeLiveBy: null,
            madeLiveOn: null,
            hasRounds: false,
            balanceSheetUploaded: false
        };
    }

    componentDidMount = () => {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let currPath = this.url.getCurrentPath();
        if (currPath.indexOf('?deleted=true') !== -1) {
            this.setState({ showDeleteSuccessMsg: true });
            this.url.set('/event/list');
        }
        if (currPath.indexOf('/event/list/createNew') !== -1) {
            this.goToCreate();
        }
        else {
            this.goToSearch();
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "createNew") {
            this.url.push(UrlHelpers.buildUrl(['/event', 'list', 'createNew']));
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/event', 'list']));
        }
    }


    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.ListEventsQuery_SortField>) {
        this.eventStore.setCurrent({ sort: options.sort, uiFilters: options.filters, statusFilters: null }, options.page, options.pageSize, false);
    }

    private EnsureCountries() {
        if (this.state.countries.state === LoadingStatus.Preload || this.state.countries.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
        return this.state.countries;
    }

    private EnsureEventTypes() {
        if (this.state.eventTypes.state === LoadingStatus.Preload || this.state.eventTypes.state === LoadingStatus.Stale) {
            connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
        }
        return this.state.eventTypes;
    }

    private EnsureEventStatuses() {
        if (this.state.eventStatuses.state === LoadingStatus.Preload || this.state.eventStatuses.state === LoadingStatus.Stale) {
            connect(new Apis.EventStatusApi().getAll(), this.state.eventStatuses, eventStatuses => this.setState({ eventStatuses }));
        }
        return this.state.eventStatuses;
    }

    private EnsureSecurityTypes() {
        if (this.state.securityTypes.state === LoadingStatus.Preload || this.state.securityTypes.state === LoadingStatus.Stale) {
            connect(new Apis.SecuritiesApi().getAll(), this.state.securityTypes, securityTypes => this.setState({ securityTypes }));
        }
        return this.state.securityTypes;
    }

    private EnsureCurrencies() {
        if (this.state.currencies.state === LoadingStatus.Preload || this.state.currencies.state === LoadingStatus.Stale) {
            connect(new Apis.CurrencyApi().getAll(false, true), this.state.currencies, currencies => this.setState({ currencies }));
        }
        return this.state.securityTypes;
    }

    private goToSearch() {
        this.EnsureEventStatuses();
        this.EnsureEventTypes();
        this.setPageState({
            pageMode: 'search',
            eventId: null,
            event: new Pending<Dtos.EventDto>(),
            edited: null,
            eventTypes: this.state.eventTypes,
            eventStatuses: this.state.eventStatuses,
            message: null,
            saveInProgress:false
        });
    }

    private goToCreate() {
        let newDto = this.initNewEvent();
        this.EnsureEventTypes();
        this.EnsureCountries();
        this.EnsureSecurityTypes();
        this.EnsureCurrencies();
        this.setPageState({
            pageMode: 'createNew',
            eventId: null,
            event: new Pending<Dtos.EventDto>(),
            edited: newDto,
            validation: new EventDtoValidator(newDto, false),
            message: null,
            eventTypes: this.state.eventTypes,
            eventStatuses: this.state.eventStatuses,
            saveInProgress: false
        });

    }

    private saveNewEvent() {
        let validation = new EventDtoValidator(this.state.edited, true);
        if (validation.isValid()) {
            this.setState({ saveInProgress: true});
            connect(new Apis.EventsApi().create(this.state.edited), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ saveInProgress: false, edited: this.state.edited, saveError: x.error, validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.eventStore.refresh();
                    window.location.href = '/event/view/' + x.data.id;
                }
            })
        }
        else {
            this.setState({ validation, saveError: null });
        }
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    countries={this.state.countries}
                    eventTypes={this.state.eventTypes}
                    securityTypes={this.state.securityTypes}
                    currencies={this.state.currencies}
                    event={this.state.edited}
                    saveError={this.state.saveError}
                    validation={this.state.validation}
                    onChange={(dto) => {
                        this.setState({
                            edited: dto,
                            validation: new EventDtoValidator(dto, this.state.validation.showValidationErrors())
                        });
                    }}
                    onCancel={() => this.goToSearch()}
                    saveInProgress={this.state.saveInProgress}
                    onSave={() => this.saveNewEvent()}
                />
            default:
                return <Search
                    canCreateEvent={this.props.canCreateEvent}
                    onCreateSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    events={this.eventStore.getCurrentData()}
                    onEventSelected={(event) => window.location.href = '/event/view/' + event.id}
                    currentFilter={this.eventStore.getCurrentFilter()}
                    eventTypes={this.state.eventTypes}
                    eventStatuses={this.state.eventStatuses}
                />;
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return <div><h1>Create Event</h1></div>
            default:
                return <div><h1>Events</h1></div>
        }
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private renderDeleteMessage() {
        return this.state.showDeleteSuccessMsg ? <Message type="success" message={"The event was deleted successfully"} qa="EventDeletedSuccessfullyMessage"/> : null;
    }

    render() {
        return (
            <div>
                {this.renderTitle()}
                {this.renderMessage()}
                {this.renderDeleteMessage()}
                {this.renderView()}
            </div>
        );
    }
}