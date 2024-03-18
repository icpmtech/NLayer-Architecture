import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { StatuteExceptionDtoValidator } from '../../../validators/statuteExceptionDtoValidator';
import { Validation } from '../../../components/stateless/validation'; 
import { QualifierDate } from './qualifierDate';
import { StatuteOfLimitationsMonths } from './statuteOfLimitationsMonths';

interface EditorProps {
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    qualifierTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    exception: Dtos.StatuteExceptionDto;
    validation: StatuteExceptionDtoValidator;
    onChange: { (m: Dtos.StatuteExceptionDto): void };
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
        var countryLookup = this.props.countries.map(x => x.map(y => { return { id: y.id, name: y.countryName }; }));
        var qualifierTypeLookup = this.props.qualifierTypes.map(x => x.map(y => { return { id: y.value, name: y.label }; }));

        var combined = Framework.Pending.combine(countryLookup, qualifierTypeLookup, (countries, qualifierTypes) => { return { countries, qualifierTypes }; });
        var val = this.props.validation;

        return <div className="adr-popup-section container-fluid ps-0" data-qa="ExceptionEditorInnerContent">
            {
                Framework.Loader.for(combined, data => {
                    let form = new Framework.FormBuilder(this.props.exception)
                        .isWide(true)
                        .setChangeHandler(m => this.modelChanged(m))
                        .addContent(<div className="row"><h3><span>Exception Editor</span></h3></div>, "ExceptionEditor")
                        .addContent(<Validation validation={this.props.validation.duplicate} />, "ValidationDuplicate")
                        .addDropdown("Country of Residence", data.countries, m => data.countries.find(x => x.id === (m.countryOfResidence && m.countryOfResidence.id)), (m, v) => m.countryOfResidence = (v && this.props.countries.data.find(x => x.id === v.id)), "CountryOfResidence", val.countryOfResidence)
                        .addCustom("Statute of Limitations", this.renderStatuteMonths(this.props.exception.statuteOfLimitationsMonths, this.props.exception.statuteOfLimitationsDays), "StatuteOfLimitations", val.statuteOfLimitations)
                        .addDropdown("Qualifier Type", data.qualifierTypes, m => data.qualifierTypes.find(x => x.id === m.qualifierType), (m, v) => m.qualifierType = v && v.id, "QualifierType", val.qualifierType)
                        .withQA("Form")
                        ;

                    if (this.props.exception.qualifierType === Dtos.StatuteQualifierType.FromDateAfterPayDate) {
                        form.addCustom("Qualifier Date", this.renderQualifierDate(this.props.exception.qualifierMonth, this.props.exception.qualifierDay), "QualifierDate", val.qualifierDate);
                    }

                    return form.render();
                })
            }
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="UpdateButton">Update</button>
            </div>
        </div>
    }

    private modelChanged(model: Dtos.StatuteExceptionDto) {
        model.qualifierTypeName = model.qualifierType ? this.props.qualifierTypes.data.find(x => x.value == model.qualifierType).label : null;
        this.props.onChange(model);
    }

    private statuteMonthsChanged(months?: number) {
        this.props.exception.statuteOfLimitationsMonths = months;
    }

    private statuteDaysChanged(days?: number) {
        this.props.exception.statuteOfLimitationsDays = days;
    }

    private qualifierDateChanged(month?: number, day?: number) {
        this.props.exception.qualifierMonth = month;
        this.props.exception.qualifierDay = day;
    }

    private renderStatuteMonths(statuteOfLimitationsMonths?: number, statuteOfLimitationsDays?: number) : JSX.Element {
        return (<StatuteOfLimitationsMonths days={statuteOfLimitationsDays} months={statuteOfLimitationsMonths} onMonthsChange={x => this.statuteMonthsChanged(x)} onDaysChange={x => this.statuteDaysChanged(x)}/>);
    }

    private renderQualifierDate(qualifierMonth?: number, qualifierDay?: number): JSX.Element {
        return (<QualifierDate onChange={x => this.qualifierDateChanged(x.month, x.day)} qualifier={{ month: qualifierMonth, day: qualifierDay }}/>);
    }

}