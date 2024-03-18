import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { IGridBuilderChangeArgs, PageableGridBuilder, Pending } from "../../classes";
interface SearchProps {
    canViewParticipantDetails: boolean
    participants: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.ParticipantSortField>): void }
    onParticipantSelected: { (participant: Dtos.ParticipantListSummaryDto): void };
    onAddSelected: { (): void };
    currentFilter: Dtos.ParticipantsListQuery;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        var gridPageSize = 10;

        var grid = PageableGridBuilder
            .ForPendingPage<Dtos.ParticipantListSummaryDto, Dtos.ParticipantSortField>(gridPageSize, this.props.participants, (options) => this.props.onPageChanged(options))
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .addExcelButton(() => new Apis.ParticipantsApi().exportUrl(this.props.currentFilter), "ExcelButton","ExportResultstoExcelButton")
            .addButton("Add Participant", () => this.props.onAddSelected(), {dataQA: "AddParticipant", pushRemainingRight: true})
            .addString("DTC Code", x => x.dtcCode, Dtos.ParticipantSortField.DtcCode, "DtcCode")
            .addString("Name", x => x.name, Dtos.ParticipantSortField.Name, "Name")
            .addString("Country", x => x.countryName, Dtos.ParticipantSortField.CountryLookup, "Country")
            .withQA("ParticipantGrid")
            ;

        if (this.props.canViewParticipantDetails) {
            grid.setRowChangeHandler(dto => this.props.onParticipantSelected(dto));
        }

        return grid.render();
    }

    render() {
        return this.renderGrid();
    }

}
