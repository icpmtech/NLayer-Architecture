import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { Accordion, AccordionSection, IconButton } from '../../../components'
import { StatuteExceptionDtoValidator } from '../../../validators/statuteExceptionDtoValidator';
import { ExceptionEditor } from './exceptionEditor';

interface EditProps {
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    qualifierTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    exceptions: Dtos.StatuteExceptionDto[];
    onChange: (dtos: Dtos.StatuteExceptionDto[]) => void;
}

interface EditState {
    exception?: Dtos.StatuteExceptionDto,
    statuteExceptionValidation?: StatuteExceptionDtoValidator,
    exceptionIndex?: number
}

export class EditExceptions extends React.Component<EditProps, EditState>
{
    render() {
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createException()} data-qa="AddExceptionButton">Add Exception</button></div>
                {this.renderExceptions()}
                {this.renderPopup()}
            </div>
        );
    }

    renderExceptions() {
        if (!this.props.exceptions || this.props.exceptions.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="CancelButton">This Statute has no exceptions</div>);
        }

        let all = Framework.Pending.combine(this.props.qualifierTypes, this.props.countries, (types, countries) => { return { types, countries } });
        let monthNames = moment.months().map((m, i) => { return { name: m, id: i + 1 } });

        return Framework.Loader.for(all, exceptionTypes => {
            return Framework.SimpleGridBuilder.For(this.props.exceptions)
                .addString("Country of Residence", x => x.countryOfResidence.countryName, null, "CountryOfResidence")
                .addString("Statute of Limitations",
                    x => (x.statuteOfLimitationsMonths ? (x.statuteOfLimitationsMonths >= 12 ? `${Math.floor(x.statuteOfLimitationsMonths / 12)} Years, ` : "") : "")
                        + (x.statuteOfLimitationsMonths ? `${x.statuteOfLimitationsMonths % 12} Months` : "")
                        + (x.statuteOfLimitationsDays && x.statuteOfLimitationsMonths ? ", " : "")
                        + (x.statuteOfLimitationsDays ? `${x.statuteOfLimitationsDays} Days` : ""), null, "StatuteOfLimitations")
                .addString("Qualifier", x => x.qualifierTypeName, null, "Qualifier")
                .addString("Qualifier Date", x => x.qualifierMonth ? (monthNames.find(m => m.id == x.qualifierMonth).name + ' ' + x.qualifierDay) : null, null, "QualifierDate")
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.editException(m, i)} icon="nav" size={16} qa="EditIcon"/>, m => m.id, null, "object","Edit",{ sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.deleteException(m, i)} icon="delete" size={16} qa="DeleteIcon"/>, m => m.id, null, "object", "Delete", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .withQA("Grid")
                .render();
        });
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteException(exception: Dtos.StatuteExceptionDto, index: number) {

        if (index != -1) {
            this.deleteConfirmation = new Framework.DialogBuilder();
            this.deleteConfirmation
                .setTitle("Delete exception?")
                .setMessage(<p>{'Are you sure you want to delete this exception?'}</p>)
                .setCancelHandler(() => this.deleteConfirmation.close())
                .setConfirmHandler(() => {
                    this.deleteConfirmation.close();
                    let dtos = Framework.safeClone(this.props.exceptions);
                    dtos.splice(index, 1);
                    this.props.onChange(dtos);
                })
                .withQA("DeleteExceptionDialog")
                .open();
        }
    }

    private editException(exception: Dtos.StatuteExceptionDto, index: number) {
        let clonedException = Framework.safeClone(exception);
        let validator = new StatuteExceptionDtoValidator(clonedException, this.props.exceptions, index, false);
        this.setState({ exception: clonedException, statuteExceptionValidation: validator, exceptionIndex: index });
    }

    private createException() {
        let newException: Dtos.StatuteExceptionDto = { id: null, countryOfResidence: null, qualifierType: null, qualifierTypeName: null, statuteOfLimitationsMonths: null, statuteOfLimitationsDays: null, qualifierMonth: null, qualifierDay: null };
        let validator = new StatuteExceptionDtoValidator(newException, this.props.exceptions, -1, false);
        this.setState({ exception: newException, statuteExceptionValidation: validator, exceptionIndex: -1 });
    }

    private completeSave(item: Dtos.StatuteExceptionDto, exceptions: Dtos.StatuteExceptionDto[], index: number) {
        let dtos = exceptions ? Framework.safeClone(exceptions) : [];

        if (index != -1) {
            dtos[index] = item;
        }
        else {
            dtos.push(item);
        }
        this.props.onChange(dtos);
        this.setState({ exception: null, statuteExceptionValidation: null, exceptionIndex: null });
    }

    private saveException() {
        let validator = new StatuteExceptionDtoValidator(this.state.exception, this.props.exceptions, this.state.exceptionIndex, true);

        if (validator.isValid()) {
            this.completeSave(this.state.exception, this.props.exceptions, this.state.exceptionIndex);
        }
        else {
            this.setState({ statuteExceptionValidation: validator });
        }
    }

    private renderPopup() {
        if (!this.state || !this.state.exception) return null;
        return (
            <ExceptionEditor
                qualifierTypes={this.props.qualifierTypes}
                countries={this.props.countries}
                exception={this.state.exception}
                validation={this.state.statuteExceptionValidation}
                onChange={m => this.updateException(m)}
                onSave={() => this.saveException()}
                onCancel={() => this.cancelException()}
               
            />
        );
    }

    private updateException(exception: Dtos.StatuteExceptionDto) {
        if (exception.qualifierType === Dtos.StatuteQualifierType.FromPayDate) {
            exception.qualifierDay = null;
            exception.qualifierMonth = null;
        }
        var validator = new StatuteExceptionDtoValidator(exception, this.props.exceptions, this.state.exceptionIndex, this.state.statuteExceptionValidation.showValidationErrors());
        this.setState({ exception: exception, statuteExceptionValidation: validator });
    }

    private cancelException() {
        this.setState({ exception: null, statuteExceptionValidation: null, exceptionIndex: null });
    }
}