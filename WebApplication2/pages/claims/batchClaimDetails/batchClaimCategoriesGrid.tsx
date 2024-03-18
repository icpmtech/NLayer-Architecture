import * as React from 'react';
import { connect, Pending, SimpleGridBuilder, Loader, IGridBuilderChangeArgs } from '../../../classes';
import { Apis, Dtos } from "../../../adr";

interface BatchClaimCategoriesGridProps {
    categories: Pending<Dtos.CategoryPositionDto[]>;
    isIrishCommonStockEvent: boolean;
};

interface BatchClaimCategoriesGridState {
};

export class BatchClaimCategoriesGrid extends React.Component<BatchClaimCategoriesGridProps, BatchClaimCategoriesGridState> {
    private gridPageSize: number = 20;

    constructor(props: BatchClaimCategoriesGridProps) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    private handleChange(options: IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>) {
    }

    private renderGrid() {
        return SimpleGridBuilder
            .ForPending<Dtos.CategoryPositionDto>(this.props.categories, 50)
            .addString("Category", x => x.categoryName, null, "Category")
            .addNumber(`# of ${this.props.isIrishCommonStockEvent ? "Positions" : "ADRs"}`, x => x.adrPosition, null, "NumberOfPositionsADRs")
            .addString("# of BOs", x => (x.hasCategoryAdrs || x.beneficialOwnerCount === null ? "n/a" : x.beneficialOwnerCount).toString(), null, "NumberOfBOs")
            .addString("Election Status", x => (x.hasCategoryAdrs ? x.electionStatusName : "n/a"), null, "ElectionStatus")
            .withQA("Grid")
            .render();
    }

    render() {
        return Loader.for(this.props.categories, () => this.renderGrid());
    }
};