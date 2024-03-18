import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { TaxCreditExceptionDtoValidator } from '../../../validators/taxCreditExceptionDtoValidator';
import { Validation } from '../../../components/stateless/validation'; 

interface EditorProps {
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Framework.Pending<Dtos.StockTypeDto[]>;
    exception: Dtos.TaxCreditExceptionDto;
    validation: TaxCreditExceptionDtoValidator;
    onChange: { (m: Dtos.TaxCreditExceptionDto): void };
    onSave: { (): void };
    onCancel: { (): void };
}

export class ExceptionEditor extends React.Component<EditorProps, {}>
{
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
        ReactDOM.render(this.innerContent(), elemToRender);
        this.widget.center();
    }

    private innerContent() {
        var entityTypesLookup = this.props.entityTypes.map(x => x.map(y => { return { id: y.id, name: y.description }; }));

        var combined = Framework.Pending.combine(entityTypesLookup, this.props.stockTypes, (entityTypes, stockTypes) => { return { entityTypes, stockTypes }; });
        var val = this.props.validation;

        return <div className="adr-popup-section container-fluid ps-0">
            {
                Framework.Loader.for(combined, data => 
                    new Framework.FormBuilder(this.props.exception)
                        .isWide(true)
                        .setChangeHandler(m => this.props.onChange(m))
                        .addContent(<div className="row"><h3><span>Exception Editor</span></h3></div>, "ExceptionEditor")
                        .addContent(<Validation validation={this.props.validation.duplicate} />, "ValidationDuplicate")
                        .addDropdown("Entity Type", data.entityTypes, m => data.entityTypes.find(x => x.id === (m.entityType && m.entityType.id)), (m, v) => m.entityType = this.props.entityTypes.data.find(x => x.id == v.id), "EntityType",val.entityType)
                        .addDropdown("Stock Type", data.stockTypes, m => data.stockTypes.find(x => x.id === (m.stockType && m.stockType.id)), (m, v) => m.stockType = v, "StockType", val.stockType)
                        .addNumber("Exception Rate(%):", m => m.rate, (m, v) => m.rate = v, "Rate", val.rate, { decimals: 4 })
                        .addTextArea("Rate Narrative", m => m.narrative, (m, v) => m.narrative = v, "Narrative", val.narrative)
                        .withQA("Form")
                        .render()
                )
            }
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="UpdateButton">Update</button>
            </div>
        </div>
    }
}