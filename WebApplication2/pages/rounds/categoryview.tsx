import * as React from 'react';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';
import { Rules } from '../admin/categories/rules'

interface Props {
    event: Framework.Pending<Dtos.EventDto>;
    category: Framework.Pending<Dtos.RoundCategoryDto>;
    categoryPermissions: Framework.Pending<Dtos.RoundCategoryPermissionsDto>;
    onBackToRound: { (): void };
    onEdit: { (): void };
    onDelete: { (): void };
    categoryTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
}

export class CategoryView extends React.Component<Props, {}> {
    render() {
        let combined = Framework.Pending.combine(this.props.category, this.props.categoryTypes, (category, categoryTypes) => { return { category, categoryTypes } });
        return <div>
            {Framework.Loader.for(combined, x =>
                <div>
                    {this.renderDetails(x.category, x.categoryTypes)}
                    {this.renderRules(x.category)}
                </div>
            )}
            {this.renderButtons()}
        </div>;
    }

    private renderDetails(category: Dtos.RoundCategoryDto, categoryTypes: Dtos.EnumDisplayDto[]) {
        let catTypesMapped = categoryTypes.map(x => { return { name: x.label, id: x.value } })
        return new Framework.FormBuilder(category)
            .withQA("goal-category-details")
            .isDisabled(true)
            .isWide(true)
            .addTextInput("Category Description", x => x.description, (m, v) => { }, "CategoryDescription")
            .addDropdown("Category Type", catTypesMapped, m => catTypesMapped.find(x => x.id === m.categoryType), (m, v) => { }, "CategoryType")
            .addNumber("Reclaim Rate %", x => x.reclaimRatePercentage, (m, v) => { }, "ReclaimRate")
            .addNumber("Withholding Rate %", x => x.whtRatePercentage, (m, v) => { }, "WithholdingRate")
            .addYesNo("Category Elections", x => x.hasCategoryAdrs, (m, v) => { }, "CategoryElections")
            .addYesNo("Subtract Claim Position from Open Position", x => x.includeInAdrLimit, (m, v) => { }, "SubtractClaimPositionFromOpenPosition")
            .addNumber("Reclaim Fee", x => x.reclaimFee, (m, v) => { }, "ReclaimFee")
            .addNumber("Depositary Bank %", x => x.depositaryBankPercent, (m, v) => { }, "DepositoryBank")
            .addNumber("Tax Relief Fee Rate", x => x.taxReliefFeeRate, (m, v) => { }, "TaxReliefFeeRate")
            .render();
    }

    private renderRules(category: Dtos.RoundCategoryDto) {
        return <Rules rules={category.documentRules}/>;
    }

    private renderButtons() {
        let disabled = !this.props.category.isDone() && !this.props.categoryPermissions.isDone();
        let permissions = this.props.categoryPermissions.data || {canDeleteCategory: false, canEditCategory: false, canEditCategoryRates: false, canModifyRulesPermission: false};
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBackToRound()} data-qa="BackToRoundButton">Back to round</button>
                {permissions.canDeleteCategory && (this.props.event.data.status !== Dtos.EventStatusLookup_Status.Canceled && this.props.event.data.status !== Dtos.EventStatusLookup_Status.Closed)
                    ? <button className="btn btn-outline-secondary" onClick={() => this.props.onDelete()} disabled={disabled} data-qa="DeleteButton">Delete</button> : null}
                {(permissions.canEditCategory || permissions.canEditCategoryRates) && (this.props.event.data.status !== Dtos.EventStatusLookup_Status.Canceled && this.props.event.data.status !== Dtos.EventStatusLookup_Status.Closed)
                    ? <button className="btn btn-primary" onClick={() => this.props.onEdit()} disabled={disabled} data-qa="EditButton">Edit</button> : null}
            </div>
        );
    }
}