import * as React from 'react';
import { Loader, Pending, PageCache, IGridBuilderChangeArgs, UrlHelpers } from "../../../classes";
import { PageableGridBuilder } from "../../../classes/pageableGridBuilder";
import { Dtos, Apis } from "../../../adr";
import { Depository, DepositoryString, DepositoryStringValues, IconButton } from '../../../components';
import { PopupBuilder } from "../../../classes/popupBuilder";
import { AddBatchClaimPopup, StartBatchClaimData } from "./AddBatchClaimPopup";
import { History } from '../../../classes/History';

interface PageProps {
    statuses: Dtos.BatchClaimStatusDto[];
    claimsStore: PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    onGridStateChange: (options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) => void;
    gridState: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
    showDtcCode: boolean;
    showDsCode: boolean;
    canCreateBatchClaim: boolean;
    createClaimUrl: string;
    selectClaimUrl: string;
    urlHistory: History;
    onCreateBatchClaim: () => void;
    getPartDs: boolean;
};

interface PageState {
};

export class BatchClaimsGrid extends React.Component<PageProps, PageState> {
    private gridPageSize: number = 20;

    handleRowClick = (claim: Dtos.ListBatchClaimsDto) => {
        let encodedUrl = this.props.urlHistory.getCurrentEncodedUrl();
        window.location.href = this.props.selectClaimUrl + '/' + claim.claimId + '?backUrl=' + encodedUrl;
    }

    render() {
        let sort = Dtos.GetAllBatchClaimsQuery_SortField;
            let grid = PageableGridBuilder.ForPendingPage<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery_SortField>(
                this.gridPageSize,
                this.props.claimsStore.getCurrentData(),
                (options) => {
                    this.props.claimsStore.setCurrent({ uiFilters: options.filters, uISort: options.sort, getParticipantDownstreamSubscribers: this.props.getPartDs }, options.page, options.pageSize, false);
                    this.props.onGridStateChange(options);
                }
            );

            grid.isFilterable()
                .setInitialState(this.props.gridState)
                .isSortable()
                .isScrollable()
                .isResizable()
                .addExcelButton(() => new Apis.ClaimsApi().getClaimsExportUrl(this.props.claimsStore.getCurrentFilter()), "ExcelButton", "ExportToExcelButton")
                .withQA("Grid");

            if (this.props.showDtcCode) {
                grid.addString("Participant", m => m.participantDtcCode, sort.DtcCode, "Participant");
            }

            if (this.props.showDsCode) {
                grid.addString("Downstream Subscriber Name", m => m.dsName, sort.DSName, "DownstreamSubscriberName");
            }

            grid.addString("Batch Claim #", m => m.claimReference, sort.ClaimReference, "BatchClaimNumber")
                .addString("Country of Issuance", m => m.countryOfIssuance, sort.CountryOfIssuance, "CountryOfIssuance")
                .addString("Participant Name", m => m.participantName, sort.ParticipantName, "ParticipantName", null, { width: 250 })
                .addString("Issuer", m => m.issuer, sort.Issuer, "Issuer")
                .addString("CUSIP", m => m.cusip, sort.CUSIP, "Cusip")
                .addCustomColumn("Depositary",
                    m => <Depository {...m}/>,
                    m => DepositoryString(m),
                    "string",
                    sort.Depositories,
                    "Depositary",
                    {
                        filterItems: DepositoryStringValues
                    })
                .addString("Filing Method", m => m.filingMethod, sort.FilingMethod, "FilingMethod")
                .addDate("ADR Record Date", m => m.adrRecordDate, sort.AdrRecordDate, "AdrRecordDate")
                .addNumber("# of BOs", m => m.numberOfBOs, sort.NumberOfBOs, "NumberOfBOs")
                .addNumber("# of ADRs", m => m.numberOfAdrs, sort.NumberOfAdrs, "NumberOfADRs")
                .addString("Status",
                    m => m.statusName,
                    sort.Status,
                    "Status",
                    null,
                    {
                        filterItems: this.props.statuses.map(s => s.name)
                    })
                .addCustomColumn("",
                    (m) => <IconButton qa="ViewBatchClaimDetailsIcon" onClick={m.canViewDetails ? () => this.handleRowClick(m) : () => { }} icon="nav" size={16} color={m.canViewDetails ? "black" : "grey"}/>,
                    m => m.claimId,
                    "object",
                    null,
                    "ViewDetails",
                    { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .withQA("BatchClaimsDetails");

            if (this.props.canCreateBatchClaim) {
                grid.addButton("Create Batch Claim", this.props.onCreateBatchClaim, {dataQA: "CreateBatchClaimButton", pushRemainingRight: true});
            }

            return grid.render();
    }
}