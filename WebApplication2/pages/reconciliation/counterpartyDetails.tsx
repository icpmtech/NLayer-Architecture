import * as React from 'react';
import { Dtos } from '../../adr';
import { Pending, Loader, LoadingStatus } from '../../classes';
import { Accordion, AccordionSection } from '../../components';

interface Props {
    counterparties: Dtos.BalanceSheetCounterpartyDto[];
}

export class CounterpartyDetails extends React.Component<Props, {}> {
    render() {
        return (
            <Accordion>
                {this.props.counterparties.map((x, i) => this.renderCounterparty(x, i))}
            </Accordion>
        );
    }

    private renderCounterparty(counterparty: Dtos.BalanceSheetCounterpartyDto, index: number) {
        return (
            <AccordionSection key={"cp" + index} title={"#" + (index + 1)} open={true} qa="CounterPartyAccordion">
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
            </AccordionSection>
        );
    }
}
