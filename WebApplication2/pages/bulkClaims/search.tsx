import * as React from 'react';
import { Dtos } from '../../adr';
import * as Framework from "../../classes";
import { TableHeaders } from '../../shared/constants';
import ParticipantName = Dtos.GetListBulkClaimsQuery_BulkClaimSortField.ParticipantName;

interface SearchProps {
    bulkClaims: Framework.Pending<Dtos.PagedResultDto<Dtos.BulkClaimSummaryDto>>
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetListBulkClaimsQuery_BulkClaimSortField>): void }
    onBulkClaimSelected: { (bulkClaim: Dtos.BulkClaimSummaryDto): void };
    currentFilter: Dtos.GetListBulkClaimsQuery;
    statusOptions: Framework.Pending<Dtos.EnumDisplayDto[]>;
    filingMethods: Framework.Pending<Dtos.EnumDisplayDto[]>;
    onCreate: { (): void };
    canCreate: boolean;
    isGoal: boolean;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetListBulkClaimsQuery_BulkClaimSortField;

        let combined = Framework.Pending.combine(this.props.statusOptions, this.props.filingMethods, (statuses, filters) => { return { statuses, filters } });

        return Framework.Loader.for(combined, loaded => {
            let statusOptions = loaded.statuses.map(x => x.label);
            let filingMethods = loaded.filters.map(x => x.label);

            let p = Framework.PageableGridBuilder
                .ForPendingPage<Dtos.BulkClaimSummaryDto, Dtos.GetListBulkClaimsQuery_BulkClaimSortField>(gridPageSize,
                    this.props.bulkClaims,
                    (options) => this.props.onPageChanged(options))
                .withQA("bulk-claims-list")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onBulkClaimSelected(dto));

            if (this.props.isGoal) {
                p.addString(TableHeaders.participant, x => x.dtcCode, sort.DtcCode, "DtcCode")
                    .addString(TableHeaders.participantName, x => x.participantName, ParticipantName, "ParticipantName")
            }

            p.addString(TableHeaders.bulkclaimReference, x => x.reference, sort.Reference, "BulkClaimReference")
                .addString(TableHeaders.countryOfIssuance, x => x.countryOfIssuance.countryName, sort.CountryOfIssuance, "CountryOfIssuance")
                .addDate(TableHeaders.adrRecordDate, x => x.date, sort.Date, "AdrRecordDate", null, { isDateOnly: true })
                .addString(TableHeaders.roundType, x => x.roundTypeName, sort.RoundType, "RoundType",null, { filterItems: filingMethods })
                .addString(TableHeaders.status, x => x.bulkClaimStatusName, sort.Status, "Status", null, { filterItems: statusOptions });

            if (this.props.canCreate) {
                p.addButton("Create Bulk Claim", () => this.props.onCreate(), { dataQA: "CreateBulkClaimButton", pushRemainingRight: true});
            }

            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }

}
