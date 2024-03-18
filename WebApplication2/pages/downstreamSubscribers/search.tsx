import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { PageableGridBuilder, Pending, IGridBuilderChangeArgs } from "../../classes";
interface SearchProps {
    canViewDownstreamSubscriber: boolean;
    canSearchDownstreamSubscriber: boolean;
    canAddDownstreamSubscriber: boolean;
    downstreamSubscribers: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>
    isGoalUser: boolean;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.ParticipantSortField>): void }
    onDownstreamSubscriberSelected: { (downSub: Dtos.ParticipantListSummaryDto): void };
    onAddSelected: { (): void };
    currentFilter: Dtos.ParticipantsListQuery;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const grid = PageableGridBuilder
            .ForPendingPage<Dtos.ParticipantListSummaryDto, Dtos.ParticipantSortField>(gridPageSize, this.props.downstreamSubscribers, (options) => this.props.onPageChanged(options))
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .withQA("Grid")
            .addString("Code", x => x.dtcCode, Dtos.ParticipantSortField.DtcCode, "Code", null, {width:300})
            .addString("Name", x => x.name, Dtos.ParticipantSortField.Name, "Name");
        this.props.isGoalUser && grid.addString("Participant DTC Code", x => x.parent.dtcCode, Dtos.ParticipantSortField.ParentCode, "ParticipantDTCCode", null, {width:200});
        this.props.isGoalUser && grid.addString("Participant Name", x => x.parent.name, Dtos.ParticipantSortField.ParentName, "ParticipantName");
        this.props.isGoalUser && grid.addExcelButton(() => new Apis.ParticipantsApi().exportUrl(this.props.currentFilter), "ExcelButton", "DownstreamSubscriberExcelButton");
        this.props.canAddDownstreamSubscriber && grid.addButton("Add Downstream Subscriber", () => this.props.onAddSelected(), { dataQA: "AddDownstreamSubscriberButton", pushRemainingRight: true});
        grid.setRowChangeHandler(dto => this.props.onDownstreamSubscriberSelected(dto));

        return grid.render();
    }

    render() {
        return this.props.canSearchDownstreamSubscriber
            ? this.renderGrid()
            : <p data-qa="NoPermissionToViewThisPage">No permission to view this page</p>;
    }

}