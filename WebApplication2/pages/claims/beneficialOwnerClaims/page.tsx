import * as React from 'react';
import { connect, PageableGridBuilder, PopupBuilder, Pending, UrlState, Loader, PagedDataState, PageCache, IGridBuilderChangeArgs } from '../../../classes';
import { History } from '../../../classes/History';

import * as Form from '../../../components';
import { UpdateClaimStatus } from '../beneficialOwnerDetails/updateClaimStatus';
import { Dtos, Apis } from '../../../adr';

interface PageState {
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
    statuses?: Pending<Dtos.BenownerClaimStatusDto[]>;
    beneficialOwnerData?: PagedDataState<Dtos.BeneficialOwnerSearchResultDto, Dtos.BeneficialOwnerSearchQuery>;
    updateSuccess?: boolean;
    gridState?: IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>;
};

interface PageProps {
    canUpdateBeneficialOwnerStatus: boolean;
    excelExportLimit: number;
};

export class BeneficialOwnerClaims extends React.Component<PageProps, PageState> {
    private popup: PopupBuilder;
    private selected: Dtos.BeneficialOwnerSearchResultDto[] = [];
    private benOwnerClaimsApi: Apis.BeneficialOwnersApi;
    private pageCache: PageCache<Dtos.BeneficialOwnerSearchResultDto, Dtos.BeneficialOwnerSearchQuery>;
    private gridPageSize: number;
    private urlHistory: History;
    private url: UrlState<IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>> = new UrlState<IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>>();

    constructor(props: PageProps) {
        super(props);

        this.urlHistory = new History(false);

        this.benOwnerClaimsApi = new Apis.BeneficialOwnersApi();
        this.gridPageSize = 100;
        this.state = {
            eventTypes: new Pending<Dtos.EventTypeDto[]>(),
            statuses: new Pending<Dtos.BenownerClaimStatusDto[]>(),
            updateSuccess: false,
            gridState: this.url.read()
        };
        
        this.pageCache = new PageCache<Dtos.BeneficialOwnerSearchResultDto, Dtos.BeneficialOwnerSearchQuery>(
            (query, page, pageSize) => this.benOwnerClaimsApi.search(query, page, pageSize),
            () => this.state.beneficialOwnerData,
            (beneficialOwnerData) => this.setState({ beneficialOwnerData })
        );
    }
    
    componentWillMount() {
        connect(new Apis.BeneficialOwnerClaimStatusesApi().getAll(), this.state.statuses, statuses => this.setState({ statuses }));
        connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
    }

    disableExcelExport = (): boolean => {
        let currentData = this.pageCache.getCurrentData();
        if (currentData.data && currentData.data.totalCount > this.props.excelExportLimit) {
            return true;
        }
        return false;
    }

    handleUpdatePopup = () => {
        this.popup = new PopupBuilder();
        this.popup
            .setTitle("Update Status")
            .setContent(<UpdateClaimStatus
                bulk={true}
                onClose={() => this.popup.close()}
                onSuccess={this.handleUpdate}
                selected={this.selected}
                statusCheck={this.statusCheck}
                onDataLoaded={() => this.popup.centreWindow()}
               
            />)
            .withQA("UpdateClaimStatusPopup")
            .render();
    }

    handleUpdate = () => {
        this.popup.destroy();
        delete this.popup;
        this.pageCache.refresh();
        this.setState({ updateSuccess: true });
    }

    statusCheck(status: Dtos.BeneficialOwnerClaimStatus): boolean {
        const naStatuses = [Dtos.BeneficialOwnerClaimStatus.InPreparation, Dtos.BeneficialOwnerClaimStatus.Canceled];
        return naStatuses.indexOf(status) === -1;
    }

    private setUrlFromGridState(options: IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>) {
        this.url.update({ filters: options.filters, sort: options.sort, page: options.page, pageSize: options.pageSize});
    }

