import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { PageableGridBuilder, Pending, Loader, FormBuilder, LoadingStatus, IGridBuilderChangeArgs } from '../../../classes';

interface EditProps {
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.GetListStatutesQuery_StatutesSortField>): void }
    statutes: Pending<Dtos.PagedResultDto<Dtos.StatuteSummaryDto>>
    onStatuteSelect: (dto) => void;
    onCreateSelected: () => void;
    onStatutesExport: () => void;
    statusOptions: Pending<Dtos.EnumDisplayDto[]>;
    qualifierTypeOptions: Pending<Dtos.EnumDisplayDto[]>;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
}

export class List extends React.Component<EditProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetListStatutesQuery_StatutesSortField;

        let combined = Pending.combine(this.props.statusOptions, this.props.qualifierTypeOptions, (statusOptions, qualifierOptions) => { return { statusOptions, qualifierOptions } });

        return Loader.for(combined, loaded => {
            let statusToInclude = [Dtos.TrmEntityStatus.Draft, Dtos.TrmEntityStatus.AwaitingVerification];
            let filteredStatusOptions = this.props.statusOptions.map(x => x.filter(y => statusToInclude.indexOf(y.value) != -1).map(x => x.label)).data;
            let filteredQualifierOptions = this.props.qualifierTypeOptions.map(x => x.filter(y => (x => x.label))).data;

            const p = PageableGridBuilder
                .ForPendingPage<Dtos.StatuteSummaryDto, Dtos.GetListStatutesQuery_StatutesSortField>(gridPageSize, this.props.statutes, (options) => this.props.onPageChanged(options))
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onStatuteSelect(dto.id))
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                .addString("Statute of Limitations",
                    x => (x.statuteOfLimitationsMonths ? (x.statuteOfLimitationsMonths >= 12 ? `${Math.floor(x.statuteOfLimitationsMonths / 12)} Years, ` : "") : "")
                        + (x.statuteOfLimitationsMonths ? `${x.statuteOfLimitationsMonths % 12} Months` : "")
                        + (x.statuteOfLimitationsDays && x.statuteOfLimitationsMonths ? ", " : "")
                        + (x.statuteOfLimitationsDays ? `${x.statuteOfLimitationsDays} Days` : ""), sort.StatuteOfLimitationMonths, "StatuteOfLimitations")
                .addString("Qualifier", x => x.qualifierTypeName, sort.QualifierType, "Qualifier")
                .addYesNo("Exceptions", x => x.hasExceptions, sort.HasExceptions, "Exceptions")
                .withQA("StatuteSummary")
                ;
            if (this.props.showLiveRecords) {
                p.addYesNo("Current Statute", x => x.isCurrentStatute, sort.IsCurrentStatute, "CurrentStatute");
            }
            else {
                p.addString("Status", x => x.statusName, sort.Status, "Status", null, { filterItems: filteredStatusOptions });
            }

            if (this.props.showLiveRecords && !this.props.isTrmReadOnlyUser) {
                p.addButton("Statutes Export", () => this.props.onStatutesExport(), { className: "btn-primary", dataQA: "StatutesExport" , pushRemainingRight: true});
            }

            if (!this.props.showLiveRecords)
                p.addButton("Create Statute", () => this.props.onCreateSelected(), { dataQA: "CreateStatute", pushRemainingRight: true});

            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }
}
