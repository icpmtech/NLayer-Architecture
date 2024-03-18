import * as React from 'react';
import { Message, Error } from '../../../components';
import * as Framework from '../../../classes';
import { Details } from './details';
import { Search } from './search';
import { Edit } from './edit';
import { Apis, Dtos } from '../../../adr';
import { TaxCreditDtoValidator } from '../../../validators/taxCreditDtoValidator';
import { TrmCountrySelection } from '../trmCountrySelection';

interface PageProps {
    backUrl: string;
    currentUserId: number;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
    currentTrmCountryId?: number;
};

interface PageState {
    taxCreditList?: Framework.PagedDataState<Dtos.TaxCreditSummaryDto, Dtos.GetListTaxCreditsQuery>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    message?: string;
    error?: Framework.AppError;
    taxCredit?: Framework.Pending<Dtos.TaxCreditDto>;
    audit?: Framework.Pending<{ id: number, items: Dtos.TaxCreditAuditDto[] }>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    entityTypes?: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes?: Framework.Pending<Dtos.StockTypeDto[]>;
    taxCreditId?: number;
    edited?: Framework.Pending<Dtos.TaxCreditDto>;
    validation?: TaxCreditDtoValidator;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    outstandingEdits?: Framework.Pending<boolean>;
    copyingFrom?: number;
    currentCountryId?: number;
}

interface UrlProps {
    taxCreditId: number;
}

export class Page extends React.Component<PageProps, PageState> {

    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    private taxCreditStore: Framework.PageCache<Dtos.TaxCreditSummaryDto, Dtos.GetListTaxCreditsQuery>;

    constructor(props: PageProps) {
        super(props);

        this.taxCreditStore = new Framework.PageCache<Dtos.TaxCreditSummaryDto, Dtos.GetListTaxCreditsQuery>(
            (query, page, pageSize) => new Apis.TaxCreditApi().search(query, page, pageSize),
            () => this.state.taxCreditList,
            (taxCreditList) => this.setState({ taxCreditList })
        );

        this.state = {
            pageMode: "search",
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            taxCredit: new Framework.Pending<Dtos.TaxCreditDto>(),
            audit: new Framework.Pending<{ id: number, items: Dtos.WhtRateAuditDto[] }>(),
            entityTypes: new Framework.Pending<Dtos.EntityTypeSummaryDto[]>(),
            stockTypes: new Framework.Pending<Dtos.StockTypeDto[]>(),
            outstandingEdits: new Framework.Pending<boolean>(),
            currentCountryId: props.currentTrmCountryId
        }
    }

