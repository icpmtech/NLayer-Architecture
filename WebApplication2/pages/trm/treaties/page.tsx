import * as React from 'react';
import { Message, Error } from '../../../components';
import * as Framework from '../../../classes';
import { Details } from './details';
import { Search } from './search';
import { Edit } from './edit';
import { Apis, Dtos } from '../../../adr';
import { TreatyDtoValidator } from '../../../validators/treatyDtoValidator';
import { GtrsExportPopup } from './gtrsExportPopup';
import { RequestClientMatrix } from './requestClientMatrix';
import { TrmCountrySelection } from '../trmCountrySelection';

interface PageProps {
    backUrl: string;
    currentUserId: number;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
    currentTrmCountryId?: number;
};

interface PageState {
    treatyList?: Framework.PagedDataState<Dtos.TreatySummaryDto, Dtos.GetListTreatiesQuery>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    message?: string;
    error?: Framework.AppError;
    treaty?: Framework.Pending<Dtos.TreatyDto>;
    audit?: Framework.Pending<{ id: number, items: Dtos.TreatyAuditDto[] }>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    treatyTypes?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    treatyExceptionTypes?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    entityTypes?: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes?: Framework.Pending<Dtos.StockTypeDto[]>;
    treatyId?: number;
    edited?: Framework.Pending<Dtos.TreatyDto>;
    validation?: TreatyDtoValidator;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    createReciprocalTreaty?: boolean;
    outstandingEdits?: Framework.Pending<boolean>;
    copyingFrom?: number;
    currentCountryId?: number;
}

interface UrlProps {
    treatyId: number;
}

export class Page extends React.Component<PageProps, PageState> {

    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    private treatyStore: Framework.PageCache<Dtos.TreatySummaryDto, Dtos.GetListTreatiesQuery>;

    constructor(props: PageProps) {
        super(props);

        this.treatyStore = new Framework.PageCache<Dtos.TreatySummaryDto, Dtos.GetListTreatiesQuery>(
            (query, page, pageSize) => new Apis.TreatyApi().search(query, page, pageSize),
            () => this.state.treatyList,
            (treatyList) => this.setState({ treatyList })
        );

        this.state = {
            pageMode: "search",
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            treaty: new Framework.Pending<Dtos.TreatyDto>(),
            audit: new Framework.Pending<{ id: number, items: Dtos.WhtRateAuditDto[] }>(),
            treatyTypes: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            treatyExceptionTypes: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            entityTypes: new Framework.Pending<Dtos.EntityTypeSummaryDto[]>(),
            stockTypes: new Framework.Pending<Dtos.StockTypeDto[]>(),
            outstandingEdits: new Framework.Pending<boolean>(),
            currentCountryId: props.currentTrmCountryId
        }
    }

