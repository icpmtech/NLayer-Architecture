import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from "../../../classes";

interface SearchProps {
    taxCredits: Framework.Pending<Dtos.PagedResultDto<Dtos.TaxCreditSummaryDto>>
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetListTaxCreditsQuery_TaxCreditsSortField>): void }
    onTaxCreditSelected: { (category: Dtos.TaxCreditSummaryDto): void };
    onAddSelected: { (): void };
    currentFilter: Dtos.GetListTaxCreditsQuery;
    statusOptions: Framework.Pending<Dtos.EnumDisplayDto[]>;
    showLiveRecords: boolean;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetListTaxCreditsQuery_TaxCreditsSortField;

        return Framework.Loader.for(this.props.statusOptions, loaded => {
            let statusToInclude = [Dtos.TrmEntityStatus.Draft, Dtos.TrmEntityStatus.AwaitingVerification];
            let filteredStatusOptions = this.props.statusOptions.map(x => x.filter(y => statusToInclude.indexOf(y.value) != -1).map(x => x.label)).data;

            const p = Framework.PageableGridBuilder
                .ForPendingPage<Dtos.TaxCreditSummaryDto, Dtos.GetListTaxCreditsQuery_TaxCreditsSortField>(gridPageSize, this.props.taxCredits, (options) => this.props.onPageChanged(options))
                .withQA("trm-tax-credits")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onTaxCreditSelected(dto))
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addString("Country of Residence", x => x.countryOfResidence.countryName, Dtos.GetListTaxCreditsQuery_TaxCreditsSortField.CountryOfResidence, "CountryOfResidence")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                .addPercentage("Dividend Rate", x => x.standardDividendRate, sort.StandardDividendRate, "DividendRate", { decimals: 4 })
                .addPercentage("Interest Rate", x => x.standardInterestRate, sort.StandardInterestRate, "InterestRate", { decimals: 4 })
                .addYesNo("Exceptions", x => x.hasExceptions, sort.HasExceptions, "Exceptions")

            if (this.props.showLiveRecords) {
                p.addYesNo("Current Tax Credit", x => x.isCurrentTaxCredit, sort.IsCurrentTaxCredit, "CurrentTaxCredit");
            } else {
                p.addString("Status", x => x.statusName, sort.Status, "Status", null, { filterItems: filteredStatusOptions });
            }

            if (!this.props.showLiveRecords)
                p.addButton("Create Tax Credit", () => this.props.onAddSelected(), { dataQA: "CreateTaxCreditButton", pushRemainingRight: true});

            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }
}
