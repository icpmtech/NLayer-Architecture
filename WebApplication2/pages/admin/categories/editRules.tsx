import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Form from '../../../components';
import { Pending, DialogBuilder } from '../../../classes';
import { RuleDtoValidator } from '../../../validators/ruleDtoValidator';
import { RuleEditor } from './ruleEditor';

interface Props {
    rules: Dtos.DocumentRuleDto[];
    beforeChange?: { (dto: Dtos.DocumentRuleDto): Promise<void> };
    onChange: { (dtos: Dtos.DocumentRuleDto[]): void };
    countries: Pending<Dtos.CountrySummaryDto[]>;
    entityTypes: Pending<Dtos.EntityTypeSummaryDto[]>;
    documents: Pending<Dtos.DocumentSummaryDto[]>;
    disabled: boolean;
}

interface State {
    documentRule?: Dtos.DocumentRuleDto,
    documentRuleValidation?: RuleDtoValidator,
    ruleIndex?: number
}

export class EditRules extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    render() {
        var tooltip = this.props.disabled ? "Cannot add rule until Country of Issuance and Filing Method have been set." : "";
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createRule()} disabled={this.props.disabled === true} title={tooltip} data-qa="AddRuleButton">Add rule</button></div>
                {this.renderRules()}
                {this.renderPopup()}
            </div>
        );
    }

    private renderRules() {
        if (!this.props.rules || !this.props.rules.length) return <div className="col-md-12 accordion" data-qa="ThisCategoryHasNoRules">This category has no rules</div>;
        return (
            <Form.Accordion>
                {this.renderGroupMessages()}
                {this.props.rules.map((x, i) => this.renderRule(x, i))}
            </Form.Accordion>
        );
    }

    private renderRule(rule: Dtos.DocumentRuleDto, index: number) {
        return (
            <Form.AccordionSection key={"rule" + index} title={"Rule #" + (index + 1)} open={true} qa="RulesAccordion">
                <div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Countries of Residence:</div>
                        <div className={"col-md-9"} data-qa="CountryOfResidenceAccordion"><b>{rule.countries.map(x => x.countryName).join(", ")}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Entity Types:</div>
                        <div className={"col-md-9"} data-qa="EntityTypesAccordion"> <b>{rule.entities.map(x => x.description).join(", ")}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Documents:</div>
                        <div className={"col-md-9"} data-qa="DocumentsAccordion"><b>{rule.documents.map(x => x.documentName).join(", ")}</b></div>
                    </div>
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.deleteRule(rule, index)} disabled={this.props.disabled === true} data-qa="DeleteRuleButton">{"Delete Rule #" + (index + 1)}</button>
                    <button className="btn btn-primary" onClick={() => this.editRule(rule, index)} disabled={this.props.disabled === true} data-qa="EditRuleButton">{"Edit Rule #" + (index + 1)}</button>
                </div>
            </Form.AccordionSection>
        );
    }

    private deleteConfirmation: DialogBuilder;
    private deleteRule(rule: Dtos.DocumentRuleDto, index: number) {

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete rule?")
            .setMessage(<p>{'Are you sure you want to delete this rule?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                let dtos = this.props.rules;
                dtos.splice(index, 1);
                this.props.onChange(dtos);
            })
            .withQA("DeleteRuleConfirmationDialog")
            .open();
    }

    private editRule(rule: Dtos.DocumentRuleDto, index: number) {
        let clonedRule = JSON.parse(JSON.stringify(rule)) as Dtos.DocumentRuleDto;
        let validator = new RuleDtoValidator(clonedRule, this.props.rules, index, false);
        this.setState({ documentRule: clonedRule, documentRuleValidation: validator, ruleIndex: index });
    }

    private createRule() {
        let newRule: Dtos.DocumentRuleDto = { id: null, countries: [], documents: [], entities: [] };
        let validator = new RuleDtoValidator(newRule, this.props.rules, -1, false);
        this.setState({ documentRule: newRule, documentRuleValidation: validator, ruleIndex: -1 });
    }

    private completeSave(item: Dtos.DocumentRuleDto, rules:Dtos.DocumentRuleDto[], index: number) {
        let dtos = rules || [];

        if (index != -1) {
            dtos[index] = item;
        }
        else {
            dtos.push(item);
        }
        this.props.onChange(dtos);
        this.setState({ documentRule: null, documentRuleValidation: null, ruleIndex: null });
    }

    private saveRule() {
        let validator = new RuleDtoValidator(this.state.documentRule, this.props.rules, this.state.ruleIndex, true);
        if (validator.isValid()) {

            if (this.props.beforeChange) {
                this.props.beforeChange(this.state.documentRule).then(() => this.completeSave(this.state.documentRule, this.props.rules, this.state.ruleIndex));
            }
            else {
                this.completeSave(this.state.documentRule, this.props.rules, this.state.ruleIndex);
            }

        }
        else {
            this.setState({ documentRuleValidation: validator });
        }
    }

    private renderPopup() {
        if (!this.state || !this.state.documentRule) return null;
        return (
            <RuleEditor countries={this.props.countries} documents={this.props.documents} entityTypes={this.props.entityTypes} rule={this.state.documentRule} validation={this.state.documentRuleValidation} onChange={m => this.updateRule(m)} onSave={() => this.saveRule()} onCancel={() => this.cancelRule()}/>
        );
    }

    private updateRule(rule: Dtos.DocumentRuleDto) {
        var validator = new RuleDtoValidator(rule, this.props.rules, this.state.ruleIndex, this.state.documentRuleValidation.showValidationErrors());
        this.setState({ documentRule: rule, documentRuleValidation: validator });
    }

    private cancelRule() {
        this.setState({ documentRule: null, documentRuleValidation: null, ruleIndex: null });
    }

    private renderGroupMessages() : JSX.Element[] {
        let messages: JSX.Element[] = [];

        this.props.rules.forEach((rule, i) => {
            let hasGroupDoc = rule.documents.some(doc => doc.documentAppliesToId == Dtos.DocumentAppliesLevel.EntityGroup && doc.systemGeneratedForm);
            let hasBatchDoc = rule.documents.some(doc => doc.documentAppliesToId == Dtos.DocumentAppliesLevel.BatchClaim && doc.systemGeneratedForm);
            let msg: string;

            if (hasGroupDoc && hasBatchDoc) msg=`Rule #${i+1} contains system generated entity group and batch claim documents, which can include data from multiple categories`;
            else if (hasGroupDoc) msg=`Rule #${i+1} contains a system generated entity group document, which will include data from all beneficial owners in this category with an entity type in this rule`;
            else if (hasBatchDoc) msg=`Rule #${i+1} contains a system generated batch claim document, which can include data from multiple categories`;
            else return;

            messages.push(
                <div key={i} data-qa="MessageContainer"className="cat-rule-group-msg-container">
                <p className="cat-rule-group-msg" data-qa="Message">{msg}</p>
                <i className="fa fa-file-text-o" data-qa="FileText"></i>
            </div>);
        });
        return messages;
    }
}