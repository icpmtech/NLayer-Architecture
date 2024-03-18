import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../adr';
import { Pending, Loader, FormBuilder } from '../../classes';
import { CounterpartyDtoValidator } from '../../validators/counterpartyDtoValidator';

interface Props {
    counterpartyTypes: Pending<Dtos.EnumDisplayDto[]>;
    counterparty: Dtos.BalanceSheetCounterpartyDto;
    validation: CounterpartyDtoValidator;
    onChange: { (m: Dtos.BalanceSheetCounterpartyDto): void };
    onSave: { (): void };
    onCancel: { (): void };
}

export class CounterpartyEditor extends  React.Component<Props, {}>
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
        var counterpartyTypes = this.props.counterpartyTypes.map(x => x.map(y => { return { id: y.value, name: y.label }; }));

        var val = this.props.validation;

        return <div className="adr-popup-section container-fluid ps-0">
            {
                Loader.for(counterpartyTypes, types =>
                    new FormBuilder(this.props.counterparty)
                        .isWide(true)
                        .setChangeHandler(m => this.props.onChange(m))
                        .addContent(<div className="row justify-content-center"><h3><span>Editor</span></h3></div>, "CounterParty")
                        //.addContent(<Validation validation={this.props.validation.duplicate} />)
                        .addTextInput("Name", m => m.name, (m, v) => m.name = v, "Name", null)
                        .addDropdown("Type", types, m => types.find(x => x.id === m.type), (m, v) => { m.type = v && v.id; m.typeName = v && v.name }, "Type", val.type)
                        .addNumber("ADR Balance:", m => m.adrs, (m, v) => m.adrs = v, "AdrBalance", null)
                        
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