import * as React from 'react';
import { Apis, Dtos } from '../../../../adr';
import { connect, LoadingStatus, Pending, SimpleGridBuilder } from '../../../../classes';

interface GridProps {
    claimId: number;
    eventSecurityType: Dtos.SecurityType;
};

interface GridState {
    categoryData?: Pending<Dtos.CategoryPositionDto[]>;
};

export class CategoryPreview extends React.Component<GridProps, GridState> {

    constructor() {
        super();

        this.state = { categoryData: new Pending<Dtos.CategoryPositionDto[]>(LoadingStatus.Preload) };
    }

    render() {
        return <div>
            <legend>Breakdown of Categories</legend>
            <div className="row">
                <div className="col-md-12" data-qa="BreakdownOfCategories">
                    {this.renderGrid()}
                </div>
            </div>
        </div>
    }

    componentDidMount() {
        connect(new Apis.CategoryElectionsApi().getCategoryPositions(this.props.claimId, true), this.state.categoryData, x => {
            this.setState({ categoryData: x })
        });
    }

    private renderGrid() {
        return SimpleGridBuilder.ForPending(this.state.categoryData)
            .isResizable()
            .isScrollable()
            .addString("Category", x => x.categoryName, null, "Category")
            .addNumber("# " + (this.props.eventSecurityType === Dtos.SecurityType.CommonStock ? "Shares" : "ADRs") +" Claimed", x => x.adrPosition, null, "SharesADRsClaimed")
            .addString("# Beneficial Owners", x => x.beneficialOwnerCount ? x.beneficialOwnerCount.toString() : "n/a", null, "NumberBeneficialOwners")
            .withQA("Grid")
            .render();
    }
}