import * as React from 'react';
import { Message, Error } from '../../../components';
import * as Framework from '../../../classes';
import { Details } from './details';
import { Search } from './search';
import { Edit } from './edit';
import { Apis, Dtos } from '../../../adr';
import { NewsDtoValidator } from '../../../validators/newsDtoValidator';
import { TrmCountrySelection } from '../trmCountrySelection';
import { RequestNewsReport } from './requestNewsReport';

interface PageProps {
    backUrl: string;
    currentUserId: number;
    showLiveRecords: boolean;
    currentTrmCountryId?: number;
    isTrmReadOnlyUser: boolean;
};

interface PageState {
    newsList?: Framework.PagedDataState<Dtos.NewsSummaryDto, Dtos.GetNewsList>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    message?: string;
    error?: Framework.AppError;
    news?: Framework.Pending<Dtos.NewsDto>;
    audit?: Framework.Pending<{ id: number, items: Dtos.NewsAuditDto[] }>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    categories?: Framework.Pending<string[]>;
    newsId?: number;
    edited?: Framework.Pending<Dtos.NewsDto>;
    validation?: NewsDtoValidator;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    outstandingEdits?: Framework.Pending<boolean>;
    currentCountryId?: number;
}

interface UrlProps {
    newsId: number;
}

export class Page extends React.Component<PageProps, PageState> {

    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    private newsStore: Framework.PageCache<Dtos.NewsSummaryDto, Dtos.GetNewsList>;

    constructor(props: PageProps) {
        super(props);

        this.newsStore = new Framework.PageCache<Dtos.NewsSummaryDto, Dtos.GetNewsList>(
            (query, page, pageSize) => new Apis.NewsApi().search(query, page, pageSize),
            () => this.state.newsList,
            (newsList) => this.setState({ newsList })
        );

        this.state = {
            pageMode: "search",
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            categories: new Framework.Pending<string[]>(),
            news: new Framework.Pending<Dtos.NewsDto>(),
            audit: new Framework.Pending<{ id: number, items: Dtos.NewsAuditDto[] }>(),
            outstandingEdits: new Framework.Pending<boolean>(),
            currentCountryId: props.currentTrmCountryId
        }
    }

    private initNewNews(): Dtos.NewsDto {
        return {
            id: null,
            reclaimMarket: null,
            effectiveDate: null,
            category: null,
            title: null,
            summaryText: null,
            newsContent: null,
            status: Dtos.TrmEntityStatus.Draft,
            statusName: "Draft",
            sources: [],
            currentPublishedVersionId: null,
            currentAwaitingVerificationVersionId: null
        }
    }

    componentDidMount = () => {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let urlString = this.props.showLiveRecords ? 'live' : 'draft';
        let currPath = this.url.getCurrentPath();
        var id = this.url.read().newsId;
        
        if (currPath.indexOf(`/news/${urlString}/createNew`) !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf(`/news/${urlString}/details`) !== -1 && id) {
            this.goToDetails(id, null, true);
        }
        else if (currPath.indexOf(`/news/${urlString}/edit`) !== -1 && id) {
            this.goToEdit(id, null);
        }
        else {
            this.goToSearch(null);
        }
    }

