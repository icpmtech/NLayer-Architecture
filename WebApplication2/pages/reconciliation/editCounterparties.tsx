import * as React from 'react';
import { Dtos } from '../../adr';
import * as Form from '../../components';
import { Pending, DialogBuilder } from '../../classes';
import { CounterpartyDtoValidator } from '../../validators/counterpartyDtoValidator';
import { CounterpartyEditor } from './counterpartyEditor';

interface Props {
    counterparties: Dtos.BalanceSheetCounterpartyDto[];
    onChange: { (dtos: Dtos.BalanceSheetCounterpartyDto[]): void };
    counterpartyTypes: Pending<Dtos.EnumDisplayDto[]>;
    balanceSheet: Dtos.BalanceSheetDto;
}

interface State {
    counterpartyEdited?: Dtos.BalanceSheetCounterpartyDto,
    counterpartyValidator?: CounterpartyDtoValidator;
    counterpartyIndex?: number
}

export class EditCounterparties extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createCounterparty()}data-qa="AddButton">Add</button></div>
                {this.renderCounterparties()}
                {this.renderPopup()}
            </div>
        );
    }

    private renderCounterparties() {
        if (this.props.counterparties.length < 1) return <div className="accordion">Nothing associated with this Balance Sheet</div>;
        return (
            <Form.Accordion>
                {this.props.counterparties.map((x, i) => this.renderCounterparty(x, i))}
            </Form.Accordion>
        );
    }

    private renderCounterparty(counterparty: Dtos.BalanceSheetCounterpartyDto, index: number) {
        return (
            <Form.AccordionSection key={"cp" + index} title={"#" + (index + 1)} open={true} qa="CounterPartyAccordion">
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Name:</div>
                    <div className={"col-md-9"} data-qa="Name"> <b>{counterparty.name}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Type:</div>
                    <div className={"col-md-9"} data-qa="Type"><b>{counterparty.typeName}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>ADR Balance:</div>
                    <div className={"col-md-9"} data-qa="AdrBalance"><b>{counterparty.adrs}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>ORD Balance:</div>
                    <div className={"col-md-9"} data-qa="OrdBalance"><b>{counterparty.ords}</b></div>
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.deleteCounterparty(counterparty, index)} data-qa="DeleteButton">{"Delete #" + (index + 1)}</button>
                    <button className="btn btn-primary" onClick={() => this.editCounterparty(counterparty, index)} data-qa="EditButton">{"Edit #" + (index + 1)}</button>
                </div>
            </Form.AccordionSection>
        );
    }

    private deleteConfirmation: DialogBuilder;
    private deleteCounterparty(rule: Dtos.BalanceSheetCounterpartyDto, index: number) {

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Counterparty?")
            .setMessage(<p>{'Are you sure you want to delete this counterparty?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                let dtos = this.props.counterparties;
                dtos.splice(index, 1);
                this.props.onChange(dtos);
            })
            .withQA("DeleteConfirmationDialog")
            .open();
    }

    private editCounterparty(exception: Dtos.BalanceSheetCounterpartyDto, index: number) {
        let clonedCounterparty = JSON.parse(JSON.stringify(exception)) as Dtos.BalanceSheetCounterpartyDto;
        let val = new CounterpartyDtoValidator(clonedCounterparty, this.props.counterparties, index, false);
        this.setState({ counterpartyEdited: clonedCounterparty, counterpartyValidator: val, counterpartyIndex: index });
    }

    private createCounterparty() {
        let newCounterparty: Dtos.BalanceSheetCounterpartyDto = { id: null, name: null, type: null, typeName: null, adrs: null, ords: null };
        let val = new CounterpartyDtoValidator(newCounterparty, this.props.counterparties, -1, false);
        this.setState({ counterpartyEdited: newCounterparty, counterpartyValidator: val, counterpartyIndex: -1 });
    }

    private completeSave(item: Dtos.BalanceSheetCounterpartyDto, counterparties: Dtos.BalanceSheetCounterpartyDto[], index: number) {
        let val = new CounterpartyDtoValidator(item, this.props.counterparties, index, true);
        if (val.isValid()) {
            let dtos = counterparties || [];

            item.ords = item.adrs * this.props.balanceSheet.ratioOrd / this.props.balanceSheet.ratioAdr;

            if (index != -1) {
                dtos[index] = item;
            }
            else {
                dtos.push(item);
            }
            this.props.onChange(dtos);
            this.setState({ counterpartyEdited: null, counterpartyValidator: null });
        }
        else {
            this.setState({ counterpartyValidator: val });
        }
    }

    private renderPopup() {
        if (!this.state.counterpartyEdited) return null;
        return (
            <CounterpartyEditor
                counterparty={this.state.counterpartyEdited}
                counterpartyTypes={this.props.counterpartyTypes}
                validation={this.state.counterpartyValidator}
                onChange={(m) => this.updateCounterparty(m)}
                onSave={() => this.completeSave(this.state.counterpartyEdited, this.props.counterparties, this.state.counterpartyIndex)}
                onCancel={() => this.cancelCounterparty()}
               
            />
        );
    }

    private updateCounterparty(counterparty: Dtos.BalanceSheetCounterpartyDto) {
        let val = new CounterpartyDtoValidator(counterparty, this.props.counterparties, 0, this.state.counterpartyValidator && this.state.counterpartyValidator.showValidationErrors());

        this.setState({ counterpartyEdited: counterparty, counterpartyValidator: val });
    }

    private cancelCounterparty() {
        this.setState({ counterpartyEdited: null, counterpartyValidator: null }); 
    }
}