import * as React from 'react';
import { PageCache, PagedDataState, IGridBuilderChangeArgs } from '../../../classes';
import { Dtos, Apis } from "../../../adr";
import { BatchClaimsGrid } from './batchClaimsGrid';
import { History } from '../../../classes/History';

interface PageProps {
    statuses: Dtos.BatchClaimStatusDto[];
    query: Dtos.GetAllBatchClaimsQuery;
    title: string;
    showCreationButtons: boolean;
    onGridStateChange: (options: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>) => void;
    gridState: IGridBuilderChangeArgs<Dtos.GetAllBatchClaimsQuery_SortField>;
    showDtcCode: boolean;
    showDsCode: boolean;
    createClaimUrl: string;
    selectClaimUrl: string;
    urlHistory: History;
    onCreateBatchClaim: () => void;
    getPartDs: boolean;
};

interface PageState {
    claimsList?: PagedDataState<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;
};

export class BatchClaimsList extends React.Component<PageProps, PageState> {
    private claimsStore: PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>;

    constructor(props: PageProps) {
        super(props);

        this.state = {
        };

        this.claimsStore = new PageCache<Dtos.ListBatchClaimsDto, Dtos.GetAllBatchClaimsQuery>(
            (query, page, pageSize) => new Apis.ClaimsApi().getClaims(query, page, pageSize),
            () => this.state.claimsList,
            (claimsList) => this.setState({ claimsList })
        );
    }

    render() {
        return (
            <div>
                <h1>{this.props.title}</h1>
                <BatchClaimsGrid statuses={this.props.statuses} claimsStore={this.claimsStore} onGridStateChange={this.props.onGridStateChange}
                    gridState={this.props.gridState} showDtcCode={this.props.showDtcCode} showDsCode={this.props.showDsCode}
                    canCreateBatchClaim={this.props.showCreationButtons} createClaimUrl={this.props.createClaimUrl} selectClaimUrl={this.props.selectClaimUrl}
                    urlHistory={this.props.urlHistory} onCreateBatchClaim={this.props.onCreateBatchClaim} getPartDs={this.props.getPartDs}/>
            </div>
        );
    }
}