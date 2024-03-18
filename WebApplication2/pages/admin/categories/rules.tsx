import * as React from 'react';
import { Dtos } from '../../../adr';
import { Loader, Pending } from "../../../classes";
import { Accordion, AccordionSection } from '../../../components'

interface Props {
    rules: Dtos.DocumentRuleDto[];
}

interface State {
}

export class Rules extends React.Component<Props, State> {
    render() {
        return (
            <Accordion>
                {this.renderGroupMessages()}
                {this.props.rules.map((x, i) => this.renderRule(x, i))}
            </Accordion>
        );
    }

    private renderRule(rule: Dtos.DocumentRuleDto, index: number) {
        return (
            <AccordionSection key={"rule" + index} title={"Rule #" + (index + 1)} open={true} qa="RulesAccordion">
                <div className="row" style={{ marginBottom: "3px"}}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Countries of Residence:</div>
                    <div className={"col-md-9"} data-qa="CountryOfResidenceAccordion"><b>{rule.countries.map(x => x.countryName).join(", ")}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Entity Types:</div>
                    <div className={"col-md-9"} data-qa="EntityTypesAccordion"> <b>{rule.entities.map(x => x.description).join(", ")}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Documents:</div>
                    <div className={"col-md-9"} data-qa="DocumentsAccordion"><b>{rule.documents.map(x => x.documentName).join(", ")}</b></div>
                </div>
            </AccordionSection>
        );
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
            <div key={i} className="cat-rule-group-msg-container">
                <p className="cat-rule-group-msg" data-qa="Message">{msg}</p>
                <i className="fa fa-file-text-o"></i>
            </div>);
        });
        return messages;
    }
}
