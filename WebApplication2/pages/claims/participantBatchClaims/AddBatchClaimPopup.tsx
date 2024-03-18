import * as React from 'react';
import { connect, Loader, SimpleGridBuilder, IGridBuilderChangeArgs, PagedDataState, PageableGridBuilder, PageCache, Pending, LoadingStatus } from '../../../classes';
import { AutoComplete, Message } from '../../../components';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';

export interface StartBatchClaimData {
    participantId: number;
    eventId: number;
};

interface PopupProps {
    success: { (data: StartBatchClaimData): void };
    close: { (): void };
    onDataLoaded: { (): void };
};

interface PopupState {
    selected?: StartBatchClaimData;
    selectedDS?: StartBatchClaimData;
    participants?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    downstreamSubscribers?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    eventList?: PagedDataState<Dtos.EventSummaryDto, Dtos.ListEventsQuery>;
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
    eventStatuses?: Pending<Dtos.EventStatusDto[]>;
    submitted?: boolean;
    dsHasPosition?: boolean;
};

export class AddBatchClaimPopup extends React.Component<PopupProps, PopupState> {

    private eventStore: PageCache<Dtos.EventSummaryDto, Dtos.ListEventsQuery>;

    constructor(props: PopupProps) {
        super(props);
        this.state = {
            selected: {} as StartBatchClaimData,
            selectedDS: { participantId: null } as StartBatchClaimData,
            participants: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(),
            downstreamSubscribers: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(),
            eventTypes: new Pending<Dtos.EventTypeDto[]>(),
            eventStatuses: new Pending<Dtos.EventStatusDto[]>(),
            submitted: false,
            dsHasPosition: false
        }

        this.eventStore = new PageCache<Dtos.EventSummaryDto, Dtos.ListEventsQuery>(
            (query, page, pageSize) => new Apis.EventsApi().search(query, page, pageSize),
            () => this.state.eventList,
            (eventList) => { this.setState({ eventList }); this.props.onDataLoaded(); }
        );
    }

    componentDidMount() {
        let participantQuery: Dtos.ParticipantsListQuery = {
            includeParticipants: true,
            includeDownstreamSubscribers: false,
            sort: { field: Dtos.ParticipantSortField.Name, asscending: true },
            uiFilters: null
        };

        connect(new Apis.ParticipantsApi().search(participantQuery, 1, 10000), this.state.participants, participants => this.setState({ participants }));
        connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
        connect(new Apis.EventStatusApi().getAll(), this.state.eventStatuses, eventStatuses => this.setState({ eventStatuses }));
        this.displayDSsubscribers(null);
    }

    handleParticipantChange(participant: Dtos.ParticipantListSummaryDto) {
        let selected = this.state.selected;
        let id = (!!participant && !!participant.id) ? participant.id : null;
        selected.participantId = id;
        this.setState({ selected: selected, selectedDS: { participantId: null } as StartBatchClaimData });
        this.displayDSsubscribers(participant.id);
    }

    handleParticipantClear() {
        this.setState( prevState => ({
            selected:{ ...prevState.selected, participantId: null},
            selectedDS: { ...prevState.selectedDS, participantId: null}
        }));
        this.displayDSsubscribers(null);
    }

    handleDSChange(participant: Dtos.ParticipantListSummaryDto) {
        let selected = this.state.selectedDS;
        let id = (!!participant && !!participant.id) ? participant.id : null;
        selected.participantId = id;
        this.setState({ selectedDS: selected });

        this.downstreamSubscriberPositionCheck(selected, false);
    }

    handleDsClear() {
        this.setState( prevState => ({
            selectedDS:{ ...prevState.selectedDS, participantId: null}
        }));
    }

    handleEventChange(event: Dtos.EventSummaryDto) {
        let selected = this.state.selected;
        let selectedDS = this.state.selectedDS;
        selected.eventId = event.id;
        selectedDS.eventId = event.id;
        this.setState({ selected, selectedDS });

        this.downstreamSubscriberPositionCheck(selectedDS, false);
    }

    handleSubmit = () => {
        let selected = this.state.selected;
        let selectedDS = this.state.selectedDS;

        this.setState({ submitted: true });

        if (!!selectedDS.eventId && !!selectedDS.participantId) {
            this.downstreamSubscriberPositionCheck(selectedDS, true);                
        }

        else if (!!selected.eventId && !!selected.participantId) {
            this.createBatchClaim(selected);
        }
    }

    private downstreamSubscriberPositionCheck(downstreamSubscriber: StartBatchClaimData, startClaim: boolean) {
        var t = new Apis.ParticipantClaimSummaryApi().getClaimedAdrPositionSummaryForEventId({ eventId: downstreamSubscriber.eventId, participantId: downstreamSubscriber.participantId, includeInPreparationClaims: false, includeInPrepClaim: null });

        t.done((d) => {
            this.setState({ dsHasPosition: d.maxPositions > 0 });
            
            if (startClaim && this.state.dsHasPosition)
                this.createBatchClaim(downstreamSubscriber);
        });
    }

    private createBatchClaim(participant: StartBatchClaimData) {
        this.props.success(participant);
    }

