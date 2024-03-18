import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { IGridBuilderChangeArgs, Loader, PageableGridBuilder, Pending } from "../../classes";
interface SearchProps {
    canCreateEvent: boolean
    events: Pending<Dtos.PagedResultDto<Dtos.EventDto>>;
    eventTypes: Pending<Dtos.EventTypeDto[]>;
    eventStatuses?: Pending<Dtos.EventStatusDto[]>;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.ListEventsQuery_SortField>): void };
    onEventSelected: { (participant: Dtos.ParticipantListSummaryDto): void };
    onCreateSelected: { (): void };
    currentFilter: Dtos.ListEventsQuery;
}

export class Search extends React.Component<SearchProps, {}> {

    render() {
        let gridPageSize = 10;
        let pending = this.props.eventStatuses.and(this.props.eventTypes, (eventStatuses, eventTypes) => { return { eventStatuses, eventTypes } });

        return Loader.for(pending, p => {
            const grid = PageableGridBuilder
                .ForPendingPage<Dtos.EventDto, Dtos.ListEventsQuery_SortField>(gridPageSize, this.props.events, (options) => this.props.onPageChanged(options))
                .withQA("goal-events")
                .isSortable()
                .isScrollable()
                .isResizable()
                .isFilterable()
                .setRowChangeHandler(x => window.location.href = '/event/view/' + x.id)
                .addExcelButton(() => new Apis.EventsApi().downloadUrl(this.props.currentFilter), "ExcelButton","ExportToExcelButton")
                .addString("Country of Issuance", x => x.countryofIssuance.countryName, Dtos.ListEventsQuery_SortField.CountryOfIssuance, "countryOfIssuance")
                .addString("CUSIP #", x => x.cusip, Dtos.ListEventsQuery_SortField.Cusip, "cusip")
                .addString("Issuer", x => x.issuer, Dtos.ListEventsQuery_SortField.Issuer, "issuer")
                .addString("Event Type", x => x.eventType && x.eventType.name, Dtos.ListEventsQuery_SortField.EventType, "eventType",null, { filterItems: p.eventTypes.map(type => type.name), selectAllFilter: false })
                .addString("B#", x => x.bNum, Dtos.ListEventsQuery_SortField.BNum, "batchNumber")
                .addDate("Record Date", x => x.adrRecordDate, Dtos.ListEventsQuery_SortField.AdrRecordDate, "adrRecordDate")
                .addString("Status", x => x.statusName, Dtos.ListEventsQuery_SortField.EventStatus, "status", null, { filterItems: p.eventStatuses.map(status => status.name), selectAllFilter: false })
                .withQA("GoalEventsGrid")
                ;
            if (this.props.canCreateEvent) {
                grid.addButton("Create Event", this.props.onCreateSelected, {dataQA:"CreateEventButton", pushRemainingRight: true, });
            }
            return grid.render();
        })
    }
}
