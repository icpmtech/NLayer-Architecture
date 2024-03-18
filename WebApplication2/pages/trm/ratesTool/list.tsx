import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { SimpleGridBuilder, PageableGridBuilder, Pending, Loader, FormBuilder, LoadingStatus, IGridBuilderChangeArgs } from '../../../classes';

interface EditProps {
    treatyRates: Pending<Dtos.TrmRateDto[]>
}

export class List extends React.Component<EditProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetWhtRateList_SortField;

        const p = SimpleGridBuilder
            .ForPending<Dtos.TrmRateDto>(this.props.treatyRates)
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .withQA("TrmRateGrid")
            .addString("Stock Type", x => x.stockTypeAdroitCode, null, "StockType")
            .addString("Entity Type", x => x.entityTypeName, null, "EntityType")
            .addDate("Effective Date", x => x.effectiveDate, null, "EffectiveDate")
            .addNumber("Tax Credit", x => x.taxCredit, null, "TaxCredit")
            .addPercentage("WHT Rate", x => x.withholdingRate, null, "WhtRate")
            .addPercentage("Treaty Rate", x => x.treatyRate, null, "TreatyRate")
            .addPercentage("Reclaim Rate", x => x.reclaimableRate, null, "ReclaimRate")
            .addString("Type", x => x.isAttestation ? "Attestation" : x.isExemption ? "Exemption" : "Standard", null, "Type")
            ;

        return p.render();
    }

    render() {
        return (
            <div>
                <h3>Treaty Rates</h3>
                {this.renderGrid()}
            </div>
        );
    }
}