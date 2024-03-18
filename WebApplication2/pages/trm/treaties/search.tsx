import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { RequestClientMatrix } from './requestClientMatrix';

interface SearchProps {
    treaties: Framework.Pending<Dtos.PagedResultDto<Dtos.TreatySummaryDto>>
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    treatyTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetListTreatiesQuery_TreatiesSortField>): void }
    onTreatySelected: { (category: Dtos.TreatySummaryDto): void };
    onAddSelected: { (): void };
    onGtrsExport: { (expFormat: boolean): void };
    onClientMatrixExport: { (): void };
    statusOptions: Framework.Pending<Dtos.EnumDisplayDto[]>;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
}

export class Search extends React.Component<SearchProps, {}> {
    private popup: Framework.PopupBuilder;

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetListTreatiesQuery_TreatiesSortField;

        return Framework.Loader.for(this.props.statusOptions, loaded => {
            let statusToInclude = [Dtos.TrmEntityStatus.Draft, Dtos.TrmEntityStatus.AwaitingVerification];
            let filteredStatusOptions = this.props.statusOptions
                .map(x =>
                    x.filter(y =>
                        statusToInclude.indexOf(y.value) != -1)
                    .map(x => x.label))
                .data;

            const p = Framework.PageableGridBuilder
                .ForPendingPage<Dtos.TreatySummaryDto, Dtos.GetListTreatiesQuery_TreatiesSortField>(gridPageSize, this.props.treaties, (options) => this.props.onPageChanged(options))
                .withQA("trm-treaties")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onTreatySelected(dto))
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addString("Country of Residence", x => x.countryOfResidence.countryName, Dtos.GetListTreatiesQuery_TreatiesSortField.CountryOfResidence, "CountryOfResidence")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                .addPercentage("Dividend Rate", x => x.standardDividendRate, sort.StandardDividendRate, "DividendRate", { decimals: 4 })
                .addPercentage("Interest Rate", x => x.standardInterestRate, sort.StandardInterestRate, "InterestRate", { decimals: 4 })
                .addYesNo("Exceptions", x => x.hasExceptions, sort.HasExceptions, "Exceptions");
            if (this.props.showLiveRecords) {
                p.addYesNo("Current Treaty", x => x.isCurrentTreaty, sort.IsCurrentTreaty, "CurrentTreaty");
            } else {
                p.addString("Status", x => x.statusName, sort.Status, "Status", null, { filterItems: filteredStatusOptions });
            }

            if (!this.props.showLiveRecords)
                p.addButton("Create Treaty", () => this.props.onAddSelected(), { dataQA: "CreateTreatyButton"})

            if (this.props.showLiveRecords && !this.props.isTrmReadOnlyUser) {
                p.addButton("GTRS .CSV (Client) Export", () => this.props.onGtrsExport(false), { className: "btn-primary", dataQA: "CsvExportButton"})
                p.addButton("GTRS .EXP (GTRS Driver File) Export", () => this.props.onGtrsExport(true), { className: "btn-primary",dataQA: "ExpExportButton"})
            }

            if (this.props.showLiveRecords && !this.props.isTrmReadOnlyUser)
                p.addButton("Client Matrix", () => this.props.onClientMatrixExport(), { className: "float-start", dataQA: "ClientMatrixButton"});
        
            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }
}
