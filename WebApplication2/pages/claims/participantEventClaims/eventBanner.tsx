import * as React from 'react';
import { Dtos } from '../../../adr';
import { DetailsBuilder, Pending } from '../../../classes';
import { Date } from '../../../components/stateless/date';

interface PageProps {
    event: Pending<Dtos.EventDto>;
};

export class EventBanner extends React.Component<PageProps, {}> {

    private formatPayDate(dto: Dtos.EventDto): React.ReactNode {
        if(dto.finalAdrPayDate)
        {
            return <Date date={dto.finalAdrPayDate} isDateOnly={true} qa="FinalAdrPayDate"/>
        }
        else if(dto.approxAdrPayDate)
        {
            return <span><Date date={dto.approxAdrPayDate} isDateOnly={true} qa="ApproxAdrPayDate"/> (Approximate)</span>
        }
        else
        {
            return 'TBA';
        }
    }

    private formatDividendRate(dividendRate: number, currency: string): React.ReactNode {
        if (!dividendRate) {
            return 'TBA';
        }
        else {
            return dividendRate.toFixed(2) + ' ' + currency;
        }
    }

    private createColumn1(builder: DetailsBuilder<Dtos.EventDto>) {
        const col1 = builder
            .addColumn("", x => null, 45, "EventBannerColumnOne", 30, 70)
            .addString("Issuer", x => x.issuer, "Issuer")
            .addString("Country of Issuance", x => x.countryofIssuance.countryName, "CountryOfIssuance")
            .addString("CUSIP#", x => x.cusip, "Cusip")
            .addString("ISIN (ORD)", x => x.isin, "Isin");
    }

    private createColumn2(builder: DetailsBuilder<Dtos.EventDto>, data: Pending<Dtos.EventDto>) {
        let adrPrefix = data.data && data.data.securityType == Dtos.SecurityType.CommonStock ? "" : "ADR ";

        const col2 = builder
            .addColumn("", x => null, 40, "EventBannerColumnTwo", 35, 65)
            .addDate(`${adrPrefix}Record Date`, x => x.adrRecordDate, "AdrRecordDate")
            .addCustom(`${adrPrefix}Pay Date`, x => this.formatPayDate(x), "AdrPayDate")
            .addCustom(`${adrPrefix}Gross Dividend Rate`, x => this.formatDividendRate(x.finalAdrGrossDivRate, "USD"), "GrossDividendRate");

        if (adrPrefix)
            col2.addCustom("ORD Gross Dividend Rate", x => this.formatDividendRate(x.finalOrdGrossDivRate, x.finalOrdGrossDivCurr.code), "OrdGrossDividendRate");
    }

    private createColumn3(builder: DetailsBuilder<Dtos.EventDto>) {
        const col3 = builder
            .addColumn("", x => null, 35, "EventBannerColumnThree", 25, 75)
            .addString("Event Status", x => x.statusName === "Unavailable" ? "Temporarily Unavailable" : x.statusName, "EventStatus")
            .addString("Event Type", x => x.eventType.name, "EventType")
            .addString("B#", x => x.bNum, "BatchNumber");
    }

    renderBanner() {
        const builder = DetailsBuilder.ForPending(this.props.event, true)
            .addHeading(x => <span>DIVIDEND EVENT DETAILS</span>)
            .withQA("event-banner")
            ;

        this.createColumn1(builder);
        this.createColumn2(builder, this.props.event);
        this.createColumn3(builder);

        return builder.render();
    }

    render() {
        return this.renderBanner();
    }

}