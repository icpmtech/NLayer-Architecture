import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { connect, DialogBuilder, IGridBuilderChangeArgs, Loader, LoadingStatus, PageCache, PagedDataState, Pending, UrlState } from '../../../classes';
import { History } from '../../../classes/History';
import { Message } from '../../../components';
import { ClaimsGrid } from './claimsGrid';
import { EventBanner } from './eventBanner';
import { SummaryChart } from './summaryChart';

interface PageProps {
    canCreateClaimAsParticipant: boolean;
    canViewDsPositions: boolean;
    canCreateClaimForDownstreamSubscriber: boolean;
    eventId: number;
    participantId: number;
    canGoBack: boolean;
    currentUserParticipantId: number;
};

interface PageState {
    claimList?: PagedDataState<Dtos.ParticipantEventClaimSummaryDto, Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery>;
    claimToCancel?: Dtos.ParticipantEventClaimSummaryDto;
    errorMessage?: string;
    event?: Pending<Dtos.EventDto>;
    eventPositionSummary?: Pending<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto>;
    statuses?: Pending<Dtos.BatchClaimStatusDto[]>;
    successMessage?: string;
    downstreamSubscriber?: Pending<Dtos.ParticipantDto>;
    createMessage?: string;
};

interface UrlProps {
    showClaimConfirmation?: boolean;
}

export class ParticipantEventClaims extends React.Component<PageProps, PageState> {

    private claimStore: PageCache<Dtos.ParticipantEventClaimSummaryDto, Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery>;
    private confirmationPopup: DialogBuilder;
    private statusFilters: string[];
    private urlHistory: History;
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();

    constructor(props) {
        super(props);

        let urlProps = this.url.read();
        this.urlHistory = new History(false);

        this.state = {
            event: new Pending<Dtos.EventDto>(),
            eventPositionSummary: new Pending<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto>(),
            statuses: new Pending<Dtos.BatchClaimStatusDto[]>(),
            downstreamSubscriber: new Pending<Dtos.ParticipantDto>(),
            createMessage: !!urlProps.showClaimConfirmation ? "Claim created successfully" : ""
        };

        this.urlHistory.replace(this.urlHistory.getCurrentPath() + " ");

        this.claimStore = new PageCache<Dtos.ParticipantEventClaimSummaryDto, Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery>(
            (query, page, pageSize) => new Apis.ParticipantEventClaimApi().getParticipantClaimsForEventId(query, page, pageSize),
            () => this.state.claimList,
            (claimList) => this.setState({ claimList })
        );
    }

