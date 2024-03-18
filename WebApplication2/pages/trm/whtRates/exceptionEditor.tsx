import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder } from '../../../classes';
import { WhtRateExceptionDtoValidator } from '../../../validators/whtRateExceptionDtoValidator';
import { Error } from '../../../components/stateless/error';
import { Validation } from '../../../components/stateless/validation';

interface Props {
    entityTypes?: Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes?: Pending<Dtos.StockTypeDto[]>;
    exceptionTypes?: Pending<Dtos.EnumDisplayDto[]>;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    exception: Dtos.WhtRateExceptionDto;
    validation: WhtRateExceptionDtoValidator;
    onChange: { (m: Dtos.WhtRateExceptionDto, i: number): void };
    onSave: { (): void };
    onCancel: { (): void };
}

interface State {
}

export class ExceptionEditor extends React.Component<Props, State> {

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
        var countryLookups = this.props.countries.map(x => x.map(y => { return { id: y.id, name: y.countryName }; }));
        var entityTypesLookup = this.props.entityTypes.map(x => x.map(y => { return { id: y.id, name: y.description }; }));
        var stockTypesLookup = this.props.stockTypes.map(x => x.map(y => { return { id: y.id, name: y.name }; }));
        var exceptionTypesLookup = this.props.exceptionTypes.map(x => x.map(y => { return { id: y.value, name: y.label }; }));

        var combined = Pending.combine(entityTypesLookup, stockTypesLookup, countryLookups, exceptionTypesLookup, (entityTypes, stockTypes, countryLookups, exceptionTypes) => { return { entityTypes, stockTypes, countryLookups, exceptionTypes }; });
        var val = this.props.validation;

        return <div className="wht-exception-section container-fluid">
            {
                Loader.for(combined, data => {
                    var form = new FormBuilder(this.props.exception)
                        .isWide(true)
                        .narrowErrors(true)
                        .setChangeHandler(m => this.props.onChange(m, 0))
                        .addContent(<div className="row"><h3><span>Edit Exceptions</span></h3></div>, "EditException")
                        .addContent(<Validation validation={this.props.validation.duplicate} />, "ValidationDuplicate")
                        .addListGroup("Included Countries of Residence", data.countryLookups, m => this.getSelectedCountries(m, data.countryLookups), (m, v) => this.setSelectedCountries(m, v), "CountriesOfResidence", val.countries)
                        .addListGroup("Included Entity Types", data.entityTypes, m => this.getSelectedEntityTypes(m, data.entityTypes), (m, v) => this.setSelectedEntityTypes(m, v), "EntityTypes", val.entityTypes)
                        .addListGroup("Included Stock Types", data.stockTypes, m => this.getSelectedStockTypes(m, data.stockTypes), (m, v) => this.setSelectedStockTypes(m, v), "StockTypes", val.stockTypes)
                        .addRadioButtonGroup("Exception Type", data.exceptionTypes, m => data.exceptionTypes.find(x => x.id == m.exceptionType), (m, v) => { m.exceptionType = v && v.id; m.exceptionTypeName = v && v.name }, "ExceptionType", val.exceptionType)
                        .addNumber("Withheld Rate(%):", m => m.rate, (m, v) => m.rate = v, "WithheldRate", val.rate, { decimals: 4 })
                        .addTextInput("Narrative:", m => m.narative, (m, v) => m.narative = v, "Narrative", val.narrative)
                        .withQA("Form")
                        ;

                    if (this.props.exception.exceptionType == Dtos.WhtRateExceptionType.Reclaim)
                        form.addNumber("Reclaim Rate(%):", m => m.reclaimRate, (m, v) => m.reclaimRate = v, "ReclaimRate", val.reclaimRate, { decimals: 4 });
                    
                    return form.render();
                })
            }
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="UpdateButton">Update</button>
            </div>
        </div>
    }

    private getSelectedCountries(exception: Dtos.WhtRateExceptionDto, items: {id:number, name: string}[]) {
        return items.filter(x => exception.countries.some(y => x.id === y.id));
    }

    private setSelectedCountries(exception: Dtos.WhtRateExceptionDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            exception.countries = [];
        }
        else {
            exception.countries = this.props.countries.data.filter(x => items.some(y => x.id === y.id));
        }
    }

    private getSelectedEntityTypes(exception: Dtos.WhtRateExceptionDto, items: {id:number, name: string}[]) {
        return items.filter(x => exception.entityTypes.some(y => x.id === y.id));
    }

    private setSelectedEntityTypes(exception: Dtos.WhtRateExceptionDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            exception.entityTypes = [];
        }
        else {
            exception.entityTypes = this.props.entityTypes.data.filter(x => items.some(y => x.id === y.id));
        }
    }

    private getSelectedStockTypes(exception: Dtos.WhtRateExceptionDto, items: {id:number, name: string}[]) {
        return items.filter(x => exception.stockTypes.some(y => x.id === y.id));
    }

    private setSelectedStockTypes(exception: Dtos.WhtRateExceptionDto, items: { id: number, name: string }[]) {
        if (!items || !items.length) {
            exception.stockTypes = [];
        }
        else {
            exception.stockTypes = this.props.stockTypes.data.filter(x => items.some(y => x.id === y.id));
        }
    }
}