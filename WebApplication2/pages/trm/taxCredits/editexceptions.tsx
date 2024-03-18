import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { Accordion, AccordionSection, IconButton } from '../../../components'
import { TaxCreditExceptionDtoValidator } from '../../../validators/taxCreditExceptionDtoValidator';
import { ExceptionEditor } from './exceptionEditor';

interface EditProps {
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Framework.Pending<Dtos.StockTypeDto[]>;
    exceptions: Dtos.TaxCreditExceptionDto[];
    onChange: (dtos: Dtos.TaxCreditExceptionDto[]) => void;
}

interface EditState {
    exception?: Dtos.TaxCreditExceptionDto,
    taxCreditExceptionValidation?: TaxCreditExceptionDtoValidator,
    exceptionIndex?: number
}

export class EditExceptions extends React.Component<EditProps, EditState>
{
    render() {
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createException()} data-qa="AddExceptionsButton">Add Exception</button></div>
                {this.renderExceptions()}
                {this.renderPopup()}
            </div>
        );
    }

    renderExceptions() {
        if (!this.props.exceptions || this.props.exceptions.length == 0) {
            return (<div className="col-md-12 accordion">This Tax Credit has no exceptions</div>);
        }

            return Framework.SimpleGridBuilder.For(this.props.exceptions)
                .addString("Entity Type", x => x.entityType.description, null, "EntityType")
                .addString("Stock Type", x => x.stockType.name, null, "StockType")
                .addPercentage("Tax Credit Exception Rate", x => x.rate, null, "TaxCreditExceptionRate")
                .addString("Narrative", x => x.narrative, null, "Narrative")
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.editException(m, i)} icon="nav" size={16} qa="EditIcon"/>, m => m.id, "object", null, "Edit", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.deleteException(m, i)} icon="delete" size={16} qa="DeleteIcon"/>, m => m.id, "object", null, "Delete", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .withQA("Grid")
                .render();
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteException(exception: Dtos.TaxCreditExceptionDto, index: number) {

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

    private editException(exception: Dtos.TaxCreditExceptionDto, index: number) {
        let clonedException = Framework.safeClone(exception);
        let validator = new TaxCreditExceptionDtoValidator(clonedException, this.props.exceptions, index, false);
        this.setState({ exception: clonedException, taxCreditExceptionValidation: validator, exceptionIndex: index });
    }

    private createException() {
        let newException: Dtos.TaxCreditExceptionDto = { id: null, entityType: null, stockType: null, narrative: null, rate: null };
        let validator = new TaxCreditExceptionDtoValidator(newException, this.props.exceptions, -1, false);
        this.setState({ exception: newException, taxCreditExceptionValidation: validator, exceptionIndex: -1 });
    }

    private completeSave(item: Dtos.TaxCreditExceptionDto, exceptions: Dtos.TaxCreditExceptionDto[], index: number) {
        let dtos = exceptions ? Framework.safeClone(exceptions) : [];

        if (index != -1) {
            dtos[index] = item;
        }
        else {
            dtos.push(item);
        }
        this.props.onChange(dtos);
        this.setState({ exception: null, taxCreditExceptionValidation: null, exceptionIndex: null });
    }

    private saveException() {
        let validator = new TaxCreditExceptionDtoValidator(this.state.exception, this.props.exceptions, this.state.exceptionIndex, true);
        if (validator.isValid()) {
            this.completeSave(this.state.exception, this.props.exceptions, this.state.exceptionIndex);
        }
        else {
            this.setState({ taxCreditExceptionValidation: validator });
        }
    }

    private renderPopup() {
        if (!this.state || !this.state.exception) return null;
        return (
            <ExceptionEditor
                entityTypes={this.props.entityTypes}
                stockTypes={this.props.stockTypes}
                exception={this.state.exception}
                validation={this.state.taxCreditExceptionValidation}
                onChange={m => this.updateException(m)}
                onSave={() => this.saveException()}
                onCancel={() => this.cancelException()}
               
            />
        );
    }

    private updateException(exception: Dtos.TaxCreditExceptionDto) {
        var validator = new TaxCreditExceptionDtoValidator(exception, this.props.exceptions, this.state.exceptionIndex, this.state.taxCreditExceptionValidation.showValidationErrors());
        this.setState({ exception: exception, taxCreditExceptionValidation: validator });
    }

    private cancelException() {
        this.setState({ exception: null, taxCreditExceptionValidation: null, exceptionIndex: null });
    }
}