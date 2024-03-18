import * as React from 'react';
import { connect, Loader, PageableGridBuilder, PopupBuilder, Pending, PageCache, UrlState, PagedDataState, IGridBuilderChangeArgs, UrlHelpers } from '../../../classes';
import { Depository, DepositoryString, DepositoryStringValues, Message } from '../../../components';
import { AddBatchClaimPopup, StartBatchClaimData } from './AddBatchClaimPopup';
import { Apis, Dtos } from '../../../adr';
import { History } from '../../../classes/History';
import { BatchClaimsList } from './batchClaimsList';

interface PageProps {
    createClaimUrl: string;
    selectClaimUrl: string;
    canCreateBatchClaim: boolean;
    isGoalView: boolean;
    showDsClaims: boolean;
};

interface PageState {
    batchClaimsData?: PagedDataState<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    dsBatchClaimsData?: PagedDataState<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    statuses?: Pending<Dtos.BatchClaimStatusDto[]>;
    gridState?: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
    dsGridState?: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
    createMessage?: string;
};

interface UrlProps {
    showClaimConfirmation?: boolean;
    gridState?: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
    dsGridState?: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
}

export class ParticipantBatchClaims extends React.Component<PageProps, PageState> {
    private popup: PopupBuilder;
    private pageCache: PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    private dsPageCache: PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
    private claimsApi: Apis.ClaimsApi;
    private gridPageSize: number = 20;
    private urlHistory: History;
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private participantBatchClaimsQuery: Dtos.GetAllBatchClaimsQuery;
    private downstreamSubscriberBatchClaimsQuery: Dtos.GetAllBatchClaimsQuery;

    constructor(props) {
        super(props);

        let urlProps = this.url.read();
        this.urlHistory = new History(false);
        
        this.state = {
            statuses: new Pending<Dtos.BatchClaimStatusDto[]>(),
            gridState: urlProps.gridState,
            dsGridState: urlProps.dsGridState,
            createMessage: !!urlProps.showClaimConfirmation ? "Claim created successfully" : ""
        };
    }

    private updateUrlFromGridState(options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) {
        let filterOptions = { filters: options.filters, sort: options.sort, page: options.page, pageSize: options.pageSize, qa:"UpdateUrlFromGridState" };
        this.url.update({ gridState: filterOptions, dsGridState: this.state.dsGridState});
    }

    private updateUrlFromDsGridState(options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) {
        let filterOptions = { filters: options.filters, sort: options.sort, page: options.page, pageSize: options.pageSize, qa: "UpdateUrlFromDsGridState" };
        this.url.update({ dsGridState: filterOptions, gridState: this.state.gridState});
    }

    componentDidMount() {
        connect(new Apis.BatchClaimStatusesApi().getAll(), this.state.statuses, statuses => {
            let state = this.state.gridState;
            let dsState = this.state.dsGridState;

            if (statuses.isReady()) {
                if (!state || !(!!state.filters || !!state.sort || !!state.page || !!state.pageSize)) {
                    let defaultFilter = {
                        filters: [this.getDefaultGridFilter(statuses.data)],
                        pageSize: this.gridPageSize,
                        page: 1,
                        sort: null
                    } as IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;

                    this.setState({ gridState: defaultFilter });
                }

                if (!dsState || !(!!dsState.filters || !!dsState.sort || !!dsState.page || !!dsState.pageSize)) {
                    let defaultFilter = {
                        filters: [this.getDefaultGridFilter(statuses.data)],
                        pageSize: this.gridPageSize,
                        page: 1,
                        sort: null
                    } as IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;

                    this.setState({ dsGridState: defaultFilter });
                }
            }

            this.setState({ statuses });
        });
    }

    handleSuccess = (data: StartBatchClaimData) => {
        window.location.href = UrlHelpers.buildUrl([this.props.createClaimUrl], data);
    }

    renderPopup = () => {
        if (!this.popup) {
            this.popup = new PopupBuilder().setTitle("Create Batch Claim");
        }

        this.popup.setContent(
            <AddBatchClaimPopup
                success={data => this.handleSuccess(data)}
                close={() => this.popup.close()}
                onDataLoaded={() => this.popup.centreWindow()}
               
            />
        ).render();
    }

    getDefaultGridFilter(statuses: Dtos.BatchClaimStatusDto[]): Dtos.FilterExpression<Dtos.GetAllBatchClaimsQuery_SortField> {
        let initialStateFilters = statuses.filter(x => x.name != "Canceled").map(x => {
            let values = { type: Dtos.FilterType.Equals, isOr: true, options: [x.name] };
            return values;
        });

       return { field: Dtos.GetAllBatchClaimsQuery_SortField.Status, values: initialStateFilters };
    }

    renderGrids() {
        return Loader.for(this.state.statuses, statuses => {

            this.participantBatchClaimsQuery = {
                uiFilters: this.state.gridState.filters,
                uISort: this.state.gridState.sort,
                getParticipantDownstreamSubscribers: false
            };

            this.downstreamSubscriberBatchClaimsQuery = {
                uiFilters: this.state.dsGridState.filters,
                uISort: this.state.dsGridState.sort,
                getParticipantDownstreamSubscribers: true
            };

            return (
                <div>

                    <BatchClaimsList statuses={statuses} query={this.participantBatchClaimsQuery} title={this.props.isGoalView ? "Participant Batch Claims" : "Batch Claims"}
                        onGridStateChange={(options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) => this.updateUrlFromGridState(options)}
                        gridState={this.state.gridState} showDtcCode={this.props.isGoalView} showDsCode={this.props.isGoalView}
                        createClaimUrl={this.props.createClaimUrl} showCreationButtons={this.props.canCreateBatchClaim}
                        selectClaimUrl={this.props.selectClaimUrl} urlHistory={this.urlHistory}
                        onCreateBatchClaim={() => this.renderPopup()} getPartDs={false}/>

                    {this.props.showDsClaims && <BatchClaimsList statuses={statuses} query={this.downstreamSubscriberBatchClaimsQuery} title={"Downstream Subscriber Batch Claims"}
                        onGridStateChange={(options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) => this.updateUrlFromDsGridState(options)}
                        gridState={this.state.dsGridState} showDtcCode={false} showDsCode={true}
                        createClaimUrl={this.props.createClaimUrl} showCreationButtons={false}
                        selectClaimUrl={this.props.selectClaimUrl} urlHistory={this.urlHistory}
                        onCreateBatchClaim={() => this.renderPopup()} getPartDs={true}/> }

                </div>
                );
        });
    }

    render() {
        return (
            <div>
                {this.state.createMessage && <Message type="success" message={this.state.createMessage} onClose={() => this.setState({ createMessage: "" })} qa="SuccessMessage"/>}
                {this.renderGrids()}
            </div>
        );
    }
}