    componentDidMount() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.event, event => this.setState({ event }));
        connect(new Apis.BatchClaimStatusesApi().getAll(), this.state.statuses, statuses => this.setState({ statuses }));
        if (this.props.participantId != this.props.currentUserParticipantId) {
            connect(new Apis.ParticipantsApi().getById(this.props.participantId), this.state.downstreamSubscriber, (downstreamSubscriber) => this.setState({ downstreamSubscriber }));
        }
        else {
            this.setState({ downstreamSubscriber: { data: null, state: LoadingStatus.Done } as Pending<Dtos.ParticipantDto> });
        }
        this.refreshChart();
    }

    private cancelBatchClaim = () => {
        connect(new Apis.BatchClaimApi().cancel(this.state.claimToCancel.claimId), null, response => {
            if (response.state === LoadingStatus.Done) {
                this.setState({ successMessage: "Claim cancelled successfully", errorMessage: null });
                this.claimStore.refresh();
                this.refreshChart();
            }
            if (response.state === LoadingStatus.Failed) {
                this.setState({ errorMessage: response.error.userMessage || "Error cancelling claim", successMessage: null });
            }
        });
    }

    private refreshChart() {
        connect(new Apis.ParticipantClaimSummaryApi().getClaimedAdrPositionSummaryForEventId({ eventId: this.props.eventId, participantId: this.props.participantId, includeInPreparationClaims: false, includeInPrepClaim: null }),
            this.state.eventPositionSummary, eventPositionSummary => this.setState({ eventPositionSummary }));
    }

    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField>) {
        this.claimStore.setCurrent({ eventId: this.props.eventId, participantId: this.props.participantId, uISort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private onCancelClicked(dto: Dtos.ParticipantEventClaimSummaryDto) {
        this.setState({ claimToCancel: dto });
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle("Claim Cancellation Confirmation")
            .setMessage(<p>{`Are you sure you want to cancel the Batch Claim #${dto.batchClaimNumber} ?`}</p>)
            .setConfirmHandler(this.cancelBatchClaim)
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("CancelConfirmationPopup")
            .open();
    }

    private onClaimRowSelected(dto: Dtos.ParticipantEventClaimSummaryDto) {
        if (dto.statusId !== Dtos.BatchClaimStatus.InPreparation && dto.statusId !== Dtos.BatchClaimStatus.Canceled) {
            if (!this.state.downstreamSubscriber.data || (this.state.downstreamSubscriber.data.canViewDetails && dto.userCanViewDetails)) {
                window.location.href = "/claims/BatchClaimDetails/" + dto.claimId;
            }
        }
        else if (dto.statusId === Dtos.BatchClaimStatus.InPreparation && this.props.canCreateClaimAsParticipant === true) {
            if (!dto.userCanContinue && this.props.participantId) {
                // no op
            }
            else if (!dto.userCanContinue) {
                this.setState({ errorMessage: "The Batch Claim can only be continued by the user that initiated it or a Participant Manager" });
            }
            else {
                window.location.href = "/claims/workflow?ClaimId=" + dto.claimId;
            }
        }
    }

    private onStartClaimClicked() {
        if (this.state.eventPositionSummary.state === LoadingStatus.Done) {
            let result = this.state.eventPositionSummary.data;
            if (result.sprRequired && !result.sprHasBeenDefined) {
                this.setState({ errorMessage: "Unable to start new claim as position has not been set." });
            }
            else if (result.sprHasBeenDefined && result.maxPositions === 0) {
                this.setState({ errorMessage: "Unable to start new claim as there are no positions to claim." });
            }
            else if (result.sprHasBeenDefined && !result.hasUnallocatedCategories && !(result.totalOpenPosition > 0)) {
                this.setState({ errorMessage: "Unable to start new claim as all open positions have been claimed." });
            }
            else
            {
                window.location.href = "/claims/workflow?EventId=" + this.props.eventId + "&ParticipantId=" + this.props.participantId;
            }
        }
    }

    private onViewPositions() {
        window.location.href = "/participantpositions?EventId=" + this.props.eventId;
    }

    private renderBanner() {
        return <EventBanner event={this.state.event}/>;
    }

    private renderChart() {
        return (Loader.for(this.state.eventPositionSummary, pos => {
            return (<div style={{ width: '300px' }}>
                <SummaryChart positionSummary={pos}/>
            </div>);
        }));
    }

    private renderGrid() {
        return (
            <div style={{ paddingRight: '5px', paddingTop: '18px', flexGrow: 1, flexBasis: '0px', minWidth: '1200px' }}>
                <ClaimsGrid
                    downstreamSubscriber={this.state.downstreamSubscriber}
                    canStartclaim={this.props.canCreateClaimAsParticipant}
                    canViewDSPositions={this.props.canViewDsPositions}
                    claims={this.claimStore.getCurrentData()}
                    event={this.state.event}
                    eventStatuses={this.state.statuses}
                    onPageChanged={options => this.onGridChanged(options)}
                    onCancelClicked={dto => this.onCancelClicked(dto)}
                    onRowSelected={dto => this.onClaimRowSelected(dto)}
                    onStartClaimClicked={() => this.onStartClaimClicked()}
                    onViewPositions={() => this.onViewPositions()}
                    canStartClaimForDownstreamSubscriber={this.props.canCreateClaimForDownstreamSubscriber}
                    onExcelExport={() => new Apis.ParticipantEventClaimApi().exportUrl(this.claimStore.getCurrentFilter())}
                    onExcelExportAll={() => new Apis.ParticipantEventClaimApi().exportDtcElectionsUrl({
                        eventId: this.props.eventId,
                        dSId: this.props.participantId != this.props.currentUserParticipantId ? this.props.participantId : null
                    })}
                   
                />
                {this.renderButtons()}
            </div>
        );
    };

    renderCreateMsg = () => {
        return this.state.createMessage && <Message type="success" message={this.state.createMessage} onClose={() => this.setState({ createMessage: null })} qa="SuccessMessage"/> }

    renderSuccessMsg = () => {
        return this.state.successMessage && <Message type="success" message={this.state.successMessage} onClose={() => this.setState({ successMessage: null })} qa="SuccessMessage"/> }

    renderErrorMsg = () => {
        return this.state.errorMessage && <Message type="alert" message={this.state.errorMessage} onClose={() => this.setState({ errorMessage: null })} qa="ErrorMessage"/> }

    renderButtons = () => {
        if (!this.props.canGoBack) {
            return null;
        }

        return <div className="float-end">
            <button className="btn btn-outline-secondary" onClick={() => window.location.href = `/participantpositions?EventId=${this.props.eventId}`} data-qa="BackButton">Back</button>
        </div>;
    }

    render() {
        let pageTitle = new Pending(LoadingStatus.Done, "Claims");
        if (this.props.participantId != this.props.currentUserParticipantId) {
            pageTitle = this.state.downstreamSubscriber.map(x => `Claims for ${x.name} (${x.dtcCode})`);
        }
        return (
            <div>
                <h1>{Loader.for(pageTitle, title => title)}</h1>
                {this.renderCreateMsg()}
                {this.renderSuccessMsg()}
                {this.renderErrorMsg()}
                {this.renderBanner()}
                <div style={{ width: '100%', minHeight:'400px', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {this.renderGrid()}
                    {this.renderChart()}
                </div>
            </div>
        );
    }
}
