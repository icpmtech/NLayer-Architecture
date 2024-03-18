import * as React from 'react';
import { Dtos } from '../../adr';
import { EventDtoValidator } from '../../validators/EventDtoValidator'
import { AppError, Pending, FormBuilder, Loader, LoadingStatus } from '../../classes'
import * as Form from '../../components';
import { AuditTrail } from "../eventGeneralInfo/auditTrail";

interface Props {
    event: Dtos.EventDto;
    eventAuditInfo?: Pending<Dtos.EventChangeDto>;
    validation: EventDtoValidator;
    saveError: AppError;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    eventTypes: Pending<Dtos.EventTypeDto[]>;
    securityTypes: Pending<Dtos.SecurityTypeDto[]>;
    currencies: Pending<Dtos.CurrencySummaryDto[]>;
    saveInProgress?: boolean;
    onCancel: () => void;
    onChange: (dto: Dtos.EventDto) => void;
    onSave: { (): void };
}

export class Edit extends React.Component<Props, { tbas: { [key: string]: boolean } }> {

    constructor(props: Props) {
        super(props);
        this.state = { tbas: {} };
    }

    private handleChange(setValue: { (m: Dtos.EventDto): void }) {
        var dto = this.props.event;
        setValue(dto);
        this.props.onChange(dto);
    }

    render() {
        var eventLoader = new Pending(this.props.event ? LoadingStatus.Done : LoadingStatus.Loading, this.props.event);
        var combined = Pending.combine(eventLoader, this.props.countries, this.props.eventTypes, this.props.securityTypes, this.props.currencies, (event, countries, eventTypes, securityTypes, currencies) => { return { event, countries, eventTypes, securityTypes, currencies }; });
        return Loader.for(combined, data => (
            <div data-qa={data.event.id ? "goal-event-edit" : "goal-event-create"}>
                <legend>Dividend Event Details</legend>
                {this.renderError()}
                {this.renderCustomForm(data.event, this.props.validation, data.securityTypes, data.countries, data.eventTypes, data.currencies)}
                {this.renderImportantNoticeSection(data.event, this.props.validation)}
                {this.props.eventAuditInfo ? this.renderAuditTrail(data.event, this.props.eventAuditInfo) : null}
                {this.renderRequiredInfo()}
                {this.renderButtons()}
            </div>
        ));
    }

    private renderError() {
        let combinedData = Pending.combine(
            this.props.eventTypes,
            this.props.countries,
            this.props.securityTypes,
            this.props.currencies,
            (eventTypes, countries, securityTypes, currencies) => { return { eventTypes, countries, securityTypes, currencies } }
        );

        return <Form.Error error={combinedData.error || this.props.saveError} qa="EditEventError"/>;
    }

    private renderAuditTrail(event: Dtos.EventDto, eventAudit: Pending<Dtos.EventChangeDto>) {
        return Loader.for(eventAudit, eventAudit => <AuditTrail event={event} eventAudit={eventAudit}/>)
    }

