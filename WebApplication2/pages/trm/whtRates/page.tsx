import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { Edit } from './edit';
import { Details } from './details';
import { List } from './list';
import * as Framework from "../../../classes";
import { Message, Error } from '../../../components';
import { WhtRateDtoValidator } from '../../../validators/whtRateDtoValidator';
import { TrmCountrySelection } from '../trmCountrySelection';
import { LoadingStatus } from '../../../classes';

interface PageProps {
    backUrl: string;
    currentUserId: number;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
    currentTrmCountryId?: number;
};

interface PageState {
    pageMode?: 'details' | 'list' | 'edit' | 'createNew'
    whtRateList?: Framework.PagedDataState<Dtos.WhtRateSummaryDto, Dtos.GetWhtRateList>;
    whtRateId?: number;
    whtRate?: Framework.Pending<Dtos.WhtRateDto>;
    edited?: Framework.Pending<Dtos.WhtRateDto>;
    validator?: WhtRateDtoValidator;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    entityTypes?: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes?: Framework.Pending<Dtos.StockTypeDto[]>;
    exceptionTypes?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    audit?: Framework.Pending<{ id: number, items: Dtos.WhtRateAuditDto[] }>;
    error?: Framework.AppError;
    message?: string;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    outstandingEdits?: Framework.Pending<boolean>;
    copyingFrom?: number;
    currentCountryId?: number;
};

