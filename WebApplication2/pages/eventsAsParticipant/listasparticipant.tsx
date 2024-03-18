import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { connect, IGridBuilderChangeArgs, Loader, PageableGridBuilder, PageCache, PagedDataState, Pending } from "../../classes";
import { ImportantNoticeLink } from './../../components/gridRowActions/importantNoticeLink';

interface PageState {
    eventList?: PagedDataState<Dtos.EventSummaryDto, Dtos.ListEventsQuery>;
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
};

export class ListAsParticipant extends React.Component<{}, PageState> {
    private eventStore: PageCache<Dtos.EventSummaryDto, Dtos.ListEventsQuery>;
    private statusFilters: string[];

    constructor() {
        super();

        this.state = { eventTypes: new Pending<Dtos.EventTypeDto[]>() };
        this.statusFilters = ["Live", "Closed", "Canceled", "Unavailable"];
        this.eventStore = new PageCache<Dtos.EventSummaryDto, Dtos.ListEventsQuery>(
            (query, page, pageSize) => new Apis.EventsApi().search(query, page, pageSize),
            () => this.state.eventList,
            (eventList) => this.setState({ eventList })
        );
    }

    componentDidMount() {
        connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.ListEventsQuery_SortField>) {
        this.eventStore.setCurrent({ sort: options.sort, uiFilters: options.filters, statusFilters: null }, options.page, options.pageSize, false);
    }

    renderGrid() {
        var gridPageSize = 10;
        return Loader.for(this.state.eventTypes, eventTypes => {
            return PageableGridBuilder
                .ForPendingPage<Dtos.EventSummaryDto, Dtos.ListEventsQuery_SortField>(gridPageSize, this.eventStore.getCurrentData(), (options) => this.onGridChanged(options))
                .withQA("participant-events")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(x => window.location.href = '/claims/listparticipant?EventId=' + x.id)
                .addString("Country of Issuance", x => x.countryofIssuance.countryName, Dtos.ListEventsQuery_SortField.CountryOfIssuance, "CountryOfIssuance", null)
                .addString("CUSIP #", x => x.cusip, Dtos.ListEventsQuery_SortField.Cusip, "Cusip")
                .addString("Issuer", x => x.issuer, Dtos.ListEventsQuery_SortField.Issuer, "Issuer")
                .addString("Event Type", x => x.eventType.name, Dtos.ListEventsQuery_SortField.EventType, "EventType", null, { filterItems: eventTypes.map(status => status.name), selectAllFilter: false })
                .addString("B#", x => x.bNum, Dtos.ListEventsQuery_SortField.BNum, "BatchNumber")
                .addDate("Record Date", x => x.adrRecordDate, Dtos.ListEventsQuery_SortField.AdrRecordDate, "AdrRecordDate")
                .addString("Status", x => x.statusName, Dtos.ListEventsQuery_SortField.EventStatus, "Status", null, { filterItems: this.statusFilters, selectAllFilter: false })
                .addCustomColumn("Important Notice", x => <ImportantNoticeLink {...x} />, () => null, null, null, "ImportantNotice", null)
                .render();
        })
    };


    render() {
        return (
            <div>
                <h1 data-qa="EventListAsParticipant">Events</h1>
                {this.renderGrid()}
            </div>
        );
    }
}