    private renderCustomForm(event: Dtos.EventDto, validation: EventDtoValidator, securityTypes: Dtos.SecurityTypeDto[], countries: Dtos.CountrySummaryDto[], eventTypes: Dtos.EventTypeDto[], currencies: Dtos.CurrencySummaryDto[]) {
        let securityTypeSelected = securityTypes.find(x => x.id === event.securityType);
        let securityTypeSet = (e: Dtos.EventDto, id: number) =>
        {
            e.securityType = id as Dtos.SecurityType;

            if (e.securityType == Dtos.SecurityType.CommonStock)
            {
                e.sponsored = false;
                e.depositoryBnym = false;
                e.depositoryCb = false;
                e.depositoryDb = false;
                e.depositoryJpm = false;
                e.ratioAdr = 1;
                e.ratioOrd = 1;
                e.eventType = eventTypes.find(x => x.id === Dtos.EventType.CashOption);
            }
        };

        let countryOptions = countries.map(x => { return { id: x.id, name: x.countryName }; });
        let countrySelected = countryOptions.find(x => x.id === (event.countryofIssuance && event.countryofIssuance.id));
        let countrySet = (e: Dtos.EventDto, id: number) => e.countryofIssuance = countries.find(x => x.id === id);

        let eventTypeSelected = eventTypes.find(x => x.id === (event.eventType && event.eventType.id));
        let eventTypeSet = (e: Dtos.EventDto, id: number) => e.eventType = eventTypes.find(x => x.id === id);

        let requiredLiveClassName = "required-two";
        let isDraft = event.status === Dtos.EventStatusLookup_Status.Draft || !event.id;
        let isLive = event.status === Dtos.EventStatusLookup_Status.Live || !event.id;

        let isDisabled = !isDraft && !isLive;

        let adrFieldText = event.securityType == Dtos.SecurityType.CommonStock ? "" : "ADR ";
        let showAdrFields = event.securityType != Dtos.SecurityType.CommonStock;
        let showCommonStockFields = event.securityType == Dtos.SecurityType.CommonStock;

        let form = new FormBuilder(event)
            .setChangeHandler((m) => this.props.onChange(m))
            .isWide(true)
            .addTextInput("CUSIP #", m => m.cusip, (m, v) => m.cusip = v, "Cusip", validation.cusip, { disabled: isDisabled, maxLength: 9 })
            .addTextInput("ISIN (ORD)", m => m.isin, (m, v) => m.isin = v, "Isin", validation.isin, { disabled: isDisabled, maxLength: 12 })
            .addDropdown("Security Type", securityTypes, m => securityTypeSelected, (m, v) => securityTypeSet(m, v && v.id), "SecurityType", validation.securityType, { disabled: isDisabled })
            .addDropdown("Country of Issuance", countryOptions, m => countrySelected, (m, v) => countrySet(m, v && v.id), "CountryOfIssuance", validation.countryofIssuance, { disabled: isDisabled })
            .addTextInput("Issuer", m => m.issuer, (m, v) => m.issuer = v, "Issuer", validation.issuer, { disabled: isDisabled })


        showCommonStockFields && form.addTextInput("Issuer Address Line 1", m => m.issuerAddressLine1, (m, v) => m.issuerAddressLine1 = v, "IssuerAddressLine1", validation.issuerAddressLine1)
            .addTextInput("Issuer Address Line 2", m => m.issuerAddressLine2, (m, v) => m.issuerAddressLine2 = v, "IssuerAddressLine2", validation.issuerAddressLine2)
            .addTextInput("Issuer Address Line 3", m => m.issuerAddressLine3, (m, v) => m.issuerAddressLine3 = v, "IssuerAddressLine3", validation.issuerAddressLine3)
            .addTextInput("Issuer Address Line 4", m => m.issuerAddressLine4, (m, v) => m.issuerAddressLine4 = v, "IssuerAddressLine4", validation.issuerAddressLine4)
        
        showAdrFields && form.addTextInput("Custodian", m => m.custodian, (m, v) => m.custodian = v, "Custodian", validation.custodian);

        showAdrFields && form.addCustom("Sponsored", this.renderSponsoredInput(event, isDisabled), "Sponsored", validation.sponsored, { disabled: isDisabled })
            .addCustom("Depository", this.renderDepositoryInput(event, isDisabled), "Depository", validation.depository, { disabled: isDisabled })

        form
            .addCustom("Ratio (ADR / ORD)", this.renderRatio(event, isDisabled || !showAdrFields), "RatioAdrOrd", validation.ratioOrdAdr, { disabled: isDisabled || !showAdrFields })
            .addDropdown("Event Type", eventTypes, m => eventTypeSelected, (m, v) => eventTypeSet(m, v && v.id), "EventType", validation.eventType, { hasOptionsLabel: false, className: requiredLiveClassName, disabled: isDisabled || event.hasRounds || !showAdrFields })
            .addNumber("Statutory WHT Rate", m => m.statutoryWhtRate, (m, v) => m.statutoryWhtRate = v, "StatutoryWhtRate", validation.statutoryWhtRate, { className: requiredLiveClassName, disabled: isDisabled })
            .addCustom("Ex Date", this.renderDateWithTBA(event.exDate, (m, v) => m.exDate = v, "exDate", isDisabled), "ExDate", validation.exDate, { disabled: isDisabled })
            .addCustom(`${adrFieldText}Record Date`, this.renderDateWithTBA(event.adrRecordDate, (m, v) => m.adrRecordDate = v, "adrRecordDate", isDisabled), "AdrRecordDate", validation.adrRecordDate, { className: requiredLiveClassName, disabled: isDisabled })
            ;

        showAdrFields && form.addCustom("ORD Record Date", this.renderDateWithTBA(event.ordRecordDate, (m, v) => m.ordRecordDate = v, "ordRecordDate", isDisabled), "OrdRecordDate", validation.ordRecordDate, { disabled: isDisabled });
        form.addCustom(`Approximate ${adrFieldText}Pay Date`, this.renderDateWithTBA(event.approxAdrPayDate, (m, v) => m.approxAdrPayDate = v, "approxAdrPayDate", isDisabled), "ApproxAdrPayDate", validation.approxAdrPayDate, { disabled: isDisabled });
        showAdrFields && form.addCustom("Approximate ORD Pay Date", this.renderDateWithTBA(event.approxOrdPayDate, (m, v) => m.approxOrdPayDate = v, "approxOrdPayDate", isDisabled), "ApproxOrdPayDate", validation.approxOrdPayDate, { disabled: isDisabled });
        form.addCustom(`Final ${adrFieldText}Pay Date`, this.renderDateWithTBA(event.finalAdrPayDate, (m, v) => m.finalAdrPayDate = v, "finalAdrPayDate", false), "FinalAdrPayDate", validation.finalAdrPayDate, { disabled: false });
        showAdrFields && form.addCustom("Final ORD Pay Date", this.renderDateWithTBA(event.finalOrdPayDate, (m, v) => m.finalOrdPayDate = v, "finalOrdPayDate", false), "FinalOrdPayDate", validation.finalOrdPayDate, { disabled: false });
        form.addCustom(`Approximate ${adrFieldText}Gross Dividend Rate`, this.renderRateUSD(event.approxAdrGrossDivRate, (m, v) => m.approxAdrGrossDivRate = v, isDisabled), "ApproxAdrGrossDividendRate", validation.approxAdrGrossDivRate, { disabled: isDisabled });
        showAdrFields && form.addCustom("Approximate ORD Gross Dividend Rate", this.renderRateCurrency(event.approxOrdGrossDivRate, (m, v) => m.approxOrdGrossDivRate = v, event.approxOrdGrossDivCurr, (m, v) => m.approxOrdGrossDivCurr = v, isDisabled, currencies), "ApproxOrdGrossDividendRate", validation.approxOrdGrossDivCurr.combine(validation.approxOrdGrossDivRate), { disabled: isDisabled });
        form.addNumber("Approximate FX Rate", m => m.approxFxRate, (m, v) => m.approxFxRate = v, "ApproxFxRate", validation.approxFxRate, { disabled: isDisabled });
        form.addCustom(`Final ${adrFieldText}Gross Dividend Rate`, this.renderRateUSD(event.finalAdrGrossDivRate, (m, v) => m.finalAdrGrossDivRate = v, false), "FinalAdrGrossDividendRate", validation.finalAdrGrossDivRate, { disabled: false });
        showAdrFields && form.addCustom("Final ORD Gross Dividend Rate", this.renderRateCurrency(event.finalOrdGrossDivRate, (m, v) => m.finalOrdGrossDivRate = v, event.finalOrdGrossDivCurr, (m, v) => m.finalOrdGrossDivCurr = v, false, currencies), "FinalOrdGrossDividendRate", validation.finalOrdGrossDivCurr.combine(validation.finalOrdGrossDivRate), { disabled: false });
        form.addNumber("Final FX Rate", m => m.finalFxRate, (m, v) => m.finalFxRate = v, "FinalFxRate",validation.finalFxRate, { disabled: false });;

        return (<div>{form.render()}</div>);
    }

