import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { AppError, connect, Loader, PageableGridBuilder, PageCache, PagedDataState, Pending, PopupBuilder } from "../../classes";
import { Dropdown, Error, ReportDocumentLink } from '../../components';
import { BnymReportDialog } from './bnymReportDialog';
import { BnymYearlyReclaimReportDialog } from './bnymYearlyReclaimReportDialog';

enum ReportType {
    JPMorganDRWIN,
    BnymCategoryElection,
    BnymYearlyReclaim
}

interface pageProps {
    isGoalUser: boolean;
}

interface pageState {
    reports?: PagedDataState<Dtos.ReportDto, Dtos.SearchReportsQuery>;
    reportStatuses?: Pending<Dtos.EnumDisplayDto[]>;
    reportTypes?: Pending<Dtos.EnumDisplayDto[]>;
    selectedReport: ReportType;
    error?: AppError;
    bnymDate?: Date;
}

export class Reports extends React.Component<pageProps, pageState> {

    private reportsApi: Apis.ReportsApi;
    private reportStore: PageCache<Dtos.ReportDto, Dtos.SearchReportsQuery>;
    private gridPageSize: number;

    constructor(props: pageProps) {
        super(props);
        this.reportsApi = new Apis.ReportsApi();
        this.gridPageSize = 10;
        this.state = {
            reportStatuses: new Pending<Dtos.EnumDisplayDto[]>(),
            reportTypes: new Pending<Dtos.EnumDisplayDto[]>(),
            selectedReport: ReportType.JPMorganDRWIN,
            bnymDate: new Date()
        };

        this.reportStore = new PageCache<Dtos.ReportDto, Dtos.SearchReportsQuery>(
            (query, page, pageSize) => this.reportsApi.getAllForCurrentUser(query, page, pageSize),
            () => this.state.reports,
            (reports) => {
                this.setState({ reports },
                    () => {
                        let currentData = this.reportStore.getCurrentData();
                        if (currentData.isDone() &&
                            currentData.data.items.find(x => x.statusId === Dtos.ReportStatus.Pending)) {
                            setTimeout(() => this.reportStore.refresh(), 5000);
                        }
                    });
            }
        );
    }

    componentDidMount() {
        connect(new Apis.EnumApi().reportStatus(), this.state.reportStatuses, reportStatuses => this.setState({ reportStatuses }));
        connect(new Apis.EnumApi().reportType(), this.state.reportTypes, reportTypes => this.setState({ reportTypes }));
    }

