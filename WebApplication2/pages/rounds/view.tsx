import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';

interface Props {
    round: Framework.Pending<Dtos.RoundDto>;
    event: Framework.Pending<Dtos.EventDto>;
    categories: Framework.Pending<Dtos.RoundCategorySummaryDto[]>;
    onBackToList: { (): void };
    onViewCategory: { (id:number): void };
    onEdit: { (id: number): void };
    onAddCategory: {():void};
    onToggleAvailable: { (): void };
    canToggleAvailable: boolean;
    onToggleLocked: { (): void };
    canToggleLocked: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onDelete: { (): void };
    eventTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
}

interface State {
};

export class View extends React.Component<Props, State> {

    private widget: kendo.ui.Upload;
    private elem: HTMLElement;
    
    render() {
        return <div>
                   {this.renderContent()}
                   {this.renderButtons()}
               </div>;
    }

    private renderContent() {
        let combined = Framework.Pending.combine(this.props.round, this.props.categories, this.props.eventTypes, (round, categories, eventTypes) => { return { round, categories, eventTypes } });
        return Framework.Loader.for(combined, data => (
            <div>
                {this.renderForm(data.round, data.eventTypes)}
                <h4>Round categories</h4>
                <div id="cat-rule-grid" data-qa="Categories">
                    {this.renderCategories(data.categories, data.eventTypes)}
                </div>
                <section id="round-reports" data-qa="RoundReports">
                    {this.renderDtccRpaReport()}
                </section>
                <Components.AllDatesNY />
            </div>
        ));
    }

    private renderForm(round: Dtos.RoundDto, roundTypes: Dtos.EnumDisplayDto[]) {
        let roundTypesMapped = roundTypes.map(x => { return { name: x.label, id: x.value } })
        return new Framework.FormBuilder(round)
            .withQA("goal-round-details")
            .isDisabled(true)
            .isWide(true)
            .addTextInput("Filing Method", x => x.filingMethod.name, () => { }, "FilingMethod")
            .addDropdown("Round Type", roundTypesMapped, m => roundTypesMapped.find(x => x.id === m.roundType), (m, v) => { m.roundType = v.id }, "RoundType")
            .addTextInput("Round Name", x => x.name, () => { }, "RoundName")
            .addDateTime("Start Date and Time", x => x.start, () => { }, "StartDateAndTime")
            .addDateTime("Claim Submission Deadline Date and Time", x => x.claimSubmissionDeadline, () => { }, "ClaimSubmissionDeadlineDateAndTime")
            .addYesNo("DTCC Supported", x => x.dtccSupported, () => { }, "DtccSupported")
            .addDateTime("CA Web Election Deadline Date and Time", x => x.caWebDeadline, () => { }, "CaWebElectionDeadlineDateAndTime")
            .addTextInput("Paying Party", x => x.payingAgent, () => { }, "PayingParty")
            .addTextInput("Payment Method", x => x.paymentMethod.name, () => { }, "PaymentMethod")
            .addNumber("Minimum Charge per BO (USD)", x => x.minimumCharge, () => { }, "MinimumChargePerBOUSD", undefined, { width: '230px' })
            .addNumber("Expected payment period (days)", x => x.expectedPaymentPeriod, () => { }, "ExpectedPaymentPeriodDays", undefined, { width: '230px' })
            .addYesNo("ADR/ORD Ratio Rounding", x => x.adrOrdRatioRounding, () => { }, "AdrORDRatioRounding")
            .addCustom("Availability to Submit Claims",
                <div style={{ marginTop: "7px" }}>{this.props.round.data.isLocked
                    ? "Locked"
                    : this.props.round.data.isAvailiable
                    ? "Available"
                        : "Unavailable"}</div>, "AvailabilityToSubmitClaims")
            .addNumber("FX Rate", x => x.fxRate, (m, v) => { }, "FxRate", undefined, { width: '230px' })
            .addNumber("Custodial Fee Amount (curr)", x => x.custodialFeeAmountCurrency, (m, v) => { }, "CustodialFeeAmount", undefined, { width: '230px' })
            .addNumber("Tax Relief Fee Rate", x => x.taxReliefFeeRate, (m, v) => { }, "TaxReliefFeeRate", undefined, { width: '230px' })
            .render();
    }