    private renderSponsoredInput(event: Dtos.EventDto, disabled: boolean) {
        const handler = (v: boolean) => {
            this.handleChange(m => {
                m.sponsored = v;
                if (m.sponsored) {
                    if (m.depositoryJpm) { m.depositoryBnym = m.depositoryCb = m.depositoryDb = false; }
                    else if (m.depositoryDb) { m.depositoryBnym = m.depositoryCb = false; }
                    else if (m.depositoryCb) { m.depositoryBnym = false; }
                }
            });
        }

        return <Form.BooleanInput name={"Custom field"} value={event.sponsored} disabled={disabled} onChange={(v) => handler(v)} qa="SponsoredBoolean"/>;
    }

    private renderDepositoryInput(event: Dtos.EventDto, disabled: boolean) {
        const depos = [{ name: "BNYM", value: "BNYM" }, { name: "Citibank", value: "CB" }, { name: "Deutsche Bank", value: "DB" }, { name: "J.P. Morgan", value: "JPM" }];
        if (event.sponsored === true) {
            const handler = v => this.handleChange(m => this.setDepoValue(m, [v]));
            const TypedRadioButtonGroup = Form.RadioButtonGroup as Newable<Form.RadioButtonGroup<{ name: string, value: string }>>;
            return <TypedRadioButtonGroup name={"depository"} options={depos} horizontal={true} disabled={disabled} value={this.getDepoValue(event)[0]} onChange={(handler)} qa="SponsoredDepository"/>;
        }
        else {
            const handler = v => this.handleChange(m => this.setDepoValue(m, v));
            const TypedCheckBoxGroup = Form.CheckBoxGroup as Newable<Form.CheckBoxGroup<{ name: string, value: string }>>;
            return <TypedCheckBoxGroup name={"depository"} options={depos} horizontal={true} disabled={disabled} value={this.getDepoValue(event)} onChange={handler} qa="NotSponsoredDepository"/>;
        }
    }

