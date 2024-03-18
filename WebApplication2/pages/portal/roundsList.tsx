import * as React from 'react';
import { PageCache, PagedDataState, IGridBuilderChangeArgs } from '../../classes';
import { Apis, Dtos } from '../../adr';
import { RoundsGrid } from './roundsGrid';

interface Props {
    query: Dtos.GetListEventRoundsQuery;
    title: string;
    showCreationButtons: boolean;
    gridState: IGridBuilderChangeArgs<Dtos.GetListEventRoundsQuery_SortField>;
    fixedFilters: Dtos.FilterExpression<Dtos.GetListEventRoundsQuery_SortField>[];
}

interface State {
    query: Dtos.GetListEventRoundsQuery;
    gridState: IGridBuilderChangeArgs<Dtos.GetListEventRoundsQuery_SortField>;
    roundsList?: PagedDataState<Dtos.EventWithRoundDetailsDto, Dtos.GetListEventRoundsQuery>;
}

export class RoundsList extends React.Component<Props, State> {
    private roundsStore: PageCache<Dtos.EventWithRoundDetailsDto, Dtos.GetListEventRoundsQuery>;

    constructor(props: Props) {
        super(props);

        this.roundsStore = new PageCache<Dtos.EventWithRoundDetailsDto, Dtos.GetListEventRoundsQuery>(
            (query, page, pageSize) => new Apis.EventRoundsApi().search(query, page, pageSize),
            () => this.state.roundsList,
            (roundsList) => this.setState({ roundsList })
        );

        let query = this.props.query;
        query.filingMethod = Dtos.FilingMethod.ReliefAtSource;
        
        this.state = { query: query, gridState: this.props.gridState };
    }

    render() {
        return (
            <div>
                <div><h3 style={{ display: "inline-block" }}>{this.props.title}</h3><span style={{ color: "grey" }}> (Next 30 Days)</span></div>

                <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <button className={"btn-small btn " + (this.state.query.filingMethod == Dtos.FilingMethod.ReliefAtSource ? "btn-primary" : "btn-outline-secondary")} onClick={() => this.setCurrentFilingMethod(Dtos.FilingMethod.ReliefAtSource)} data-qa="ReliefAtSourceButton">Relief At Source</button>
                    <button className={"btn-small btn " + (this.state.query.filingMethod == Dtos.FilingMethod.QuickRefund ? "btn-primary" : "btn-outline-secondary")} onClick={() => this.setCurrentFilingMethod(Dtos.FilingMethod.QuickRefund)} data-qa="QuickRefund">Quick Refund</button>
                    <button className={"btn-small btn " + (this.state.query.filingMethod == Dtos.FilingMethod.LongForm ? "btn-primary" : "btn-outline-secondary")} onClick={() => this.setCurrentFilingMethod(Dtos.FilingMethod.LongForm)} data-qa="LongFormButton">Long Form</button>
                </div>

                <RoundsGrid rounds={this.roundsStore.getCurrentData()} gridState={this.state.gridState} showCreationButtons={this.props.showCreationButtons} onGridChange={(options) => this.onGridChange(options)}/>
            </div>);
    }

    componentDidMount() {
        this.refreshGrid();
    }

    private refreshGrid() {
        this.roundsStore.setCurrent(this.state.query, this.state.gridState.page, this.state.gridState.pageSize, false);
    }

    private setCurrentFilingMethod(filingMethod: Dtos.FilingMethod) {
        let query = this.state.query;
        query.filingMethod = filingMethod;
        query.sort = this.state.gridState.sort;
        query.uiFilters = (this.state.gridState.filters || []).concat(this.props.fixedFilters);
        this.setState({ query: query});
        this.refreshGrid();
    }

    onGridChange(options: IGridBuilderChangeArgs<Dtos.GetListEventRoundsQuery_SortField>) {
        let gridState = this.state.gridState;
        let query = this.state.query;
        gridState.sort = options.sort || this.props.query.sort;
        gridState.filters = options.filters;
        query.sort = this.state.gridState.sort;
        query.uiFilters = (this.state.gridState.filters || []).concat(this.props.fixedFilters);
        this.setState({query: query, gridState: gridState});
        this.roundsStore.setCurrent(this.state.query, options.page, options.pageSize, false);
    }
}