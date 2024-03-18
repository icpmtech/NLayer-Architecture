import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Stateless from '../../../components/stateless';
import { connect, Pending, DetailsBuilder } from '../../../classes';
import { Dtos } from '../../../adr';

interface BatchClaimDetailsProps {
    claimDetails: Pending<Dtos.ClaimDetailsDto>;
};

export class BatchClaimDetailsGrid extends React.Component<BatchClaimDetailsProps, {}> {

    render() {
        const builder = this.createBuilder();
        this.createColumn1(builder);
        this.createColumn2(builder);
        this.createColumn3(builder);

        return builder.render();
    }

    private createBuilder(): DetailsBuilder<Dtos.ClaimDetailsDto> {
        const builder = DetailsBuilder.ForPending(this.props.claimDetails)
            .addHeading(x => <span>{`Issuer: `}<span id="issuer" data-qa="Issuer">{x.event.issuer}</span></span>)
            .withQA("DetailsBuilder")
            .addHeading(x => {
                let isIrishCommonStockEvent = this.props.claimDetails.data.event.securityType == Dtos.SecurityType.CommonStock && this.props.claimDetails.data.event.countryofIssuance.countryCode == "IRL";
                
                return (<span>
                    {`${!isIrishCommonStockEvent ? "ADR " : ""}Record Date: `}
                    <span id="ADRRecordDate" data-qa="BatchClaimDetailsIssuer">
                        <Stateless.Date date={x.event.adrRecordDate} qa="AdrRecordDate"/>
                    </span>
                </span>)
            });

        return builder;
    }

    private createColumn1(builder: DetailsBuilder<Dtos.ClaimDetailsDto>) {
        const col1 = builder.addColumn("Batch claim #", x => x.batchClaimReference, 40, "BatchClaimNumber", 45, 55)
            .addString("DTC Participant", x => x.participant.name + " (" + x.participant.dtcCode + ")", "DtcParticipant");

        if (this.props.claimDetails.data.downstreamSubscriber && this.props.claimDetails.data.downstreamSubscriber.id > -1)
            col1.addString("Downstream Subscriber", x => x.downstreamSubscriber.name + " (" + x.downstreamSubscriber.dtcCode + ")", "DownstreamSubscriber");

        if (this.showSubmissionDate(this.props.claimDetails && this.props.claimDetails.data)) {
            col1.addDateTime("Submision Date", x => x.submissionDate, "SubmissionDate")
                .addString("Submitted by", x => x.submittedByName, "SubmittedBy");
        }
        else {
            col1.addString("Submission Date", x => "Not yet submitted", "NotYetSubmitted")
                .addString("Created by", x => x.createdByName, "CreatedBy");
        }

        col1.addString("Filing Method Type/Round", x => x.round.name, "FilingMethodTypeRound");
    }

    private createColumn2(builder: DetailsBuilder<Dtos.ClaimDetailsDto>) {
        let isIrishCommonStockEvent = this.props.claimDetails.data.event.securityType == Dtos.SecurityType.CommonStock && this.props.claimDetails.data.event.countryofIssuance.countryCode == "IRL";

        const col2 = builder.addColumn("Status", x => x.statusName, 30, "Status",  58, 42)
            .addDate((isIrishCommonStockEvent ? "" : "ADR ") + "Pay Date", x => x.event.finalAdrPayDate || x.event.approxAdrPayDate, "AdrPayDate")

        if (!isIrishCommonStockEvent) col2.addCustom("ADR:ORD Ratio", x => `${x.event.ratioAdr}:${x.event.ratioOrd}`, "AdrOrdRatio")
        col2.addNumber(`Claimed ${isIrishCommonStockEvent ? '' : 'ADR '}Position`, x => x.claimedADRPosition, "AdrPosition");
        if (!isIrishCommonStockEvent) col2.addNumber("Claimed ORD Position", x => parseFloat(x.claimedORDPosition.toFixed(4)), "ClaimedOrdPosition");
        col2.addNumber("# Beneficial Owners Included", x => x.beneficialOwnerCount, "NumberBeneficialOwnersIncluded");
    }

    private createColumn3(builder: DetailsBuilder<Dtos.ClaimDetailsDto>) {
        const col3 = builder.addColumn("", x => "", 30, "BatchClaimDetailsColumnThree", 55, 44)
            .addString("B#", x => x.event.bNum, "BatchNumber")
            .addString("CUSIP", x => x.event.cusip, "Cusip")
            .addString("Country of Issuance", x => x.event.countryofIssuance.countryName, "CountryOfIssuance")
            .addString("Event Type", x => x.event.eventType.name, "EventType")
            .addCustom("Depositary", x => <Stateless.Depository {...x.event} />, "Depositary");
    }

    private showSubmissionDate(details: Dtos.ClaimDetailsDto): boolean {
        let preventShowing = [Dtos.BatchClaimStatus.InPreparation, Dtos.BatchClaimStatus.Canceled];
        return preventShowing.indexOf(details.statusId) === -1;
    }
};
