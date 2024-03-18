import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { connect, LoadingStatus, Pending, Loader, IGridBuilderChangeArgs, UrlState, PagedDataState, PageCache, UrlHelpers, AppError } from "../../classes";
import { Edit } from '../event/edit';
import { EventDtoValidator } from '../../validators/eventDtoValidator';

interface Props {
    eventId: number
}

interface State {
    event?: Pending<Dtos.EventDto>;
    edited?: Dtos.EventDto;
    saveError?: AppError;
    validator?: EventDtoValidator;
    eventTypes?: Pending<Dtos.EventTypeDto[]>;
    securityTypes?: Pending<Dtos.SecurityTypeDto[]>;
    currencies?: Pending<Dtos.CurrencySummaryDto[]>;
    countries?: Pending<Dtos.CountrySummaryDto[]>;
}

export class Copy extends React.Component<Props, State> {
    constructor() {
        super();

        this.state = {
            event: new Pending<Dtos.EventDto>(),
            validator: null,
            eventTypes: new Pending<Dtos.EventTypeDto[]>(),
            securityTypes: new Pending<Dtos.SecurityTypeDto[]>(),
            currencies: new Pending<Dtos.CurrencySummaryDto[]>(),
            countries: new Pending<Dtos.CountrySummaryDto[]>()
        }
    }

    private componentWillMount() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.event, event => this.setEventToCopy(event));
        connect(new Apis.EventTypeApi().getAll(), this.state.eventTypes, eventTypes => this.setState({ eventTypes }));
        connect(new Apis.SecuritiesApi().getAll(), this.state.securityTypes, securityTypes => this.setState({ securityTypes }));
        connect(new Apis.CurrencyApi().getAll(false, true), this.state.currencies, currencies => this.setState({ currencies }));
        connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
    }

    private setEventToCopy(event: Pending<Dtos.EventDto>) {
        if (event.isDone()) {
            let newEvent: Dtos.EventDto = {
                cusip: event.data.cusip,
                securityType: event.data.securityType,
                securityTypeName: event.data.securityTypeName,
                countryofIssuance: event.data.countryofIssuance,
                issuer: event.data.issuer,
                issuerAddressLine1: event.data.issuerAddressLine1,
                issuerAddressLine2: event.data.issuerAddressLine2,
                issuerAddressLine3: event.data.issuerAddressLine3,
                issuerAddressLine4: event.data.issuerAddressLine4,
                custodian: event.data.custodian,
                sponsored: event.data.sponsored,
                depositoryJpm: event.data.depositoryJpm,
                depositoryDb: event.data.depositoryDb,
                depositoryCb: event.data.depositoryCb,
                depositoryBnym: event.data.depositoryBnym,
                ratioAdr: event.data.ratioAdr,
                ratioOrd: event.data.ratioOrd,
                eventType: event.data.eventType,
                statutoryWhtRate: event.data.statutoryWhtRate,
                adrRecordDate: event.data.adrRecordDate,
                ordRecordDate: event.data.ordRecordDate,
                approxAdrPayDate: event.data.approxAdrPayDate,
                finalAdrPayDate: event.data.finalAdrPayDate,
                approxOrdPayDate: event.data.approxOrdPayDate,
                finalOrdPayDate: event.data.finalOrdPayDate,
                approxAdrGrossDivRate: event.data.approxAdrGrossDivRate,
                finalAdrGrossDivRate: event.data.finalAdrGrossDivRate,
                approxOrdGrossDivRate: event.data.approxOrdGrossDivRate,
                approxOrdGrossDivCurr: event.data.approxOrdGrossDivCurr,
                finalOrdGrossDivRate: event.data.finalOrdGrossDivRate,
                finalOrdGrossDivCurr: event.data.finalOrdGrossDivCurr,
                approxFxRate: event.data.approxFxRate,
                finalFxRate: event.data.finalFxRate,
                bNum: event.data.bNum,
                publicationDate: event.data.publicationDate,
                isin: event.data.isin,
                exDate: event.data.exDate,
                createdBy: null,
                createdOn: null,
                hasImportantNotice: false,
                importantNoticeLastByName: null,
                importantNoticeLastUploaded: null,
                id: null,
                madeLiveBy: null,
                madeLiveOn: null,
                status: Dtos.EventStatusLookup_Status.Draft,
                statusName: "Draft",
                hasRounds: false,
                balanceSheetUploaded: false
            };

            this.setState({ event: event, edited: newEvent, saveError: null, validator: new EventDtoValidator(newEvent, false) });
        } else {
            this.setState({ event: event, validator: null });
        }
    }

    private save() {
        let validator = new EventDtoValidator(this.state.edited, true);
        if (validator.isValid()) {
            connect(new Apis.EventsApi().create(this.state.edited),
                null,
                result => {
                    if (result.isDone()) {
                        window.location.href = `/event/view/${result.data.id}`;
                        return;
                    }
                    else if (result.isFailed()) {
                        this.setState({ saveError: result.error });
                    }
                });
        } else {
            this.setState({ validator: validator, saveError: null });
        }
    }

    render() {
        return Loader.for(this.state.event, e =>
            <Edit
                event={this.state.edited}
                saveError={this.state.saveError}
                validation={this.state.validator}
                countries={this.state.countries}
                currencies={this.state.currencies}
                eventTypes={this.state.eventTypes}
                securityTypes={this.state.securityTypes}
                onChange={(m) => this.setState({ edited: m, validator: new EventDtoValidator(m, this.state.validator.showValidationErrors()) })}
                onCancel={() => window.location.href = `/event/view/${this.props.eventId}`}
                onSave={() => this.save()}
            />
        );
    }
}
