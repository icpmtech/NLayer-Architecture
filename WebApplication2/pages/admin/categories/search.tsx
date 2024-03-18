import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { PageableGridBuilder, Pending, IGridBuilderChangeArgs, Loader } from "../../../classes";
import { TableHeaders } from '../../../shared/constants';

interface SearchProps {
    categories: Pending<Dtos.PagedResultDto<Dtos.CategorySummaryDto>>
    filingMethods: Pending<Dtos.FilingMethodDto[]>;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.CategorySortField>): void }
    onCategorySelected: { (category: Dtos.CategorySummaryDto): void };
    onAddSelected: { (): void };
    currentFilter: Dtos.CategorySearchQuery;
    canCreateCategory: boolean;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid(filingMethods: Dtos.FilingMethodDto[]) {
        const gridPageSize = 10;
        const sort = Dtos.CategorySortField;

        const p = PageableGridBuilder
            .ForPendingPage<Dtos.CategorySummaryDto, Dtos.CategorySortField>(gridPageSize, this.props.categories, (options) => this.props.onPageChanged(options))
            .withQA("goal-categories")
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .setRowChangeHandler(dto => this.props.onCategorySelected(dto))
            .addExcelButton(() => new Apis.CategoriesApi().exportUrl(this.props.currentFilter), "ExcelButton", "ExportToExcelButton")
            .addString(TableHeaders.countryOfIssuance, x => x.countryOfIssuance.countryName, sort.CountryOfIssuance, "CountryOfIssuanceInput")
            .addString(TableHeaders.filingMethod, x => x.filingMethod.name, sort.FilingMethod, "FilingMethodInput", null, { filterItems: filingMethods.map(x => x.name), selectAllFilter: false })
            .addString(TableHeaders.description, x => x.description, sort.Description, "DescriptionInput")
            .addPercentage(TableHeaders.reclaimRate, x => x.reclaimRate, sort.ReclaimRate, "ReclaimRateInput", { decimals: 4 })
            .addPercentage(TableHeaders.withholdingRate, x => x.whtRate, sort.WhtRate, "WithholdingRateInput", { decimals: 4 })
            .addString(TableHeaders.countriesOfResidence, x => x.countriesOfResidence, sort.CountriesOfResidence, "CountriesOfResidenceInput")
            .addString(TableHeaders.entityTypes, x => x.entityTypes, sort.EntityTypes, "EntityTypesInput");

        if (this.props.canCreateCategory)
            p.addButton("Create Category with Rules", () => this.props.onAddSelected(), { dataQA: "CreateCategoryWithRulesButton", pushRemainingRight: true})

        return p.render();
    }

    render() {
        return Loader.for(this.props.filingMethods, (filingMethods) => this.renderGrid(filingMethods));
    }

}
