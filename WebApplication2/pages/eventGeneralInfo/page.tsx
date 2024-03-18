import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { AlertBuilder, AppError, connect, LoadingStatus, Pending, UrlHelpers, UrlState } from "../../classes";
import { Message } from '../../components';
import { Error } from '../../components/stateless/error';
import { EventDtoValidator } from '../../validators/eventDtoValidator';
import { Edit } from '../event/edit';
import { Details } from './details';

interface PageProps {
    eventId: number
    canEditEvent: boolean;
    canMakeLive: boolean;
    canCopyEvent: boolean;
    canDeleteEvent: boolean;
    canChangeStatusFromLive: boolean;
};

interface PageState {
    pageMode?: 'details' | 'edit';
    edited?: Dtos.EventDto;
    saveError?: AppError;
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    currencies?: Pending<Dtos.CurrencySummaryDto[]>;
    event?: Pending<Dtos.EventDto>;
    eventAuditInfo?: Pending<Dtos.EventChangeDto>;
    eventStatuses?: Pending<Dtos.EventStatusDto[]>;
    message?: string;
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
    validation?: EventDtoValidator;
    securityTypes?: Pending<Dtos.SecurityTypeDto[]>;
    saveInProgress: boolean;
};

interface UrlProps {
    pageMode: string;
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private alertPopup: AlertBuilder;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            pageMode: "details",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            currencies: new Pending<Dtos.CurrencySummaryDto[]>(),
            event: new Pending<Dtos.EventDto>(),
            eventAuditInfo: new Pending<Dtos.EventChangeDto>(),
            eventTypes: new Pending<Dtos.EventTypeDto[]>(),
            eventStatuses: new Pending<Dtos.EventStatusDto[]>(),
            securityTypes: new Pending<Dtos.SecurityTypeDto[]>(),
            saveInProgress: false
        };
    }

    private initNewEvent(): Dtos.EventDto {
        return {
            securityType: null,
            securityTypeName: null,
            sponsored: true,
            statutoryWhtRate: null,
            ordRecordDate: null,
            approxOrdPayDate: null,
            finalOrdPayDate: null,
            approxAdrGrossDivRate: null,
            approxOrdGrossDivRate: null,
            approxOrdGrossDivCurr: null,
            finalAdrGrossDivRate: null,
            finalOrdGrossDivRate: null,
            finalOrdGrossDivCurr: null,
            approxFxRate: null,
            finalFxRate: null,
            publicationDate: null,
            importantNoticeLastUploaded: null,
            importantNoticeLastByName: null,
            isin: null,
            exDate: null,
            approxAdrPayDate: null,
            finalAdrPayDate: null,
            ratioAdr: null,
            ratioOrd: null,
            depositoryDb: null,
            depositoryCb: null,
            depositoryBnym: null,
            depositoryJpm: null,
            id: null,
            countryofIssuance: null,
            cusip: null,
            issuer: null,
            issuerAddressLine1: null,
            issuerAddressLine2: null,
            issuerAddressLine3: null,
            issuerAddressLine4: null,
            custodian: null,
            eventType: null,
            bNum: null,
            adrRecordDate: null,
            status: null,
            statusName: null,
            hasImportantNotice: null,
            createdBy: null,
            createdOn: null,
            madeLiveBy: null,
            madeLiveOn: null,
            hasRounds: false,
            balanceSheetUploaded: false
        };
    }

    componentDidMount = () => {
        connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
        connect(new Apis.EventStatusApi().getAll(), this.state.eventStatuses, eventStatuses => this.setState({ eventStatuses }));
        connect(new Apis.SecuritiesApi().getAll(), this.state.securityTypes, securityTypes => this.setState({ securityTypes }));
        connect(new Apis.CurrencyApi().getAll(false, true), this.state.currencies, currencies => this.setState({ currencies }));

        this.LoadEvent();
        this.LoadAudit();

        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let pageMode = this.url.read().pageMode || "details";
        if (pageMode === 'details') {
            this.goToDetails(null);
        }
        else if (pageMode === 'edit') {
            this.goToEdit(null);
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "edit") {
            this.url.push(UrlHelpers.buildUrl(['/event', 'view', this.props.eventId.toString()]));
            this.url.update({ pageMode: "edit" });
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/event', 'view', this.props.eventId.toString()]));
            this.url.update({ pageMode: "details" });
        }
    }

    private LoadEvent() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.event, (event) => {
            this.setState({
                event,
                edited: event.isDone() ? JSON.parse(JSON.stringify(event.data)) as Dtos.EventDto : null,
                validation: event.isDone() ? new EventDtoValidator(event.data, false) : null,
                saveError: null
            });
        });
    }

    private LoadAudit() {
        connect(new Apis.EventAuditApi().getAuditLatest(this.props.eventId), this.state.eventAuditInfo, (eventAuditInfo) => this.setState({ eventAuditInfo }));
    }

    private goToDetails(message: string) {
        this.setPageState({
            pageMode: 'details',
            message: message,
            saveInProgress: false
        });
    }

    private goToEdit(message: string) {
        this.setPageState({
            pageMode: 'edit',
            message: message,
            edited: this.state.event.map(x => JSON.parse(JSON.stringify(x)) as Dtos.EventDto).data,
            validation: this.state.event.isDone() ? new EventDtoValidator(this.state.event.data, false) : null,
            saveError: null,
            saveInProgress: false
        });
    }

    private updateEvent() {
        let validation = new EventDtoValidator(this.state.edited, true);
        if (validation.isValid()) {
            this.setState({ saveInProgress: true });
            connect(new Apis.EventsApi().update(this.props.eventId, this.state.edited), null,
                event => {
                    if (event.isDone()) {
                        this.LoadEvent();
                        this.LoadAudit();
                        this.goToDetails("Event updated");
                    }
                    else if (event.isFailed()) {
                        this.setState({ saveInProgress: false, validation: validation, saveError: event.error });
                    }
                });
        }
        else {
            this.setState({ validation, saveError: null });
        }
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'edit':
                return <Edit
                    event={this.state.edited}
                    eventAuditInfo={this.state.eventAuditInfo}
                    validation={this.state.validation}
                    saveError={this.state.saveError}
                    currencies={this.state.currencies}
                    eventTypes={this.state.eventTypes}
                    countries={this.state.countries}
                    securityTypes={this.state.securityTypes}
                    onChange={(e) => this.setState({ edited: e, validation: new EventDtoValidator(e, this.state.validation.showValidationErrors()) })}
                    onCancel={() => { this.goToDetails(null) }}
                    saveInProgress={this.state.saveInProgress}
                    onSave={() => this.updateEvent()}
                />;
            default:
                return <Details
                    canEditEvent={this.props.canEditEvent}
                    canMakeLive={this.props.canMakeLive}
                    canCopyEvent={this.props.canCopyEvent}
                    canDeleteEvent={this.props.canDeleteEvent}
                    canChangeStatusFromLive={this.props.canChangeStatusFromLive}
                    countries={this.state.countries}
                    currencies={this.state.currencies}
                    event={this.state.event}
                    eventAuditInfo={this.state.eventAuditInfo}
                    eventTypes={this.state.eventTypes}
                    securityTypes={this.state.securityTypes}
                    onEditClick={() => this.goToEdit(null)}
                    onUploadComplete={() => { this.LoadEvent(); this.LoadAudit(); this.goToDetails(null); }}
                    onStatusChangeComplete={() => {
                        //this.goToDetails(this.props.eventId, null, true);
                        window.location.href = '/event/view/' + this.props.eventId; // TEMPORARY WORK AROUND UNTIL WE HAVE SOLUTION FOR OUT-OF-DATE PROPS
                    }}
                    onMakeLiveConfirm={() => this.makeEventLive()}
                   
                />;
        }
    }

    private makeEventLive() {
        let validation = new EventDtoValidator(this.state.event.data, false, true);
        if (validation.isValid()) {
            connect(new Apis.EventsApi().makeLive(this.props.eventId), null, response => {
                if (response.state === LoadingStatus.Done) {
                    //this.goToDetails(this.props.eventId, null, true);
                    window.location.href = '/event/view/' + this.props.eventId; // TEMPORARY WORK AROUND UNTIL WE HAVE SOLUTION FOR OUT-OF-DATE PROPS
                }
                else if (response.state === LoadingStatus.Failed) {
                    this.alertPopup = new AlertBuilder();
                    this.alertPopup
                        .setTitle("Error making event live")
                        .setMessage(<Error error={response.error} allowClose={false} qa="MakingEventLiveError"/>)
                        .open();
                }
            });
        }

        else {
            this.alertPopup = new AlertBuilder();
            const errorMsg = <Error error={null} customError={validation.errors.map(x => x.errorMessage)} allowClose={false} qa="MakingEventLiveValidationError"/>;
            const msg = "You can edit the event to fix these validation errors and then try again to make event live."
            this.alertPopup
                .setTitle("Error making event live")
                .setMessage(<div data-qa="ErrorMessage">{errorMsg}<p data-qa="Message">{msg}</p><br/></div>)
                .open();
        }
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    render() {
        return (
            <div>
                {this.renderMessage()}
                {this.renderView()}
            </div>
        );
    }
}