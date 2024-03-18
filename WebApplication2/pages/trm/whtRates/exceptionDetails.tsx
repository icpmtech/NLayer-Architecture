import * as React from 'react';
import { Dtos } from '../../../adr';
import { Loader, Pending } from "../../../classes";
import { Accordion, AccordionSection } from '../../../components'

interface Props {
    exceptions: Dtos.WhtRateExceptionDto[];
}

interface State {
}

export class ExceptionDetails extends React.Component<Props, State> {
    render() {
        return (
            <Accordion>
                {this.props.exceptions.map((x, i) => this.renderException(x, i))}
            </Accordion>
        );
    }

    private renderException(exception: Dtos.WhtRateExceptionDto, index: number) {
        return (
            <AccordionSection key={"rule" + index} title={"Rule #" + (index + 1)} open={true} qa="WhtRateExceptionAccordion">
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Countries of Residence:</div>
                    <div className={"col-md-9"} data-qa="CountriesOfResidence"> <b>{exception.countries.map(x => x.countryName).join(", ")}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Entity Types:</div>
                    <div className={"col-md-9"} data-qa="EntityTypes"> <b>{exception.entityTypes.map(x => x.description).join(", ")}</b></div>
                </div>
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Stock Types:</div>
                    <div className={"col-md-9"} data-qa="StockTypes"><b>{exception.stockTypes.map(x => x.name).join(", ")}</b></div>
                </div>
                <div className="row">
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Exception Type:</div>
                    <div className={"col-md-9"} data-qa="ExceptionType"><b>{exception.exceptionTypeName}</b></div>
                </div>
                <div className="row">
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Withheld Rate:</div>
                    <div className={"col-md-9"} data-qa="WithheldRate"><b>{exception.rate >0 && (exception.rate + "%")}</b></div>
                </div>
                {exception.exceptionType == Dtos.WhtRateExceptionType.Reclaim && <div className="row">
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Reclaim Rate:</div>
                    <div className={"col-md-9"} data-qa="ReclaimRate"><b>{exception.reclaimRate + "%"}</b></div>
                </div>}
                <div className="row" style={{ marginBottom: "3px" }}>
                    <div style={{ textAlign: 'right' }} className={"col-md-2"}>Narrative:</div>
                    <div className={"col-md-9"} data-qa="Narrative"><b>{exception.narative}</b></div>
                </div>
            </AccordionSection>
        );

    }
}
