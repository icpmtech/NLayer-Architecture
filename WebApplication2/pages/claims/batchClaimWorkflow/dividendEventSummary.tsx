import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import * as Renderers from '../../../components/stateless';

interface SummaryProps {
    eventDetails: Framework.Pending<Dtos.EventDto>;
    claimDetails: Framework.Pending<Dtos.ClaimDetailsDto>;
}

export class DividendEventSummary extends React.Component<SummaryProps, {}> {
    render() {
        if (!this.props.eventDetails.data) return null;

        let eventInfo = this.props.eventDetails.data;
        let claimInfo = this.props.claimDetails.data;

        return (<div>
                    <div className="row">
                        <div className="card bg-light" style={{ width: '100%' }}>
                            <div className="card-body">
                                <div className="row col-md-12">
                                    <div className="col-md-12" style={{ textAlign: 'center' }}>
                                <h4 data-qa="DividendEventDetailsHeader">Dividend Event Details</h4>
                                    </div>
                                </div>
                                <div className="row col-md-12">
                                    <label className="col-md-2 col-form-label">Issuer</label>
                                    <label className="col-md-6" data-qa="Issuer">{eventInfo.issuer}</label>

                                    <label className="col-md-2 col-form-label">Event Status</label>
                                    <label className="col-md-2" data-qa="Status">{eventInfo.statusName}</label>
                                </div>
                                <div className="row col-md-12">
                                    <label className="col-md-2 col-form-label">B#</label>
                                    <label className="col-md-2" data-qa="BatchNumber">{eventInfo.bNum}</label>

                                    <label className="col-md-2 col-form-label">Country of Issuance</label>
                                    <label className="col-md-2" data-qa="CountryOfIssuance">{eventInfo.countryofIssuance.countryName}</label>

                                    <label className="col-md-2 col-form-label">Event Type</label>
                                    <label className="col-md-2" data-qa="EventType">{eventInfo.eventType.name}</label>
                                </div>
                                <div className="row col-md-12">
                                    <label className="col-md-2 col-form-label">CUSIP#</label>
                                    <label className="col-md-2" data-qa="Cusip">{eventInfo.cusip}</label>

                                    <label className="col-md-2 col-form-label">{eventInfo.securityType == Dtos.SecurityType.CommonStock ? "" : "ADR "} Record Date</label>
                                    <label className="col-md-2" data-qa="AdrRecordDate"><Renderers.Date date={eventInfo.adrRecordDate} qa="AdrRecordDate"/></label>

                                    <label className="col-md-2 col-form-label">{eventInfo.securityType == Dtos.SecurityType.CommonStock ? "" : "ADR "} Pay Date</label>
                                    <label className="col-md-2" data-qa="AdrPayDate">{this.renderPayDate(eventInfo)}</label>
                                </div>
                                { (this.props.claimDetails.isDone() && this.props.claimDetails.data.id) ? (
                                <div className="row col-md-12">
                                    <label className="col-md-2 col-form-label">Batch Claim ID</label>
                                    <label className="col-md-2" data-qa="BatchClaimId">{claimInfo.batchClaimReference}</label>

                                    <label className="col-md-2 col-form-label">Filing method Type/Round</label>
                                    <label className="col-md-2" data-qa="FilingMethodTypeRound">{claimInfo.round.name}</label>
                                </div> ) : ("") }
                            </div>
                        </div>
                    </div>
                </div>);
    }

    renderPayDate(eventInfo: Dtos.EventDto) {
        if (eventInfo.finalAdrPayDate) {
            return <Renderers.Date date={eventInfo.finalAdrPayDate} qa="FinalAdrPayDate"/>;
        }
        if (eventInfo.approxAdrPayDate) {
            return <span><Renderers.Date date={eventInfo.approxAdrPayDate} qa="ApproxAdrPayDate"/> (Approximate)</span>;
        }
        return "TBA";
    }
}