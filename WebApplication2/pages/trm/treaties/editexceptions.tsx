import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { Accordion, AccordionSection, IconButton } from '../../../components'
import { TreatyExceptionDtoValidator } from '../../../validators/treatyExceptionDtoValidator';
import { ExceptionEditor } from './exceptionEditor';

interface EditProps {
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Framework.Pending<Dtos.StockTypeDto[]>;
    treatyExceptionTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    exceptions: Dtos.TreatyExceptionDto[];
    onChange: (dtos: Dtos.TreatyExceptionDto[]) => void;
}

interface EditState {
    exception?: Dtos.TreatyExceptionDto,
    treatyExceptionValidation?: TreatyExceptionDtoValidator,
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
            return (<div className="col-md-12 accordion" data-qa="TreatyHasNoExceptions">This Treaty has no exceptions</div>);
        }

        return Framework.Loader.for(this.props.treatyExceptionTypes, exceptionTypes => {
            return Framework.SimpleGridBuilder.For(this.props.exceptions)
                .addString("Entity Type", x => x.entityType.description, null, "EntityType")
                .addString("Stock Type", x => x.stockType.name, null, "StockType")
                .addString("Exception Type", x => x.exceptionTypeName, null, "ExceptionType")
                .addPercentage("Treaty Exception Rate", x => x.rate, null, "TreatyExceptionRate")
                .addString("Narrative", x => x.narrative, null, "Narrative")
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.editException(m, i)} icon="nav" size={16} qa="EditIcon"/>, m => m.id, "object", null, "Edit", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.deleteException(m, i)} icon="delete" size={16} qa="DeleteIcon"/>, m => m.id, "object", null, "Delete", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .render();
        });
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteException(exception: Dtos.TreatyExceptionDto, index: number) {

        if (index != -1) {
            this.deleteConfirmation = new Framework.DialogBuilder();
            this.deleteConfirmation
                .setTitle("Delete exception?")
                .setMessage(<p>{'Are you sure you want to delete this exception?'}</p>)
                .setCancelHandler(() => this.deleteConfirmation.close())
                .withQA("DeleteExceptionConfirmationDialog")
                .setConfirmHandler(() => {
                    this.deleteConfirmation.close();
                    let dtos = Framework.safeClone(this.props.exceptions);
                    dtos.splice(index, 1);
                    this.props.onChange(dtos);
                })
                .open();
        }
    }

    private editException(exception: Dtos.TreatyExceptionDto, index: number) {
        let clonedException = Framework.safeClone(exception);
        let validator = new TreatyExceptionDtoValidator(clonedException, this.props.exceptions, index, false);
        this.setState({ exception: clonedException, treatyExceptionValidation: validator, exceptionIndex: index });
    }

    private createException() {
        let newException: Dtos.TreatyExceptionDto = { id: null, entityType: null, stockType: null, exceptionType: null, exceptionTypeName: null, narrative: null, rate: null };
        let validator = new TreatyExceptionDtoValidator(newException, this.props.exceptions, -1, false);
        this.setState({ exception: newException, treatyExceptionValidation: validator, exceptionIndex: -1 });
    }

    private completeSave(item: Dtos.TreatyExceptionDto, exceptions: Dtos.TreatyExceptionDto[], index: number) {
        let dtos = exceptions ? Framework.safeClone(exceptions) : [];

        if (index != -1) {
            dtos[index] = item;
        }
        else {
            dtos.push(item);
        }
        this.props.onChange(dtos);
        this.setState({ exception: null, treatyExceptionValidation: null, exceptionIndex: null });
    }

    private saveException() {
        let validator = new TreatyExceptionDtoValidator(this.state.exception, this.props.exceptions, this.state.exceptionIndex, true);
        if (validator.isValid()) {
            this.completeSave(this.state.exception, this.props.exceptions, this.state.exceptionIndex);
        }
        else {
            this.setState({ treatyExceptionValidation: validator });
        }
    }

    private renderPopup() {
        if (!this.state || !this.state.exception) return null;
        return (
            <ExceptionEditor
                entityTypes={this.props.entityTypes}
                stockTypes={this.props.stockTypes}
                treatyExceptionTypes={this.props.treatyExceptionTypes}
                exception={this.state.exception}
                validation={this.state.treatyExceptionValidation}
                onChange={m => this.updateException(m)}
                onSave={() => this.saveException()}
                onCancel={() => this.cancelException()}
               
            />
        );
    }

    private updateException(exception: Dtos.TreatyExceptionDto) {
        var validator = new TreatyExceptionDtoValidator(exception, this.props.exceptions, this.state.exceptionIndex, this.state.treatyExceptionValidation.showValidationErrors());
        this.setState({ exception: exception, treatyExceptionValidation: validator });
    }

    private cancelException() {
        this.setState({ exception: null, treatyExceptionValidation: null, exceptionIndex: null });
    }
}