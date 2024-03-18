import * as React from 'react';
import { Dtos } from '../../adr';
import { AppError, Pending, FormBuilder, Loader, LoadingStatus, safeClone, DialogBuilder } from '../../classes';
import { EditCounterparties } from './editCounterparties';
import * as Form from '../../components';
import { BalanceSheetDtoValidator } from '../../validators/balanceSheetDtoValidator';

interface Props {
    onCancel: () => void;
    onSave: () => void;
    event: Dtos.EventDto;
    validator: BalanceSheetDtoValidator;
    onChange: (dto: Dtos.BalanceSheetDto) => void;
    balanceSheet: Pending<Dtos.BalanceSheetDto>;
    counterpartyTypes: Pending<Dtos.EnumDisplayDto[]>;
}

interface State {
    isDirty: boolean;
}

export class EditBalanceSheet extends React.Component<Props, State>
{
    render() {

        let val = this.props.validator;

        return Loader.for(this.props.balanceSheet,
            bs => {

                return (<div>
                    <legend>Balance Sheet</legend>

                    {FormBuilder.for(bs)
                        .isWide(true)
                        .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto); })
                        .addDate("Date Received", m => m.announcementDate, (m, v) => m.announcementDate = v, "DateReceived", val.announcementDate)
                        .addTextInput("Unique Universal Event Identifier", m => m.uniqueUniversalEventIdentifier, (m, v) => m.uniqueUniversalEventIdentifier = v, "UniqueUniversalEventIdentifier", val.uniqueUniversalEventIdentifier)
                        .addCustom("Ratio", this.renderRatio(bs), "Ratio")
                        .withQA("BalanceSheetForm")
                        .render()}

                    {bs.counterparties && bs.counterparties.length > 1 ? this.renderTotal(bs) : null}

                    <EditCounterparties
                        counterpartyTypes={this.props.counterpartyTypes}
                        counterparties={bs.counterparties}
                        onChange={(dtos) => { this.setState({ isDirty: true }); this.onCounterpartiesChange(dtos) }}
                        balanceSheet={this.props.balanceSheet.data}
                       
                    />

                    {this.renderButtons()}
                </div>)
            });
    }

    // private renderRatio(balanceSheet: Dtos.BalanceSheetDto): JSX.Element {
    //     return FormBuilder.for(balanceSheet)
    //         .isInline(true)
    //         .addNumber("ADR /", m => m.ratioAdr, null, "Adr",null, { labelPosition: "right", disabled: true })
    //         .addNumber("ORD", m => m.ratioOrd, null, "Ord", null, { labelPosition: "right", disabled: true })
    //         .render();
    // }

    private renderRatio(balanceSheet: Dtos.BalanceSheetDto) {
        return (
            <div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={balanceSheet.ratioAdr} min={0} decimals={0} disabled={true} onChange={null} qa="RatioAdr"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px', paddingRight: '20px' }}>ADR  /</div> </div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={balanceSheet.ratioOrd} min={0} decimals={0} disabled={true} onChange={null} qa="RatioOrd"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px' }}> ORD </div></div>
            </div>
        );
    }

    private renderTotal(balanceSheet: Dtos.BalanceSheetDto): JSX.Element {
        return FormBuilder.for(balanceSheet)
            .isWide(true)
            .addNumber("Total ADR Balance", m => m.counterparties.map(x => x.adrs).reduce((p, n) => p + n), null, "TotalADRBalance", null, { disabled: true })
            .addNumber("Total ORD Balance", m => m.counterparties.map(x => x.ords).reduce((p, n) => p + n), null, "TotalORDBalance", null, { disabled: true })
            .withQA("TotalForm")
            .render()
            ;
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.confirmCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="SaveButton">Save</button>
            </div>
        );
    }

    private onCounterpartiesChange(counterparties: Dtos.BalanceSheetCounterpartyDto[]) {
        let bs = safeClone(this.props.balanceSheet);
        bs.data.counterparties = counterparties;
        this.props.onChange(bs.data);
    }

    private confirmCancelDialog: DialogBuilder;
    private confirmCancel() {
        if (this.state && this.state.isDirty) {
            let message = <div><p>You have unsaved changes, are you sure you want to cancel?</p></div>;

            this.confirmCancelDialog = new DialogBuilder()
                    .setMessage(message)
                    .setConfirmHandler(() => {
                        this.confirmCancelDialog.close();
                        this.confirmCancelDialog = null;
                        this.props.onCancel();
                    })
                    .setCancelHandler(() => {
                        this.confirmCancelDialog.close();
                        this.confirmCancelDialog = null;
                    })
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel();
        }
    }
}
