import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { safeClone, connect, Pending, PagedDataState, PageCache, PopupBuilder, Loader, IGridBuilderChangeArgs, AppError, DialogBuilder, LoadingStatus } from '../../classes';
import { List } from './list';
import { Upload } from './upload';
import { Audit } from './audit';
import { EventBanner } from '../claims/participantEventClaims/eventBanner';
import { AutoComplete, Message, Error } from '../../components';
import { AddPosition } from './addPosition';
import { ReasonPopup } from './reasonPopup';

interface Props {
    eventId: number;
    canUpload: boolean;
    canDelete: boolean;
    showAllParticipants: boolean;
    isGoalUser: boolean;
    participantId: number;
}

interface State {
    audit?: Pending<Dtos.ParticipantAuditDto>;
    event?: Pending<Dtos.EventDto>;
    participants?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    downstreamSubscribers?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    selected?: Dtos.ParticipantListSummaryDto;
    selectedAdrInfo?: Pending<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto>;
    positions?: Pending<Dtos.ParticipantPositionDto[]>;
    participantPositionsCache?: Dtos.ParticipantPositionDto[];
    claimApprovePositions?: Pending<Dtos.ParticipantClaimedApprovedPositionsDto[]>;
    requiresSaveReason: Pending<boolean>;

    deleteError?: AppError;

    downloadUrl?: string;
    participantPositionsAllowed?: boolean;
    positionsUpdated: boolean;
    message: string;
}

export class Page extends React.Component<Props, State>{
    private clearDialog: PopupBuilder;
    private uploadDialog: PopupBuilder;

    constructor(props: Props) {
        super(props);
        this.state = {
            audit: new Pending<Dtos.ParticipantAuditDto>(),
            event: new Pending<Dtos.EventDto>(),
            positions: new Pending<Dtos.ParticipantPositionDto[]>(),
            downloadUrl: new Apis.ParticipantPositionsApi().downloadUrl(props.eventId, -1),
            participants: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(),
            selected: { id: null } as Dtos.ParticipantListSummaryDto,
            participantPositionsAllowed: false,
            deleteError: null,
            selectedAdrInfo: new Pending<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto>(),
            claimApprovePositions: new Pending<Dtos.ParticipantClaimedApprovedPositionsDto[]>(),
            positionsUpdated: false,
            message: null,
            requiresSaveReason: new Pending(LoadingStatus.Done, true)
        };
    }

    componentDidMount() {
        if (this.props.showAllParticipants) {
            let query: Dtos.ParticipantPositionsForEventQuery = {
                eventId: this.props.eventId,
                participantId: (this.props.showAllParticipants && !this.state.selected.id ? null : this.state.selected.id),
                sort: null,
                uiFilters: null
            };
            connect(new Apis.ParticipantPositionsApi().getAll(query, 1, 10000), null, p => this.setState({ participantPositionsCache: p.data != null ? p.data.items : null }));
        }

        let participantQuery: Dtos.ParticipantsListQuery = {
            includeParticipants: true,
            includeDownstreamSubscribers: false,
            sort: { field: Dtos.ParticipantSortField.Name, asscending: true },
            uiFilters: null
        };
        connect(new Apis.ParticipantsApi().search(participantQuery, 1, 10000), this.state.participants, participants => this.setState({ participants }));

        this.loadSaveReasonRequired();
        this.loadParticipants();
        this.loadDownstreamSubscribers();
    }

