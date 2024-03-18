import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { DialogBuilder, Loader, Pending, PopupBuilder } from "../../classes";
import * as Form from '../../components';
import { AuditTrail } from './auditTrail';
import { ChangeEventStatusPopup } from './changeEventStatusPopup';
import { DeleteDraftEventPopup } from './deleteDraftEventPopup';
import { ExportDwtPopup } from './exportDwtPopup';
import { ImportantNoticeUpload } from './importantNoticeUpload';

interface DetailsProps {
    canEditEvent: boolean;
    canMakeLive: boolean;
    canCopyEvent: boolean;
    canDeleteEvent: boolean;
    canChangeStatusFromLive: boolean;
    event: Pending<Dtos.EventDto>;
    eventAuditInfo: Pending<Dtos.EventChangeDto>;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    eventTypes: Pending<Dtos.EventTypeDto[]>;
    securityTypes: Pending<Dtos.SecurityTypeDto[]>;
    currencies: Pending<Dtos.CurrencySummaryDto[]>;
    onEditClick: () => void;
    onUploadComplete: () => void;
    onStatusChangeComplete: () => void;
    onMakeLiveConfirm: () => void;
}

export class Details extends React.Component<DetailsProps, {}> {
    private confirmationPopup: DialogBuilder;
    private popup: PopupBuilder;
    private adrFieldText: string;

    private renderField(title: string, content: JSX.Element, qa:string, requiredForLive?: boolean): JSX.Element {
        let classes = ['col-md-2', 'col-form-label', 'form-label', 'text-end'];
        this.props.canMakeLive && this.props.event.data.status !== Dtos.EventStatusLookup_Status.Live && requiredForLive === true && classes.push("required-two")
        return (
            <div className="row mb-3 w-100">
                <label className={classes.join(" ")}>{title}</label>
                <div className="col-md-5" data-qa={qa}>{content}</div>
            </div>
        );
    }

    private createTextInput(value: string, disabled: boolean, isFormControl: boolean, onChange: (item: string) => void, maxLength: number = null, qa:string) {
        return <Form.TextInput value={value} disabled={true} onChange={onChange} isFormControl={isFormControl} maxLength={maxLength} qa={qa}/>;
    }

    private createNumberInput(value: number, disabled: boolean, isFormControl: boolean, onChange: (item: number) => void, qa:string) {
        return <Form.NumberInput value={value} disabled={true} onChange={onChange} isFormControl={isFormControl} qa={qa} />;
    }

    private createDropDown<T extends { name: string }>(options: T[], value: T, disabled: boolean, isFormControl: boolean, onChange: (item: T) => void, qa:string) {
        const TypedDropdown = Form.Dropdown as Newable<Form.Dropdown<T>>;
        return <TypedDropdown options={options} value={value} onChange={onChange} isFormControl={isFormControl} disabled={true} qa={qa}/>;
    }

