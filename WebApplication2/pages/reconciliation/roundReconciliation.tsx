import * as React from 'react';
import { Dtos, Apis } from '../../adr';
import { Pending, Loader, connect, DialogBuilder, PopupBuilder, PageCache, PagedDataState, IGridBuilderChangeArgs, SimpleGridBuilder, LoadingStatus } from '../../classes';
import { Message } from '../../components';
import { DtccRpaReport } from './dtccRpaReport';
import { ReconciliationGrid } from './reconciliationGrid';

import { JpmElectionSheet } from './jpmElectionSheet';
import { ExportRpaPopup } from '../event/exportRpaPopup';
import { ExportRpaChangePopup } from './ExportRpaChangePopup';
import { BnymOfacReport } from './BnymOfacReport';
import { CategoryMapper } from './CategoryMapper';

interface Props {
    isJpmSponsored: boolean;
    isBnymSponsored: boolean;
    finalPayDateSet: boolean;
    balanceSheetUploaded: boolean;

    roundId: number;
    sendingElectionSheet: boolean;
    roundDetails?: Pending<Dtos.RoundDto>;

    onReportDeleted: (roundId: number) => void;
    onFileUploaded: (roundId: number) => void;
    onRoundUpdated: (roundId: number, reloadDtcc: boolean) => void;
    onDeleteReport: (summary: Dtos.DtccReportSummaryDto) => void;
    onElectionSheetChange: (roundId: number) => void;
    roundDtccRpaSummary: Pending<Dtos.DtccReportSummaryDto>;
    jpmElectionSheetSummary: Pending<Dtos.JpmElectionSheetSummaryDto>;
    canExportRpa: boolean;
}

interface State {
    deletingReport: boolean;
    balanceInformation: Pending<Dtos.EventRoundBalanceInformationDto>;
    lastCreated: Pending<Dtos.EventRoundLastClaimCreatedDto>;
    reconciliationList?: PagedDataState<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>;
    unmatchedList?: PagedDataState<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>;
    matchingCategories?: Pending<Dtos.MatchingSameRateCategoriesDto>;
}

export class RoundReconciliation extends React.Component<Props, State>
{
    private reconciliationStore: PageCache<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>;
    private unmatchedStore: PageCache<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>;

    constructor(props: Props) {
        super(props);

        this.state = {
            deletingReport: false,
            balanceInformation: new Pending<Dtos.EventRoundBalanceInformationDto>(LoadingStatus.Preload),
            lastCreated: new Pending<Dtos.EventRoundLastClaimCreatedDto>(LoadingStatus.Preload),
            matchingCategories: new Pending<Dtos.MatchingSameRateCategoriesDto>(LoadingStatus.Preload)
        };

        this.reconciliationStore = new PageCache<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>(
            (query, page, pageSize) => new Apis.RoundReconciliationApi().getRecords(query, page, pageSize),
            () => this.state.reconciliationList,
            (reconciliationList) => this.setState({ reconciliationList })
        );

        this.unmatchedStore = new PageCache<Dtos.ReconciliationRecordDto, Dtos.GetEventRoundReconciliationReportQuery>(
            (query, page, pageSize) => new Apis.RoundReconciliationApi().getRecords(query, page, pageSize),
            () => this.state.unmatchedList,
            (unmatchedList) => this.setState({ unmatchedList })
        );
    }

    render() {
        return (<div>
            {this.renderBalanceReconciliation()}
            {this.renderDtccRpaReport()}
            {this.renderReconciliation()}
            {this.renderJpmElectionSheet()}
            {this.renderBnymOfacReport()}
            {this.renderButtons()}
            {this.renderMultiCatPopup()}
        </div>);
    }

    componentDidUpdate(oldProps: Props) {
        if (oldProps.roundId != this.props.roundId) {
            this.onGridChanged({ page: 1, pageSize: 10, filters: null, sort: null });
            this.onUnmatchedGridChanged({ page: 1, pageSize: 10, filters: null, sort: null });

            this.ensureBalanceInformation();
            this.ensureLastUpdatedDate();
        }
    }

