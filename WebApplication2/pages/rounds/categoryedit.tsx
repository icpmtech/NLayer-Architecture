import * as React from 'react';
import * as Framework from '../../classes';
import { RoundCategoryDtoValidator } from '../../validators/roundCategoryDtoValidator';
import { Dtos } from '../../adr';
import { EditRules } from '../admin/categories/editrules'
import { Rules } from '../admin/categories/rules'

interface Props {
    roundId: number;
    category: Framework.Pending<Dtos.RoundCategoryDto>;
    existingCategories: Framework.Pending<Dtos.RoundCategorySummaryDto[]>;
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    documents: Framework.Pending<Dtos.DocumentSummaryDto[]>;
    onCancel: { (): void };
    onSave: { (dto: Dtos.RoundCategoryDto): void };
    beforeRuleChange: { (ruleDto: Dtos.DocumentRuleDto): Promise<void> };
    categoryTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    roundTypeActual: Dtos.EventType;
    categoryPermissions: Framework.Pending<Dtos.RoundCategoryPermissionsDto>;
}

interface State {
    editor?: Dtos.RoundCategoryDto;
    validation?: RoundCategoryDtoValidator;
    isDirty?: boolean;
}

export class CategoryEdit extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = this.getEditorState(props.category);;
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.category.isDone() && this.props.category.data != nextProps.category.data) {
            this.setState(this.getEditorState(nextProps.category));
        }
    }

    private getEditorState(category: Framework.Pending<Dtos.RoundCategoryDto>): State {
        if (category.isDone()) {
            let dto = category.data || { eventRoundId: this.props.roundId, documentRules: [], hasCategoryAdrs: false, includeInAdrLimit: true } as Dtos.RoundCategoryDto;
            let editor = Framework.safeClone(dto);
            let validation = new RoundCategoryDtoValidator(editor, this.props.existingCategories.data, false);
            return { editor, validation, isDirty: false };
        }
        return { isDirty: false };
    }

    render() {
        var combined = Framework.Pending.combine(this.props.categoryPermissions, this.props.categoryTypes, (p, t) => { return { p, t }; });
        
        return Framework.Loader.for(combined, (x) =>
            <div>
                {this.renderForm(x.t)}
                {this.renderRules()}
                {this.renderButtons()}
            </div>);
    }

    private renderForm(types: Dtos.EnumDisplayDto[]) {
        let val = this.state.validation;
        let editor = this.state.editor;
        let typesMapped = types.filter(x => x.value !== Dtos.EventType.CashAndStockOption).map(x => { return { name: x.label, id: x.value } })

        return Framework.Loader.for(this.props.category, cat => {
            if (this.props.roundTypeActual !== Dtos.EventType.CashAndStockOption) {
                editor.categoryType = this.props.roundTypeActual;
            }

            return Framework.FormBuilder.for(editor)
                .withQA(editor.id ? "goal-category-edit" : "goal-category-create")
                .isWide(true)
                .setChangeHandler((dto) => this.onChange(dto))
                .addTextInput("Category Description", x => x.description, (m, v) => m.description = v, "CategoryDescription", val.description, { disabled: !this.props.categoryPermissions.data.canEditCategory })
                .addDropdown("Category Type", typesMapped, m => typesMapped.find(x => x.id === m.categoryType), (m, v) => { m.categoryType = v.id }, "CategoryType", val.categoryType, { disabled: this.props.roundTypeActual !== Dtos.EventType.CashAndStockOption || !this.props.categoryPermissions.data.canEditCategory })
                .addNumber("Reclaim Rate %", x => x.reclaimRatePercentage, (m, v) => m.reclaimRatePercentage = v, "ReclaimRate", val.reclaimRatePercentage)
                .addNumber("Withholding Rate %", x => x.whtRatePercentage, (m, v) => m.whtRatePercentage = v, "WithholdingRate", null)
                .addYesNo("Category Elections", x => x.hasCategoryAdrs, (m, v) => m.hasCategoryAdrs = v, "CategoryElections", val.hasCategoryAdrs, { disabled: !this.props.categoryPermissions.data.canEditCategory })
                .addYesNo("Subtract Claim Position from Open Position", x => x.includeInAdrLimit, (m, v) => m.includeInAdrLimit = v, "SubractClaimPositionFromOpenPosition", val.hasAdrLimit, { disabled: !this.props.categoryPermissions.data.canEditCategory })
                .addNumber("Reclaim Fee", x => x.reclaimFee, (m, v) => m.reclaimFee = v, "ReclaimFee", null)
                .addNumber("Depositary Bank %", x => x.depositaryBankPercent, (m, v) => m.depositaryBankPercent = v, "DepositoryBank", null)
                .addNumber("Tax Relief Fee Rate", x => x.taxReliefFeeRate, (m, v) => m.taxReliefFeeRate = v, "TaxReliefFeeRate", val.taxReliefFeeRate)
                .render();
        });
    }

    private renderRules() {
        if (this.props.category.isDone()) {
            return <EditRules rules={this.state.editor.documentRules} countries={this.props.countries} documents={this.props.documents} entityTypes={this.props.entityTypes} onChange={(dtos) => this.onRulesChange(dtos)} beforeChange={(dto) => this.props.beforeRuleChange(dto)} disabled={!(this.props.categoryPermissions.data && this.props.categoryPermissions.data.canEditCategoryRules)}/>;
        }
        return null;
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.confirmCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.onSave()} disabled={!this.props.category.isDone()} data-qa="SaveButton">Save</button>
            </div>
        );
    }

    private onRulesChange(dtos: Dtos.DocumentRuleDto[]) {
        var dto = this.state.editor;
        dto.documentRules = dtos;
        this.onChange(dto);
    }

    private onChange(dto: Dtos.RoundCategoryDto) {
        let validation = new RoundCategoryDtoValidator(dto, this.props.existingCategories.data, this.state.validation.showValidationErrors());
        this.setState({ editor: dto, validation, isDirty: true });
    }

    private onSave() {
        let validator = new RoundCategoryDtoValidator(this.state.editor, this.props.existingCategories.data, true);
        if (validator.isValid()) {
            this.props.onSave(this.state.editor);
        }
        else {
            this.setState({ validation: validator });
        }
    }

    private confirmCancelDialog: Framework.DialogBuilder;
    private confirmCancel() {
        if (this.state && this.state.isDirty) {
            let message = <div>
                <p>You have unsaved changes, are you sure you want to cancel?</p>
            </div>;

            this.confirmCancelDialog = new Framework.DialogBuilder()
                .setMessage(message)
                .setConfirmHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                    this.props.onCancel();
                })
                .setCancelHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                })
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel();
        }
    }
}