    renderGrid() {
        let pending = this.state.statuses.and(this.state.eventTypes, (statuses, eventTypes) => { return { statuses, eventTypes } });
        return Loader.for(pending, p => {
            const grid = PageableGridBuilder.ForPendingPage<Dtos.BeneficialOwnerSearchResultDto, Dtos.BeneficialOwnerSortField>(
                this.url.read().pageSize || this.gridPageSize,
                this.pageCache.getCurrentData(),
                (options) => {
                    this.pageCache.setCurrent({ uiFilters: options.filters, sort: options.sort }, options.page, options.pageSize, false);
                    this.setUrlFromGridState(options);
                }
            )
                .setInitialState(this.state.gridState)
                .setRowChangeHandler(x => this.navigateToDetails(x))
                .isFilterable()
                //.isFixed(1)
                .isSortable()
                .isScrollable()
                .isResizable()
                .addCustomExcelButton(this.disableExcelExport() ? "Reduce rows to enable Export to Excel" : "Export to Excel", () => this.benOwnerClaimsApi.exportUrl(this.pageCache.getCurrentFilter(), Dtos.BeneficialOwnersExportType.Normal), "ReduceRowsToEnableExportToExcel",this.disableExcelExport() ? "disabled" : "")
                .addCustomExcelButton(this.disableExcelExport() ? "Reduce rows to enable Export all details to Excel" : "Export all details to Excel", () => this.benOwnerClaimsApi.exportUrl(this.pageCache.getCurrentFilter(), Dtos.BeneficialOwnersExportType.Full), "ReduceRowsToEnableExportAllDetailsToExcel",this.disableExcelExport() ? "disabled" : "")
                .addString("Status", x => x.benificalOwnerStatusName, Dtos.BeneficialOwnerSortField.BenificalOwnerStatus, "Status", null, {
                    filterItems: p.statuses.map(x => x.name), width: 100
                })
                .addString("Country of Issuance", x => x.countryOfIssuance, Dtos.BeneficialOwnerSortField.CountryOfIssuance, "CountryOfIssuance", null, { width: 200 })
                .addString("Filing Method Round", x => x.roundName, Dtos.BeneficialOwnerSortField.FilingMethodRound, "FilingMethodRound", null, { width: 200 })
                .addString("Issuer", x => x.issuer, Dtos.BeneficialOwnerSortField.Issuer, "Issuer", null, { width: 200 })
                .addString("CUSIP", x => x.cusip, Dtos.BeneficialOwnerSortField.Cusip, "Cusip", null, { width: 200 })
                .addDate("ADR Record Date", x => x.adrRecordDate, Dtos.BeneficialOwnerSortField.AdrRecordDate, "AdrRecordDate", null, { width: 200 })
                .addString("Participant", x => x.dtcCode, Dtos.BeneficialOwnerSortField.DtcCode, "Participant", null, { width: 150 })
                .addString("Participant Name", x => x.participantName, Dtos.BeneficialOwnerSortField.ParticipantName, "ParticipantName", null, { width: 250 })
                .addString("Downstream Subscriber Name", x => x.dsName, Dtos.BeneficialOwnerSortField.DSName, "DownstreamSubscriberName", null, { width: 200 })
                .addString("Batch Claim #", x => x.batchClaimReference, Dtos.BeneficialOwnerSortField.BatchClaimReference, "BatchClaimNumber", null, { width: 200 })
                .addStrings("Beneficial Owner", " ", x => [x.firstNames, x.lastName], Dtos.BeneficialOwnerSortField.DisplayName, "BeneficialOwner", { width: 200 })
                .addString("Category", x => x.categoryDisplayName, Dtos.BeneficialOwnerSortField.CategoryDisplayName, "Category", null, { width: 200 })
                .addString("Country of residence", x => x.countryOfResidence, Dtos.BeneficialOwnerSortField.CountryOfResidence, "CountryOfResidence", null, { width: 200 })
                .addString("Entity type", x => x.entityTypeDescription, Dtos.BeneficialOwnerSortField.EntityTypeDescription, "EntityType", null, { width: 200 })
                .addNumber("# of ADRs", x => x.numAdrs, Dtos.BeneficialOwnerSortField.NumAdrs, "NumberOfADRs", null, { width: 100 })
                .addYesNo("Possible Duplicate", x => x.possibleDuplicate, Dtos.BeneficialOwnerSortField.PossibleDuplicate, "PossibleDuplicate", { width: 100 })
                .withQA("BeneficialOwnerSearchResults")
                ;

            if (this.props.canUpdateBeneficialOwnerStatus) {
                grid.addButton('Update Status', this.handleUpdatePopup, {dataQA: "UpdateStatus", pushRemainingRight: true})
                    .isSelectable(selection => this.selected = selection);
            }

            return grid.render();
        });
    }

    renderSuccess = () => {
        return this.state.updateSuccess ? <Form.Message type="success" message="Status updated successfully" onClose={() => this.setState({ updateSuccess: false })} qa="StatusUpdatedSuccessfullyMessage"/> : null;
    }

    render() {
        return (
            <div>
                <h1>Beneficial Owner Claims</h1>
                {this.renderSuccess()}
                {this.renderGrid()}
            </div>
        );
    }

    private navigateToDetails(dto: Dtos.BeneficialOwnerSearchResultDto) {
        let encodedUrl = this.urlHistory.getCurrentEncodedUrl();
        window.location.href = '/claims/viewbodetails/' + dto.id + "?backurl=" + encodedUrl;
    }
};