    componentDidMount() {
        this.ensureBalanceInformation();
        this.ensureLastUpdatedDate();
    }

    private ensureBalanceInformation() {
        connect(new Apis.RoundApi().getBalanceInformation(this.props.roundId), this.state.balanceInformation, bi => this.setState({ balanceInformation: bi }));
    }

    private ensureLastUpdatedDate() {
        connect(new Apis.RoundApi().getLastClaimCreatedDate(this.props.roundId), this.state.lastCreated, lc => this.setState({ lastCreated: lc }));
    }

    private renderBalanceReconciliation() {
        return (<div style={{ maxWidth: "800px" }}>
            <h4>Balance Reconciliation</h4>
            {this.renderBalanceReconciliationGrid()}
        </div>);
    }

    private renderBalanceReconciliationGrid() {
        return Loader.for(this.state.balanceInformation, bi => {
            var info = [
                { name: "ADRs", custodianBalance: bi.custodianAdrTotal, adroitBalance: bi.adroitAdrTotal },
                { name: "ORDs", custodianBalance: bi.custodianOrdTotal, adroitBalance: bi.adroitOrdTotal }
            ];

            var grid = SimpleGridBuilder.For(info)
                .addString(" ", x => x.name, null, "BalanceGrid")
                .addNumber("Custodian Balance", x => x.custodianBalance, null, "CustodianBalance")
                .addCustomColumn("Adroit Balance", x => <span className={x.adroitBalance > x.custodianBalance ? "field-validation-error" : ""}>{x.adroitBalance}</span>, () => null, null, null, "AdroitBalance",null)
                .addCustomColumn(" ", x => <span className="field-validation-error">{x.name == "ADRs" && x.adroitBalance > x.custodianBalance ? "Round balance exceeds custodian balance" : ""}</span>, () => null, null, null, "RoundBalanceExceedsCustodianBalance",{ width: "50%" })
                ;

            return grid.render();
        });
    }

    private renderReconciliation() {
        var combined = Pending.combine(this.props.roundDetails, this.props.roundDtccRpaSummary, this.state.lastCreated, (rd, dtc, lc) => { return { rd, dtc, lc } });

        return Loader.for(combined, data => {
            return (<div>
                <h4>RPA Reconciliation</h4>
                {data.rd.reconciliationRun && !data.rd.hasReconciliationItems && <span>Reconciliation was last run on {moment(data.rd.reconciliationRunDate).format("dddd, MMMM Do YYYY [at] HH:mm")} and no reconciliation mismatches were found.</span>}
                {data.rd.reconciliationRun && data.rd.hasReconciliationItems && <span>Reconciliation was last run on {moment(data.rd.reconciliationRunDate).format("dddd, MMMM Do YYYY [at] HH:mm")}.</span>}
                {data.rd.reconciliationRun && data.dtc.reportUploaded && data.rd.reconciliationRunDate <= data.dtc.uploadedAt &&
                    <div className="field-validation-error">A new DTCC RPA report has been received since the last time reconciliation was run, please re-run reconciliation.</div>}
                {data.rd.reconciliationRun && data.dtc.reportUploaded && data.lc.lastCreatedDate && data.rd.reconciliationRunDate <= data.lc.lastCreatedDate &&
                    <div className="field-validation-error">A new claim has been created since the last time reconciliation was run, please re-run reconciliation.</div>}
                {data.rd.reconciliationRun && data.rd.hasReconciliationItems && this.renderReconciliationReport()}
                <div>
                    {data.dtc.reportUploaded && <button className={data.rd.reconciliationRun ? "btn btn-outline-secondary" : "btn btn-primary"} onClick={() => this.checkMatchingCategoryRates()} data-qa="RunReconciliationButton">{data.rd.reconciliationRun ? "Re-" : "" }Run Reconciliation</button>}
                    {!data.dtc.reportUploaded && <span>Reconciliation cannot be run until a DTCC report has been uploaded.</span>}
                    {data.rd.reconciliationRun && <button className="btn btn-outline-secondary" onClick={() => this.runCreateRpaChangeReport()} data-qa="GenerateRpaChangeReportButton">Generate RPA Change Report</button>}
                </div>
            </div>);
        });
    }

