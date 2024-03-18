import * as React from 'react'
import { Apis, Dtos } from '../../adr';
import { Loader, Pending, SimpleGridBuilder } from '../../classes';
import { IconButton } from '../../components';

interface Props {
    eventSummary: Pending<Dtos.BulkClaimUploadSummaryDto[]>
    eventDetails: Pending<Dtos.BulkClaimUploadDetailsDto[]>
    showSubmittedColumns: boolean;
    bulkClaimId: number;
}

interface State {
}

export class Summary extends React.Component<Props, State>
{
    render() {
        return (<div>
            <h2 data-qa="SubmittedReviewBulkClaim">{this.props.showSubmittedColumns ? 'Submitted' : 'Review Bulk Claim'}</h2>
            <div>
                <h3>Summary</h3>
                {this.renderSummaryGrid()}
            </div>
            {!this.props.showSubmittedColumns && <div style={{ paddingTop: 10 }}>
                <h3>By Event</h3>
                {this.renderEventDetailGrids()}
            </div>}
        </div>);
    }

    renderSummaryGrid() {
        return Loader.for(this.props.eventSummary, (eventSummary) => {
            let grid = SimpleGridBuilder.For(eventSummary)
                .addString("B#", m => m.bNumber, null, "BatchNumber", null)
                .addString("CUSIP", m => m.cusip, null, "Cusip", null)
                .addNumber("# of ADRs", m => m.numberOfAdrs, null, "NumberOfAdrs", null)
                .addNumber("Beneficial Owners", m => m.numberOfBeneficialOwners, null, "NumberOfBeneficialOwners", null)
                .withQA("SummaryGrid");

            if (this.props.showSubmittedColumns) {
                grid.addString("Status", m => m.batchClaimStatusName, null, "Status", null);
                grid.addString("Batch Claim Reference", m => m.batchClaimReferenceNumber, null, "BatchClaimReference", null);

                grid.addCustomColumn("",
                    (m) => <IconButton onClick={() => this.navigateToBatchClaim(m.batchClaimId)} icon="nav" size={16} color="black" qa=""/>,
                    m => m.batchClaimId, "object",
                    "NavigateToBatchClaim",
                    null,
                    { sortable: false, filterable: false, headerTemplate: "", width: 32 });
            }

            return grid.render()
        });
    }

    renderDetailsGrid(eventDetail: Dtos.BulkClaimUploadDetailsDto) {
        let grid = SimpleGridBuilder.For(eventDetail.categories)
            .addString("Category", m => m.categoryName, null, "Category",null)
            .addNumber("# of ADRs", m => m.numberOfAdrs, null, "NumberOfAdrs", null, { width: 125 })
            .addNumber("# of BOs", m => m.numberOfBeneficialOwners, null, "NumberOfBos", null, { width: 125 })
            .withQA("DetailsGrid")
            ;

        return (<div style={{ paddingTop: 10 }}>
            <h4>{eventDetail.bNumber} - {eventDetail.issuer} ({eventDetail.cusip})</h4>
            {grid.render()}
        </div>);
    }

    renderEventDetailGrids() {
        return Loader.for(this.props.eventDetails,
            (eventDetails) => <div>{eventDetails.map((m, i) => { return this.renderDetailsGrid(m) })}</div>
        );
    }

    private navigateToBatchClaim(batchClaimId: number) {
        window.location.href = '/claims/BatchClaimDetails/' + batchClaimId.toString() + '?backUrl=/bulkClaims/list?bulkClaimId=' + this.props.bulkClaimId;
    }
}