import * as React from 'react';
import { Message, Error, Dropdown } from '../../components';
import { Apis, Dtos } from '../../adr';
import { Pending, Loader, PageCache, LoadingStatus, connect, PagedDataState, SimpleGridBuilder, PageableGridBuilder } from '../../classes';
import { TrmCountrySelection } from './trmCountrySelection';

interface PageProps {
    isTrmReadOnlyUser: boolean;
    currentTrmCountryId?: number;
};

interface PageState {
    currentCountryId?: number;
    currentWhtRate?: Pending<Dtos.WhtRateDto>;
    currentStatute?: Pending<Dtos.StatuteDto>;
    currentTreaties?: Pending<Dtos.PagedResultDto<Dtos.TreatySummaryDto>>;
    currentNews?: Pending<Dtos.PagedResultDto<Dtos.NewsSummaryDto>>;
    countries?: Pending<Dtos.CountrySummaryDto[]>
    currentCorId?: number;
    currentWhtRateExceptions?: Pending<Dtos.WhtRateExceptionDto[]>;
    currentTreatyExceptions?: Pending<Dtos.TreatyExceptionDto[]>;
}

export class Page extends React.Component<PageProps, PageState> {
    private newsStore: PageCache<Dtos.NewsSummaryDto, Dtos.GetNewsList>;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            currentCountryId: props.currentTrmCountryId,
            currentWhtRate: new Pending<Dtos.WhtRateDto>(LoadingStatus.Preload),
            currentStatute: new Pending<Dtos.StatuteDto>(LoadingStatus.Preload),
            currentTreaties: new Pending<Dtos.PagedResultDto<Dtos.TreatySummaryDto>>(LoadingStatus.Preload),
            currentNews: new Pending<Dtos.PagedResultDto<Dtos.NewsSummaryDto>>(LoadingStatus.Preload),
            countries: new Pending<Dtos.CountrySummaryDto[]>(LoadingStatus.Preload),
            currentWhtRateExceptions: new Pending<Dtos.WhtRateExceptionDto[]>(LoadingStatus.Preload),
            currentTreatyExceptions: new Pending<Dtos.TreatyExceptionDto[]>(LoadingStatus.Preload)
        };

        this.ensureCountries();
    }

    render() {

        let combined = Pending.combine(this.state.currentWhtRate, this.state.currentStatute, this.state.currentTreaties, this.state.countries,
            (wht, statute, treaties, countries) => { return { wht, statute, treaties, countries }; });

        return (<div>
            <TrmCountrySelection currentCountryId={this.state.currentCountryId} onCountryChanged={(x) => { this.setState({ currentCountryId: x && x.id }); this.ensureRates(); }}/>

                    {this.state.currentCountryId > 0 && Loader.for(combined, x => {
                return (<div>
                    <div className="row">
                        <div className="col-md-5">
                            <div style={{ marginBottom: '15px' }}>
                                <button className="btn btn-primary" style={{ marginTop: '5px', float: 'right', width: '150px' }} onClick={() => { window.location.href = '/whtrate/live' }} data-qa="ViewAllWhtRatesButton">View all WHT Rates</button>
                                <h3>Withholding Tax</h3>
                                <div>{this.renderWhtRate()}</div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <button className="btn btn-primary" style={{ marginTop: '5px', float: 'right', width: '150px' }} onClick={() => { window.location.href = '/treaties/live' }} data-qa="ViewAllTreatiesButton">View all Treaties</button>
                                <h3>Recent Treaties</h3>
                                <div>{this.renderTreaties()}</div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <button className="btn btn-primary" style={{ marginTop: '5px', float: 'right', width: '150px' }} onClick={() => { window.location.href = '/statutes/live' }} data-qa="ViewAllStatutesButton">View all Statutes</button>
                                <h3>Statute</h3>
                                <div>{this.renderStatute()}</div>
                            </div>
                        </div>
                        <div className="col-md-1"></div>

                        {
                            !this.props.isTrmReadOnlyUser && 
                            <div className="col-md-6">
                                <div className='mb-3'>
                                    <button className="btn btn-primary" style={{ marginTop: '5px', float: 'right' }} onClick={() => { window.location.href = '/news/live' }} data-qa="ViewAllNewsButton">View all News</button>
                                    <h3>Latest News</h3>
                                </div>
                                <div>{this.renderNews()}</div>
                            </div>
                        }

                    </div>
                    <div>
                        <h3>Exceptions</h3>
                        {combined.data.wht && this.renderExceptions()}
                    </div>
                </div>
                );
            })}
                </div>);
    }

    componentDidMount() {
        this.ensureRates();
    }

    renderWhtRate() {
        let whtRate = this.state.currentWhtRate.data;

        return (<div>
            {whtRate != null && <ul>
                <li>The current withholdng dividend tax rate is <b>{whtRate.dividendRate}%</b></li>
                <li>The current withholdng interest tax rate is <b>{whtRate.interestRate}%</b></li>
                <li data-qa="ExceptionsNoExceptionsWhtRate">{whtRate.hasExceptions ? `${whtRate.exceptions.length} Exceptions` : "No Exceptions"}</li>
            </ul>}
            {whtRate == null && <div>There is no current withholding rate</div>}
        </div>);
    }

    renderStatute() {
        let statute = this.state.currentStatute.data;
        let statuteMonths = statute && statute.statuteOfLimitationsMonths % 12;
        let statuteYears = statute && statute.statuteOfLimitationsMonths > 12 ? Math.floor(statute.statuteOfLimitationsMonths / 12) : null;

        return (<div>
            {statute != null && <ul>
                <li>The current statute is <b data-qa="CurrentStatute">{statuteYears > 0 ? statuteYears + " year" + (statuteYears > 1 ? "s" : "") + ", " : ""} {statuteMonths} month{(statuteMonths > 1 ? "s" : "")}</b></li>
                <li data-qa="ExceptionsNoExceptionsStatute">{statute.hasExceptions ? `${statute.exceptions.length} exceptions` : "There are no exceptions"}</li>
            </ul>}
            {statute == null && <div>There is no current statute</div>}
        </div>);
    }

    renderTreaties() {
        let treaties = this.state.currentTreaties.data;

        if (!treaties) return;

        const p = SimpleGridBuilder
            .For<Dtos.TreatySummaryDto>(treaties.items)
            .addDate("Effective Date", x => x.effectiveDate, null, "EffectiveDate")
            .addString("Country of Residence", x => x.countryOfResidence.countryName, null, "Country")
            .addPercentage("Standard Dividend Rate", x => x.standardDividendRate, null, "StandardDividendRate")
            .addPercentage("Standard Interest Rate", x => x.standardInterestRate, null, "StandardInterestRate")
            .addString("Exceptions", x => x.hasExceptions ? "Yes" : "No", null, "Exceptions")
            ;

        return (<div>
            {!!treaties && !!treaties.count && <div style={{ marginTop: '20px' }}>{p.render()}</div>}
            {(treaties == null || !treaties.count) && <div>There are no current treaties</div>}
        </div>);
    }

    renderNews() {
        let data = this.state.currentNews.data;

        if (!data) return;

        const p = SimpleGridBuilder
            .For<Dtos.NewsSummaryDto>(data.items)
            .addDate("Effective Date", x => x.effectiveDate, null, "EffectiveDate")
            .addString("Title", x => x.title, null, "Title")
            .addString("Category", x => x.category, null, "Category")
            ;

        return p.render();
    }

    renderExceptions() {
        let whtRateId = this.state.currentWhtRate.data.id;
        let mappedCountries = this.state.countries.data.map(l => { return { id: l.id, name: l.countryName } });
        const TypedDropdown = Dropdown as Newable<Dropdown<{ id: number, name: string }>>;
        let selected = mappedCountries.find(x => x.id === this.state.currentCorId);
        return (<div>
            <div className="row">
                    <div className="col-md-2"><h4>Country of residence</h4></div>
                    <div className="col-md-3">
                        <TypedDropdown
                        isFormControl={true}
                        options={mappedCountries}
                        value={selected}
                        hasOptionsLabel={false}
                        onChange={(country) => { this.setState({ currentCorId: country.id }); this.ensureWhtExceptions(whtRateId, country.id); this.ensureTreatyExceptions(country.id, this.state.currentCountryId); }}
                        qa="CountryOfResidenceDropdown"
                    />
                    </div>
                </div>
                    <div className="row">
                <div className="col-md-5" data-qa="TreatyRate">
                    <h4>Treaty rate</h4>
                            {this.renderTreatyExceptions()}
                        </div>
                        <div className="col-md-1"></div>
                <div className="col-md-6" data-qa="WithholdingRate">
                            <h4>Withholding rate</h4>
                            {this.renderWhtRateExceptions()}
                        </div>
                    </div>
                </div>);
    }

    renderWhtRateExceptions() {
        let exceptions = this.state.currentWhtRateExceptions.data;

        if (!exceptions) return;

        const p = SimpleGridBuilder
            .For<Dtos.WhtRateExceptionDto>(exceptions)
            .addString("Entity types", x => x.entityTypes.map(x => x.name).join(', '), null, "EntityTypes")
            .addString("Stock types", x => x.stockTypes.map(x => x.name).join(', '), null, "StockTypes")
            .addString("Exception type", x => x.exceptionTypeName, null, "ExceptionType")
            .addPercentage("WH Rate", x => x.rate, null, "WhRate")
            .addPercentage("Reclaim Rate", x => x.reclaimRate, null, "ReclaimRate")
            .addString("Narrative", x => x.narative, null, "Narrative")
            .withQA("WhtRateExceptions")
            ;

        return (<div>
                    {!!exceptions && !!exceptions.length && <div style={{ marginTop: '20px' }}>{p.render()}</div>}
                    {(exceptions == null || !exceptions.length) && <div>There are no exceptions</div>}
                </div>);

    }

    renderTreatyExceptions() {
        let exceptions = this.state.currentTreatyExceptions.data;

        if (!exceptions) return;

        const p = SimpleGridBuilder
                .For<Dtos.TreatyExceptionDto>(exceptions)
            .addString("Entity types", x => x.entityType.name, null, "EntityTypes")
            .addString("Stock types", x => x.stockType.name, null, "StockTypes")
            .addString("Exception type", x => x.exceptionTypeName, null, "ExceptionType")
            .addPercentage("Rate", x => x.rate, null, "Rate")
            .addString("Narrative", x => x.narrative, null, "Narrative")
            .withQA("TreatyException")
            ;

        return (<div>
                    {!!exceptions && !!exceptions.length && <div style={{ marginTop: '20px' }}>{p.render()}</div>}
                    {(exceptions == null || !exceptions.length) && <div>There are no exceptions</div>}
                </div>);

    }
    
    ensureRates() {
        if (this.state.currentCountryId) {
            this.ensureWhtRate();
            this.ensureStatute();
            this.ensureTreaties();
            if (!this.props.isTrmReadOnlyUser)
                this.ensureNews();
        }
    }

    ensureWhtRate() {
        connect(new Apis.WhtRateApi().getCurrentWhtRateByCoi(this.state.currentCountryId), this.state.currentWhtRate, wht => {
            if (wht.isDone() || !wht.isFailed()) {
                this.setState({ currentWhtRate: wht });
            }
            else {
                this.setState({ currentWhtRate: new Pending(LoadingStatus.Done, null) });
            }
        });
    }

    ensureStatute() {
        connect(new Apis.StatutesApi().getCurrentStatuteByCoi(this.state.currentCountryId), this.state.currentStatute, st => {
            if (st.isDone() || !st.isFailed()) {
                this.setState({ currentStatute: st });
            }
            else {
                this.setState({ currentStatute: new Pending(LoadingStatus.Done, null) });
            }
        });
    }

    ensureTreaties() {
        let gridPageSize: number = 5;

        let query = {
            showLiveRecords: true,
            sort: { asscending: false, field: Dtos.GetListTreatiesQuery_TreatiesSortField.EffectiveDate },
            uiFilters: [
                { field: Dtos.GetListTreatiesQuery_TreatiesSortField.IsCurrentTreaty, values: [{ type: Dtos.FilterType.Equals, isOr: false, options: ["true"] }] },
                { field: Dtos.GetListTreatiesQuery_TreatiesSortField.EffectiveDate, values: [{ type: Dtos.FilterType.LessThan, isOr: false, options: [moment(new Date).format('YYYY-MM-D')] }] }
            ]
        } as Dtos.GetListTreatiesQuery;

        connect(new Apis.TreatyApi().search(query, 1, gridPageSize), this.state.currentTreaties, x => {
            if (x.isDone()) {
                this.setState({ currentTreaties: x });
            }
        });
    }

    ensureNews() {
        let gridPageSize: number = 5;
        let query = { showLiveNews: true, sort: { asscending: false, field: Dtos.GetNewsList_SortField.EffectiveDate }, uiFilters: null };

        connect(new Apis.NewsApi().search(query, 1, gridPageSize), this.state.currentNews, x => {
            if (x.isDone()) {
                this.setState({ currentNews: x });
            }
        });
    }

    ensureCountries() {
        connect(new Apis.CountriesApi().getAll(false), this.state.countries, x => {
            if (x.isDone()) {
                this.setState({ countries: x});
            }
        })
    }

    ensureWhtExceptions(whtId: number, corId: number) {
        connect(new Apis.WhtRateApi().getExceptions(whtId, corId),
            this.state.currentWhtRateExceptions,
            x => {
                if (x.isDone()) {
                    this.setState({ currentWhtRateExceptions: x });
                }
            })
    }

    ensureTreatyExceptions(corId: number, coiId: number) {
            connect(new Apis.TreatyApi().getExceptions(corId, coiId), this.state.currentTreatyExceptions, x => {
                if (x.isDone()) {
                    this.setState({ currentTreatyExceptions: x });
                }
            })
    }
}