    private renderCategories(categories: Dtos.RoundCategorySummaryDto[], categoryTypes: Dtos.EnumDisplayDto[]) {
        let catTypesMapped = categoryTypes.map(x => { return { name: x.label, id: x.value } })
        let grid = Framework.SimpleGridBuilder.For(categories)
            .setNoDataMessage("No categories")
            .isNavigatable()
            .isResizable()
            .isScrollable()
            .setRowChangeHandler((m) => this.props.onViewCategory(m.id))
            .addString("Category Description", x => x.description, null, "CategoryDescription")
            .addString("Category Type", x => catTypesMapped.find(z => z.id == x.categoryType).name, null, "CategoryType")
            .addPercentage("Reclaim Rate", x => x.reclaimRatePercentage, null, "ReclaimRate")
            .addPercentage("Withholding Rate", x => x.whtRatePercentage, null, "WithholdingRate")
            .addYesNo("Category Elections", x => x.hasCategoryAdrs, null, "CategoryElections")
            .addYesNo("Subtract Claim Position from Open Position", x => x.includeInAdrLimit, null, "SubtractClaimPositionFromOpenPosition")
            .addNumber("Reclaim Fee", x => x.reclaimFee, (m, v) => m.reclaimFee = v, "ReclaimFee", null)
            .addPercentage("Depositary Bank", x => x.depositaryBankPercent, (m, v) => m.depositaryBankPercent = v, "DepositaryBank", null)
            .addPercentage("Tax Relief Fee Rate", x => x.taxReliefFeeRate, (m, v) => m.taxReliefFeeRate = v, "TaxReliefFeeRate", null)
            .addCustomColumn("", cat => cat.hasGeneratedBatchClaimDocs || cat.hasGeneratedEntityGroupDocs ? <i className="fa fa-file-text-o"></i> : null, () => null, null, null, "HasGeneratedDocs",{ headerTemplate: "" })
            .styleRow(cat => {
                if (cat.hasGeneratedBatchClaimDocs || cat.hasGeneratedEntityGroupDocs) return ["k-grid-row-highlight-blue"];
            })
            .displayRowTooltip(cat => {
                if (cat.hasGeneratedBatchClaimDocs && cat.hasGeneratedEntityGroupDocs) return {tooltipText: "Category has batch claim and entity group documents", width: 180};
                else if (cat.hasGeneratedBatchClaimDocs) return {tooltipText: "Category has batch claim documents", width: 180};
                else if (cat.hasGeneratedEntityGroupDocs) return {tooltipText: "Category has entity group documents", width: 180};
            });
            if (this.props.canEdit) {
                grid.addButton("Add category", () => this.props.onAddCategory(), { dataQA: "AddCategoryButton", pushRemainingRight: true});
            }
        return grid.render();
    }

    private renderDtccRpaReport() {
    }

    private renderButtons() {
        let round = this.props.round && this.props.round.data;
        let disabled = !this.props.round || !this.props.round.isDone();
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBackToList()} data-qa="BackToListButton">Back to list</button>
                {this.props.canToggleAvailable ? <button className="btn btn-outline-secondary" onClick={() => this.props.onToggleAvailable()} disabled={disabled || round.isLocked} data-qa="MakeAvailableUnavailableButton">{round && round.isAvailiable ? "Make Unavailable" : "Make Available"}</button> : null}
                {this.props.canToggleLocked ? <button className="btn btn-outline-secondary" onClick={() => this.props.onToggleLocked()} disabled={disabled} data-qa="LockUnlockButton">{round && round.isLocked ? "Unlock" : "Lock"}</button> : null}
                {this.props.canDelete ? <button className="btn btn-outline-secondary" onClick={() => this.props.onDelete()} disabled={disabled} data-qa="DeleteButton">Delete</button> : null }
                {this.props.canEdit ? <button className="btn btn-primary" onClick={() => this.props.onEdit(this.props.round.data.id)} disabled={disabled} data-qa="EditButton">Edit</button> : null }
            </div>
        );
  }
}
