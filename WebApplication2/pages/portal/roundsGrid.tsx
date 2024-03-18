import * as React from 'react';
import { Pending, PageableGridBuilder, IGridBuilderChangeArgs } from '../../classes';
import { Apis, Dtos } from '../../adr';

interface Props {
    rounds: Pending<Dtos.PagedResultDto<Dtos.EventWithRoundDetailsDto>>;
    showCreationButtons: boolean;
    gridState: IGridBuilderChangeArgs<Dtos.GetListEventRoundsQuery_SortField>;
    onGridChange: (options: IGridBuilderChangeArgs<Dtos.GetListEventRoundsQuery_SortField>) => void;
} 

export class RoundsGrid extends React.Component<Props, {}>
{
    render() {
        const grid = PageableGridBuilder
            .ForPendingPage<Dtos.EventWithRoundDetailsDto, Dtos.GetListEventRoundsQuery_SortField>(5,
                this.props.rounds,
                (options) => {this.props.onGridChange(options)}
            );

        grid.isFilterable()
            .setInitialState(this.props.gridState)
            .isSortable()
            .addString("CUSIP", x => x.cusip, Dtos.GetListEventRoundsQuery_SortField.Cusip, "Cusip")
            .addString("Country of Issuance", x => x.countryOfIssuance.countryName, Dtos.GetListEventRoundsQuery_SortField.CountryOfIssuance, "CountryOfIssuance")
            .addDate("Record Date", x => x.adrRecordDate, Dtos.GetListEventRoundsQuery_SortField.AdrRecordDate, "RecordDate", null)
            .withQA("EventWithRoundDetailsGrid")
            ;

        if (this.props.showCreationButtons) {
            grid.addDate("End Date", x => x.roundEndDate, null, "EndDate", null, {filterable: false});
            grid.addString("Closes", x => moment(x.roundEndDate).fromNow(), null, "Closes");
            grid.addCustomColumn(" ", x => <div className="btn-link" onClick={() => this.createBatchClaim(x.eventId)}>Start Claim</div>, (m) => null, null, null, "StartClaim", null);
        }
        else {
            grid.addString("Opens for Submission", x => moment(x.roundStartDate).fromNow(), null, "OpensForSubmission");
        }

        return grid.render();
    }

    createBatchClaim(eventId: number) {
        window.location.href = "/claims/workflow?eventId=" + eventId;
    }
}