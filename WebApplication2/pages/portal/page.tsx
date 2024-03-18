import * as React from 'react';
import { Pending, Loader, PageCache, PagedDataState, PageableGridBuilder } from '../../classes';
import { IconButton } from '../../components';
import { Apis, Dtos } from '../../adr';
import { RoundsList } from './roundsList';
import { History } from '../../classes/History';

interface PageProps {
    currentUserId: number;
}

interface PageState {
    batchClaimsData?: PagedDataState<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
}

export class Page extends React.Component<PageProps, PageState> {
    private urlHistory: History;
    private claimsCache: PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    private gridPageSize: number = 10;

    constructor(props: PageProps) {
        super(props);
        this.urlHistory = new History(false);

        this.claimsCache = new PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>(
            (filter, page, pageSize) => new Apis.ClaimsApi().getClaims(filter, page, pageSize),
            () => this.state.batchClaimsData,
            (batchClaimsData) => this.setState({ batchClaimsData })
        );

        this.state = {};
    }
    
    render() {
        let upcomingRoundsFixedFilters = [{
            field: Dtos.GetListEventRoundsQuery_SortField.RoundStartDate,
            values: [{ type: Dtos.FilterType.GreaterThan, isOr: false, options: [moment().add("day", 0).format("YYYY-MM-DD HH:mm")] }]
        }, {
            field: Dtos.GetListEventRoundsQuery_SortField.RoundStartDate,
            values: [{ type: Dtos.FilterType.LessThan, isOr: false, options: [moment().add("day", 31).format("YYYY-MM-DD HH:mm")] }]
        }, {
            field: Dtos.GetListEventRoundsQuery_SortField.RoundAvailability,
            values: [{ type: Dtos.FilterType.Equals, isOr: false, options: ["false"] }]
        }];

        let upcomingRoundsGridState = {
            sort: { field: Dtos.GetListEventRoundsQuery_SortField.RoundStartDate, asscending: true },
            filters: [],
            page: 1,
            pageSize: 5
        };

        let upcomingRoundsQuery = {
            eventId: null,
            liveEventsOnly: true,
            filingMethod: Dtos.FilingMethod.QuickRefund,
            sort: upcomingRoundsGridState.sort,
            uiFilters: upcomingRoundsFixedFilters
        };

        let closingRoundsFixedFilters = [{
            field: Dtos.GetListEventRoundsQuery_SortField.RoundEndDate,
            values: [{ type: Dtos.FilterType.GreaterThan, isOr: false, options: [moment().add("day", 0).format("YYYY-MM-DD")] }]
        }, {
            field: Dtos.GetListEventRoundsQuery_SortField.RoundEndDate,
            values: [{ type: Dtos.FilterType.LessThan, isOr: false, options: [moment().add("day", 31).format("YYYY-MM-DD")] }]
        }, {
            field: Dtos.GetListEventRoundsQuery_SortField.RoundAvailability,
            values: [{ type: Dtos.FilterType.Equals, isOr: false, options: ["true"] }]
        }];
        
        let closingRoundsGridState = {
            sort: { field: Dtos.GetListEventRoundsQuery_SortField.RoundEndDate, asscending: true },
            filters: [],
            page: 1,
            pageSize: 5
        };

        let closingRoundsQuery = {
            eventId: null,
            liveEventsOnly: true,
            filingMethod: Dtos.FilingMethod.QuickRefund,
            sort: closingRoundsGridState.sort,
            uiFilters: closingRoundsFixedFilters
        };

        return (<div>
            <h2>Adroit Dashboard</h2>

            <div className="row col-md-12">
                <div className="col-md-6">
                    <RoundsList key="roundsGrid1" query={upcomingRoundsQuery} gridState={upcomingRoundsGridState} fixedFilters={upcomingRoundsFixedFilters} title="Upcoming Rounds" showCreationButtons={false}/>
                </div>
                <div className="col-md-6">
                    <RoundsList key="roundsGrid2" query={closingRoundsQuery} gridState={closingRoundsGridState} fixedFilters={closingRoundsFixedFilters} title="Closing Rounds" showCreationButtons={true}/>
                </div>
            </div>

            <div className="col-md-12" style={{ paddingTop: "10px" }}>
                <h3 data-qa="OpenClaims">Open Claims</h3>
                {this.renderClaimsGrid()}
            </div>
        </div>);
    }

    componentDidMount() {
        let query = {
            uISort: { field: Dtos.GetAllBatchClaimsQuery_SortField.RoundClosingDate, asscending: true },
            uiFilters: [{ field: Dtos.GetAllBatchClaimsQuery_SortField.Status, values: [{ isOr: false, type: Dtos.FilterType.Equals, options: [Dtos.BatchClaimStatus.InPreparation.toString()] }] }]
        } as Dtos.GetAllBatchClaimsQuery;

        this.claimsCache.setCurrent(query, 1, this.gridPageSize, false);
    }

    private renderClaimsGrid() {
        let sort = Dtos.GetAllBatchClaimsQuery_SortField;

        const grid = PageableGridBuilder.ForPendingPage<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery_SortField>(
            this.gridPageSize,
            this.claimsCache.getCurrentData(),
            (options) => {
                let statusFilter = { field: Dtos.GetAllBatchClaimsQuery_SortField.Status, values: [{ isOr: false, type: Dtos.FilterType.Equals, options: [Dtos.BatchClaimStatus.InPreparation.toString()] }] };
                if (options.filters == null) options.filters = [];
                options.filters.push(statusFilter);
                this.claimsCache.setCurrent({ uiFilters: options.filters, uISort: options.sort, getParticipantDownstreamSubscribers: false }, options.page, options.pageSize, false);
            });

        grid.isFilterable()
            .isSortable()
            .isScrollable()
            .isResizable()
            
            .addString("Batch Claim #", m => m.claimReference, sort.ClaimReference, "BatchClaimNumber")
            .addString("CUSIP", m => m.cusip, sort.CUSIP, "Cusip")
            .addString("Country of Issuance", m => m.countryOfIssuance, sort.CountryOfIssuance, "CountryOfIssuance")
            .addDate("ADR Record Date", m => m.adrRecordDate, sort.AdrRecordDate, "AdrRecordDate")
            .addString("Filing Method", m => m.filingMethod, sort.FilingMethod, "FilingMethod")
            .addNumber("# of ADRs", m => m.numberOfAdrs, sort.NumberOfAdrs, "NumberOfADRs")
            .addNumber("# of BOs", m => m.numberOfBOs, sort.NumberOfBOs, "NumberOfBOs")
            .addString("Closes for Submission", x => moment().diff(x.roundClosingDate) > 0 ? "Round Closed" : moment(x.roundClosingDate).fromNow(), sort.RoundClosingDate, "ClosesForSubmission")
            .addCustomColumn("",
                (m) => <IconButton onClick={() => this.handleRowClick(m)} icon="nav" size={16} color={"black"} qa="ClickRowIcon"/>,
                m => m.claimId,
                "object",
                null,
                "Navigate",
                { sortable: false, filterable: false, headerTemplate: "", width: 32 })
            .withQA("ClaimsGrid");

        return grid.render();
    }

    handleRowClick = (claim: Dtos.ListBatchClaimsDto) => {
        let encodedUrl = this.urlHistory.getCurrentEncodedUrl();
        window.location.href = "/claims/BatchClaimDetails/" + claim.claimId + '?backUrl=' + encodedUrl;
    }
}