interface UrlProps {
    whtRateId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private whtRateStore: Framework.PageCache<Dtos.WhtRateSummaryDto, Dtos.GetWhtRateList>;
    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    constructor(props: PageProps) {
        super(props);

        this.whtRateStore = new Framework.PageCache<Dtos.WhtRateSummaryDto, Dtos.GetWhtRateList>(
            (query, page, pageSize) => new Apis.WhtRateApi().search(query, page, pageSize),
            () => this.state.whtRateList,
            (whtRateList) => this.setState({ whtRateList })
        );

        this.state = {
            pageMode: 'list',
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            entityTypes: new Framework.Pending<Dtos.EntityTypeSummaryDto[]>(),
            stockTypes: new Framework.Pending<Dtos.StockTypeDto[]>(),
            exceptionTypes: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            audit: new Framework.Pending<{ id: number, items: Dtos.WhtRateAuditDto[] }>(),
            whtRate: new Framework.Pending<Dtos.WhtRateDto>(Framework.LoadingStatus.Preload),
            outstandingEdits: new Framework.Pending<boolean>(),
            currentCountryId: props.currentTrmCountryId
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
        var rateId = this.url.read().whtRateId;

        if (currPath.indexOf(`/whtRate/${urlString}/details`) !== -1 && rateId) {
            this.goToDetails(rateId, null);
        }
        else if (currPath.indexOf(`/whtRate/${urlString}/edit`) !== -1 && rateId) {
            this.goToEdit(rateId);
        }
        else if (currPath.indexOf(`/whtRate/${urlString}/create`) !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf(`/whtRate/${urlString}/copy`) !== -1 && rateId) {
            this.goToCopy(rateId);
        }
        else {
            this.goToSearch(null);
        }
    }

    private setPageState(state: PageState) {
        let urlString = this.props.showLiveRecords ? 'live' : 'draft';
        let backUrl = this.props.backUrl ? `?backUrl=${encodeURI(this.props.backUrl)}` : "";
        this.setState(state);

        if (state.pageMode === "details") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/whtRate', urlString, 'details' + backUrl]))
            this.url.update({ whtRateId: state.whtRateId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/whtRate', urlString, 'create']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/whtRate', urlString, 'edit']))
            this.url.update({ whtRateId: state.whtRateId })
        }
        else {
            this.url.push(Framework.UrlHelpers.buildUrl(['/whtRate', urlString]));
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case 'createNew':
                return "Create New Withholding Rate";
            case 'details':
                if (!this.state.whtRate.data) return "View Withholding Rate";

                switch (this.state.whtRate.data.status) {
                    case Dtos.TrmEntityStatus.Draft: return "View Draft Withholding Rate";
                    case Dtos.TrmEntityStatus.AwaitingVerification: return "Verify Withholding Rate";
                    case Dtos.TrmEntityStatus.Published: return "View Withholding Rate";
                }
            case 'list':
                return (this.props.showLiveRecords) ? "Withholding Rates" : "Draft Withholding Rates";
            case 'edit':
                return this.state.whtRate.data && this.state.whtRate.data.status === Dtos.TrmEntityStatus.Draft ? "Edit Draft Withholding Rate" : "Edit Withholding Rate";
        }
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        } else {
            this.goToSearch(null);
            this.whtRateStore.refresh();
        }
    }

    private goToSearch(message: string) {
        this.EnsureStatusOptions();
        this.ensureHasUnapprovedItems();

        this.setPageState({
            pageMode: 'list',
            error: null,
            message
        });
    }

    private initNewRate(): Dtos.WhtRateDto {
        return {
            narative: null,
            exceptions: [],
            id: 0,
            effectiveDate: null,
            reclaimMarket: null,
            dividendRate: null,
            interestRate: null,
            hasExceptions: null,
            isCurrentWhtRate: null,
            status: Dtos.TrmEntityStatus.Draft,
            statusName: "Draft",
            currentPublishedVersionId: null,
            currentAwaitingVerificationVersionId: null
        }
    }

    private goToCopy(id: number) {

        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();
        this.EnsureExceptionTypes();
        this.EnsureStatusOptions();

        let copy = {} as Dtos.WhtRateDto;

        Framework.connect(new Apis.WhtRateApi().getById(id), null, (whtRate) => {

            if (whtRate.isDone()) {
                copy = Framework.safeClone(whtRate).data;
                copy.id = null;
                copy.currentAwaitingVerificationVersionId = null;
                copy.effectiveDate = null;
                copy.status = Dtos.TrmEntityStatus.Draft;
                copy.statusName = "Draft";
                copy.isCurrentWhtRate = false;

                this.setPageState({
                    pageMode: 'createNew',
                    whtRateId: null,
                    whtRate: new Framework.Pending<Dtos.WhtRateDto>(),
                    edited: new Framework.Pending(Framework.LoadingStatus.Done, copy),
                    validator: new WhtRateDtoValidator(copy, false),
                    message: null,
                    error: null,
                    copyingFrom: id
                });
            }
            else {
                this.setState({ whtRate })
            }
        });
    }

    private goToCreate() {
        let newDto = this.initNewRate();

        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();
        this.EnsureExceptionTypes();
        this.EnsureStatusOptions();

        this.setPageState({
            pageMode: 'createNew',
            whtRateId: null,
            whtRate: new Framework.Pending<Dtos.WhtRateDto>(),
            edited: new Framework.Pending(Framework.LoadingStatus.Done, this.initNewRate()),
            validator: new WhtRateDtoValidator(newDto, false),
            error: null,
            copyingFrom: null
        });
    }

    private goToEdit(id: number) {
        this.EnsureCountries();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();
        this.EnsureExceptionTypes();
        this.EnsureWhtRate(id);

        let edited = Framework.safeClone(this.state.whtRate);

        this.setPageState({
            pageMode: 'edit',
            whtRateId: id,
            edited,
            validator: new WhtRateDtoValidator(edited.data || this.initNewRate(), false),
            message: null
        });
    }

    private goToDetails(id: number, message: string, reload?: boolean) {
        this.setState({ whtRateId: id })
        this.EnsureWhtRate(id, reload);
        this.EnsureWhtRateAudit(id);

        this.setPageState({
            pageMode: 'details',
            whtRateId: id,
            validator: null,
            error: null,
            message
        });
    }

    private EnsureStatusOptions() {
        var statusOptions = this.state.statusOptions;
        if (!statusOptions || statusOptions.state == Framework.LoadingStatus.Preload || statusOptions.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().trmStatusType(), statusOptions, statusOptions => this.setState({ statusOptions }));
        }
    }

    private EnsureWhtRate(id: number, reload?: boolean) {
        let preload = new Framework.Pending<Dtos.WhtRateDto>();

        if (!reload && this.state.whtRate && this.state.whtRate.data && this.state.whtRate.data.id == id) {
            preload = this.state.whtRate;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.WhtRateApi().getById(id), preload, (whtRate) => {
                if (this.state.whtRateId === id) {
                    if (whtRate.isDone() && (this.state.pageMode === 'edit' || this.state.pageMode === 'details')) {
                        let edited = Framework.safeClone(whtRate);
                        let validator = new WhtRateDtoValidator(edited.data, false);
                        this.setState({ edited, whtRate, validator });
                    }
                    else {
                        this.setState({ whtRate })
                    }
                }
            });
        }
    }

    private EnsureWhtRateAudit(id: number) {
        Framework.connect(new Apis.WhtRateApi().getAuditById(id).then(x => { return { id: id, items: x }; }), this.state.audit, (audit) => {
            if (this.state.whtRateId === id) {
                this.setState({ audit });
            }
        });
    }

    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(true), this.state.countries, countries => this.setState({ countries }));
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

    private EnsureExceptionTypes() {
        if (this.state.exceptionTypes.state === Framework.LoadingStatus.Preload || this.state.exceptionTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().whtRateExceptionType(), this.state.exceptionTypes, exceptionTypes => this.setState({ exceptionTypes }));
        }
    }

    private ensureHasUnapprovedItems() {
        if (this.props.isTrmReadOnlyUser) {
            this.setState({ outstandingEdits: new Framework.Pending(LoadingStatus.Done, false, null) });
            return;
        }
        if(this.state.outstandingEdits.state == Framework.LoadingStatus.Preload || this.state.outstandingEdits.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.TrmApi().hasOutstandingEdits({
                checkTreaty: false,
                checkWht: true,
                checkTaxCredit: false,
                checkStatute: false,
                checkNews: false,
                includeAwaitingVerification: true,
                includeDraft: true,
                countryOfResidenceId: null,
                reclaimMarketId: this.state.currentCountryId
            }), this.state.outstandingEdits, outstandingEdits => this.setState({ outstandingEdits }));
        }
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetWhtRateList_SortField>) {
        this.whtRateStore.setCurrent({ showLiveWhtRates: this.props.showLiveRecords, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private updateEditor(dto: Dtos.WhtRateDto) {
        this.setState({
            edited: new Framework.Pending(Framework.LoadingStatus.Done, dto),
            validator: new WhtRateDtoValidator(dto, this.state.validator.showValidationErrors())
        });
    }

    private create(status?: Dtos.TrmEntityStatus, message?: string) {
        let newDto = this.state.edited.data;

        if (status) {
            newDto.status = status;
        }

        let validator = new WhtRateDtoValidator(newDto, true);

        if (validator.isValid()) {
            Framework.connect(new Apis.WhtRateApi().create(newDto), null, x => {
                if (x.state === Framework.LoadingStatus.Failed) {
                    this.setState({ error: x.error });
                }
                else if (x.state === Framework.LoadingStatus.Done) {
                    this.whtRateStore.refresh();
                    this.goToDetails(x.data.id, message || 'Withholding Rate was successfully created.');
                }
            });
        }
        else {
            this.setState({ validator });
        }
    }

    private editPublished() {
        let newDto = this.state.edited.data;

        let validation = new WhtRateDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.WhtRateApi().editPublishedRecord(newDto, this.state.whtRateId), null, rate => {
                if (rate.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validator: validation, error: rate.error });
                }
                else if (rate.state === Framework.LoadingStatus.Done) {
                    this.goToDetails(this.state.whtRateId, "Changes were sent for verification", true);
                }
                else {
                    this.setState({ validator: validation });
                }
            })
        }
        else {
            this.setState({ validator: validation  });
        }
    }

    private approve() {
        Framework.connect(new Apis.WhtRateApi().approve(this.state.edited.data.id), null, whtRate => {
            if (whtRate.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: whtRate.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Withholding Rate approved successfully", true);
            }
        });
    }

    private reject() {
        Framework.connect(new Apis.WhtRateApi().reject(this.state.edited.data.id), null, whtRate => {
            if (whtRate.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: whtRate.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Withholding Rate rejected successfully", true);
            }
        });
    }

    private update(status: Dtos.TrmEntityStatus, message?: string) {

        let newDto = this.state.edited.data;
        newDto.status = status;

        let validator = new WhtRateDtoValidator(newDto, true);

        if (validator.isValid()) {
            Framework.connect(new Apis.WhtRateApi().update(newDto.id, newDto), null, whtRate => {
                if (whtRate.isDone()) {
                    this.whtRateStore.refresh();
                    this.setState({ whtRate })
                    this.goToDetails(whtRate.data.id, message);
                }
                else if (whtRate.isFailed()) {
                    this.setState({ error: whtRate.error, validator: validator });
                }
            })
        }
        else {
            this.setState({ validator });
        }
    }

    private deleteWhtRate(id: number) {
        Framework.connect(new Apis.WhtRateApi().deleteWhtRate(id), null, x => {
            if (x.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: x.error, pageMode: 'list' });
            }
            else if (x.state === Framework.LoadingStatus.Done) {
                this.whtRateStore.refresh();
                this.goToSearch("Withholding rate was successfully deleted");
            }
            else {
                this.setState({ whtRate: new Framework.Pending(x.state, this.state.whtRate.data) });
            }
        });
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    onCancel={this.state.copyingFrom != null ? () => window.location.href = `/whtRate/live/details#{"whtRateId":${this.state.copyingFrom}}` : () => this.goToSearch(null)}
                    onSave={() => this.create(Dtos.TrmEntityStatus.Draft)}
                    onPublishDraft={() => this.create(Dtos.TrmEntityStatus.AwaitingVerification, "Withholding Rate has been sent for verification")}
                    countries={this.state.countries}
                    whtRate={this.state.edited}
                    onChange={(dto) => this.updateEditor(dto)}
                    stockTypes={this.state.stockTypes}
                    entityTypes={this.state.entityTypes}
                    exceptionTypes={this.state.exceptionTypes}
                    validator={this.state.validator}
                    showLiveRecords={this.props.showLiveRecords}
                    currentCountryId={this.state.currentCountryId}
                   
                />;
            case 'edit':
                return <Edit
                    onCancel={() => this.goToDetails(this.state.whtRateId, null)}
                    onSave={() => this.update(Dtos.TrmEntityStatus.Draft, "Withholding Rate was successfully updated")}
                    onPublishDraft={() => this.update(Dtos.TrmEntityStatus.AwaitingVerification, "Withholding Rate has been sent for verification")}
                    onEditPublished={() => this.editPublished()}
                    countries={this.state.countries}
                    whtRate={this.state.edited}
                    onChange={(dto) => this.updateEditor(dto)}
                    stockTypes={this.state.stockTypes}
                    entityTypes={this.state.entityTypes}
                    exceptionTypes={this.state.exceptionTypes}
                    validator={this.state.validator}
                    showLiveRecords={this.props.showLiveRecords}
                   
                />;
            case 'details':
                return <Details
                    onBack={() => this.handleBack() }
                    onApprove={() => this.approve()}
                    onReject={() => this.reject()}
                    currentUserId={this.props.currentUserId}
                    onEdit={() => this.goToEdit(this.state.whtRateId)}
                    whtRate={this.state.whtRate}
                    audit={this.state.audit.map(x => x.items)}
                    onDelete={id => this.deleteWhtRate(id)}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onCopy={(id) => window.location.href = `/whtRate/draft/copy#{"whtRateId":${id}}`}
                   
                />;
            case 'list':
                return <List
                    onPageChanged={(options) => this.onGridChanged(options)}
                    whtRates={this.whtRateStore.getCurrentData()}
                    onRateSelect={(id) => this.goToDetails(id, null)}
                    onCreateSelected={() => this.goToCreate()}
                    statusOptions={this.state.statusOptions}
                    showLiveRecords={this.props.showLiveRecords}
                   
                />;
        }
    }

    private renderLink() {
        if (!this.state.whtRate.data || this.props.isTrmReadOnlyUser || (!this.state.whtRate.data.currentAwaitingVerificationVersionId && !this.state.whtRate.data.currentPublishedVersionId)) return null;

        let published = !!this.state.whtRate.data.currentAwaitingVerificationVersionId;

        var message = published ? "There are changes to this record that are awaiting verification. Further changes cannot be made until pending changes have been approved or rejected" : "This is an edit of an already published record";
        var linkText = published ? " view the record awaiting verification" :  "view the original record";
        var itemId = this.state.whtRate.data.currentPublishedVersionId || this.state.whtRate.data.currentAwaitingVerificationVersionId;

        return (<div className="flash-message alert alert-info">
            {message} - <a className="alert-link" href="#" onClick={() => this.goToDetails(itemId, "", true)} data-qa="RecordAwaitingVerificationLink">{linkText}</a>.
        </div>);
    }

    private renderWarningLink() {
        if (!this.props.showLiveRecords || this.state.pageMode != 'list' || this.props.isTrmReadOnlyUser) return null;

        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {

            if (!hasEdits) return null;

            return (
                <div className="flash-message alert alert-info">There are records in Draft or Pending Verification that are not viewable here - <a className="alert-link" href='draft' data-qa="ViewRecordsLink">view these records</a>.</div>
            );
        })
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    render() {
        return (
            <div>
                <TrmCountrySelection
                    onCountryChanged={(ctry) => { this.setState({ currentCountryId: ctry.id, outstandingEdits: new Framework.Pending<boolean>(Framework.LoadingStatus.Preload) }); this.whtRateStore.refresh(); this.goToSearch("Country was changed successfully"); }}
                    currentCountryId={this.state.currentCountryId}
                />
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderMessage()}
                {this.renderWarningLink()}
                {this.renderLink()}
                {this.state.error ? <Error error={this.state.error} qa="TrmWhtRatesError"/> : null}
                {this.renderView()}
            </div>
        );
    }
}