    private displayDSsubscribers(parentId: number) {
        if (!parentId) {
            this.setState({ downstreamSubscribers: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(LoadingStatus.Done, 
                { pageSize: 0, count: 0, items: [], page: 0, totalCount: 0, totalPages: 0 })
            });
            return;
        }
        let dtcQuery: Dtos.ParticipantsListQuery = {
            includeParticipants: false,
            includeDownstreamSubscribers: true,
            sort: { field: Dtos.ParticipantSortField.Name, asscending: true },
            uiFilters: [
                { field: Dtos.ParticipantSortField.ParentId, values: [{ type: Dtos.FilterType.Equals, isOr: false, options: [parentId.toString()] }] }
            ]
        };
        connect(
            new Apis.ParticipantsApi().search(dtcQuery, 1, 10000),
            this.state.downstreamSubscribers,
            downstreamSubscribers => {
                if (!downstreamSubscribers.data) {
                    downstreamSubscribers.data = { pageSize: 10, count: 1, items: [], page: 1, totalCount: 1, totalPages: 1 };
                }
                if (!downstreamSubscribers.data.items) {
                    downstreamSubscribers.data.items = [];
                }
                this.setState({ downstreamSubscribers });
            }
        );
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.ListEventsQuery_SortField>) {
        this.eventStore.setCurrent(
            {
                sort: options.sort,
                uiFilters: options.filters,
                statusFilters: [Dtos.EventStatusLookup_Status.Live, Dtos.EventStatusLookup_Status.Unavailable]
            },
            options.page,
            options.pageSize,
            false
        );
    }

    renderParticipantField() {
        return Loader.for(this.state.participants.map(x => x.items), participants => {
            const TypedAutoComplete = AutoComplete as Newable<AutoComplete<Dtos.ParticipantListSummaryDto>>;
            return <TypedAutoComplete
                options={participants}
                onChange={value => this.handleParticipantChange(value)}
                map={m => m.dtcCode + " - " + m.name}
                value={participants.find(p => p.id === this.state.selected.participantId)}
                onClear={() => this.handleParticipantClear()}
                qa="ParticipantTypedAutoComplete"
            />
        });
    }

    renderDSField() {
        return Loader.for(this.state.downstreamSubscribers.map(x => x.items), ds => {
            const TypedAutoComplete = AutoComplete as Newable<AutoComplete<Dtos.ParticipantListSummaryDto>>;
            return <TypedAutoComplete
                options={ds}
                onChange={value => this.handleDSChange(value)}
                map={m => (m.dtcCode == "" ? "" : (m.dtcCode + " - ")) + m.name}
                value={ds.find(p => p.id === this.state.selectedDS.participantId)}
                onClear={() => this.handleDsClear()}
                qa="DsFieldTypedAutoComplete"
            />
        });
    }

    renderEventsGrid() {
        let gridPageSize = 10;
        let pending = this.state.eventStatuses.and(this.state.eventTypes, (eventStatuses, eventTypes) => { return { eventStatuses, eventTypes } });
        return Loader.for(pending, p => {
            return PageableGridBuilder
                .ForPendingPage<Dtos.EventSummaryDto, Dtos.ListEventsQuery_SortField>(gridPageSize, this.eventStore.getCurrentData(), (options) => this.onGridChanged(options))
                .isSortable()
                .isScrollable()
                .isResizable()
                .isFilterable()
                .setRowChangeHandler(x => this.handleEventChange(x))
                .highlight(x => !!x.id && x.id === this.state.selected.eventId)
                .addString("Country of Issuance", x => x.countryofIssuance.countryName, Dtos.ListEventsQuery_SortField.CountryOfIssuance, "CountryOfIssuance")
                .addString("CUSIP #", x => x.cusip, Dtos.ListEventsQuery_SortField.Cusip, "Cusip")
                .addString("Issuer", x => x.issuer, Dtos.ListEventsQuery_SortField.Issuer, "Issuer")
                .addString("Event Type", x => x.eventType.name, Dtos.ListEventsQuery_SortField.EventType, "EventType",null, { filterItems: p.eventTypes.map(type => type.name), selectAllFilter: false })
                .addString("B#", x => x.bNum, Dtos.ListEventsQuery_SortField.BNum, "BatchNumber")
                .addDate("ADR Record Date", x => x.adrRecordDate, Dtos.ListEventsQuery_SortField.AdrRecordDate, "AdrRecordDate")
                .addString("Status", x => x.statusName, Dtos.ListEventsQuery_SortField.EventStatus, "Status", null, { filterItems: ['Live', 'Unavailable'], selectAllFilter: false })
                .withQA("EventsGrid")
                .render();
        })
    };

    render() {
        return (
            <div className="popup-container large">
                <Message type="alert" message="Please select a Participant" hide={!this.state.submitted || !!this.state.selected.participantId} qa="PleaseSelectAParticipantMessage"/>
                <Message type="alert" message="Please select an Event" hide={!this.state.submitted || !!this.state.selected.eventId} qa="PleaseSelectAnEventMessage"/>
                <Message type="alert" message="The downstream subscriber does not have a position defined for the selected event" hide={!this.state.selectedDS.eventId || !this.state.submitted || !this.state.selectedDS.participantId || this.state.dsHasPosition} qa="NoDownstreamSubscriberPositionDefinedMessage"/>

                <div className="mb-3">
                    <span className="col-form-label form-label">Select Participant</span>
                    <div className="row">
                        <div className="col-md-6" data-qa="SelectParticipant">
                            {this.renderParticipantField()}
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <span className="col-form-label form-label">Select Downstream Subscriber</span>
                    <div className="row">
                        <div className="col-md-6" data-qa="SelectDownstreamSubscriber">
                            {this.renderDSField()}
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <span className="col-form-label form-label" data-qa="SelectEvent">Select Event</span>
                    {this.renderEventsGrid()}
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={this.props.close} data-qa="CloseButton">Close</button>
                    <button className="btn btn-primary" onClick={this.handleSubmit} data-qa="ContinueButton">Continue</button>
                </div>
            </div>
        );
    }
}