    private checkMatchingCategoryRates() {
        connect(new Apis.RoundReconciliationApi().getMatchingSameRateCategories(this.props.roundId), this.state.matchingCategories, mc => {
            this.setState({ matchingCategories: mc })
            if (mc.isDone()) {
                if (!mc.data || mc.data.adroitMatchingRateCategories.length < 2 ) {
                    this.runReconciliation();
                }
            }
        });
    }

    private runReconciliation() {
        connect(new Apis.RoundReconciliationApi().runReconciliation(this.props.roundId), null, x => {
            if (x.isDone()) {
                if (this.state.reconciliationList) {
                    this.reconciliationStore.refresh();
                }
                if (this.state.unmatchedList) {
                    this.unmatchedStore.refresh();
                }

                this.props.onRoundUpdated(this.props.roundId, true);
            }
        });
    }

    private runCreateRpaChangeReport() {
        this.generateRpaChange(this.props.roundId);
    }

    private renderReconciliationReport() {
        return (<div>
            <h4>Participant Mismatches</h4>
            <ReconciliationGrid onRowUpdated={() => null} showUnattachedOnly={true} reconciliationItems={this.unmatchedStore.getCurrentData()} onPageChanged={(args) => this.onUnmatchedGridChanged(args)}/>

            <h4>Election Mismatches</h4>
            <ReconciliationGrid onRowUpdated={(m) => this.updateRowResolution(m)} showUnattachedOnly={false} reconciliationItems={this.reconciliationStore.getCurrentData()} onPageChanged={(args) => this.onGridChanged(args)}/>
        </div>);
    }

    private updateRowResolution(dto: Dtos.ReconciliationRecordDto) {
        connect(new Apis.RoundReconciliationApi().reconcile(dto), null, x => {
            if (x.isDone()) {
                this.reconciliationStore.refresh();
                this.props.onRoundUpdated(this.props.roundId, false);
            }
        });
    }

