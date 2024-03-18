import * as React from 'react';
import { connect, LoadingStatus, Pending, PageableGridBuilder, Loader, IGridBuilderChangeArgs } from '../../../classes';
import { Apis, Dtos } from "../../../adr";
import { Message } from '../../../components';

interface BatchClaimOwnersGridProps {
    benOwners: Pending<Dtos.PagedResultDto<Dtos.BeneficialOwnerDetailsDto>>;
    query: Dtos.GetBatchClaimBenOwnersQuery;
    onChange: { (filter: Dtos.GetBatchClaimBenOwnersQuery, page: number, pageSize: number): void };
    onSelected: { (dto: Dtos.BeneficialOwnerDetailsDto): void };
    isIrishCommonStockEvent: boolean;
    disableExcelExport: boolean;
};

interface BatchClaimOwnersGridState {
    statuses: Pending<Dtos.BenownerClaimStatusDto[]>;
    exportError?: boolean;
    exportSuccess?: boolean;
};

export class BatchClaimOwnersGrid extends React.Component<BatchClaimOwnersGridProps, BatchClaimOwnersGridState> {
    private gridPageSize: number = 20;
    private benOwnerClaimsApi: Apis.BeneficialOwnerApi;

    constructor(props: BatchClaimOwnersGridProps) {
        super(props);
        this.benOwnerClaimsApi = new Apis.BeneficialOwnerApi();

        this.state = {
            statuses: new Pending<Dtos.BenownerClaimStatusDto[]>()
        };
    }

    componentDidMount() {
        connect(new Apis.BeneficialOwnerClaimStatusesApi().getAll(), this.state.statuses, statuses => this.setState({ statuses }));
    }

    private handleChange(options: IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>) {
        var query = Object.assign({}, this.props.query);
        query.sort = options.sort;
        query.uiFilters = options.filters;
        this.props.onChange(query, options.page, options.pageSize);
    }

    private queueExport() {
        connect(new Apis.ReportsApi().queueBODownload({ batchClaimId: this.props.query.id }), null, response => {
            response.state === LoadingStatus.Failed && this.setState({ exportError: true });
            response.state === LoadingStatus.Done && this.setState({ exportSuccess: true, exportError: false });
        });
    }

    private renderGrid(statuses: Dtos.BenownerClaimStatusDto[]) {
        return PageableGridBuilder
            .ForPendingPage<Dtos.BeneficialOwnerDetailsDto, Dtos.BeneficialOwnerSortField>(this.gridPageSize, this.props.benOwners, (options) => this.handleChange(options))
            .isSortable()
            .isFilterable()
            .isScrollable()
            .isResizable()
            .withQA("BeneficialOwnerClaimStatus")
            .addStrings("Beneficial Owner", " ", x => [x.givenNames, x.familyName], Dtos.BeneficialOwnerSortField.DisplayName, "BeneficialOwner")
            .addString("BO ID", x => x.benownerClaimReference, Dtos.BeneficialOwnerSortField.BeneficialOwnerClaimId, "BeneficialOwnerClaimID")
            .addString("Country of Residence", x => x.countryOfResidence.countryName, Dtos.BeneficialOwnerSortField.CountryOfResidence, "CountryOfResidence")
            .addString("Entity Type", x => x.entityType.description, Dtos.BeneficialOwnerSortField.EntityTypeDescription, "EntityType")
            .addString("Category", x => x.category.displayName, Dtos.BeneficialOwnerSortField.CategoryDisplayName, "Category")
            .addNumber(`# of ${this.props.isIrishCommonStockEvent ? "Positions" : "ADRs"}`, x => x.adrPosition, Dtos.BeneficialOwnerSortField.NumAdrs, "NumberOfPositionsADRs")
            .addString("Status", x => x.benOwnerClaimStatusName, Dtos.BeneficialOwnerSortField.BenificalOwnerStatus, "Status", null, {
                filterItems: statuses.map(x => x.name)
            })
            .setRowChangeHandler(x => this.props.onSelected(x))
            .addCustomExcelButton(this.props.disableExcelExport ? "Reduce rows to enable Export to Excel" : "Export to Excel", () => this.benOwnerClaimsApi.exportByClaimIdUrl(this.props.query, Dtos.BeneficialOwnersExportType.Normal), "ExportToExcelButton", this.props.disableExcelExport ? "disabled" : "")
            .addCustomExcelButton(this.props.disableExcelExport ? "Reduce rows to enable Export all details to Excel" : "Export all details to Excel", () => this.benOwnerClaimsApi.exportByClaimIdUrl(this.props.query, Dtos.BeneficialOwnersExportType.Full), "ExportAllDetailsToExcelButton", this.props.disableExcelExport ? "disabled" : "")
            .addButton("Queue Full Export", () => this.queueExport(), {dataQA:"QueueFullExportButton", pushRemainingRight: true})
            .render();
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
                <p>To download the exported files go to the <a href="/reports/export" data-qa="reportsPageLink">Reports</a> page.</p>
            </div>
        );
    }

    render() {
        return Loader.for(this.state.statuses, statuses => <div>
            {this.renderSuccess()}
            {this.renderError()}
            {this.renderExportText()}
            {this.renderGrid(statuses)}
        </div>);
    }
};