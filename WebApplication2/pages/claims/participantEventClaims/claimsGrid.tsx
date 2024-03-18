import * as React from 'react';
import { Dtos } from '../../../adr';
import { IGridBuilderChangeArgs, Loader, PageableGridBuilder, Pending } from "../../../classes";
import { CancelButton } from '../../../components/gridRowActions/cancelButton';


interface GridProps {
    canStartclaim: boolean;
    canStartClaimForDownstreamSubscriber: boolean;
    canViewDSPositions: boolean;
    claims: Pending<Dtos.PagedResultDto<Dtos.ParticipantEventClaimSummaryDto>>;
    event: Pending<Dtos.EventDto>;
    eventStatuses: Pending<Dtos.BatchClaimStatusDto[]>;
    onCancelClicked?: (claim: Dtos.ParticipantEventClaimSummaryDto) => void;
    onExcelExport?: () => string;
    onExcelExportAll?: () => string;
    onPageChanged: { (options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField>): void };
    onRowSelected?: (claim: Dtos.ParticipantEventClaimSummaryDto) => void;
    onStartClaimClicked?: () => void;
    onViewPositions?: () => void;
    downstreamSubscriber: Pending<Dtos.ParticipantDto>;
}

export class ClaimsGrid extends React.Component<GridProps, {}> {
    componentDidUpdate() {
        this.setStatusTooltips();
    }

    private setStatusTooltips() {
        $(".react-grid").kendoTooltip({
            content: (e) => {
                var gridCell = e.target && !!e.target[0] ? e.target[0] : null;
                var cellText = gridCell && !!gridCell.innerText ? gridCell.innerText : "";
                return this.getStatusTooltip(cellText) || "No additional status info available";
            },
            filter: "div[data-has-status-tooltip='true']",
            position: "right"
        });
    }

    private getStatusTooltip(status: string) {
        var statusTooltips = {
            "In Preparation": "Draft not submitted to Goal yet. Takes position from the overall Participant position",
            "Canceled": "Draft canceled and never submitted to Goal. Does not take position from the overall Participant position",
            "Submitting": "Submitted to Goal. Running ADROIT&trade; checks",
            "Submitted": "Submitted to Goal and pending Goal's initial review",
            "In Process": "Waiting for the participant to submit documents or Goal to review",
            "Filed": "Filed to the Tax Authorities",
            "Rejected": "Rejected by Goal"
        };
        return statusTooltips[status];
    }

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField;

        var combined = Pending.combine(
            this.props.eventStatuses,
            this.props.downstreamSubscriber,
            this.props.event,
            (statuses, ds, event) => { return { statuses, ds, event } }
        );

        return Loader.for(combined, all => {
            const grid = PageableGridBuilder
                .ForPendingPage<Dtos.ParticipantEventClaimSummaryDto, Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField>(gridPageSize, this.props.claims, (options) => this.props.onPageChanged(options))
                .withQA("ParticipantClaims")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(x => this.props.onRowSelected(x))
                .addExcelButton(() => this.props.onExcelExport(), "ExcelButton", "ExcelButton")
                .addCustomExcelButton("Export Elections Summary", () => this.props.onExcelExportAll(), "ExportElectionsSummaryExcelButton")
                .addString("Filing Method", x => x.filingMethod, sort.FilingMethod, "FilingMethod")
                .addString("Batch Claim #", x => x.batchClaimNumber, sort.BatchClaimNumber, "BatchClaimNumber",null, { width: 140 })
                .addNumber(all.event.securityType === Dtos.SecurityType.CommonStock ? "Shares Claimed" : "ADRs Claimed", x => x.adrClaimed, sort.AdrClaimed, "SharesADRsClaimed", null, { width: 140 })
                .addString("# Beneficial Owners", x => (x.countOfBeneficalOwners == null ? "n/a" : x.countOfBeneficalOwners.toString()), sort.CountOfBeneficalOwners, "NumberOfBeneficialOwners",null, { width: 160 })
                .addString("Created By", x => x.createdBy, sort.CreatedBy, "CreatedBy", null, { width: 150 })
                .addDateTime("Submission Date", x => x.submitedOn, sort.SubmitedAt, "SubmissionDate")
                .addCustomColumn("Status", x => <div data-has-status-tooltip="true">{x.status}</div>, () => null, "string", sort.Status, "Status", { filterItems: all.statuses.map(x => x.name), selectAllFilter: false, sortable: true, width: 95 });

            if (!all.ds || (all.ds.canCancelClaims))
                grid.addCustomColumn(" ", x => CancelButton({ dto: x, clickHandler: (claim) => this.props.onCancelClicked(claim), disabled: !x.userCanCancel, dtoName: "Claim", qa:"CancelButton"}), () => null, null, null, "CancelClaim", { width: 53, });

            let pushRemainingRight = true;

            if (this.props.canViewDSPositions === true) {
                grid.addButton("View Downstream Subscriber Positions", () => this.props.onViewPositions(), { dataQA: "ds-positions-button", pushRemainingRight });
                pushRemainingRight = false;
            }

            if (this.props.canStartclaim === true) {
                if (!all.ds || (all.ds.canManageClaims && this.props.canStartClaimForDownstreamSubscriber)) {
                    grid.addButton("Start New Claim", () => this.props.onStartClaimClicked(), {dataQA: "StartNewClaimButton", pushRemainingRight });
                }                    
            }

            return grid.render();
        });
    };

    render() {
        return this.renderGrid();
    }

}