    componentWillMount() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.event, event => this.setState({ event }));
        connect(new Apis.ParticipantPositionsApi().getClaimedApproved({ eventId: this.props.eventId, showDS: this.props.showAllParticipants }),
            this.state.claimApprovePositions,
            pos => this.setState({ claimApprovePositions: pos })
        );
        this.loadAudit();
    }

    render() {
        return (
            <div>
                {!this.props.isGoalUser && this.renderHeader()}

                {this.state.deleteError && <Error error={this.state.deleteError} qa="ParticipantPositionError"/>}

                <Message type="success" message={this.state.message} hide={!this.state.message} qa="SuccessMessage"/>

                <div>
                    {this.props.showAllParticipants && this.renderParticipantSelection()}
                </div>

                {(this.props.showAllParticipants && !this.state.participantPositionsAllowed && this.state.selected.id > 0) &&
                    <Error
                    error={null}
                    customError={["Cannot set positions for downstream subscribers as selected participant does not yet have a defined position"]}
                    qa="NoDefinedPositionError"
                    />}

                {this.props.showAllParticipants && this.state.participantPositionsAllowed &&
                    Loader.for(this.state.selectedAdrInfo, info => (
                        <div className="mb-3">
                            <div className="row">
                                <div className="col-md-5 offset-md-1"><strong>Participant RD Position:</strong></div>
                                <div className="col-md-2" data-qa="ParticipantRdPosition">{new Intl.NumberFormat('en-US').format(info.maxPositions)}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-5 offset-md-1"><strong>ADRs Claimed (only Participant claims):</strong></div>
                                <div className="col-md-2" data-qa="AdrsClaimedOnlyParticipantClaims">{new Intl.NumberFormat('en-US').format(info.allocatedClaimed)}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-5 offset-md-1"><strong>ADRs Claimed (inc. DS claims):</strong></div>
                                <div className="col-md-2" data-qa="AdrsClaimedIncludingDsClaims">{new Intl.NumberFormat('en-US').format(info.allocatedClaimed + info.claimedDSPosition)}</div>
                            </div>
                        </div>
                    ))}

                {(!this.props.showAllParticipants || this.state.participantPositionsAllowed) &&
                    <List
                    positions={this.state.positions}
                    eventId={this.props.eventId}
                    showClaimedTotals={this.props.isGoalUser && !this.props.showAllParticipants}
                    canContinueToDetails={this.props.isGoalUser}
                    claimedApprovedPositions={this.state.claimApprovePositions}
                    downloadUrl={this.state.downloadUrl}
                    canUpload={this.props.canUpload}
                    canUpdate={this.props.canUpload}
                    canDelete={this.props.canDelete}
                    onViewClaims={(x) => this.onViewClaims(x)}
                    onUpload={() => this.onUpload()}
                    onClear={() => this.onClear()}
                    onPositionUpdated={() => this.onPositionUpdated()}
                    onAdd={() => this.addPosition()}
                    onDeletePosition={(x) => this.onDeletePosition(x)}
                   
                    />}
                {this.renderButtons()}

                {(!this.props.showAllParticipants || (this.state.selected && this.state.participantPositionsAllowed)) && <Audit audit={this.state.audit}/>}
            </div>
        );
    }

    renderHeader() {
        return (
            <div>
                <h1>Downstream Subscriber Positions</h1>
                <EventBanner event={this.state.event}/>
            </div>
        );
    }

    renderButtons() {
        return (
            <div className="text-end">
                {!this.props.isGoalUser && <button className="btn btn-outline-secondary" onClick={() => this.goBack()} data-qa="BackButton">Back</button>}
                {this.state.positionsUpdated && <button className="btn btn-primary" onClick={() => this.savePositions()} data-qa="SaveButton">Save</button>}
            </div>
        );
    }

    renderParticipantField() {
        return Loader.for(this.state.participants.map(x => x.items), participants => {
            const TypedAutoComplete = AutoComplete as Newable<AutoComplete<Dtos.ParticipantListSummaryDto>>;
            return <TypedAutoComplete
                options={participants}
                onChange={value => this.handleParticipantChange(value)}
                onSelect={value => { }}
                map={m => m.dtcCode + " - " + m.name}
                value={participants.find(p => p.id === this.state.selected.id)}
                qa="ParticipantTypedAutoComplete"
            />
        });
    }

    renderParticipantSelection() {
        return (
            <div className="mb-3">
                <div className="row">
                    <div className="col-md-6 offset-md-1">
                        <div><strong>Select a participant</strong></div>
                        <div data-qa="SelectAParticipant">{this.renderParticipantField()}</div>
                    </div>
                </div>
            </div>
        );
    }

    private loadSaveReasonRequired() {
        connect(new Apis.ParticipantPositionsApi().getPositionsHasBeenSet(this.props.eventId, this.state.selected ? this.state.selected.id : null), null, audit => {
            this.setState({ requiresSaveReason: audit });
        });
    }

    private onDeletePosition(dto: Dtos.ParticipantPositionDto) {
        let positions = this.state.positions.data;
        positions = positions.filter(x => x != dto);
        this.setState({ positions: new Pending(LoadingStatus.Done, positions), positionsUpdated: true });
    }

    private onViewClaims(dto: Dtos.ParticipantPositionDto) {
        window.location.href = '/claims/listparticipant?EventId=' + this.props.eventId + '&ParticipantId=' + dto.participantId;
    }

    private onPositionUpdated() {
        this.setState({ positionsUpdated: true });
    }

    private addParticipantPositionsReasonDialog: PopupBuilder;
    private savePositions() {
        if (this.state.requiresSaveReason.data == true) {

            this.addParticipantPositionsReasonDialog = new PopupBuilder()
                .setWidth(800)
                .setTitle("Save Reason")
                .setContent(<ReasonPopup
                    onCancel={() => this.addParticipantPositionsReasonDialog.close()}
                    onConfirm={(reason, authoriser) => { this.confirmSavePositions(reason, authoriser); this.addParticipantPositionsReasonDialog.close(); }}
                   
                />)
                .withQA("SaveReasonPopup")
                ;

            this.addParticipantPositionsReasonDialog.open();
        }
        else {
            this.confirmSavePositions(null, null);
        }
    }

    private confirmSavePositions(reason: string, authoriser: string) {
        this.setState({ positionsUpdated: false });
        let positions = this.state.positions.data;

        let cmd = { eventId: this.props.eventId, participantId: this.state.selected ? this.state.selected.id : null, positions: positions, changeReason: reason, changeAuthoriser: authoriser } as Dtos.UpdateParticipantPositionsDto;

        connect(new Apis.ParticipantPositionsApi().update(cmd), null, x => {
            if (x.error) {
                this.setState({ deleteError: x.error, message: null });
            }
            else if (x.isDone()) {
                let errorRow = $(`.k-grid-content td`).toggleClass("cell-invalid", false).find('span').toggleClass('k-dirty', false);
                this.setState({ message: `${this.props.showAllParticipants || !this.props.isGoalUser ? "Downstream Subscriber" : "Participant"} positions updated successfully`, deleteError: null });
                this.loadParticipants();
                this.loadSaveReasonRequired();
                this.loadAudit();
            }
        });
    }

    private confirmDeletePositions(reason: string, authoriser: string) {
        var command = { eventId: this.props.eventId, participantId: this.state.selected ? this.state.selected.id : null, changeReason: reason, changeAuthoriser: authoriser };

        connect(new Apis.ParticipantPositionsApi().delete(command), null, x => {
            if (x.state === LoadingStatus.Failed) {
                this.setState({ deleteError: x.error });
            }
            else if (x.state === LoadingStatus.Done) {
                this.loadAudit();
                this.loadParticipants();
                this.setState({ positionsUpdated: false });
                this.loadSaveReasonRequired();
            }
        });
    }

    private goBack() {
        window.location.href = "/claims/listparticipant?EventId=" + this.props.eventId;
    }

    private addPositionDialog: PopupBuilder;
    private addPosition() {
        let currentParticipants = this.state.positions.data.map(o => o.participantId);
        let availableParticipants = (this.state.downstreamSubscribers || this.state.participants).map(x => x.items.filter(y => currentParticipants.indexOf(y.id) == -1));

        this.addPositionDialog = new PopupBuilder()
            .setWidth(750)
            .setTitle("Add Adr Position")
            .setContent(<AddPosition
                participants={availableParticipants}
                isDownstreamSubscriber={!!(this.state.selected.id || this.props.participantId)}
                onConfirm={(ptc, position) => { this.addParticipantPosition(ptc, position); this.addPositionDialog.close(); }}
                onCancel={() => this.addPositionDialog.close()}
                qa="AddAdrPosition"
            />)
            ;

        this.addPositionDialog.open();
    }

    private addParticipantPosition(participant: Dtos.ParticipantSummaryDto, position: number) {
        var data = safeClone(this.state.positions.data);

        var item = { adrPosition: position, participantId: participant.id, dtcCode: participant.dtcCode, name: participant.name, id: null };
        data.push(item);

        this.setState({ positionsUpdated: true, positions: new Pending(LoadingStatus.Done, data) });
    }

    private handleParticipantChange(participant: Dtos.ParticipantListSummaryDto) {
        this.setState({ selected: participant });

        let query: Dtos.ParticipantPositionsForEventQuery = {
            eventId: this.props.eventId,
            participantId: this.state.selected.id,
            sort: null,
            uiFilters: []
        };

        var maxPositionForCurrentParticipant = this.state.participantPositionsCache.find(x => x.participantId == participant.id);
        var allowChange = this.state.participantPositionsCache.length === 0 || (maxPositionForCurrentParticipant && maxPositionForCurrentParticipant.adrPosition > 0);

        this.setState({ participantPositionsAllowed: allowChange, downloadUrl: new Apis.ParticipantPositionsApi().downloadUrl(this.props.eventId, participant.id), deleteError: null });

        connect(
            new Apis.ParticipantClaimSummaryApi().getClaimedAdrPositionSummaryForEventId({ eventId: this.props.eventId, participantId: this.state.selected.id, includeInPreparationClaims: false, includeInPrepClaim: null }),
            this.state.selectedAdrInfo,
            info => { this.setState({ selectedAdrInfo: info }) }
        );
        this.loadAudit();
        this.loadParticipants();
        this.loadDownstreamSubscribers();
        this.loadSaveReasonRequired();
    }

    private onClear() {
        this.clearDialog = new PopupBuilder()
            .setWidth(800)
            .setTitle("Clear Positions")
            .withQA("ClearPositionsPopup")
            .setContent(
            <div>
                <p>Are you sure you want to delete the positions for this event?</p>
                <ReasonPopup
                    onCancel={() => this.clearDialog.close()}
                    onConfirm={(reason, authoriser) => { this.confirmDeletePositions(reason, authoriser); this.clearDialog.close(); }}
                    confirmText={"Clear Positions"}
                   
                />
            </div>)
            ;

        this.clearDialog.open();
    }

    private onUpload() {
        this.uploadDialog = new PopupBuilder()
            .setTitle("Upload positions")
            .withQA("UploadPositionsPopup")
            .setContent(<Upload
                eventId={this.props.eventId}
                participantId={this.state.selected.id}
                isGoalUser={this.props.isGoalUser}
                saveUrl={"/api/participantpositions/upload"}
                onUploadComplete={() => this.onUploadComplete()}
                onClose={() => this.onUploadClose()}
                requiresSaveReason={this.state.requiresSaveReason.data}
               
            />)
            .setOnCloseAction(() => this.onUploadClose())
            ;
        this.uploadDialog.open();
    }

    private onUploadClose() {
        this.uploadDialog && this.uploadDialog.destroy();
        this.uploadDialog = null;
    }

    private onUploadComplete() {
        // refresh positions
        this.loadAudit();
        this.loadParticipants();
        this.loadDownstreamSubscribers();
        this.loadSaveReasonRequired();
    }

    private loadAudit() {
        connect(new Apis.ParticipantPositionsApi().audit(this.props.eventId, this.state.selected ? this.state.selected.id : null), this.state.audit, audit => this.setState({ audit }));
    }

    private loadParticipants() {
        connect(new Apis.ParticipantPositionsApi().getAll({ eventId: this.props.eventId, participantId: (this.props.showAllParticipants && !this.state.selected.id ? null : this.state.selected.id), sort: null, uiFilters: [] }, 1, 10000), null, positions => {
            this.setState({ positions: positions.map(x => x.items) });
        });
    }

    private loadDownstreamSubscribers() {
        var participantId = this.state.selected.id || this.props.participantId;

        if (!participantId) {
            this.setState({ downstreamSubscribers: null });
        }
        else {
            let filter = { field: Dtos.ParticipantSortField.ParentId, values: [{ type: Dtos.FilterType.Equals, isOr: false, options: [participantId.toString()] }] } as Dtos.FilterExpression<Dtos.ParticipantSortField>;
            let query = { includeDownstreamSubscribers: true, includeParticipants: false, uiFilters: [filter], sort: null } as Dtos.ParticipantsListQuery;
            connect(new Apis.ParticipantsApi().search(query, 1, 10000), null, ds => {
                this.setState({ downstreamSubscribers: ds, message: null });
            });
        }
    }
}