    private initNewTaxCredit(): Dtos.TaxCreditDto {
        return {
            id: null,
            reclaimMarket: null,
            countryOfResidence: null,
            standardDividendRate: null,
            standardDividendRateNarrative: null,
            standardInterestRate: null,
            standardInterestRateNarrative: null,
            effectiveDate: null,
            exceptions: [],
            hasExceptions: false,
            isCurrentTaxCredit: false,
            status: Dtos.TrmEntityStatus.Draft,
            statusName: "Draft",
            currentPublishedVersionId: null,
            currentAwaitingVerificationVersionId: null
        };
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
        var id = this.url.read().taxCreditId;

        if (currPath.indexOf(`/taxCredits/${urlString}/createNew`) !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf(`/taxCredits/${urlString}/details`) !== -1 && id) {
            this.goToDetails(id, null, true);
        }
        else if (currPath.indexOf(`/taxCredits/${urlString}/edit`) !== -1 && id) {
            this.goToEdit(id, null);
        }
        else if (currPath.indexOf(`/taxCredits/${urlString}/copy`) !== -1 && id) {
            this.goToCopy(id);
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
            this.url.push(Framework.UrlHelpers.buildUrl(['/taxCredits', urlString, 'details' + backUrl]))
            this.url.update({ taxCreditId: state.taxCreditId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/taxCredits', urlString, 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/taxCredits', urlString, 'edit']))
            this.url.update({ taxCreditId: state.taxCreditId })
        }
        else {
            this.url.push(Framework.UrlHelpers.buildUrl(['/taxCredits', urlString]));
        }
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetListTaxCreditsQuery_TaxCreditsSortField>) {
        this.taxCreditStore.setCurrent({ sort: options.sort, uiFilters: options.filters, showLive: this.props.showLiveRecords }, options.page, options.pageSize, false);
    }

    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private EnsureEntityTypes() {
        if (this.state.entityTypes.state === Framework.LoadingStatus.Preload || this.state.entityTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EntityTypesApi().getAllTrm(), this.state.entityTypes, entityTypes => this.setState({ entityTypes }));
        }
    }

    private EnsureStockTypes() {
        if (this.state.stockTypes.state === Framework.LoadingStatus.Preload || this.state.stockTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.StockTypeApi().search(), this.state.stockTypes, stockTypes => this.setState({ stockTypes }));
        }
    }

    private ensureStatusOptions() {
        var statusOptions = this.state.statusOptions;
        if (!statusOptions || statusOptions.state == Framework.LoadingStatus.Preload || statusOptions.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().trmStatusType(), statusOptions, statusOptions => this.setState({ statusOptions }));
        }
    }

    private ensureHasUnapprovedItems(){
        if (this.props.isTrmReadOnlyUser) {
            this.setState({ outstandingEdits: new Framework.Pending(Framework.LoadingStatus.Done, false, null) });
            return;
        }
        if(this.state.outstandingEdits.state == Framework.LoadingStatus.Preload || this.state.outstandingEdits.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.TrmApi().hasOutstandingEdits({
                checkTreaty: false,
                checkWht: false,
                checkTaxCredit: true,
                checkStatute: false,
                checkNews: false,
                includeAwaitingVerification: true,
                includeDraft: true,
                countryOfResidenceId: null,
                reclaimMarketId: this.state.currentCountryId
            }), this.state.outstandingEdits, outstandingEdits => this.setState({ outstandingEdits }));
        }
    }

    private updateEditor(dto: Dtos.TaxCreditDto) {
        this.setState({
            edited: new Framework.Pending(Framework.LoadingStatus.Done, dto),
            validation: new TaxCreditDtoValidator(dto, this.state.validation.showValidationErrors())
        });
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        } else {
            this.goToSearch(null);
            this.taxCreditStore.refresh();
        }
    }

    private goToSearch(message: string) {
        this.EnsureCountries();
        this.ensureStatusOptions();
        this.ensureHasUnapprovedItems();
        this.setPageState({
            pageMode: 'search',
            taxCreditId: null,
            taxCredit: new Framework.Pending<Dtos.TaxCreditDto>(),
            edited: null,
            message: message,
            error: null
        });
    }

    private goToCopy(id: number) {

        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();

        let copy = {} as Dtos.TaxCreditDto;

        Framework.connect(new Apis.TaxCreditApi().getById(id), null, (taxCredit) => {

            if (taxCredit.isDone()) {
                copy = Framework.safeClone(taxCredit).data;
                copy.id = null;
                copy.currentAwaitingVerificationVersionId = null;
                copy.effectiveDate = null;
                copy.status = Dtos.TrmEntityStatus.Draft;
                copy.statusName = "Draft";
                copy.isCurrentTaxCredit = false;

                this.setPageState({
                    pageMode: 'createNew',
                    taxCreditId: null,
                    taxCredit: new Framework.Pending<Dtos.TaxCreditDto>(),
                    edited: new Framework.Pending(Framework.LoadingStatus.Done, copy),
                    validation: new TaxCreditDtoValidator(copy, false),
                    message: null,
                    error: null,
                    copyingFrom: id
                });
            }
            else {
                this.setState({ taxCredit })
            }
        });
    }

    private goToCreate() {
        let newDto = this.initNewTaxCredit();

        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();

        this.setPageState({
            pageMode: 'createNew',
            taxCreditId: null,
            taxCredit: new Framework.Pending<Dtos.TaxCreditDto>(),
            edited: new Framework.Pending(Framework.LoadingStatus.Done, this.initNewTaxCredit()),
            validation: new TaxCreditDtoValidator(newDto, false),
            message: null,
            error: null,
            copyingFrom: null
        });
    }

    private EnsureTaxCreditAudit(id: number) {
        Framework.connect(new Apis.TaxCreditApi().getAuditById(id).then(x => { return { id: id, items: x }; }), this.state.audit, (audit) => {
            if (this.state.taxCreditId === id) {
                this.setState({ audit });
            }
        });
    }

    private goToDetails(id: number, message: string, reload: boolean) {
        this.EnsureCountries();
        this.EnsureTaxCreditAudit(id);
        this.EnsureTaxCredit(id, reload);

        this.setPageState({
            pageMode: 'details',
            message: message,
            taxCreditId: id,
            validation: null,
            error: null
        });
    }

    private EnsureTaxCredit(id: number, reload?: boolean) {
        let preload = new Framework.Pending<Dtos.TaxCreditDto>();

        if (!reload && this.state.taxCredit && this.state.taxCredit.data && this.state.taxCredit.data.id == id) {
            preload = this.state.taxCredit;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.TaxCreditApi().getById(id), preload, (taxCredit) => {
                if (this.state.taxCreditId === id) {
                    if (taxCredit.isDone() && (this.state.pageMode === 'edit' || this.state.pageMode === 'details')) {
                        let edited = Framework.safeClone(taxCredit);
                        let validation = new TaxCreditDtoValidator(edited.data, false);
                        this.setState({ edited, taxCredit, validation });
                    }
                    else {
                        this.setState({ taxCredit })
                    }
                }
            });
        }
    }

    private goToEdit(id: number, message: string) {
        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();
        this.EnsureTaxCredit(id);

        let edited = Framework.safeClone(this.state.taxCredit);

        this.setPageState({
            pageMode: 'edit',
            taxCreditId: id,
            edited,
            validation: new TaxCreditDtoValidator(edited.data || this.initNewTaxCredit(), false),
            error: null,
            message: message,
        });
    }

    private create(status?: Dtos.TrmEntityStatus, message?: string) {
        let newDto = this.state.edited.data;

        if (status) {
            newDto.status = status;
        }

        let validation = new TaxCreditDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TaxCreditApi().create(newDto), null, taxCredit => {
                if (taxCredit.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: taxCredit.error });
                }
                else if (taxCredit.state === Framework.LoadingStatus.Done) {
                    this.taxCreditStore.refresh();
                    this.setState({ taxCredit });
                    this.goToDetails(taxCredit.data.id, message || "Tax Credit was successfully created", true);
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

        let validation = new TaxCreditDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TaxCreditApi().editPublishedRecord(newDto, this.state.taxCreditId), null, taxCredit => {
                if (taxCredit.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: taxCredit.error });
                }
                else if (taxCredit.state === Framework.LoadingStatus.Done) {
                    this.goToDetails(this.state.taxCreditId, "Changes were sent for verification", true);
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
        Framework.connect(new Apis.TaxCreditApi().approve(this.state.edited.data.id), null, taxCredit => {
            if (taxCredit.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: taxCredit.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Tax Credit approved successfully", true);
            }
        });
    }

    private reject() {
        Framework.connect(new Apis.TaxCreditApi().reject(this.state.edited.data.id), null, taxCredit => {
            if (taxCredit.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: taxCredit.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Tax Credit rejected successfully", true);
            }
        });
    }

    private update(status: Dtos.TrmEntityStatus, message?: string) {

        let newDto = this.state.edited.data;
        newDto.status = status;

        let validation = new TaxCreditDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TaxCreditApi().update(newDto.id, newDto), null, taxCredit => {
                if (taxCredit.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: taxCredit.error });
                }
                else if (taxCredit.state === Framework.LoadingStatus.Done) {
                    this.taxCreditStore.refresh();
                    this.setState({ taxCredit });
                    this.goToDetails(taxCredit.data.id, message, true);
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

    private deleteTaxCredit(id: number) {
        Framework.connect(new Apis.TaxCreditApi().deleteTaxCredit(id), null, x => {
            if (x.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: x.error, pageMode: 'search' });
            }
            else if (x.state === Framework.LoadingStatus.Done) {
                this.taxCreditStore.refresh();
                this.goToSearch("Tax Credit was successfully deleted");
            }
        });
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    taxCredit={this.state.edited}
                    onCancel={this.state.copyingFrom != null ? () => window.location.href = `/taxCredits/live/details#{"taxCreditId":${this.state.copyingFrom}}` : () => this.goToSearch(null)}
                    onSave={() => this.create(Dtos.TrmEntityStatus.Draft)}
                    onPublishDraft={() => this.create(Dtos.TrmEntityStatus.AwaitingVerification, "Tax Credit has been sent for verification")}
                    countries={this.state.countries}
                    entityTypes={this.state.entityTypes}
                    stockTypes={this.state.stockTypes}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    showLiveRecords={this.props.showLiveRecords}
                    currentCountryId={this.state.currentCountryId}
                   
                />;
            case 'details':
                return <Details
                    taxCredit={this.state.taxCredit}
                    taxCreditAudit={this.state.audit.map(x => x.items)}
                    onEdit={() => this.goToEdit(this.state.taxCreditId, null)}
                    onBack={() => { this.handleBack(); }}
                    onApprove={() => this.approve()}
                    onReject={() => this.reject()}
                    countries={this.state.countries}
                    onDelete={(id) => this.deleteTaxCredit(id)}
                    currentUserId={this.props.currentUserId}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onCopy={(id) => window.location.href = `/taxCredits/draft/copy#{"taxCreditId":${id}}`}
                   
                />;
            case 'edit':
                return <Edit
                    taxCredit={this.state.edited}
                    onCancel={() => this.goToDetails(this.state.taxCreditId, null, true)}
                    onSave={() => this.update(Dtos.TrmEntityStatus.Draft, "Tax Credit was successfully updated")}
                    onPublishDraft={() => this.update(Dtos.TrmEntityStatus.AwaitingVerification, "Tax Credit has been sent for verification")}
                    onEditPublished={() => this.editPublished()}
                    countries={this.state.countries}
                    entityTypes={this.state.entityTypes}
                    stockTypes={this.state.stockTypes}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    showLiveRecords={this.props.showLiveRecords}
                   
                />;
            default:
                return <Search
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    taxCredits={this.taxCreditStore.getCurrentData()}
                    onTaxCreditSelected={(taxCredit) => this.goToDetails(taxCredit.id, null, false)}
                    currentFilter={this.taxCreditStore.getCurrentFilter()}
                    countries={this.state.countries}
                    statusOptions={this.state.statusOptions}
                    showLiveRecords={this.props.showLiveRecords}
                   
                />;
        }
    }

    private renderError() {
        return <Error error={this.state.error} qa="TaxCreditsError"/>
    }

    private renderLink() {
        if (!this.state.taxCredit.data || this.props.isTrmReadOnlyUser || (!this.state.taxCredit.data.currentAwaitingVerificationVersionId && !this.state.taxCredit.data.currentPublishedVersionId)) return null;

        let published = !!this.state.taxCredit.data.currentAwaitingVerificationVersionId;

        var message = published ? "There are changes to this record that are awaiting verification. Further changes cannot be made until pending changes have been approved or rejected" : "This is an edit of an already published record";
        var linkText = published ? " view the record awaiting verification" : " view the original record";
        var itemId = this.state.taxCredit.data.currentPublishedVersionId || this.state.taxCredit.data.currentAwaitingVerificationVersionId;

        return (<div className="flash-message alert alert-info">
            {message} - <a className="alert-link" href="#" onClick={() => this.goToDetails(itemId, "", true)} data-qa="DetailsLink">{linkText}</a>.
        </div>);
    }

    private renderWarningLink() {
        if (!this.props.showLiveRecords || this.state.pageMode != 'search' || this.props.isTrmReadOnlyUser) return null;

        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {

            if (!hasEdits) return null;

            return (
                <div className="flash-message alert alert-info">There are records in Draft or Pending Verification that are not viewable here - <a className="alert-link" href='draft' data-qa="viewRecordsLink">view these records</a>.</div>
            );
        })
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create Tax Credit"
            case 'details':
                if (!this.state.taxCredit.data) return "View Tax Credit";

                switch (this.state.taxCredit.data.status) {
                    case Dtos.TrmEntityStatus.Draft: return "View Draft Tax Credit";
                    case Dtos.TrmEntityStatus.AwaitingVerification: return "Verify Tax Credit";
                    case Dtos.TrmEntityStatus.Published: return "View Tax Credit";
                }
            case "edit":
                return (this.state.taxCredit.data && this.state.taxCredit.data.statusName) == "Draft" ? "Edit Draft Tax Credit" : "Edit Tax Credit";
            default:
                return this.props.showLiveRecords ? "Tax Credit" : "Draft Tax Credit"
        }
    }

    render() {
        return (
            <div>
                <TrmCountrySelection
                    onCountryChanged={(ctry) => { this.setState({ currentCountryId: ctry.id, outstandingEdits: new Framework.Pending<boolean>(Framework.LoadingStatus.Preload) }); this.taxCreditStore.refresh(); this.goToSearch("Country was changed successfully"); }}
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