    private renderReportSelector() {
        const TypedDropdown = Dropdown as Newable<Dropdown<{ id: number, name: string }>>;
        const options = [
            { id: ReportType.JPMorganDRWIN, name: "DRWIN report (JP Morgan)" },
            { id: ReportType.BnymCategoryElection, name: "BNYM Election Report" },
            { id: ReportType.BnymYearlyReclaim, name: "BNYM Yearly Reclaim Report" }
        ];

        let selected = options.find(x => x.id === this.state.selectedReport);
        return (
            <div>
                <div>{this.renderTitle("Run report")}</div>
                <div className="row" style={{ paddingBottom: '15px' }}>
                    <div className="row col-md-12">
                        <div className="col-md-5">
                            <TypedDropdown isFormControl={true} options={options} value={selected} hasOptionsLabel={false} onChange={(report) => { this.setState({ selectedReport: report.id }) }} qa="ReportTypeDropdown"/>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary" onClick={() => this.runReport()} data-qa="RunReportButton">Run report</button>
                        </div>
                        <div className="col-md-5">
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private dialog: PopupBuilder;

    private runReport() {
        let api = new Apis.ReportsApi();
        var method;

        if (this.state.selectedReport == ReportType.JPMorganDRWIN) {
            method = api.queueJpmDrwinReport({});
            this.getReportData(method);
        }

        else if (this.state.selectedReport == ReportType.BnymCategoryElection) {
            this.dialog = new PopupBuilder()
                .setTitle("Select Date")
                .setContent(this.renderBNYMPopup())
                .setWidth(600)
                .withQA("BnymPopup")
                ;

            this.dialog.open();
        }

        else if (this.state.selectedReport == ReportType.BnymYearlyReclaim) {
            this.dialog = new PopupBuilder()
                .setTitle("BNYM Yearly Reclaim Report")
                .setContent(this.renderBnymReclaimPopup())
                .setWidth(600)
                .withQA("BnymYearlyReclaimReportPopup")
                ;

            this.dialog.open();
        }

    }

    private getReportData(method: any) {
        connect(method, null, response => {
            if (response.isFailed()) {
                this.setState({ error: response.error });
            }
            else if (response.isDone()) {
                this.setState({ error: null });
                this.reportStore.refresh();
            }
        })
    }

    private renderBnymReclaimPopup() {
        return <BnymYearlyReclaimReportDialog
            onCancel={() => this.dialog.close()}
            onSave={(year) => {
                this.getReportData(new Apis.ReportsApi().queueBnymYearlyReclaimReport({ year: year }));
                this.dialog.close();
            }}
           
        />
    }

    private renderBNYMPopup() {
        return <BnymReportDialog
            onCancel={() => this.dialog.close()}
            onSave={(country, date) => {
                this.getReportData(new Apis.ReportsApi().queueBnymElectionReport({ adrRecordDate: date, countryOfIssuance: country }));
                this.dialog.close();
            }}
           
        />
    }

    private renderGrid() {
        const sort = Dtos.SearchReportsQuery_SortField;
        let pending = this.state.reportStatuses.and(this.state.reportTypes, (reportStatuses, reportTypes) => { return { reportStatuses, reportTypes } });
        return Loader.for(pending, p => {
            const grid = PageableGridBuilder.ForPendingPage<Dtos.ReportDto, Dtos.SearchReportsQuery_SortField>(
                this.gridPageSize,
                this.reportStore.getCurrentData(),
                (options) => this.reportStore.setCurrent({ uISort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false))
                .isFilterable()
                .isSortable()
                .isScrollable()
                .isResizable()
                .addString("Type", dto => dto.type, sort.ReportType, "Type", null, { filterItems: p.reportTypes.map(type => type.label), selectAllFilter: false, width: "250px" })
                .addString("Status", dto => dto.status, sort.ReportStatus, "Status", null, { filterItems: p.reportStatuses.map(type => type.label), selectAllFilter: false, width: "100px" })
                .addString("Description", dto => dto.description, sort.Description, "Description")
                .addDateTime("Requested On", dto => dto.requestedOn, sort.RequestedOn, "RequestedOn", null, { width: "160px", showSuffix: false })
                .addDateTime("Expires On", dto => dto.expires, sort.ExpiryDate, "ExpiresOn",null, { width: "160px", showSuffix: false })
                .addCustomColumn("Filenames", dto => this.renderFiles(dto.generatedFiles), (m) => m.generatedFiles.map(x => x.name).join(","), null, null, "FileNames", null)
                .withQA("Grid")
                ;

            return (
                <div>
                    {grid.render()}
                    <p>* All times are NY Local Time</p>
                </div>
            );
        })
    }

    private renderFiles(files: Dtos.GeneratedFileDto[]) {
        if (!files || !files.length) return null;
        return (
            <ul style={{ listStyleType: "none", padding: "0", marginBottom: "0" }} data-qa="Files">
                {files.map(f => <li data-qa="ReportDocumentLink"><ReportDocumentLink {...f} /></li>)}
            </ul>
        );
    }

    private renderTitle = (title: string) => { return <h2>{title}</h2>; }

    private renderError() {
        return <Error error={this.state.error} qa="ReportsError"/>
    }

    render() {
        return (
            <div>
                {this.props.isGoalUser && this.renderReportSelector()}
                {this.renderError()}
                {this.renderTitle("Reports queue")}
                {this.renderGrid()}
            </div>
        );
    }
};