import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder } from '../../../classes';
import { RuleDtoValidator } from '../../../validators/ruleDtoValidator';
import { Error } from '../../../components/stateless/error'; 
import { Validation } from '../../../components/stateless/validation'; 
import { Message } from '../../../components/inputs/message'

interface Props {
    countries: Pending<Dtos.CountrySummaryDto[]>,
    entityTypes: Pending<Dtos.EntityTypeSummaryDto[]>,
    documents: Pending<Dtos.DocumentSummaryDto[]>;
    rule: Dtos.DocumentRuleDto;
    validation: RuleDtoValidator;
    onChange: { (m: Dtos.DocumentRuleDto): void };
    onSave: { (): void };
    onCancel: { (): void };
}

interface State {
}

export class RuleEditor extends React.Component<Props, State> {

    private elem: HTMLDivElement;
    private widget: kendo.ui.Window;

    componentDidMount() {
        this.elem = document.createElement("div");
        let innerContentDiv = document.createElement("div");
        innerContentDiv.classList.add("innerReactDiv");
        this.elem.appendChild(innerContentDiv);

        document.body.appendChild(this.elem);

        this.widget = new kendo.ui.Window(this.elem, {
            title: "",
            draggable: false,
            modal: true,
            pinned: false,
            resizable: false,
            close: () => this.props.onCancel()
        });

        this.renderInnerContent();

    }

    componentWillUnmount() {
        this.widget.destroy();
    }

    componentDidUpdate() {
        this.renderInnerContent();
    }

    render() {
        return <noscript />;
    }

    private renderInnerContent() {
        var elemToRender = this.elem.getElementsByClassName("innerReactDiv")[0];
        console.log("Got iiner div", elemToRender);
        ReactDOM.render(this.innerContent(), elemToRender);
        this.widget.center();
    }

    private innerContent() {
        var countiesLookup = this.props.countries.map(x => x.map(y => { return { id: y.id, name: y.countryName }; }));
        var entityTypesLookup = this.props.entityTypes.map(x => x.map(y => { return { id: y.id, name: y.description }; }));

        var combined = Pending.combine(countiesLookup, entityTypesLookup, this.props.documents, (countries, entityTypes, documents) => { return { countries, entityTypes, documents }; });
        var val = this.props.validation;
 
        return <div id="rule-editor-popup" className="adr-popup-section container-fluid ps-0" data-qa="RuleEditorPopup">
            {
                Loader.for(combined, data => {
                    var documentsLookup = data.documents.map(x => { return { id: x.id, name: x.documentName }; });

                    let form = new FormBuilder(this.props.rule)
                    .setChangeHandler(m => this.props.onChange(m))
                    .addContent(<div className="row justify-content-center"><h3><span>Select Countries and Entities</span></h3></div>, "SelectCountriesAndEntitiesInput")
                    .addContent(<Validation validation={this.props.validation.duplicate} />, "DuplicateInput")
                        .addListGroup("Included Countries", data.countries, m => this.getSelectedCountries(m, data.countries), (m, v) => this.setSelectedCountries(m, v), "IncludedCountriesInput", val.countries)
                        .addListGroup("Included Entities", data.entityTypes, m => this.getSelectedEntityTypes(m, data.entityTypes), (m, v) => this.setSelectedEntityTypes(m, v), "IncludedEntitiesInput", val.entities)
                    .addContent(<div className="row justify-content-center"><h3><span>Select Documents</span></h3></div>, "SelectDocumentsInput")
                    .addContent(this.getDocMessages(), "DocumentMessagesInput");
                    form.addListGroup("Included Documents", documentsLookup, m => this.getSelectedDocuments(m, documentsLookup), (m, v) => this.setSelectedDocuments(m, v), "IncludedDocumentsInput", val.documents)
                    .withQA("Form")
                    return form.render();
                    }
                )
            }
            <div className="text-end mb-1">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="UpdateButton">Update</button>
            </div>
        </div>
    }

    private getSelectedCountries(rule: Dtos.DocumentRuleDto, items: {id:number, name: string }[]) {
        return items.filter(x => rule.countries.some(y => x.id === y.id));
    }

    private setSelectedCountries(rule: Dtos.DocumentRuleDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            rule.countries = [];
        }
        else {
            rule.countries = this.props.countries.data.filter(x => items.some(y => x.id === y.id));
        }
    }

    private getSelectedEntityTypes(rule: Dtos.DocumentRuleDto, items: { id: number, name: string }[]) {
        return items.filter(x => rule.entities.some(y => x.id === y.id));
    }

    private setSelectedEntityTypes(rule: Dtos.DocumentRuleDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            rule.entities = [];
        }
        else {
            rule.entities = this.props.entityTypes.data.filter(x => items.some(y => x.id === y.id));
        }
    }

    private getSelectedDocuments(rule: Dtos.DocumentRuleDto, items: { id: number, name: string }[]) {
        return items.filter(x => rule.documents.some(y => x.id === y.id));
    }

    private setSelectedDocuments(rule: Dtos.DocumentRuleDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            rule.documents = [];
        }
        else {
            rule.documents = this.props.documents.data.filter(x => items.some(y => x.id === y.id));
        }
    }

    private getDocMessages() : JSX.Element {
        let docMessages: JSX.Element[] = [];
        let message: string;

        this.props.rule.documents.forEach( (doc, i) => {
            if (doc.documentAppliesToId === Dtos.DocumentAppliesLevel.EntityGroup && doc.systemGeneratedForm) 
                message = `"` + doc.documentName + `" is a system generated entity group document, which will include data from all beneficial owners in this category with an entity type in this rule`;
            else if (doc.documentAppliesToId === Dtos.DocumentAppliesLevel.BatchClaim && doc.systemGeneratedForm) 
                message = `"` + doc.documentName + `" is a system generated batch claim document, which can include data from multiple categories`;
            else return;
            
            docMessages.push(
                <div key={i} className="rule-group-flash-msg">
                    <Message message={message} allowClose={false} type={'info'} qa="SuccessMessage" useRowLayout><span className="k-icon k-i-file-txt" style={{alignSelf: 'center'}}></span></Message>
                </div>
            );
        });
        return <div id="rule-editor-doc-messages" data-qa="DocumentMessages">{docMessages}</div>;
    }
}