    private getDepoValue(event: Dtos.EventDto) {
        let res = [];
        event.depositoryBnym === true && res.push({ name: "BNYM", value: "BNYM" });
        event.depositoryCb === true && res.push({ name: "Citibank", value: "CB" });
        event.depositoryDb === true && res.push({ name: "Deutsche Bank", value: "DB" });
        event.depositoryJpm === true && res.push({ name: "J.P. Morgan", value: "JPM" });
        return res;
    }

    private setDepoValue(m: Dtos.EventDto, v: { name: string, value: string }[]) {
        m.depositoryBnym = v.filter(x => x.value === "BNYM").length ? true : false;
        m.depositoryCb = v.filter(x => x.value === "CB").length ? true : false;
        m.depositoryDb = v.filter(x => x.value === "DB").length ? true : false;
        m.depositoryJpm = v.filter(x => x.value === "JPM").length ? true : false;
    }

    private renderRatio(event: Dtos.EventDto, disabled: boolean) {
        return (
            <div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={event.ratioAdr} min={0} decimals={0} disabled={disabled} onChange={v => this.handleChange(m => m.ratioAdr = v > 0 ? v : null)} qa="RatioAdr"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px', paddingRight: '20px' }}>ADR  /</div> </div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={event.ratioOrd} min={0} decimals={0} disabled={disabled} onChange={v => this.handleChange(m => m.ratioOrd = v > 0 ? v : null)} qa="RatioOrd"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px' }}> ORD </div></div>
            </div>
        );
    }

    private renderDateWithTBA(value: Date, setDateValue: { (m: Dtos.EventDto, v: Date): void }, tbaName: string, disabled: boolean) {

        let tbaValue = this.state.tbas[tbaName];
        if (tbaValue === null || tbaValue === undefined) {
            tbaValue = !value;
        }

        let tbaHandler = (checked: boolean) => {
            var tbas = this.state.tbas;
            tbas[tbaName] = checked;
            this.setState({ tbas: tbas });
            if (checked) {
                this.handleChange(m => setDateValue(m, null));
            }
        }

        let dateHandler = (value: Date) => {
            var tbas = this.state.tbas;
            tbas[tbaName] = !value;
            this.setState({ tbas: tbas });
            this.handleChange(m => setDateValue(m, value));
        }

        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.DateInput value={value} disabled={disabled} onChange={(v) => dateHandler(v)} qa="DateInput"/>
                </div>
                <div style={{ width: '15%', float: 'left' }}>
                    <span style={{ position: 'relative', left: '20px' }}>
                        <Form.CheckBox name={"TBA"} value={tbaValue} disabled={disabled} onChange={(v) => tbaHandler(v)} qa="TbaCheckbox"/>
                    </span>
                </div>
            </div>
        );
    }

    private renderRateUSD(value: number, setValue: { (event: Dtos.EventDto, value: number): void }, disabled: boolean) {
        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.NumberInput value={value} disabled={disabled} min={0} onChange={v => this.handleChange(m => setValue(m, v))} qa="RateUsdInput"/>
                </div>
                <div style={{ float: 'left', width: '15%' }}>
                    <div style={{ position: 'relative', left: '20px', top: '8px' }}> USD </div>
                </div>
            </div>
        );
    }

    private renderRateCurrency(rate: number, setRate: { (event: Dtos.EventDto, value: number): void }, currency: Dtos.CurrencySummaryDto, setCurrency: { (event: Dtos.EventDto, value: Dtos.CurrencySummaryDto): void }, disabled: boolean, currencies: Dtos.CurrencySummaryDto[]) {
        const TypedDropdown = Form.Dropdown as Newable<Form.Dropdown<{ id: number, name: string }>>;
        let options = currencies.map(x => { return { id: x.id, name: x.code }; });
        let selected = options.find(x => x.id === (currency && currency.id));

        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.NumberInput value={rate} disabled={disabled} min={0} onChange={v => this.handleChange(m => setRate(m, v))} qa="RateCurrency"/>
                </div>
                <div style={{ float: 'left', width: '15%' }}>
                    <TypedDropdown options={options} value={selected} isFormControl={true} disabled={disabled} onChange={v => this.handleChange(m => setCurrency(m, currencies.find(x => x.id === (v && v.id))))} hasOptionsLabel={false} qa="CurrencyDropdown"/>
                </div>
            </div>
        );
    }

    private renderImportantNoticeSection(event: Dtos.EventDto, validation: EventDtoValidator) {
        const form = new FormBuilder(event)
            .setChangeHandler((m) => this.props.onChange(m))
            .isWide(true)
            .addTextInput("B#", m => m.bNum, (m, v) => m.bNum = v, "BatchNumber", validation.bNum)
            .addDate("Publication Date", m => m.publicationDate, (m, v) => m.publicationDate = v, "PublicationDate", validation.publicationDate);
        ;
        return (
            <div>
                <legend>Important Notice</legend>
                {form.render()}
            </div>
        );
    }

    private renderRequiredInfo() {
        return (
            <div className="d-flex flex-column mb-3">
                <div className="col-md-12 required-desc required">* Mandatory to save draft</div>
                <div className="col-md-12 required-desc required-two">** Mandatory to make event live</div>
            </div>
        );
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className={"btn btn-primary" + (this.props.saveInProgress ? " btn-loading" : "")} disabled={this.props.saveInProgress} onClick={() => this.props.onSave()} data-qa="SaveButton">{this.props.saveInProgress ? "Saving..." : "Save"}</button>
            </div>
        );
    }
}