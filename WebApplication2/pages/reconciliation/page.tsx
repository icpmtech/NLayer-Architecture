import * as React from 'react';
import { PageableGridBuilder, Pending, LoadingStatus, Loader, connect, AppError, DialogBuilder, PopupBuilder } from '../../classes';
import { Dropdown, Message } from '../../components';
import { Dtos, Apis } from '../../adr';
import { EventReconciliation } from './eventReconciliation';
import { RoundReconciliation } from './roundReconciliation';
import { DtccRpaReport } from './dtccRpaReport';
import { ExportDwtPopup } from '../eventGeneralInfo/exportDwtPopup';

interface Props {
    eventId: number;
}

interface State {
    eventDetails: Pending<Dtos.EventDto>;
    availableRounds: Pending<Dtos.RoundSummaryDto[]>;
    currentRound: Pending<Dtos.RoundDto>;
    currentRoundId?: number;
    balanceSheet?: Pending<Dtos.BalanceSheetDto>;
    sendingElectionSheet?: boolean;
    error?: AppError;
    deletingReport?: boolean;
    commonStockNoRounds?: boolean;
    roundDtccRpaSummary?: Pending<Dtos.DtccReportSummaryDto>;
    jpmElectionSheetSummary?: Pending<Dtos.JpmElectionSheetSummaryDto>;
}

