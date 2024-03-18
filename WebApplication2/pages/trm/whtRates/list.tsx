import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { PageableGridBuilder, Pending, Loader, FormBuilder, LoadingStatus, IGridBuilderChangeArgs } from '../../../classes';

interface EditProps {
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.GetWhtRateList_SortField>): void }
    whtRates: Pending<Dtos.PagedResultDto<Dtos.WhtRateSummaryDto>>
    onRateSelect: (dto) => void;
    onCreateSelected: () => void;
    statusOptions: Pending<Dtos.EnumDisplayDto[]>;
    showLiveRecords: boolean;
}

export class List extends React.Component<EditProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetWhtRateList_SortField;

        return Loader.for(this.props.statusOptions, loaded => {
            let statusToInclude = [Dtos.TrmEntityStatus.Draft, Dtos.TrmEntityStatus.AwaitingVerification];
            let filteredStatusOptions = this.props.statusOptions.map(x => x.filter(y => statusToInclude.indexOf(y.value) != -1).map(x => x.label)).data;

            const p = PageableGridBuilder
                .ForPendingPage<Dtos.WhtRateSummaryDto, Dtos.GetWhtRateList_SortField>(gridPageSize, this.props.whtRates, (options) => this.props.onPageChanged(options))
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onRateSelect(dto.id))
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                .addPercentage("Dividend Rate", x => x.dividendRate, sort.DividendRate, "DividendRate", { decimals: 4 })
                .addPercentage("Interest Rate", x => x.interestRate, sort.InterestRate, "InterestRate",{ decimals: 4 })
                .addYesNo("Exceptions", x => x.hasExceptions, sort.HasExceptions, "Exceptions")
                .withQA("Grid")

                if (this.props.showLiveRecords) {
                    p.addYesNo("Current Withholding Rate", x => x.isCurrentWhtRate, sort.IsCurrentWhtRate, "CurrentWithholdingRate");
                } else {
                    p.addString("Status", x => x.statusName, sort.Status, "Status", null, { filterItems: filteredStatusOptions })
                        .addButton("Create Withholding Rate", () => this.props.onCreateSelected(), { dataQA: "CreateWithholdingRate", pushRemainingRight: true});
                }

            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }
}