    private onUnmatchedGridChanged(options: IGridBuilderChangeArgs<Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField>) {
        this.unmatchedStore.setCurrent({ eventRoundId: this.props.roundId, showUnmatchedParticipants: true, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.GetEventRoundReconciliationReportQuery_ReconciliationSortField>) {
        this.reconciliationStore.setCurrent({ eventRoundId: this.props.roundId, showUnmatchedParticipants: false, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private renderButtons() {
        return (<div className="float-end">
            {this.props.canExportRpa ? <button className="btn btn-outline-secondary" onClick={() => this.exportRpa(this.props.roundId)} data-qa="ExportRpaButton">Export RPA</button> : null}
        </div>);
    }

    private renderDtccRpaReport() {
        var combined = Pending.combine(this.props.roundDtccRpaSummary, this.props.roundDetails, (dtcc, round) => { return { dtcc, round } });

        return Loader.for(combined,
            data => (
                <div>
                    <DtccRpaReport
                        dtccRpaSummary={data.dtcc}
                        round={data.round}
                        onFileUploaded={(roundId) => this.props.onFileUploaded(roundId)}
                        onDelete={(summary) => this.props.onDeleteReport(summary)}
                        deletingReport={this.state.deletingReport}
                       
                    />
                </div>
            ));

    }

    private renderJpmElectionSheet() {
        var combined = Pending.combine(this.props.jpmElectionSheetSummary,
            this.props.roundDtccRpaSummary,
            this.props.roundDetails,
            this.reconciliationStore.getCurrentData(),
            this.state.lastCreated,
            (jpm, dtcc, round, electionMismatches, lastClaim) => { return { jpm, dtcc, round, electionMismatches, lastClaim } });

        return this.props.isJpmSponsored && Loader.for(combined, data =>
            <JpmElectionSheet
                jpmElectionSheetSummary={data.jpm}
                dtccRpaSummary={data.dtcc}
                roundDetails={data.round}
                eventBalanceSheetUpload={this.props.balanceSheetUploaded}
                onDownloadElectionSheet={(showWarning) => this.onDownloadElectionSheet(showWarning)}
                downloadingElectionSheet={this.props.sendingElectionSheet}
                hasElectionMismatches={data.electionMismatches.count > 0}
                newClaimSubmitted={data.round.reconciliationRun && data.lastClaim.lastCreatedDate && data.round.reconciliationRunDate <= data.lastClaim.lastCreatedDate}
                onSendElctionSheet={() => this.onElectionSheetUploaded()}
               
            />
        );
    }

    private renderBnymOfacReport() {
        return this.props.isBnymSponsored && Loader.for(this.props.roundDetails, round =>
            <BnymOfacReport
                roundDetails={round}
                finalPayDateSet={this.props.finalPayDateSet}
               
                />
            )
    }

    private exportRpaPopup: PopupBuilder;
    private exportRpa(roundId: number) {
        this.exportRpaPopup = new PopupBuilder()
            .setTitle("Export round RPA")
            .withQA("ExportRoundRpaPopup")
            .setContent(<ExportRpaPopup roundId={roundId} onClose={() => {
                this.exportRpaPopup.close();
                this.exportRpaPopup = null;
            }}/>);

        this.exportRpaPopup.render();
    }
    
    private onDownloadElectionSheet(showWarning: boolean) {
        if (showWarning) {
            let dialog = new DialogBuilder();

            dialog.setTitle("Download Election Sheet")
                .setMessage(<p>This round has not been fully reconciled. Are you sure you want to continue ?</p>)
                .withQA("DownloadElectionSheetDialog")
                .setConfirmHandler(() => {
                    window.open(new Apis.JpmReportingApi().electionSheetDownloadUrl(this.props.roundId));
                    setTimeout(() => { this.props.onElectionSheetChange(this.props.roundId) }, 2000);
                })
                .setCancelHandler(() => { dialog.close() })
                .open();
        } else {
            window.open(new Apis.JpmReportingApi().electionSheetDownloadUrl(this.props.roundId));
            setTimeout(() => { this.props.onElectionSheetChange(this.props.roundId) }, 2000);
        }
    }

    private onElectionSheetUploaded() {
        this.props.onElectionSheetChange(this.props.roundId);
    }

    private generateRpaChangePopup: PopupBuilder;
    private generateRpaChange(roundId: number) {
        this.generateRpaChangePopup = new PopupBuilder()
            .setTitle("Export RPA Change report")
            .withQA("ExportRpaChangeReportPopup")
            .setContent(<ExportRpaChangePopup roundId={roundId}onClose={() => {
                this.generateRpaChangePopup.close();
                this.generateRpaChangePopup = null;
            }} />);

        this.generateRpaChangePopup.render();
    }

    private renderMultiCatPopup() {
        if (this.state.matchingCategories.isReady() &&
            this.state.matchingCategories.data.adroitMatchingRateCategories.length > 0)
            return (
                <div>
                    <CategoryMapper
                        onCancel={() => {
                            this.setState({
                                matchingCategories: new Pending<Dtos.MatchingSameRateCategoriesDto>(LoadingStatus.Preload)
                            });
                        }}
                        onUpdate={(categories) => this.updateMatchingCategories(categories)}
                        matchingCategories={this.state.matchingCategories.data}
                       
                    />
                </div>
            );
        else return null;
    }

    private updateMatchingCategories(categories: Dtos.AdroitCategoryDescriptionDto[]) {
        connect(new Apis.RoundReconciliationApi().updateMatchingSameRateCategories(this.props.roundId,
                { adroitMatchingRateCategories: categories }),
            null,
            x => {
                if (x.isDone()) {
                    this.setState({
                        matchingCategories: new Pending<Dtos.MatchingSameRateCategoriesDto>(LoadingStatus.Preload)
                    });
                    this.runReconciliation();
                }
            });
    }
}