    private setPageState = (state: PageState): void => {
        let urlString = this.props.showLiveRecords ? 'live' : 'draft';
        let backUrl = this.props.backUrl ? `?backUrl=${encodeURI(this.props.backUrl)}` : "";

        this.setState(state);

        if (state.pageMode === "details") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/news', urlString, 'details' + backUrl]))
            this.url.update({ newsId: state.newsId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/news', urlString, 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/news', urlString, 'edit']))
            this.url.update({ newsId: state.newsId })
        }
        else {
            this.url.push(Framework.UrlHelpers.buildUrl(['/news', urlString]));
        }
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetNewsList_SortField>) {
        this.newsStore.setCurrent({ showLiveNews: this.props.showLiveRecords, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }
        
    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private EnsureCategories() {
        if (this.state.categories.state === Framework.LoadingStatus.Preload || this.state.categories.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.NewsApi().getCategories(), this.state.categories, categories => this.setState({ categories }));
        }
    }

    private ensureHasUnapprovedItems() {
        if (this.state.outstandingEdits.state == Framework.LoadingStatus.Preload || this.state.outstandingEdits.state == Framework.LoadingStatus.Stale) {

            if (this.props.isTrmReadOnlyUser) {
                this.setState({ outstandingEdits: Framework.Pending.done(false) });
                return;
            }

            Framework.connect(new Apis.TrmApi().hasOutstandingEdits({
                checkTreaty: false,
                checkWht: false,
                checkTaxCredit: false,
                checkStatute: true,
                checkNews: false,
                includeAwaitingVerification: true,
                includeDraft: true,
                countryOfResidenceId: null,
                reclaimMarketId: this.state.currentCountryId
            }), this.state.outstandingEdits, outstandingEdits => this.setState({ outstandingEdits }));
        }
    }

    private updateEditor(dto: Dtos.NewsDto) {
        this.setState({
            edited: new Framework.Pending(Framework.LoadingStatus.Done, dto),
            validation: new NewsDtoValidator(dto, this.state.validation.showValidationErrors())
        });
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        } else {
            this.goToSearch(null);
            this.newsStore.refresh();
        }
    }

    private goToSearch(message: string) {
        this.EnsureCountries();
        this.EnsureCategories();
        this.ensureStatusOptions();
        this.ensureHasUnapprovedItems();

        this.setPageState({
            pageMode: 'search',
            newsId: null,
            news: new Framework.Pending<Dtos.NewsDto>(),
            edited: null,
            message: message,
            error: null
        });
    }

    private goToCreate() {
        let newDto = this.initNewNews();

        this.EnsureCountries();
        this.EnsureCategories();
        this.ensureStatusOptions();

        this.setPageState({
            pageMode: 'createNew',
            newsId: null,
            news: new Framework.Pending<Dtos.NewsDto>(),
            edited: new Framework.Pending(Framework.LoadingStatus.Done, this.initNewNews()),
            validation: new NewsDtoValidator(newDto, false),
            message: null,
            error: null
        });
    }

    private EnsureNewsAudit(id: number) {
        Framework.connect(new Apis.NewsApi().getAuditById(id).then(x => { return { id: id, items: x }; }), this.state.audit, (audit) => {
            if (this.state.newsId === id) {
                this.setState({ audit });
            }
        });
    }

    private goToDetails(id: number, message: string, reload: boolean) {
        this.EnsureCountries();
        this.EnsureCategories();
        this.EnsureNewsAudit(id);
        this.EnsureNews(id, reload);
        
        this.setPageState({
            pageMode: 'details',
            message: message,
            validation: null,
            newsId: id,
            error: null
        });
    }

    private goToEdit(id: number, message: string) {
        this.EnsureCountries();
        this.EnsureCategories();
        this.EnsureNews(id);

        let edited = Framework.safeClone(this.state.news);
        
        this.setPageState({
            pageMode: 'edit',
            message: message,
            edited: edited,
            validation: new NewsDtoValidator(edited.data || this.initNewNews(), false),
            newsId: id,
            error: null
        });
    }

    private EnsureNews(id: number, reload?: boolean) {
        let preload = new Framework.Pending<Dtos.NewsDto>();

        if (!reload && this.state.news && this.state.news.data && this.state.news.data.id == id) {
            preload = this.state.news;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.NewsApi().getById(id), preload, (news) => {
                if (news.isDone() && (this.state.pageMode === 'edit' || this.state.pageMode === 'details')) {
                    let edited = Framework.safeClone(news);
                    let validation = new NewsDtoValidator(edited.data, false);
                    this.setState({ edited, news, validation, newsId: id });
                }
                else {
                    this.setState({ news })
                }
            });
        }
    }

    private ensureStatusOptions() {
        var statusOptions = this.state.statusOptions;
        if (!statusOptions || statusOptions.state == Framework.LoadingStatus.Preload || statusOptions.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().trmStatusType(), statusOptions, statusOptions => this.setState({ statusOptions }));
        }
    }

    private deleteNews(id: number) {
        Framework.connect(new Apis.NewsApi().deleteNews(id), null, x => {
            if (x.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: x.error, pageMode: 'search' });
            }
            else if (x.state === Framework.LoadingStatus.Done) {
                this.newsStore.refresh();
                this.goToSearch("News was successfully deleted");
            }
        });
    }
    
    private create(status?: Dtos.TrmEntityStatus, message?: string) {
        let newDto = this.state.edited;

        if (status) {
            newDto.data.status = status;
        }

        let validation = new NewsDtoValidator(newDto.data, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.NewsApi().create(newDto.data), null, news => {
                if (news.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: news.error });
                }
                else if (news.state === Framework.LoadingStatus.Done) {
                    this.newsStore.refresh();
                    this.setState({ news, edited: Framework.safeClone(news) });
                    this.goToDetails(news.data.id, message || "News was successfully created", true);
                }
                else {
                    this.setState({ validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private approve() {
        Framework.connect(new Apis.NewsApi().approve(this.state.edited.data.id), null, news => {
            if (news.state === Framework.LoadingStatus.Failed) {
                //Set it to done as will redisplay grid
                this.setState({ error: news.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "News item approved successfully", true);
            }
        });
    }

    private reject() {
        Framework.connect(new Apis.NewsApi().reject(this.state.edited.data.id), null, news => {
            if (news.state === Framework.LoadingStatus.Failed) {
                //Set it to done as will redisplay grid
                this.setState({ error: news.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "News item rejected successfully", true);
            }
        });
    }

    private update(status: Dtos.TrmEntityStatus, message?: string) {
        let newDto = this.state.edited.data;
        newDto.status = status;

        let validation = new NewsDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.NewsApi().update(newDto.id, newDto), null, news => {
                if (news.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: news.error });
                }
                else if (news.state === Framework.LoadingStatus.Done) {
                    this.newsStore.refresh();
                    this.setState({ news });
                    this.goToDetails(news.data.id, message, true);
                }
                else {
                    this.setState({ validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private editPublished() {
        let newDto = this.state.edited.data;

        let validation = new NewsDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.NewsApi().editPublishedRecord(newDto, this.state.newsId), null, news => {
                if (news.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation, error: news.error });
                }
                else if (news.state === Framework.LoadingStatus.Done) {
                    this.goToDetails(this.state.newsId, "Changes were sent for verification", true);
                }
                else {
                    this.setState({ validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }


    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    news={this.state.edited}
                    onCancel={() => this.goToSearch(null)}
                    onSave={() => this.create(Dtos.TrmEntityStatus.Draft)}
                    onPublishDraft={() => this.create(Dtos.TrmEntityStatus.AwaitingVerification, "News has been sent for verification")}
                    countries={this.state.countries}
                    categories={this.state.categories}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    showLiveRecords={this.props.showLiveRecords}
                    currentCountryId={this.state.currentCountryId}
                   
                />;
            case 'details':
                return <Details
                    news={this.state.news}
                    newsAudit={this.state.audit.map(x => x.items)}
                    onEdit={() => this.goToEdit(this.state.newsId, null)}
                    onBack={() => { this.handleBack(); }}
                    countries={this.state.countries}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onApprove={() => this.approve() }
                    onReject={() => this.reject()}
                    currentUserId={this.props.currentUserId}
                    onDelete={(id) => this.deleteNews(id)}
                   
                />;
            case 'edit':
                return <Edit
                    news={this.state.edited}
                    onCancel={() => this.goToDetails(this.state.newsId, null, true)}
                    onSave={() => this.update(Dtos.TrmEntityStatus.Draft, "News was successfully updated")}
                    onPublishDraft={() => this.update(Dtos.TrmEntityStatus.AwaitingVerification, "News has been sent for verification")}
                    countries={this.state.countries}
                    categories={this.state.categories}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    showLiveRecords={this.props.showLiveRecords}
                    onEditPublished={() => this.editPublished()}
                   
                />;
            default:
                return <Search
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    news={this.newsStore.getCurrentData()}
                    onNewsSelected={(news) => this.goToDetails(news.id, null, false)}
                    currentFilter={this.newsStore.getCurrentFilter()}
                    countries={this.state.countries}
                    statusOptions={this.state.statusOptions}
                    showLiveRecords={this.props.showLiveRecords}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onNewsReport={() => this.exportNewsReport()}
                   
                />;
        }
    }
        
    private exportNewsReportPopup: Framework.PopupBuilder;
    private exportNewsReport() {
        this.exportNewsReportPopup = new Framework.PopupBuilder()
            .setContent(<RequestNewsReport onClose={() => {
                this.exportNewsReportPopup.close();
                this.exportNewsReportPopup = null;
            }}
               
            />);
        this.exportNewsReportPopup.setTitle("Request News Report");
        this.exportNewsReportPopup.render();
    }

    private renderError() {
        return <Error error={this.state.error} qa="TrmNewsError"/>
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private renderLink() {
        if (this.props.isTrmReadOnlyUser || !this.state.news.data || (!this.state.news.data.currentAwaitingVerificationVersionId && !this.state.news.data.currentPublishedVersionId)) return null;

        let published = !!this.state.news.data.currentAwaitingVerificationVersionId;

        var message = published ? "There are changes to this record that are awaiting verification. Further changes cannot be made until pending changes have been approved or rejected" : "This is an edit of an already published record";
        var linkText = published ? "view the record awaiting verification" : "view the original record";
        var itemId = this.state.news.data.currentPublishedVersionId || this.state.news.data.currentAwaitingVerificationVersionId;

        return (<div className="flash-message alert alert-info">
            {message} - <a className="alert-link" href="#" onClick={() => this.goToDetails(itemId, "", true)}>{linkText}</a>.
        </div>);
    }

    private renderWarningLink() {
        if (!this.props.showLiveRecords || this.state.pageMode != 'search') return null;

        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {

            if (!hasEdits) return null;

            return (
                <div className="flash-message alert alert-info">There are records in Draft or Pending Verification that are not viewable here - <a className="alert-link" href = 'draft'>view these records</a>.</div>
            );
        })
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create News"
            case 'details':
                if (!this.state.news.data) return "View News";

                switch (this.state.news.data.status) {
                    case Dtos.TrmEntityStatus.Draft: return "View Draft News";
                    case Dtos.TrmEntityStatus.AwaitingVerification: return "Verify News";
                    case Dtos.TrmEntityStatus.Published: return "View News";
                }
            case "edit":
                return (this.state.news.data && this.state.news.data.statusName) == "Draft" ? "Edit Draft News" : "Edit News";
            default:
                return this.props.showLiveRecords ? "News" : "Draft News"
        }
    }

    render() {
        return (
            <div>
                <TrmCountrySelection
                    onCountryChanged={(ctry) => { this.setState({ currentCountryId: ctry.id, outstandingEdits: new Framework.Pending<boolean>(Framework.LoadingStatus.Preload) }); this.newsStore.refresh(); this.goToSearch("Country was changed successfully"); }}
                    currentCountryId={this.state.currentCountryId}
                />
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderMessage()}
                {this.renderWarningLink()}
                {this.renderLink()}
                {this.renderError()}
                {this.renderView()}
            </div>
        );
    }
}