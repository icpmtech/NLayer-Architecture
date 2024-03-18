import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { PageableGridBuilder, IGridBuilderChangeArgs, Pending, SimpleGridBuilder } from '../../classes';
import { Dropdown } from '../../components';

interface Props {
    showUnattachedOnly: boolean;
    reconciliationItems: Pending<Dtos.PagedResultDto<Dtos.ReconciliationRecordDto>>;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField>): void }
    onRowUpdated: { (dto: Dtos.ReconciliationRecordDto): void }
}

export class ReconciliationGrid extends React.Component<Props, {}>
{
    render() {
        const gridPageSize = 200;
        const sort = null;

        const p = PageableGridBuilder
            .ForPendingPage<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField>(gridPageSize, this.props.reconciliationItems, (options) => this.props.onPageChanged(options))
            .isSortable()
            .isFilterable()
            .isScrollable()
            .setSaveHandler(i => { var item = this.props.reconciliationItems.data.items[i]; if (item) { this.props.onRowUpdated(item); } })
            .addString("Participant Name", x => x.participantName, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.ParticipantName, "ParticipantName", null, { width: "35%" })
            .addString("Participant Id", x => x.participantCode, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.ParticipantName, "ParticipantID", null)
            .withQA("Grid")
            ;

        if (this.props.showUnattachedOnly) {
            p.addString("Only found in", x => x.decisionName, null, "OnlyFoundIn");
        }

        else {
            const TypedDropdown = Dropdown as Newable<Dropdown<{ name: string, id: number}>>;

            var options = [{ name: "Adroit", id: Dtos.ReconciliationDecision.Adroit }, { name: "DTCC", id: Dtos.ReconciliationDecision.Dtcc }];

            p.addString("Category", x => x.categoryName, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.CategoryName, "Category", null)
                .addNumber("DTCC Quantity", x => x.dtccQuantity, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.DtcTotal, "DtccQuantity", null)
                .addNumber("Adroit Quantity", x => x.adroitQuantity, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.AdrTotal, "AdroitQuantity",null)
                .addCustomColumn("Correct Quantity", (m, i) => <TypedDropdown hasOptionsLabel={true} options={options} onChange={(v) => { m.decision = v ? v.id : null; this.props.onRowUpdated(m) }} value={options.find(x => x.id == m.decision)} qa="CorrectQuantityDropdown"/>,
                    null, null, Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField.Decision, "CorrectQuantity", null, null, null)
                ;
            
        }

        return p.render();
    }
}