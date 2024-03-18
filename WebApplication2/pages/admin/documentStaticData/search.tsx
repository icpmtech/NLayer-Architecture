import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { PageableGridBuilder, Pending, IGridBuilderChangeArgs } from "../../../classes";

interface SearchProps {
    canEditDocumentStaticData: boolean;
    documents: Pending<Dtos.PagedResultDto<Dtos.DocumentStaticDataSummaryDto>>;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.DocumentStaticDataSortField>): void };
    onDocumentSelected: { (participant: Dtos.DocumentStaticDataSummaryDto): void };
    onAddSelected: { (): void };
    currentFilter: Dtos.DocumentStaticDataSearchQuery;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        var gridPageSize = 10;        
        var grid = PageableGridBuilder
            .ForPendingPage<Dtos.DocumentStaticDataSummaryDto, Dtos.DocumentStaticDataSortField>(gridPageSize, this.props.documents, (options) => this.props.onPageChanged(options))
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .setRowChangeHandler(dto => this.props.onDocumentSelected(dto))
            .addExcelButton(() => new Apis.DocumentStaticDataApi().exportUrl(this.props.currentFilter), "ExcelButton","ExportToExcelButton")
            .addString("Document Title", x => x.documentTitle, Dtos.DocumentStaticDataSortField.Title, "DocumentTitle")
            .addYesNo("Physical Required", x => x.physicalRequired, Dtos.DocumentStaticDataSortField.PhysicalRequired, "PhysicalRequired")
            .addString("Country of Issuance", x => x.countryOfIssuance.countryName, Dtos.DocumentStaticDataSortField.CountryOfIssuance, "CountryOfIssuance")
            .addString("Applies to", x => x.appliesToName, Dtos.DocumentStaticDataSortField.AppliesTo, "AppliesTo", null, { filterItems: ['Each Beneficial Owner','Batch Claim', 'Entity Group'], selectAllFilter: false })
            .addYesNo("System Generated form", x => x.systemGeneratedForm, Dtos.DocumentStaticDataSortField.SystemGeneratedForm, "SystemGeneratedForm")
            .withQA("Grid")
            ;

        if (this.props.canEditDocumentStaticData) {
            grid.addButton("Create Document Static Data", () => this.props.onAddSelected(), { dataQA: "CreateDocumentStaticDataButton", pushRemainingRight: true});
        }

        return grid.render();
    }

    render() {
        return this.renderGrid();
    }

}