export class Page extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            eventDetails: new Pending<Dtos.EventDto>(LoadingStatus.Preload),
            currentRound: new Pending<Dtos.RoundDto>(LoadingStatus.Preload),
            balanceSheet: new Pending<Dtos.BalanceSheetDto>(LoadingStatus.Preload),
            availableRounds: new Pending<Dtos.RoundSummaryDto[]>(LoadingStatus.Preload),
            roundDtccRpaSummary: new Pending<Dtos.DtccReportSummaryDto>(LoadingStatus.Preload),
            jpmElectionSheetSummary: new Pending<Dtos.JpmElectionSheetSummaryDto>(LoadingStatus.Preload),
            sendingElectionSheet: false,
            currentRoundId: null
        };
    }

    componentDidMount() {
        this.ensureEventDetails();
        this.ensureRoundsList();
    }

    render() {
        return (<div>
            <h3>Reporting and Reconciliation</h3>
            {Loader.for(this.state.eventDetails, evt => {
                return <div>
                    {evt.securityType != Dtos.SecurityType.CommonStock &&
                        <div>
                            {this.renderDropdown()}
                            <hr />
                            {!this.state.currentRoundId && this.renderEventReconciliation()}
                            {this.state.currentRoundId > 0 && this.renderRoundReconciliation()}
                        </div>}
                    {evt.securityType == Dtos.SecurityType.CommonStock && this.renderEventReconciliation()}
                    {evt.securityType == Dtos.SecurityType.CommonStock && this.renderCommonStock()}
                </div>
            })}
        </div>);
    }

    private renderCommonStock() {
        var combined = Pending.combine(this.state.roundDtccRpaSummary, this.state.currentRound, this.state.availableRounds, (dtcc, round, ar) => { return { dtcc, round, ar } });

        if (this.state.commonStockNoRounds) {
            return <div>Cannot upload a DTCC RPA report until the event has at least one round.</div>;
        }
        
        return Loader.for(combined, data => (
            <div>
                {this.state.currentRoundId > 0 && this.renderRoundReconciliation()}
                
                {data.dtcc.reportUploaded && <div style={{ marginTop: "15px" }}><button className="btn btn-outline-secondary" onClick={() => this.exportDwtReport()} data-qa="ExportDwtReportButton">Export DWT Report</button></div>}
            </div>));
    }

    private dwtDialog: PopupBuilder;
    private exportDwtReport() {
        this.dwtDialog = new PopupBuilder();
        this.dwtDialog.setTitle("Export DWT Report");

        this.dwtDialog.setContent(<ExportDwtPopup eventId={this.props.eventId} onClose={() => this.dwtDialog.close()}/>);
        this.dwtDialog.render();
    }

    private renderDropdown() {
        return <div className="row">
            {Loader.for(this.state.availableRounds, rounds => {
                const TypedDropdown = Dropdown as Newable<Dropdown<{ id: number, name: string }>>;
                let options = rounds.map(x => { return { id: x.id, name: x.name }; });
                options.splice(0, 0, { id: null, name: 'Entire Event' });
                let selected = options.find(x => x.id === this.state.currentRoundId);

                return <div className="col-md-5">
                    <TypedDropdown options={options} value={selected} isFormControl={true} onChange={v => this.roundChanged(v.id, true)} hasOptionsLabel={false} qa="SecurityTypeDropdown"/>
                </div>
            })}
        </div>
    }

    private roundChanged(roundId: number, reloadDtcc: boolean) {
        this.setState({ currentRoundId: roundId });

        if (roundId) {
            this.ensureRoundDetails(roundId);

            if (reloadDtcc) {
                this.ensureRoundDtccRpaSummary(roundId);
                this.ensureJpmElectionSheetSummary(roundId);
            }
        }
    }

    private electionSheetChange(roundId: number) {
        this.setState({jpmElectionSheetSummary: new Pending<Dtos.JpmElectionSheetSummaryDto>(LoadingStatus.Preload)});
        this.roundChanged(roundId, true);
    }

    private renderEventReconciliation() {
        return Loader.for(this.state.eventDetails, evt => {
            return <EventReconciliation event={evt} onBalanceSheetUpdated={() => this.ensureEventDetails()}/>
        });
    }

    private renderRoundReconciliation() {
        return Loader.for(this.state.eventDetails, evt => {
            return <RoundReconciliation
                roundDetails={this.state.currentRound}
                sendingElectionSheet={this.state.sendingElectionSheet}
                isJpmSponsored={evt.sponsored && evt.depositoryJpm}
                isBnymSponsored={evt.sponsored && evt.depositoryBnym}
                finalPayDateSet={evt.finalAdrPayDate != null}
                balanceSheetUploaded={evt.balanceSheetUploaded}
                onRoundUpdated={(roundId, reloadDtcc) => this.roundChanged(roundId, reloadDtcc)}
                onFileUploaded={(roundId) => this.roundChanged(roundId, true)}
                onReportDeleted={(roundId) => this.roundChanged(roundId, true)}
                onDeleteReport={(summary) => this.deleteReport(summary)}
                onElectionSheetChange={(roundId) => this.electionSheetChange(roundId)}
                canExportRpa={true}
                roundId={this.state.currentRoundId}
                roundDtccRpaSummary={this.state.roundDtccRpaSummary}
                jpmElectionSheetSummary={this.state.jpmElectionSheetSummary}
               
            />
        });
    }

    private deleteReport(summary: Dtos.DtccReportSummaryDto) {
        let d = new DialogBuilder();

        d.setTitle("Delete DTCC RPA report")
            .setMessage(`This will remove the DTCC RPA report uploaded by ${summary.uploadedBy} on ${moment(new Date(summary.uploadedAt)).format("DD MMM YYYY")}. This action cannot be undone.`)
            .setCancelText("Cancel")
            .setConfirmText("Delete DTCC RPA report")
            .setWidth(500)
            .setConfirmHandler(() => {
                this.setState({ deletingReport: true });
                connect(new Apis.DtccReportApi().deleteReport(summary.roundId),
                    null,
                    result => {
                        if (result.isDone()) {
                            this.setState({ deletingReport: false });
                            this.ensureRoundDtccRpaSummary(summary.roundId);
                            this.ensureJpmElectionSheetSummary(summary.roundId);
                        }
                        else if (result.isFailed()) {
                            this.setState({});
                        }
                    }
                )
            })
            .setCancelHandler(() => { d.close(); })
            .open();
    }

    private ensureRoundDtccRpaSummary(roundId: number) {
        connect(new Apis.DtccReportApi().getReportSummary(roundId), this.state.roundDtccRpaSummary, summary => this.setState({ roundDtccRpaSummary: summary }));
    }

    private ensureJpmElectionSheetSummary(roundId: number) {
        connect(new Apis.JpmReportingApi().electionSheetSummary(roundId), this.state.jpmElectionSheetSummary, summary => this.setState({ jpmElectionSheetSummary: summary }));
    }

    private ensureEventDetails() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.eventDetails, x => {
            if (x.isDone() && x.data.securityType == Dtos.SecurityType.CommonStock && this.state.availableRounds.data) {
                this.ensureCommonStockRpa();
            }

            this.setState({ eventDetails: x });
        });
    }

    private ensureCommonStockRpa() {
        if (!this.state.availableRounds.data) return;

        let firstRound = this.state.availableRounds.data[0];

        if (firstRound) {
            this.ensureRoundDtccRpaSummary(firstRound.id);
            this.ensureRoundDetails(firstRound.id);
            this.setState({ currentRoundId: firstRound.id });
        }
        else
            this.setState({ commonStockNoRounds: true });
    }

    private ensureRoundsList() {
        connect(new Apis.RoundApi().search(this.props.eventId), this.state.availableRounds, x => {
            if (x.isDone() && this.state.eventDetails.data && this.state.eventDetails.data.securityType == Dtos.SecurityType.CommonStock) {
                this.ensureCommonStockRpa();
            }

            this.setState({ availableRounds: x });
        });
    }

    private ensureRoundDetails(roundId: number) {
        connect(new Apis.RoundApi().get(roundId), this.state.currentRound, x => this.setState({ currentRound: x }));
    }
}