    private createDateWithTBA(dateValue: Date, tbaValue: boolean, disabled: boolean, dateHandler: (item: Date) => void, tbaHandler: (item: boolean) => void, qa:string) {
        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.DateInput value={dateValue} disabled={true} onChange={dateHandler} qa={qa + "DateInput"}/>
                </div>
                <div style={{ width: '15%', float: 'left' }}>
                    <span style={{ position: 'relative', left: '20px', top: '5px' }}>
                        <Form.CheckBox name={"TBA"} value={tbaValue} disabled={true} onChange={tbaHandler} qa={qa + "Checkbox"}/>
                    </span>
                </div>
            </div>
        );
    }

    private renderSponsored(event: Dtos.EventDto) {
        const input = <Form.BooleanInput name={"Custom field"} value={event.sponsored} disabled={true} onChange={null} qa="SponsoredBoolean"/>;
        return this.renderField("Sponsored", input, "Sponsored", true);
    }

    private renderCusip(event: Dtos.EventDto) {
        const input = this.createTextInput(event.cusip, false, true, null, 9, "Cusip");
        return this.renderField("CUSIP #", input, "Cusip", true);
    }

    private renderIsin(event: Dtos.EventDto) {
        const input = this.createTextInput(event.isin, false, true, null, 12, "Isin");
        return this.renderField("ISIN (ORD)", input, "Isin" ,true);
    }

    private renderSecurityType(event: Dtos.EventDto, securityTypes: Dtos.SecurityTypeDto[]) {
        const securityType = securityTypes.find(x => x.id === event.securityType);
        const input = this.createDropDown(securityTypes, securityType, false, true, null, "SecurityType");
        return this.renderField("Security Type", input, "SecurityType", true);
    }

    private renderCountry(event: Dtos.EventDto, countries: { name: string, id: number, code: string }[]) {
        const country = countries.find(x => x.id === (event.countryofIssuance && event.countryofIssuance.id));
        const input = this.createDropDown(countries, country, false, true, null, "CountryOfIssuance");
        return this.renderField("Country of Issuance", input, "CountryOfIssuance", true);
    }

    private renderIssuer(event: Dtos.EventDto) {
        const input = this.createTextInput(event.issuer, false, true, null, null, "Issuer");
        return this.renderField("Issuer", input, "Issuer", true);
    }

    private renderIssuerAddressLine1(event: Dtos.EventDto) {
        const input = this.createTextInput(event.issuerAddressLine1, false, true, null, null, "AddressLine1");
        return this.renderField("Issuer Address Line 1", input, "AddressLine1", true);
    }

    private renderIssuerAddressLine2(event: Dtos.EventDto) {
        const input = this.createTextInput(event.issuerAddressLine2, false, true, null, null, "AddressLine2");
        return this.renderField("Issuer Address Line 2", input, "AddressLine2", true);
    }

    private renderIssuerAddressLine3(event: Dtos.EventDto) {
        const input = this.createTextInput(event.issuerAddressLine3, false, true, null, null, "AddressLine3");
        return this.renderField("Issuer Address Line 3", input, "AddressLine3", true);
    }

    private renderIssuerAddressLine4(event: Dtos.EventDto) {
        const input = this.createTextInput(event.issuerAddressLine4, false, true, null, null, "AddressLine4");
        return this.renderField("Issuer Address Line 4", input, "AddressLine4", true);
    }

    private renderCustodian(event: Dtos.EventDto) {
        const input = this.createTextInput(event.custodian, false, true, null, null, "Custodian");
        return this.renderField("Custodian", input, "Custodian", false);
    }

    private renderDepository(event: Dtos.EventDto) {
        const depos = [{ name: "BNYM", value: "BNYM" }, { name: "Citibank", value: "CB" }, { name: "Deutsche Bank", value: "DB" }, { name: "J.P. Morgan", value: "JPM" }];
        if (event.sponsored === true) {
            const TypedRadioButtonGroup = Form.RadioButtonGroup as Newable<Form.RadioButtonGroup<{ name: string, value: string }>>;
            const input = <TypedRadioButtonGroup name={"the title"} options={depos} horizontal={true} disabled={true} value={this.getRadioDepoValue(event)} onChange={null} qa="EventSponsoredDepositoryRadio"/>;
            return this.renderField("Depository", input, "EventSponsoredDepository", true);
        }
        else {
            const TypedCheckBoxGroup = Form.CheckBoxGroup as Newable<Form.CheckBoxGroup<{ name: string, value: string }>>;
            const input = <TypedCheckBoxGroup name={"the title"} options={depos} horizontal={true} disabled={true} value={this.getDepoValue(event)} onChange={null} qa="DepositoryRadio"/>;
            return this.renderField("Depository", input, "Depositary", true);
        }
    }

    private renderRatio(event: Dtos.EventDto) {
        const input = (
            <div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={event.ratioAdr} disabled={true} onChange={null} qa="RatioAdr"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px', paddingRight: '20px' }}>ADR  /</div> </div>
                <div style={{ width: '40%', float: 'left' }}>
                    <Form.NumberInput value={event.ratioOrd} disabled={true} onChange={null} qa="RatioOrd"/>
                </div>
                <div style={{ float: 'left' }}><div style={{ display: 'table-cell', height: '30px', verticalAlign: 'middle', paddingLeft: '5px' }}> ORD </div></div>
            </div>
        );
        return this.renderField("Ratio (ADR/ORD)", input, "RadioAdrOrd", true);
    }

    private renderEventType(event: Dtos.EventDto, eventTypes: Dtos.EventTypeDto[]) {
        const eventType = eventTypes.find(x => x.id === (event.eventType && event.eventType.id));
        const input = this.createDropDown(eventTypes, eventType, false, true, null, "EventType")
        return this.renderField("Event Type", input, "EventType", true);
    }

    private renderWHTRate(event: Dtos.EventDto) {
        const input = this.createNumberInput(event.statutoryWhtRate, false, true, null, "WhtRate");
        return this.renderField("Statutory WHT Rate", input, "WhtRate", true);
    }

    private renderExDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.exDate, !event.exDate, false, null, null, "ExDate");
        return this.renderField("Ex Date", input, "ExDate");
    }

    private renderAdrRecordDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.adrRecordDate, !event.adrRecordDate, false, null, null, "AdrRecordDate");
        return this.renderField(`${this.adrFieldText} Record Date`, input, "AdrRecordDate", true);
    }

    private renderOrdRecordDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.ordRecordDate, !event.ordRecordDate, false, null, null, "OrdRecordDate");
        return this.renderField("ORD Record Date", input, "OrdRecordDate");
    }

    private renderApproxAdrPayDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.approxAdrPayDate, !event.approxAdrPayDate, false, null, null, "ApproxAdrPayDate");
        return this.renderField(`Approximate ${this.adrFieldText} Pay Date`, input, "ApproxAdrPayDate");
    }

    private renderApproxOrdPayDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.approxOrdPayDate, !event.approxOrdPayDate, false, null, null, "ApproxOrdPayDate");
        return this.renderField("Approximate ORD Pay Date", input, "ApproxOrdPayDate");
    }

    private renderFinalAdrPayDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.finalAdrPayDate, !event.finalAdrPayDate, false, null, null, "FinalAdrPayDate");
        return this.renderField(`Final ${this.adrFieldText} Pay Date`, input, "FinalAdrPayDate");
    }

    private renderFinalOrdPayDate(event: Dtos.EventDto) {
        const input = this.createDateWithTBA(event.finalOrdPayDate, !event.finalOrdPayDate, false, null, null, "FinalOrdPayDate");
        return this.renderField("Final ORD Pay Date", input, "FinalOrdPayDate");
    }

    private renderApproxAdrGrossDivRate(event: Dtos.EventDto) {
        const input = this.createRateWithUSD(event.approxAdrGrossDivRate);
        return this.renderField(`Approximate ${this.adrFieldText} Gross Dividend Rate`, input, "ApproxAdrGrossDivRate");
    }

    private renderApproxOrdGrossDivRate(event: Dtos.EventDto, currencies: Dtos.CurrencySummaryDto[]) {
        const input = this.createRateWithCurrency(event.approxOrdGrossDivRate, event.approxOrdGrossDivCurr, currencies);
        return this.renderField("Approximate ORD Gross Dividend Rate", input, "ApproxOrdGrossDivRate");
    }

    private renderFinalAdrGrossdivRate(event: Dtos.EventDto) {
        const input = this.createRateWithUSD(event.finalAdrGrossDivRate);
        return this.renderField(`Final ${this.adrFieldText} Gross Dividend Rate`, input, "FinalAdrGrossDivRate");
    }

    private renderFinalOrdGrossdivRate(event: Dtos.EventDto, currencies: Dtos.CurrencySummaryDto[]) {
        const input = this.createRateWithCurrency(event.finalOrdGrossDivRate, event.finalOrdGrossDivCurr, currencies);
        return this.renderField("Final ORD Gross Dividend Rate", input, "FinalOrdGrossDivRate");
    }

    private renderApproxFxRate(event: Dtos.EventDto) {
        const input = this.createNumberInput(event.approxFxRate, false, true, null, "ApproxFxRate");
        return this.renderField("Approximate FX Rate", input, "ApproxFxRate");
    }

    private renderFinalFxRate(event: Dtos.EventDto) {
        const input = this.createNumberInput(event.finalFxRate, false, true, null, "FinalFxRate");
        return this.renderField("Final FX Rate", input, "FinalFxRate");
    }

    private renderBNum(event: Dtos.EventDto) {
        const input = this.createTextInput(event.bNum, false, true, null, null, "BatchNumber");
        return this.renderField("B#", input, "BatchNumber");
    }

    private renderPublicationDate(event: Dtos.EventDto) {
        const dateValue = event.publicationDate;
        const input = <Form.DateInput value={dateValue} disabled={true} onChange={null} qa="PublicationDateInput"/>;
        return this.renderField(" Publication Date", input, "PublicationDate");
    }

    getRadioDepoValue(event: Dtos.EventDto) {
        if (event.depositoryJpm === true) return { name: "J.P. Morgan", value: "JPM" };
        if (event.depositoryDb === true) return { name: "Deutsche Bank", value: "DB" };
        if (event.depositoryCb === true) return { name: "Citibank", value: "CB" };
        if (event.depositoryBnym === true) return { name: "BNYM", value: "BNYM" };
    }

    setRadioDepoValue(m: Dtos.EventDto, v: { name: string, value: string }) {
        m.depositoryBnym = v.value === "BNYM" ? true : false;
        m.depositoryCb = v.value === "CB" ? true : false;
        m.depositoryDb = v.value === "DB" ? true : false;
        m.depositoryJpm = v.value === "JPM" ? true : false;
    }

    getDepoValue(event: Dtos.EventDto) {
        let res = [];
        event.depositoryBnym === true && res.push({ name: "BNYM", value: "BNYM" });
        event.depositoryCb === true && res.push({ name: "Citibank", value: "CB" });
        event.depositoryDb === true && res.push({ name: "Deutsche Bank", value: "DB" });
        event.depositoryJpm === true && res.push({ name: "J.P. Morgan", value: "JPM" });
        return res;
    }

    setDepoValue(m: Dtos.EventDto, v: { name: string, value: string }[]) {
        m.depositoryBnym = v.filter(x => x.value === "BNYM").length ? true : false;
        m.depositoryCb = v.filter(x => x.value === "CB").length ? true : false;
        m.depositoryDb = v.filter(x => x.value === "DB").length ? true : false;
        m.depositoryJpm = v.filter(x => x.value === "JPM").length ? true : false;
    }

    private createRateWithUSD(rate: number) {
        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.NumberInput value={rate} disabled={true} qa="RateWithUsdInput"/>
                </div>
                <div style={{ float: 'left', width: '15%' }}>
                    <div style={{ position: 'relative', left: '20px', top: '8px' }}> USD </div>
                </div>
            </div>
        );
    }

    private createRateWithCurrency(rate: number, currency: Dtos.CurrencySummaryDto, currencies: Dtos.CurrencySummaryDto[]) {

        const TypedDropdown = Form.Dropdown as Newable<Form.Dropdown<{ id: number, name: string }>>;
        let options = currencies.map(x => { return { id: x.id, name: x.code }; });
        let selected = options.find(x => x.id === (currency && currency.id));

        return (
            <div>
                <div style={{ width: '85%', float: 'left' }}>
                    <Form.NumberInput value={rate} disabled={true} qa="RateInput"/>
                </div>
                <div style={{ float: 'left', width: '15%' }}>
                    <TypedDropdown options={options} value={selected} isFormControl={true} disabled={true} hasOptionsLabel={false} qa="CurrencyInput"/>
                </div>
            </div>
        );

    }

    private renderCustomForm(
        event: Dtos.EventDto,
        eventTypes: Dtos.EventTypeDto[],
        countries: { name: string, id: number, code: string }[],
        currencies: Dtos.CurrencySummaryDto[],
        securityTypes: Dtos.SecurityTypeDto[]) {

        let showAdrFields = event.securityType != Dtos.SecurityType.CommonStock;
        let showCommonStockFields = event.securityType == Dtos.SecurityType.CommonStock;
        this.adrFieldText = event.securityType == Dtos.SecurityType.CommonStock ? "" : "ADR";

        return (
            <fieldset className="form-horizontal container-fluid d-flex flex-column">
                {this.renderCusip(event)}
                {this.renderIsin(event)}
                {this.renderSecurityType(event, securityTypes)}
                {this.renderCountry(event, countries)}
                {this.renderIssuer(event)}
                {showCommonStockFields && this.renderIssuerAddressLine1(event)}
                {showCommonStockFields && this.renderIssuerAddressLine2(event)}
                {showCommonStockFields && this.renderIssuerAddressLine3(event)}
                {showCommonStockFields && this.renderIssuerAddressLine4(event)}
                {showAdrFields && this.renderCustodian(event)}
                {showAdrFields && this.renderSponsored(event)}
                {showAdrFields && this.renderDepository(event)}
                {this.renderRatio(event)}
                {this.renderEventType(event, eventTypes)}
                {this.renderWHTRate(event)}
                {this.renderExDate(event)}
                {this.renderAdrRecordDate(event)}
                {showAdrFields && this.renderOrdRecordDate(event)}
                {this.renderApproxAdrPayDate(event)}
                {showAdrFields && this.renderApproxOrdPayDate(event)}
                {this.renderFinalAdrPayDate(event)}
                {showAdrFields && this.renderFinalOrdPayDate(event)}
                {this.renderApproxAdrGrossDivRate(event)}
                {showAdrFields && this.renderApproxOrdGrossDivRate(event, currencies)}
                {this.renderApproxFxRate(event)}
                {this.renderFinalAdrGrossdivRate(event)}
                {showAdrFields && this.renderFinalOrdGrossdivRate(event, currencies)}
                {this.renderFinalFxRate(event)}
            </fieldset>
        );
    }

    private renderImportantNoticeSection(event: Dtos.EventDto) {
        return (
            <div>
                <legend>Important Notice</legend>
                <div>
                    <fieldset className={"form-horizontal"}>
                        {this.renderBNum(event)}
                        {this.renderPublicationDate(event)}
                        {this.renderFileLastUploaded(event)}
                        {this.renderFileLastUploadedBy(event)}
                        {this.renderFileDownloadLink(event)}
                        {this.renderImportantNoticeActions()}
                    </fieldset>
                </div>
            </div>
        );
    }

    private renderFileLastUploaded(event: Dtos.EventDto) {
        if (event.importantNoticeLastUploaded) {
            const formattedDateString = moment(event.importantNoticeLastUploaded).tz('America/New_York').format('DD MMM YYYY HH:mm');
            const input = this.createTextInput(formattedDateString, false, true, null, null, "FileLastUploaded");
            return this.renderField(" File Last Uploaded", input, "FileLastUploaded");
        }
        return null;
    }

    private renderFileLastUploadedBy(event: Dtos.EventDto) {
        if (event.importantNoticeLastUploaded) {
            const input = this.createTextInput(event.importantNoticeLastByName, false, true, null, null, "LastUploadedBy");
            return this.renderField(" File Last Uploaded By", input, "LastUploadedBy");
        }
        return null;
    }

    private renderFileDownloadLink(event: Dtos.EventDto) {
        if (event.importantNoticeLastUploaded) {
            let url = new Apis.EventsApi().downloadImportantNoticeUrl(event.id);
            const link = <div style={{ marginTop: '7px' }}><a href={url} target="_blank" data-qa="DownloadLinkAnchor">Click to Download</a></div>;
            return this.renderField("Download", link, "DownloadLink");
        }
        return null;
    }

    private renderImportantNoticeActions() {
        if (this.props.canEditEvent === true) {
            let classes = ['col-md-2', 'col-form-label', 'text-end'];
            return Loader.for(this.props.event, event =>
                <div className="row mb-3 w-100">
                    <label className={classes.join(" ")}>Important Notice File</label>
                    <div className="col-md-5" data-qa="ImportantNotice">
                        <ImportantNoticeUpload eventId={event.id} fileExists={!!event.importantNoticeLastUploaded}/>
                    </div>
                </div>
            );
        }
        return null;
    }

    private renderRequiredInfo() {
        return this.props.canMakeLive && this.props.event.data.status !== Dtos.EventStatusLookup_Status.Live === true
            ? <div className="d-flex mb-3">
                <div className="col-md-12 required-desc required-two" data-qa="RequiredInfo">** Mandatory to make event live</div>
            </div>
            : null;
    }

    private renderButtons(event: Dtos.EventDto) {
        return (
            <div className="text-end">
                <button id="BackToListButton" className="btn btn-outline-secondary" onClick={() => window.location.href = '/event/list'} data-qa="BackToListButton">Back To List</button>
                {this.props.event.data && this.props.event.data.securityType == Dtos.SecurityType.CommonStock && <button className="btn btn-outline-secondary" onClick={() => this.exportDwtReport()} data-qa="ExportDwtReportButton">Export DWT Report</button>}
                {this.props.canDeleteEvent && event.status == Dtos.EventStatusLookup_Status.Draft ? <button className="btn btn-outline-secondary" onClick={() => this.renderDeleteDraftPopup(event)} data-qa="DeleteDraftEventButton">Delete Draft Event</button> : null}
                {this.props.canChangeStatusFromLive && event.status === Dtos.EventStatusLookup_Status.Live ? <button className="btn btn-primary" onClick={() => this.renderStatusChangePopup(event)} data-qa="ChangeEventStatusButton">Change Event Status</button> : null}
                {this.props.canMakeLive && event.status !== Dtos.EventStatusLookup_Status.Live ? <button id="MakeEventLiveButton" className="btn btn-primary" onClick={() => this.showMakeLiveConfirmationPopup(event)} data-qa="MakeEventLiveButton">Make Event Live</button> : null}
                {this.props.canCopyEvent ? <button className="btn btn-primary" onClick={() => window.location.href = "/event/copy?eventId=" + event.id} data-qa="CopyEventButton">Copy Event</button> : null}
                {this.props.canEditEvent ? <button className="btn btn-primary" disabled={!this.props.event.isDone()} onClick={() => this.props.onEditClick()} data-qa="EditButton">Edit</button> : null}
            </div>
        );
    }

    private dwtDialog: PopupBuilder;
    private exportDwtReport() {
        this.dwtDialog = new PopupBuilder();
        this.dwtDialog.setTitle("Export DWT Report");

        this.dwtDialog.setContent(<ExportDwtPopup eventId={this.props.event.data.id} onClose={() => this.dwtDialog.close()}/>);
        this.dwtDialog.render();
    }

    private renderAuditTrail(event: Dtos.EventDto, eventAudit: Dtos.EventChangeDto) {
        return <AuditTrail event={event} eventAudit={eventAudit}/>
    }

    private renderStatusChangePopup = (event: Dtos.EventDto) => {
        this.popup = new PopupBuilder()
            .setTitle("Change Live Event Status")
            .setContent(
                <ChangeEventStatusPopup
                    eventId={event.id}
                    onClose={() => this.popup.close()}
                    onDataLoaded={() => this.popup.centreWindow()}
                    onStatuschanged={() => { this.popup.close(); this.props.onStatusChangeComplete(); }}
                
                />
        );
        this.popup.render();
    }

    private renderDeleteDraftPopup = (event: Dtos.EventDto) => {
        this.popup = new PopupBuilder();
        this.popup
            .setTitle("Delete Draft Event")
            .setContent(<DeleteDraftEventPopup eventId={event.id} onClose={() => this.popup.close()}/>)
            .render();
    }

    private showMakeLiveConfirmationPopup(event: Dtos.EventDto) {
        const msg = (event.status === Dtos.EventStatusLookup_Status.Canceled || event.status === Dtos.EventStatusLookup_Status.Closed || event.status === Dtos.EventStatusLookup_Status.Unavailable)
            ? "You are about to make this event live again. Are you sure you want to continue?"
            : "You are about to make this event live, this action cannot be undone.  Are you sure you want to continue?"
        this.confirmationPopup = new DialogBuilder();
        this.confirmationPopup
            .setTitle("Make Event Live")
            .setMessage(<p>{msg}</p>)
            .setConfirmHandler(() => this.props.onMakeLiveConfirm())
            .setCancelHandler(this.confirmationPopup.close)
            .withQA("MakeEventLivePopup")
            .open();
    }

    private renderError() {
        return <Form.Error error={this.props.event.error} qa="EventGeneralInfoDetailsError"/> }

    private renderTitle() { return <legend>Dividend Event Details</legend> }

    render() {
        let mappedCountries = this.props.countries.map(countries => countries.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));

        let combinedData = Pending.combine(
            this.props.event,
            this.props.eventTypes,
            this.props.eventAuditInfo,
            this.props.securityTypes,
            this.props.currencies,
            mappedCountries,
            (event, eventTypes, eventAuditInfo, securityTypes, currencies, countries) => { return { event, eventTypes, eventAuditInfo, securityTypes, currencies, countries } }
        );
        return (
            <div data-qa="goal-event-details">
                {this.renderTitle()}
                {this.renderError()}
                {Loader.for(combinedData, data =>
                    <div>
                        <div>{this.renderCustomForm(data.event, data.eventTypes, data.countries, data.currencies, data.securityTypes)}</div>
                        <div>{this.renderImportantNoticeSection(data.event)}</div>
                        <div>{this.renderAuditTrail(data.event, data.eventAuditInfo)}</div>
                        {this.renderRequiredInfo()}
                        {this.renderButtons(data.event)}
                    </div>
                )}
            </div>
        );
    }
}