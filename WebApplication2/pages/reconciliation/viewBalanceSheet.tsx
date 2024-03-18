import * as React from 'react';
import { Dtos } from '../../adr';
import { AppError, Pending, FormBuilder, Loader, LoadingStatus } from '../../classes';
import { CounterpartyDetails } from './counterpartyDetails';
import * as Form from '../../components';

interface Props {
    balanceSheet: Pending<Dtos.BalanceSheetDto>;
    balanceSheetUploaded: boolean;
    onEdit: () => void;
}

export class ViewBalanceSheet extends React.Component<Props, {}>
{
    constructor(props: Props) {
        super(props);
    }

    render() {
        return Loader.for(this.props.balanceSheet, bs => {

            return (<div>
                <legend>Balance Sheet</legend>
                {!this.props.balanceSheetUploaded ? <Form.Message type="info" message={"Balance Sheet has not yet been uploaded for this event"} qa="BalanceSheetNotYetUploadedMessage"/> : null}

                {FormBuilder.for(bs)
                    .isWide(true)
                    .addDate("Date Received", m => m.announcementDate, null, "DateReceived", null,{ disabled: true })
                    .addTextInput("Unique Universal Event Identifier", m => m.uniqueUniversalEventIdentifier, null, "UniqueUniversalEventIdentifier", null, { disabled: true })
                    .addCustom("Ratio", this.renderRatio(bs), "Ratio")
                    .withQA("BalanceSheetForm")
                    .render()}

                {bs.counterparties && bs.counterparties.length > 1 ? this.renderTotal(bs) : null}

                {bs.counterparties && bs.counterparties.length > 0 ? <CounterpartyDetails counterparties={bs.counterparties}/> : "Nothing associated with this Balance Sheet"}

                {this.renderButtons()}
            </div>)
        });
    }

    // private renderRatio(balanceSheet: Dtos.BalanceSheetDto) : JSX.Element {
    //     return FormBuilder.for(balanceSheet)
    //         .isInline(true)
    //         .addNumber("ADR /", m => m.ratioAdr, null, "Adr", null, { labelPosition: "right", disabled: true })
    //         .addNumber("ORD", m => m.ratioOrd, null, "Ord", null, { labelPosition: "right", disabled: true })
    //         .withQA("Ratio")
    //         .render();
    // }

    private renderRatio(balanceSheet: Dtos.BalanceSheetDto): JSX.Element {
        return (
            <div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={balanceSheet.ratioAdr} disabled={true} onChange={null} qa="RatioAdr"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px', paddingRight: '20px' }}>ADR  /</div> </div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={balanceSheet.ratioOrd} disabled={true} onChange={null} qa="RatioOrd"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px' }}> ORD </div></div>
            </div>
        );
    }
        
    private renderTotal(balanceSheet: Dtos.BalanceSheetDto): JSX.Element {
        return FormBuilder.for(balanceSheet)
            .isWide(true)
            .addNumber("Total ADR Balance", m => m.counterparties.map(x => x.adrs).reduce((p,n) => p + n), null, "TotalADRBalance", null, { disabled: true })
            .addNumber("Total ORD Balance", m => m.counterparties.map(x => x.ords).reduce((p, n) => p + n), null, "TotalORDBalance", null, { disabled: true })
            .withQA("Total")
            .render()
            ;
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-primary" onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>
            </div>
        );
    }
}
