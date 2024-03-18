import * as React from 'react';
import { Apis, Dtos } from '../../../../adr';
import { PageableGridBuilder, PageCache, PagedDataState, LoadingStatus, connect } from '../../../../classes';
import { Message } from '../../../../components';

interface GridProps {
    claimId: number;
    eventSecurityType: Dtos.SecurityType;
    excelExportLimit: number;
};

interface GridState {
    benOwenersData?: PagedDataState<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    exportError?: boolean;
    exportSuccess?: boolean;
};

export class BeneficialOwnerPreview extends React.Component<GridProps, GridState> {
    private api: Apis.BeneficialOwnerApi;
    private dataCache: PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    private gridPageSize: number = 20;

    constructor() {
        super();
        this.state = { };
        this.api = new Apis.BeneficialOwnerApi();
        this.dataCache = new PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>(
            (query, page, pageSize) => this.api.getAllByClaimId(query, page, pageSize),
            () => this.state.benOwenersData,
            (benOwenersData) => this.setState({ benOwenersData: benOwenersData })
        );
    }

    render() {
        return <div>
            <legend>Beneficial Owners</legend>
            <div className="row">
                <div className="col-md-12" data-qa="BeneficialOwners">
                    {this.renderSuccess()}
                    {this.renderError()}
                    {this.renderExportText()}
                    {this.renderGrid()}
                </div>
            </div>
        </div>
    }

    private renderError() {
        return this.state.exportError ? <Message type="alert" message={"Error exporting Beneficial Owners"} qa="ErrorExportingBeneficialOwnersMessage"/> : null;
    }

    private renderSuccess() {
        return this.state.exportSuccess ? <Message type="success" message={"Successfully started export."} qa="SuccessfullyStartedExportMessage"/> : null;
    }

    private renderExportText() {
        if (!this.state.exportSuccess) return null;
        return (
            <div>
                <p>When the files are ready for download you will be notified by email.</p>
                <p >To download the exported files go to the <a href="/reports/export" data-qa="ReportPageLink">Reports</a> page.</p>
            </div>
        );
    }

    private renderGrid() {
        var disableExcelExport = this.dataCache.getCurrentData().map(x => x.totalCount > this.props.excelExportLimit).data || false;
        return PageableGridBuilder.ForPendingPage<Dtos.BeneficialOwnerDetailsDto, Dtos.BeneficialOwnerSortField>(
            this.gridPageSize,
            this.dataCache.getCurrentData(),
            (options) => this.dataCache.setCurrent({ id: this.props.claimId, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false)
        )
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .addCustomExcelButton(disableExcelExport ? "Reduce rows to enable Export all details to Excel" : "Export all details to Excel", () => new Apis.BeneficialOwnerApi().exportByClaimIdUrl(this.dataCache.getCurrentFilter(), Dtos.BeneficialOwnersExportType.Full), disableExcelExport ? "disabled" : "")
            .addButton("Queue Full Export", () => this.queueExport(), { dataQA: "QueueFullExportButton", pushRemainingRight: true})
            .addStrings("Full Name", " ", x => [x.givenNames, x.familyName], Dtos.BeneficialOwnerSortField.DisplayName, "FullName")
            .addNumber((this.props.eventSecurityType === Dtos.SecurityType.CommonStock ? "Shares" : "ADRs") + " Position", x => x.adrPosition, Dtos.BeneficialOwnerSortField.NumAdrs, "NumberOfADRs")
            .addString("Entity Type", x => x.entityType.description, Dtos.BeneficialOwnerSortField.EntityTypeDescription, "entityType")
            .addString("Country Of Residence", x => x.countryOfResidence.countryName, Dtos.BeneficialOwnerSortField.CountryOfResidence, "CountryOfResidence")
            .addString("Category", x => x.category.displayName, Dtos.BeneficialOwnerSortField.Category, "Category")
            .withQA("Grid")
            .render();
    }

    private queueExport() {
        connect(new Apis.ReportsApi().queueBODownload({ batchClaimId: this.props.claimId }), null, response => {
            response.state === LoadingStatus.Failed && this.setState({ exportError: true });
            response.state === LoadingStatus.Done && this.setState({ exportSuccess: true, exportError: false });
        });
    }

}