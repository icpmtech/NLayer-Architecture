import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Form from '../../../components';
import { Pending, DialogBuilder } from '../../../classes';
import { WhtRateExceptionDtoValidator } from '../../../validators/whtRateExceptionDtoValidator';
import { ExceptionEditor } from './exceptionEditor';

interface Props {
    exceptions: Dtos.WhtRateExceptionDto[];
    onChange: { (dtos: Dtos.WhtRateExceptionDto[]): void };
    stockTypes: Pending<Dtos.StockTypeDto[]>;
    entityTypes: Pending<Dtos.EntityTypeSummaryDto[]>;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    exceptionTypes: Pending<Dtos.EnumDisplayDto[]>;
}

interface State {
    exceptionEdited?: Dtos.WhtRateExceptionDto,
    exceptionValidator?: WhtRateExceptionDtoValidator;
    exceptionIndex?: number
}

export class EditExceptions extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createException()} data-qa="AddExceptionButton">Add exception</button></div>
                {this.renderExceptions()}
                {this.renderPopup()}
            </div>
        );
    }

    private renderExceptions() {
        if (this.props.exceptions.length < 1) return <div className="col-md-12 accordion" data-qa="WhtHasExceptions">This WHT Rate has no exceptions</div>;
        return (
            <Form.Accordion>
                {this.props.exceptions.map((x, i) => this.renderException(x, i))}
            </Form.Accordion>
        );
    }

    private renderException(exception: Dtos.WhtRateExceptionDto, index: number) {
        return (
            <Form.AccordionSection key={"rule" + index} title={"Rule #" + (index + 1)} open={true} qa="WhtRateExceptionAccordion">
                <div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Countries of Residence:</div>
                        <div className={"col-md-9"} data-qa="CountriesOfResidence"><b>{exception.countries.map(x => x.countryName).join(", ")}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Entity Types:</div>
                        <div className={"col-md-9"} data-qa="EntityTypes"><b>{exception.entityTypes.map(x => x.description).join(", ")}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Stock Types:</div>
                        <div className={"col-md-9"} data-qa="StockTypes"> <b>{exception.stockTypes.map(x => x.name).join(", ")}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Exception Type:</div>
                        <div className={"col-md-9"} data-qa="ExceptionType"><b>{exception.exceptionTypeName}</b></div>
                    </div>
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Withheld Rate:</div>
                        <div className={"col-md-9"} data-qa="WithheldRate"><b>{exception.rate > 0 && (exception.rate + "%")}</b></div>
                    </div>
                    {exception.exceptionType == Dtos.WhtRateExceptionType.Reclaim && <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Reclaim Rate:</div>
                        <div className={"col-md-9"} data-qa="ReclaimRate"><b>{exception.reclaimRate + "%"}</b></div>
                    </div>}
                    <div className="row">
                        <div style={{ textAlign: 'right' }} className={"col-md-2"}>Narrative:</div>
                        <div className={"col-md-9"} data-qa="Narrative"><b>{exception.narative}</b></div>
                    </div>
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.deleteException(exception, index)} data-qa="DeleteExceptionButton">{"Delete Exception #" + (index + 1)}</button>
                    <button className="btn btn-primary" onClick={() => this.editException(exception, index)} data-qa="EditExceptionButton">{"Edit Exception #" + (index + 1)}</button>
                </div>
            </Form.AccordionSection>
        );
    }

    private deleteConfirmation: DialogBuilder;
    private deleteException(rule: Dtos.WhtRateExceptionDto, index: number) {

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Exception?")
            .setMessage(<p>{'Are you sure you want to delete this exception?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                let dtos = this.props.exceptions;
                dtos.splice(index, 1);
                this.props.onChange(dtos);
            })
            .withQA("DeleteExceptionDialog")
            .open();
    }

    private editException(exception: Dtos.WhtRateExceptionDto, index: number) {
        let clonedException = JSON.parse(JSON.stringify(exception)) as Dtos.WhtRateExceptionDto;
        let val = new WhtRateExceptionDtoValidator(clonedException, this.props.exceptions, index, false);
        this.setState({ exceptionEdited: clonedException, exceptionValidator:val, exceptionIndex: index });
    }

    private createException() {
        let newException: Dtos.WhtRateExceptionDto = {
            id: null,
            rate: null,
            reclaimRate: null,
            narative: null,
            exceptionType: Dtos.WhtRateExceptionType.Treaty,
            exceptionTypeName: "Treaty",
            countries: [],
            entityTypes: [],
            stockTypes: []
        };
        let val = new WhtRateExceptionDtoValidator(newException, this.props.exceptions, -1, false);
        this.setState({ exceptionEdited: newException, exceptionValidator: val, exceptionIndex: -1 });
    }

    private completeSave(item: Dtos.WhtRateExceptionDto, exceptions: Dtos.WhtRateExceptionDto[], index: number) {
        let val = new WhtRateExceptionDtoValidator(item, this.props.exceptions, index, true);
        if (val.isValid()) {
            let dtos = exceptions || [];

            if (index != -1) {
                dtos[index] = item;
            }
            else {
                dtos.push(item);
            }
            this.props.onChange(dtos);
            this.setState({ exceptionEdited: null, exceptionValidator: null });
        }
        else {
            this.setState({ exceptionValidator:val });
        }
    }

    private renderPopup() {
        if (!this.state.exceptionEdited) return null;
        return (
            <ExceptionEditor stockTypes={this.props.stockTypes}
                entityTypes={this.props.entityTypes}
                exceptionTypes={this.props.exceptionTypes}
                countries={this.props.countries}
                exception={this.state.exceptionEdited}
                validation={this.state.exceptionValidator}
                onChange={(m,i) => this.updateException(m,i)}
                onSave={() => this.completeSave(this.state.exceptionEdited, this.props.exceptions, this.state.exceptionIndex)}
                onCancel={() => this.cancelException()}
               
            />
        );
    }

    private updateException(exception: Dtos.WhtRateExceptionDto, index: number) {
        let val = new WhtRateExceptionDtoValidator(exception, this.props.exceptions, index, this.state.exceptionValidator && this.state.exceptionValidator.showValidationErrors());

       this.setState({ exceptionEdited: exception, exceptionValidator: val });
    }

    private cancelException() {
        this.setState({ exceptionEdited: null, exceptionValidator: null });
    }
}