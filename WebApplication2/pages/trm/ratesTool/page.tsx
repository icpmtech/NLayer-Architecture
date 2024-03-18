import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { List } from './list';
import { connect, LoadingStatus, Pending, FormBuilder, Loader, safeClone } from "../../../classes";
import { Message, Error } from '../../../components';
import { TrmRateToolValidator } from '../../../validators/trmRateToolValidator';

interface PageProps {
    isTrmReadOnlyUser: boolean;
};

interface PageState {
    treatyRates?: Pending<Dtos.TrmRateDto[]>;
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    entityTypes?: Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes?: Pending<Dtos.StockTypeDto[]>;
    showRates?: boolean;
    outstandingEdits?: Pending<boolean>;

    query?: Dtos.GetRatesForCountriesQuery;
    validator?: TrmRateToolValidator;
};

export class Page extends React.Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        
        this.state = {
            treatyRates: new Pending<Dtos.TrmRateDto[]>(),
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            entityTypes: new Pending<Dtos.EntityTypeSummaryDto[]>(),
            stockTypes: new Pending<Dtos.StockTypeDto[]>(),
            outstandingEdits: new Pending<boolean>(),

            query: { reclaimMarketId: null, countryOfResidenceId: null, date: new Date(), entityTypes: [], stockTypes: [] }
        };
    }

    componentDidMount() {
        this.ensureCountries();
        this.ensureEntityTypes();
        this.ensureStockTypes();

        let validator = new TrmRateToolValidator(this.state.query, false);
        this.setState({ validator });
    }

    render() {
        return (
            <div>
                <h2>TRM Rate Tool</h2>
                {this.renderOptions()}
                <button className="btn btn-primary" onClick={() => this.showRates()} data-qa="ShowRatesButton">Show rates</button>
                {this.state.outstandingEdits && this.state.outstandingEdits.isDone() && this.state.outstandingEdits.data && this.renderWarning()}
                {this.state.showRates && <List treatyRates={this.state.treatyRates}/>}
            </div>
        );
    }

    renderOptions() {
        let mappedCountries = this.state.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        var entityTypesLookup = this.state.entityTypes.map(x => x.map(y => { return { id: y.id, name: y.name }; }));
        var stockTypesLookup = this.state.stockTypes.map(x => x.map(y => { return { id: y.id, name: y.reference }; }));

        var combined = Pending.combine(mappedCountries, entityTypesLookup, stockTypesLookup, (countries, entityTypes, stockTypes) => { return { countries, entityTypes, stockTypes }; });

        let validator = this.state.validator;

        return Loader.for(combined, combined => {
            let f = FormBuilder.for(this.state.query)
                .isWide(true)
                .addDropdown("Reclaim Market", combined.countries, m => combined.countries.find(x => x.id === (m.reclaimMarketId)), (m, v) => m.reclaimMarketId = v.id, "ReclaimMarket", validator.reclaimMarket)
                .addDropdown("Country of Residence", combined.countries, m => combined.countries.find(x => x.id === (m.countryOfResidenceId)), (m, v) => m.countryOfResidenceId = v.id, "CountryOfResidence", validator.countryOfResidence)
                .addDate("Date", m => m.date, (m, v) => m.date = v, "Date", validator.date)
                .addMultiSelectDropdown("Stock Type", combined.stockTypes, m => combined.stockTypes.filter(x => m.stockTypes && m.stockTypes.some(y => y == x.id)), (m, v) => m.stockTypes = v.map(x => x.id), "StockType", null, { noneSelectedText: "(All Stock Types)" })
                .addMultiSelectDropdown("Entity Type", combined.entityTypes, m => combined.entityTypes.filter(x => m.entityTypes && m.entityTypes.some(y => y == x.id)), (m, v) => m.entityTypes = v.map(x => x.id), "EntityTypes", null, { noneSelectedText: "(All Client Types)" })
                .withQA("Form")
                ;

            return f.render();
        });
    }

    private renderWarning() {
        return (
            <div><br/>
                <div className="flash-message alert alert-info" data-qa="RecordsAwaitingApprovalAlert">Please be advised there are records awaiting approval, therefore the data in the list may be incorrect.</div>
            </div>
        );
    }

    private showRates() {
        let validation = new TrmRateToolValidator(this.state.query, true);

        if (validation.isValid()) {
            let query = safeClone(this.state.query);
            connect(new Apis.TrmRatesApi().getRateForCountries(query), this.state.treatyRates, treatyRates => this.setState({ showRates: true, treatyRates, validator: validation }));

            if (!this.props.isTrmReadOnlyUser) { // readonly user is not informed if there are outstanding edits
                connect(new Apis.TrmApi().hasOutstandingEdits({
                        checkTreaty: true,
                        checkWht: true,
                        checkTaxCredit: true,
                        checkNews: false,
                        checkStatute: false,
                        includeAwaitingVerification: true,
                        includeDraft: false,
                        reclaimMarketId: query.reclaimMarketId,
                        countryOfResidenceId: query.countryOfResidenceId
                    }),
                    this.state.outstandingEdits,
                    outstanding => this.setState({ outstandingEdits: outstanding })
                );
            }
        }
        else {
            this.setState({ validator: validation });
        }
    }

    private ensureCountries() {
        if (this.state.countries.state === LoadingStatus.Preload || this.state.countries.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private ensureEntityTypes() {
        if (this.state.entityTypes.state === LoadingStatus.Preload || this.state.entityTypes.state === LoadingStatus.Stale) {
            connect(new Apis.EntityTypesApi().getAllTrm(), this.state.entityTypes, entityTypes => this.setState({ entityTypes }));
        }
    }

    private ensureStockTypes() {
        if (this.state.stockTypes.state === LoadingStatus.Preload || this.state.stockTypes.state === LoadingStatus.Stale) {
            connect(new Apis.StockTypeApi().search(), this.state.stockTypes, stockTypes => this.setState({ stockTypes }));
        }
    }
}