import { CategoryDtoValidator } from '../../../validators/categoryDtoValidator';
import { RuleDtoValidator } from '../../../validators/ruleDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder, AppError, DialogBuilder } from '../../../classes';
import * as Form from '../../../components';
import { RuleEditor } from './ruleEditor';
import { Audit } from '../../../components/audit';
import { EditRules } from './editrules'

interface EditProps {
    countries: Pending<Dtos.CountrySummaryDto[]>;
    filingMethods: Pending<Dtos.FilingMethodDto[]>;
    entityTypes: Pending<Dtos.EntityTypeSummaryDto[]>;
    documents: Pending<Dtos.DocumentSummaryDto[]>;
    category: Pending<Dtos.CategoryDto>;
    validation: CategoryDtoValidator;
    onChange: { (dto: Dtos.CategoryDto): void };
    onCancel: { (): void };
    onSave: { (): void };
    beforeRuleChange: { (ruleDto: Dtos.DocumentRuleDto): Promise<void> };
}

export class Edit extends React.Component<EditProps, { isDirty?: boolean}> {

    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Pending.combine(this.props.category, mappedCountries, this.props.filingMethods, (category, countries, filingMethods) => { return { category, countries, filingMethods }; });
        let val = this.props.validation;

        return Loader.for(combinedAll, all => {
            let canEditFields = !all.category.rules || !all.category.rules.length;

            return new FormBuilder(all.category)
                .isWide(true)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto); })
                .addDropdown("Country of Issuance", all.countries, m => all.countries.find(x => x.id === (m.countryOfIssuance && m.countryOfIssuance.id)), (m, v) => m.countryOfIssuance = v && this.props.countries.data.find(x => x.id === v.id), "CountryOfIssuanceInput", val.countryOfIssuance, { disabled: !canEditFields })
                .addDropdown("Filing Method", all.filingMethods, m => all.filingMethods.find(x => x.id === (m.filingMethod && m.filingMethod.id)), (m, v) => m.filingMethod = v && this.props.filingMethods.data.find(x => x.id === v.id), "FilingMethodInput", val.filingMethod, { disabled: !canEditFields })
                .addTextInput("Category Description:", m => m.description, (m, v) => m.description = v, "CategoryDescriptionInput", val.description)
                .addNumber("Reclaim Rate(%):", m => m.reclaimRate, (m, v) => m.reclaimRate = v, "ReclaimRateInput", val.reclaimRate, { decimals: 4 })
                .addNumber("Withholding Rate(%):", m => m.whtRate, (m, v) => m.whtRate = v, "WithholdingRateInput", null, { decimals: 4 })
                .addTextArea("Category Notes", m => m.notes, (m, v) => m.notes = v, "CategoryNotesInput", val.notes)
                .withQA("CategoriesForm")
                .render()
        }
        );
    }

    private renderButtons() {
        let saveButtonText = this.props.category.isReady() && this.props.category.data.id ? "Update" : "Save"; 
        return (
            <div className="text-end" data-qa="Buttons">
                <button className="btn btn-outline-secondary" onClick={() => this.confirmCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} disabled={!this.props.category.isReady()} data-qa="SaveButton">{saveButtonText}</button>
            </div>
        );
    }

    private renderError() {
        return <Form.Error error={this.props.category.error} qa="CategoriesEditError"/>;
    }

    private renderRules() {
        if (!this.props.category.isReady()) return null;
        let cat = this.props.category.data;
        let canEditRules = !!cat.countryOfIssuance && !!cat.filingMethod;
        return <EditRules rules={cat.rules} countries={this.props.countries} documents={this.props.documents} entityTypes={this.props.entityTypes} onChange={(dto) => { this.setState({ isDirty: true }); this.onRulesChange(dto); }} disabled={!canEditRules} beforeChange={this.props.beforeRuleChange}/>;
    }

    private renderAudit() {
        if (!this.props.category.data || !this.props.category.data.id) return null;
        return <Audit auditableEntity={this.props.category.data}/>
    }

    render() {
        return (
            <div>
                {this.renderError()}
                {this.renderform()}
                {this.renderRules()}
                {this.renderAudit()}
                {this.renderButtons()}
            </div>
        );
    }

    private onRulesChange(rules: Dtos.DocumentRuleDto[]) {
        let cat = this.props.category.data;
        cat.rules = rules;
        this.props.onChange(cat);
    }

    private confirmCancelDialog: DialogBuilder;
    private confirmCancel() {
        if (this.state && this.state.isDirty) {
            let message = <div>
                <p data-qa="UnsavedChangesMessage">You have unsaved changes, are you sure you want to cancel?</p>
            </div>;

            this.confirmCancelDialog = new DialogBuilder()
                .setMessage(message)
                .withQA("UnsavedChangesDialog")
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