    private initNewTreaty(): Dtos.TreatyDto {
        return {
            id: null,
            treatyType: null,
            treatyTypeName: null,
            reclaimMarket: null,
            countryOfResidence: null,
            standardDividendRate: null,
            standardDividendRateNarrative: null,
            standardInterestRate: null,
            standardInterestRateNarrative: null,
            signedDate: null,
            approvedDate: null,
            ratifiedDate: null,
            inForceDate: null,
            effectiveDate: null,
            exceptions: [],
            hasExceptions: false,
            isCurrentTreaty: false,
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
        var id = this.url.read().treatyId;

        if (currPath.indexOf(`/treaties/${urlString}/createNew`) !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf(`/treaties/${urlString}/details`) !== -1 && id) {
            this.goToDetails(id, null, true);
        }
        else if (currPath.indexOf(`/treaties/${urlString}/edit`) !== -1 && id) {
            this.goToEdit(id, null);
        }
        else if (currPath.indexOf(`/treaties/${urlString}/copy`) !== -1 && id) {
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
            this.url.push(Framework.UrlHelpers.buildUrl(['/treaties', urlString, 'details' + backUrl]))
            this.url.update({ treatyId: state.treatyId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/treaties', urlString, 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/treaties', urlString, 'edit']))
            this.url.update({ treatyId: state.treatyId })
        }
        else {
            this.url.push(Framework.UrlHelpers.buildUrl(['/treaties', urlString]));
        }
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetListTreatiesQuery_TreatiesSortField>) {
        this.treatyStore.setCurrent({ sort: options.sort, uiFilters: options.filters, showLiveRecords: this.props.showLiveRecords }, options.page, options.pageSize, false);
    }

    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private EnsureTreatyTypes() {
        if (this.state.treatyTypes.state === Framework.LoadingStatus.Preload || this.state.treatyTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().treatyType(), this.state.treatyTypes, treatyTypes => this.setState({ treatyTypes }));
        }
    }

    private EnsureTreatyExceptionTypes() {
        if (this.state.treatyExceptionTypes.state === Framework.LoadingStatus.Preload || this.state.treatyExceptionTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().treatyExceptionType(), this.state.treatyExceptionTypes, treatyExceptionTypes => this.setState({ treatyExceptionTypes }));
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
                checkTreaty: true,
                checkWht: false,
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

    private updateEditor(dto: Dtos.TreatyDto) {
        this.setState({
            edited: new Framework.Pending(Framework.LoadingStatus.Done, dto),
            validation: new TreatyDtoValidator(dto, this.state.validation.showValidationErrors())
        });
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        } else {
            this.goToSearch(null);
            this.treatyStore.refresh();
        }
    }

    private goToSearch(message: string) {
        this.EnsureCountries();
        this.EnsureTreatyTypes();
        this.EnsureTreatyExceptionTypes();
        this.ensureStatusOptions();
        this.ensureHasUnapprovedItems();

        this.setPageState({
            pageMode: 'search',
            treatyId: null,
            treaty: new Framework.Pending<Dtos.TreatyDto>(),
            edited: null,
            message: message,
            error: null
        });
    }

    private goToCopy(id: number) {

        this.EnsureCountries();
        this.EnsureTreatyTypes();
        this.EnsureTreatyExceptionTypes();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();

        let copy = {} as Dtos.TreatyDto;

        Framework.connect(new Apis.TreatyApi().getById(id), null, (treaty) => {

            if (treaty.isDone()) {
                copy = Framework.safeClone(treaty).data;
                copy.id = null;
                copy.currentAwaitingVerificationVersionId = null;
                copy.effectiveDate = null;
                copy.status = Dtos.TrmEntityStatus.Draft;
                copy.statusName = "Draft";
                copy.isCurrentTreaty = false;

                this.setPageState({
                    pageMode: 'createNew',
                    treatyId: null,
                    treaty: new Framework.Pending<Dtos.TreatyDto>(),
                    edited: new Framework.Pending(Framework.LoadingStatus.Done, copy),
                    validation: new TreatyDtoValidator(copy, false),
                    message: null,
                    error: null,
                    createReciprocalTreaty: true,
                    copyingFrom: id
                });
            }
            else {
                this.setState({ treaty })
            }
        });
    }

    private goToCreate() {
        let newDto = this.initNewTreaty();

        this.EnsureCountries();
        this.EnsureTreatyTypes();
        this.EnsureTreatyExceptionTypes();
        this.EnsureEntityTypes();
        this.EnsureStockTypes();

        this.setPageState({
            pageMode: 'createNew',
            treatyId: null,
            treaty: new Framework.Pending<Dtos.TreatyDto>(),
            edited: new Framework.Pending(Framework.LoadingStatus.Done, this.initNewTreaty()),
            validation: new TreatyDtoValidator(newDto, false),
            message: null,
            error: null,
            createReciprocalTreaty: true,
            copyingFrom: null
        });
    }

    private EnsureTreatyAudit(id: number) {
        Framework.connect(new Apis.TreatyApi().getAuditById(id).then(x => { return { id: id, items: x }; }), this.state.audit, (audit) => {
            if (this.state.treatyId === id) {
                this.setState({ audit });
            }
        });
    }

    private goToDetails(id: number, message: string, reload: boolean) {
        this.EnsureCountries();
        this.EnsureTreatyTypes();
        this.EnsureTreatyExceptionTypes();
        this.EnsureTreatyAudit(id);
        this.EnsureTreaty(id, reload);

        this.setPageState({
            pageMode: 'details',
            message: message,
            treatyId: id,
            validation: null,
            error: null
        });
    }

    private goToEdit(id: number, message: string) {
        this.EnsureCountries();
        this.EnsureTreatyTypes();
        this.EnsureEntityTypes();
        this.EnsureTreatyExceptionTypes();
        this.EnsureStockTypes();
        this.EnsureTreaty(id);

        let edited = Framework.safeClone(this.state.treaty);

        this.setPageState({
            pageMode: 'edit',
            message: message,
            treatyId: id,
            edited,
            validation: new TreatyDtoValidator(edited.data || this.initNewTreaty(), false),
            error: null,
            createReciprocalTreaty: false
        });
    }

    private EnsureTreaty(id: number, reload?: boolean) {
        let preload = new Framework.Pending<Dtos.TreatyDto>();

        if (!reload && this.state.treaty && this.state.treaty.data && this.state.treaty.data.id == id) {
            preload = this.state.treaty;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.TreatyApi().getById(id), preload, (treaty) => {
                if (this.state.treatyId === id) {
                    if (treaty.isDone() && (this.state.pageMode === 'edit' || this.state.pageMode === 'details')) {
                        let edited = Framework.safeClone(treaty);
                        let validation = new TreatyDtoValidator(edited.data, false);
                        this.setState({ edited, treaty, validation });
                    }
                    else {
                        this.setState({ treaty })
                    }
                }
            });
        }
    }

    private editPublished() {
        let newDto = this.state.edited.data;

        let validation = new TreatyDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TreatyApi().editPublishedRecord(newDto, this.state.treatyId), null, treaty => {
                if (treaty.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: treaty.error });
                }
                else if (treaty.state === Framework.LoadingStatus.Done) {
                    this.goToDetails(this.state.treatyId, "Changes were sent for verification", true);
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

    private create(status?: Dtos.TrmEntityStatus, message?: string) {
        let newDto = this.state.edited.data;

        if (status) {
            newDto.status = status;
        }

        let validation = new TreatyDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TreatyApi().create(newDto), null, treaty => {
                if (treaty.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: treaty.error });
                }
                else if (treaty.state === Framework.LoadingStatus.Done) {
                    if (this.state.createReciprocalTreaty) {
                        let reciprocalTreaty = Framework.safeClone(newDto);

                        let reciprocalReclaimMarket = Framework.safeClone(newDto.countryOfResidence);
                        let reciprocalCountryOfResidence = Framework.safeClone(newDto.reclaimMarket);

                        reciprocalTreaty.reclaimMarket = reciprocalReclaimMarket;
                        reciprocalTreaty.countryOfResidence = reciprocalCountryOfResidence;

                        Framework.connect(new Apis.TreatyApi().create(reciprocalTreaty), null, y => {
                            if (y.state === Framework.LoadingStatus.Done) {
                                this.treatyStore.refresh();
                                this.goToDetails(treaty.data.id, "Treaty and associated reciprocal treaty successfully created", true);
                            }
                            else if (y.state === Framework.LoadingStatus.Failed) {
                                this.treatyStore.refresh();
                                this.goToDetails(treaty.data.id, "Treaty was created successfully, but associated reciprocal treaty could not be created as one already exists", true);
                            }
                            else {
                                this.setState({ validation: validation });
                            }
                        });
                    }
                    else {
                        this.treatyStore.refresh();
                        this.goToDetails(treaty.data.id, message || "Treaty was successfully created", true);
                    }
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
        Framework.connect(new Apis.TreatyApi().approve(this.state.edited.data.id), null, treaty => {
            if (treaty.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: treaty.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Treaty approved successfully", true);
            }
        });
    }

    private reject() {
        Framework.connect(new Apis.TreatyApi().reject(this.state.edited.data.id), null, treaty => {
            if (treaty.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: treaty.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Treaty rejected successfully", true);
            }
        });
    }

    private update(status: Dtos.TrmEntityStatus, message: string) {
        let newDto = this.state.edited.data;
        newDto.status = status;

        let validation = new TreatyDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.TreatyApi().update(newDto.id, newDto), null, treaty => {

                if (treaty.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: treaty.error });
                }
                else if (treaty.state === Framework.LoadingStatus.Done) {
                    this.treatyStore.refresh();
                    this.setState({ treaty });
                    this.goToDetails(treaty.data.id, message, true);
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

    private deleteTreaty(id: number) {
        Framework.connect(new Apis.TreatyApi().deleteTreaty(id), null, x => {
            if (x.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: x.error, pageMode: 'search' });
            }
            else if (x.state === Framework.LoadingStatus.Done) {
                this.treatyStore.refresh();
                this.goToSearch("Treaty was successfully deleted");
            }
        });
    }

    private toggleReciprocalCreation(value: boolean) {
        this.setState({ createReciprocalTreaty: value });
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    treaty={this.state.edited}
                    onCancel={this.state.copyingFrom != null ? () => window.location.href = `/treaties/live/details#{"treatyId":${this.state.copyingFrom}}` : () => this.goToSearch(null)}
                    onSave={() => this.create(Dtos.TrmEntityStatus.Draft)}
                    onPublishDraft={() => this.create(Dtos.TrmEntityStatus.AwaitingVerification, "Treaty has been sent for verification")}
                    onReciprocalChanged={(r) => this.toggleReciprocalCreation(r)}
                    countries={this.state.countries}
                    treatyTypes={this.state.treatyTypes}
                    treatyExceptionTypes={this.state.treatyExceptionTypes}
                    entityTypes={this.state.entityTypes}
                    stockTypes={this.state.stockTypes}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    createReciprocal={this.state.createReciprocalTreaty}
                    showLiveRecords={this.props.showLiveRecords}
                    currentCountryId={this.state.currentCountryId}
                   
                />;
            case 'details':
                return <Details
                    onDelete={(id) => this.deleteTreaty(id)}
                    treaty={this.state.treaty}
                    treatyAudit={this.state.audit.map(x => x.items)}
                    onEdit={() => this.goToEdit(this.state.treatyId, null)}
                    onBack={() => { this.handleBack(); }}
                    onApprove={() => this.approve()}
                    onReject={() => this.reject()}
                    countries={this.state.countries}
                    treatyTypes={this.state.treatyTypes}
                    currentUserId={this.props.currentUserId}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onCopy={(id) => window.location.href = `/treaties/draft/copy#{"treatyId":${id}}`}
                   
                />;
            case 'edit':
                return <Edit
                    treaty={this.state.edited}
                    onCancel={() => this.goToDetails(this.state.treatyId, null, true)}
                    onReciprocalChanged={(r) => this.toggleReciprocalCreation(r)}
                    onSave={() => this.update(Dtos.TrmEntityStatus.Draft, "Treaty was successfully updated")}
                    onPublishDraft={() => this.update(Dtos.TrmEntityStatus.AwaitingVerification, "Treaty has been sent for verification")}
                    onEditPublished={() => this.editPublished()}
                    countries={this.state.countries}
                    treatyTypes={this.state.treatyTypes}
                    treatyExceptionTypes={this.state.treatyExceptionTypes}
                    entityTypes={this.state.entityTypes}
                    stockTypes={this.state.stockTypes}
                    onChange={(dto) => this.updateEditor(dto)}
                    validation={this.state.validation}
                    createReciprocal={this.state.createReciprocalTreaty}
                    showLiveRecords={this.props.showLiveRecords}
                   
                />;
            default:
                return <Search
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    treaties={this.treatyStore.getCurrentData()}
                    onTreatySelected={(treaty) => this.goToDetails(treaty.id, null, false)}
                    countries={this.state.countries}
                    treatyTypes={this.state.treatyTypes}
                    onGtrsExport={(exp) => this.exportReport(exp)}
                    onClientMatrixExport={() => this.exportClientMatrix()}
                    statusOptions={this.state.statusOptions}
                    showLiveRecords={this.props.showLiveRecords}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                   
                />;
        }
    }

    private renderError() {
        return <Error error={this.state.error} qa="TreatiesError"/>
    }

    private renderLink() {
        if (!this.state.treaty.data || this.props.isTrmReadOnlyUser || (!this.state.treaty.data.currentAwaitingVerificationVersionId && !this.state.treaty.data.currentPublishedVersionId)) return null;

        let published = !!this.state.treaty.data.currentAwaitingVerificationVersionId;

        var message = published ? "There are changes to this record that are awaiting verification. Further changes cannot be made until pending changes have been approved or rejected" : "This is an edit of an already published record";
        var linkText = published ? " view the record awaiting verification" : " view the original record";
        var itemId = this.state.treaty.data.currentPublishedVersionId || this.state.treaty.data.currentAwaitingVerificationVersionId;

        return (<div className="flash-message alert alert-info">
            {message} - <a className="alert-link" href="#" onClick={() => this.goToDetails(itemId, "", true)} data-qa="AwaitingVerificationLink">{linkText}</a>.
        </div>);
    }

    private renderWarningLink() {
        if (!this.props.showLiveRecords || this.state.pageMode != 'search' || this.props.isTrmReadOnlyUser) return null;

        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {

            if (!hasEdits) return null;

            return (
                <div className="flash-message alert alert-info">There are records in Draft or Pending Verification that are not viewable here - <a className="alert-link" href='draft' data-qa="ViewTheseRecordsLink">view these records</a>.</div>
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
                return "Create Treaty"
            case "details":
                if (!this.state.treaty.data) return "View Treaty";

                switch (this.state.treaty.data.status) {
                    case Dtos.TrmEntityStatus.Draft: return "View Draft Treaty";
                    case Dtos.TrmEntityStatus.AwaitingVerification: return "Verify Treaty";
                    case Dtos.TrmEntityStatus.Published: return "View Treaty";
                }
            case "edit":
                return (this.state.treaty.data && this.state.treaty.data.statusName) == "Draft" ? "Edit Draft Treaty" : "Edit Treaty";
            default:
                return this.props.showLiveRecords ? "Treaties" : "Draft Treaties"
        }
    }

    render() {
        return (
            <div>
                <TrmCountrySelection
                    onCountryChanged={(ctry) => { this.setState({ currentCountryId: ctry.id, outstandingEdits: new Framework.Pending<boolean>(Framework.LoadingStatus.Preload) }); this.treatyStore.refresh(); this.goToSearch("Country was changed successfully"); }}
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

    private exportReportPopup: Framework.PopupBuilder;
    private exportReport(expFormat: boolean) {
        this.exportReportPopup = new Framework.PopupBuilder()
            .setTitle(`GTRS ${expFormat ? 'Exp' : ''} Export`)
            .withQA( "GtrsPopup")
            .setContent(<GtrsExportPopup isBinarisedExport={expFormat}onClose={() => {
                this.exportReportPopup.close();
                this.exportReportPopup = null;
            } } />);
        this.exportReportPopup.render();
    }

    private exportClientMatrixPopup: Framework.PopupBuilder;
    private exportClientMatrix() {
        this.exportClientMatrixPopup = new Framework.PopupBuilder()
            .setContent(<RequestClientMatrix onClose={() => {
                this.exportClientMatrixPopup.close();
                this.exportClientMatrixPopup = null;
            }}
               
            />);
        this.exportClientMatrixPopup.setTitle("Request Client Matrix");
        this.exportClientMatrixPopup.render();
    }
}