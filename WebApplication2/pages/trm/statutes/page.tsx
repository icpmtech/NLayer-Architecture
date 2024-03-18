import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { Edit } from './edit';
import { Details } from './details';
import { List } from './list';
import * as Framework from "../../../classes";
import { Message, Error } from '../../../components';
import { StatuteDtoValidator } from '../../../validators/statuteDtoValidator';
import { StatutesExportPopup } from './statutesExportPopup';
import { TrmCountrySelection } from '../trmCountrySelection';

interface PageProps {
    backUrl: string;
    currentUserId: number;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
    currentTrmCountryId?: number;
};

interface PageState {
    pageMode?: 'details' | 'list' | 'edit' | 'createNew'
    statuteList?: Framework.PagedDataState<Dtos.StatuteSummaryDto, Dtos.GetListStatutesQuery>;
    statuteId?: number;
    statute?: Framework.Pending<Dtos.StatuteDto>;
    edited?: Framework.Pending<Dtos.StatuteDto>;
    validator?: StatuteDtoValidator;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    qualifierTypes?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    audit?: Framework.Pending<{ id: number, items: Dtos.StatuteAuditDto[] }>;
    error?: Framework.AppError;
    message?: string;
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    outstandingEdits?: Framework.Pending<boolean>;
    copyingFrom?: number;
    currentCountryId?: number;
};

interface UrlProps {
    statuteId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private statuteStore: Framework.PageCache<Dtos.StatuteSummaryDto, Dtos.GetListStatutesQuery>;
    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();
    constructor(props: PageProps) {
        super(props);

        this.statuteStore = new Framework.PageCache<Dtos.StatuteSummaryDto, Dtos.GetListStatutesQuery>(
            (query, page, pageSize) => new Apis.StatutesApi().search(query, page, pageSize),
            () => this.state.statuteList,
            (statuteList) => this.setState({ statuteList })
        );

        this.state = {
            pageMode: 'list',
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            qualifierTypes: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            statusOptions: new Framework.Pending<Dtos.EnumDisplayDto[]>(),
            audit: new Framework.Pending<{ id: number, items: Dtos.StatuteAuditDto[] }>(),
            statute: new Framework.Pending<Dtos.StatuteDto>(Framework.LoadingStatus.Preload),
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
        var rateId = this.url.read().statuteId;

        if (currPath.indexOf(`/statutes/${urlString}/details`) !== -1 && rateId) {
            this.goToDetails(rateId, null);
        }
        else if (currPath.indexOf(`/statutes/${urlString}/edit`) !== -1 && rateId) {
            this.goToEdit(rateId);
        }
        else if (currPath.indexOf(`/statutes/${urlString}/create`) !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf(`/statutes/${urlString}/copy`) !== -1 && rateId) {
            this.goToCopy(rateId);
        }
        else {
            this.goToSearch(null);
        }
    }

    private setPageState(state: PageState) {
        let urlString = this.props.showLiveRecords ? 'live' : 'draft';
        this.setState(state);

        let backUrl = this.props.backUrl ? `?backUrl=${encodeURI(this.props.backUrl)}` : "";

        if (state.pageMode === "details") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/statutes', urlString, 'details' + backUrl]))
            this.url.update({ statuteId: state.statuteId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/statutes', urlString, 'create']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(Framework.UrlHelpers.buildUrl(['/statutes', urlString, 'edit']))
            this.url.update({ statuteId: state.statuteId })
        }
        else {
            this.url.push(Framework.UrlHelpers.buildUrl(['/statutes', urlString]));
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case 'createNew':
                return "Create New Statute";
            case "details":
                if (!this.state.statute.data) return "View Statute";

                switch (this.state.statute.data.status) {
                    case Dtos.TrmEntityStatus.Draft: return "View Draft Statute";
                    case Dtos.TrmEntityStatus.AwaitingVerification: return "Verify Statute";
                    case Dtos.TrmEntityStatus.Published: return "View Statute";
                }
            case "edit":
                return (this.state.statute.data && this.state.statute.data.statusName) == "Draft" ? "Edit Draft Statute" : "Edit Statute";
            default:
                return this.props.showLiveRecords ? "Statutes" : "Draft Statutes";
        }
    }

    private handleBack = () => {
        if (this.props.backUrl) {
            window.location.href = this.props.backUrl;
        } else {
            this.goToSearch(null);
            this.statuteStore.refresh();
        }
    }

    private goToSearch(message: string) {
        this.EnsureStatusOptions();
        this.EnsureQualifierTypes();
        this.ensureHasUnapprovedItems();

        this.setPageState({
            pageMode: 'list',
            error: null,
            message
        });
    }

    private initNewRate(): Dtos.StatuteDto {
        return {
            exceptions: [],
            id: 0,
            effectiveDate: null,
            reclaimMarket: null,
            qualifierType: null,
            qualifierTypeName: null,
            statuteOfLimitationsMonths: null,
            statuteOfLimitationsDays: null,
            qualifierMonth: null,
            qualifierDay: null,
            hasExceptions: false,
            isCurrentStatute: false,
            status: Dtos.TrmEntityStatus.Draft,
            statusName: "Draft",
            currentPublishedVersionId: null,
            currentAwaitingVerificationVersionId: null
        }
    }

    private goToCopy(id: number) {

        this.EnsureCountries();
        this.EnsureQualifierTypes();
        this.EnsureStatusOptions();

        let copy = {} as Dtos.StatuteDto;

        Framework.connect(new Apis.StatutesApi().getById(id), null, (statute) => {

            if (statute.isDone()) {
                copy = Framework.safeClone(statute).data;
                copy.id = null;
                copy.currentAwaitingVerificationVersionId = null;
                copy.effectiveDate = null;
                copy.status = Dtos.TrmEntityStatus.Draft;
                copy.statusName = "Draft";
                copy.isCurrentStatute = false;

                this.setPageState({
                    pageMode: 'createNew',
                    statuteId: null,
                    statute: new Framework.Pending<Dtos.StatuteDto>(),
                    edited: new Framework.Pending(Framework.LoadingStatus.Done, copy),
                    validator: new StatuteDtoValidator(copy, false),
                    message: null,
                    error: null,
                    copyingFrom: id
                });
            }
            else {
                this.setState({ statute })
            }
        });
    }

    private goToCreate() {
        this.EnsureCountries();
        this.EnsureQualifierTypes();
        this.EnsureStatusOptions();

        let edited = new Framework.Pending<Dtos.StatuteDto>(Framework.LoadingStatus.Done, this.initNewRate());
        let validator = new StatuteDtoValidator(edited.data, false);

        this.setPageState({
            pageMode: 'createNew',
            statuteId: null,
            statute: new Framework.Pending<Dtos.StatuteDto>(),
            edited,
            validator,
            error: null,
            copyingFrom: null
        });
    }

    private goToEdit(id: number) {
        this.EnsureCountries();
        this.EnsureQualifierTypes();
        this.EnsureStatute(id);

        let edited = Framework.safeClone(this.state.statute);

        this.setPageState({
            pageMode: 'edit',
            statuteId: id,
            edited,
            validator: new StatuteDtoValidator(edited.data || this.initNewRate(), false),
            message: null
        });
    }

    private goToDetails(id: number, message: string, reload?: boolean) {
        this.setState({ statuteId: id })
        this.EnsureStatute(id, reload);
        this.EnsureStatuteAudit(id);

        this.setPageState({
            pageMode: 'details',
            statuteId: id,
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

    private EnsureStatute(id: number, reload?: boolean) {
        let preload = new Framework.Pending<Dtos.StatuteDto>();

        if (!reload && this.state.statute && this.state.statute.data && this.state.statute.data.id == id) {
            preload = this.state.statute;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.StatutesApi().getById(id), preload, (statute) => {
                if (this.state.statuteId === id) {
                    if (statute.isDone() && (this.state.pageMode === 'edit' || this.state.pageMode === 'details')) {
                        let edited = Framework.safeClone(statute);
                        let validator = new StatuteDtoValidator(edited.data, false);
                        this.setState({ edited, statute, validator });
                    }
                    else {
                        this.setState({ statute })
                    }
                }
            });
        }
    }

    private EnsureStatuteAudit(id: number) {
        Framework.connect(new Apis.StatutesApi().getAuditById(id).then(x => { return { id: id, items: x }; }), this.state.audit, (audit) => {
            if (this.state.statuteId === id) {
                this.setState({ audit });
            }
        });
    }

    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private EnsureQualifierTypes() {
        if (this.state.qualifierTypes.state === Framework.LoadingStatus.Preload || this.state.qualifierTypes.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().statuteQualifierType(), this.state.qualifierTypes, qualifierTypes => this.setState({ qualifierTypes }));
        }
    }

    private ensureHasUnapprovedItems(){
        if (this.props.isTrmReadOnlyUser) {
            this.setState({ outstandingEdits: new Framework.Pending(Framework.LoadingStatus.Done, false, null) });
            return;
        }
        if (this.state.outstandingEdits.state == Framework.LoadingStatus.Preload || this.state.outstandingEdits.state == Framework.LoadingStatus.Stale) {
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

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetListStatutesQuery_StatutesSortField>) {
        this.statuteStore.setCurrent({ showLiveRecords: this.props.showLiveRecords, sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private updateEditor(dto: Dtos.StatuteDto) {
        this.setState({ edited: new Framework.Pending<Dtos.StatuteDto>(Framework.LoadingStatus.Done, dto) });
    }

    private create(status?: Dtos.TrmEntityStatus, message?: string) {
        if (status) {
            this.state.edited.data.status = status;
        }

        let edited = this.state.edited;

        if (this.state.edited.data.qualifierType === Dtos.StatuteQualifierType.FromPayDate) {
            this.state.edited.data.qualifierMonth = null;
            this.state.edited.data.qualifierDay = null;
        }

        let validator = new StatuteDtoValidator(edited.data, true);

        if (validator.isValid()) {
            Framework.connect(new Apis.StatutesApi().create(edited.data), null, x => {
                if (x.state === Framework.LoadingStatus.Failed) {
                    this.setState({ error: x.error });
                }
                else if (x.state === Framework.LoadingStatus.Done) {
                    this.statuteStore.refresh();
                    this.goToDetails(x.data.id, message || 'Statute was successfully created');
                }
            });
        }
        else {
            this.setState({ validator });
        }
    }

    private approve() {
        Framework.connect(new Apis.StatutesApi().approve(this.state.edited.data.id), null, news => {
            if (news.state === Framework.LoadingStatus.Failed) {
                //Set it to done as will redisplay grid
                this.setState({ error: news.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Statute was successfully approved", true);
            }
        });
    }

    private reject() {
        Framework.connect(new Apis.StatutesApi().reject(this.state.edited.data.id), null, news => {
            if (news.state === Framework.LoadingStatus.Failed) {
                //Set it to done as will redisplay grid
                this.setState({ error: news.error });
            } else {
                this.goToDetails(this.state.edited.data.currentPublishedVersionId || this.state.edited.data.id, "Statute was successfully rejected", true);
            }
        });
    }

    private update(status: Dtos.TrmEntityStatus, message?: string) {
        this.state.edited.data.status = status;

        if (this.state.edited.data.qualifierType === Dtos.StatuteQualifierType.FromPayDate) {
            this.state.edited.data.qualifierMonth = null;
            this.state.edited.data.qualifierDay = null;
        }

        let validator = new StatuteDtoValidator(this.state.edited.data, true);

        if (validator.isValid()) {
            Framework.connect(new Apis.StatutesApi().update(this.state.statuteId, this.state.edited.data), null, statute => {
                if (statute.isDone()) {
                    this.statuteStore.refresh();
                    this.setState({ statute })
                    this.goToDetails(statute.data.id, message || "Statute was successfully updated.");
                }
                else if (statute.isFailed()) {
                    this.setState({ error: statute.error, validator: validator });
                }
            })
        }
        else {
            this.setState({ validator });
        }
    }

    private editPublished() {

        if (this.state.edited.data.qualifierType === Dtos.StatuteQualifierType.FromPayDate) {
            this.state.edited.data.qualifierMonth = null;
            this.state.edited.data.qualifierDay = null;
        }

        let newDto = this.state.edited.data;

        let validation = new StatuteDtoValidator(newDto, true);

        if (validation.isValid()) {
            Framework.connect(new Apis.StatutesApi().editPublishedRecord(newDto, this.state.statuteId), null, statute => {
                if (statute.state === Framework.LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validator: validation, error: statute.error });
                }
                else if (statute.state === Framework.LoadingStatus.Done) {
                    this.goToDetails(this.state.statuteId, "Changes were sent for verification", true);
                }
                else {
                    this.setState({ validator: validation });
                }
            })
        }
        else {
            this.setState({ validator: validation });
        }
    }

    private deleteStatute(id: number) {
        Framework.connect(new Apis.StatutesApi().deleteStatute(id), null, x => {
            if (x.state === Framework.LoadingStatus.Failed) {
                this.setState({ error: x.error, pageMode: 'list' });
            }
            else if (x.state === Framework.LoadingStatus.Done) {
                this.statuteStore.refresh();
                this.goToSearch("Statute was successfully deleted");
            }
            else {
                this.setState({ statute: new Framework.Pending(x.state, this.state.statute.data) });
            }
        });
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    onCancel={this.state.copyingFrom != null ? () => window.location.href = `/statutes/live/details#{"statuteId":${this.state.copyingFrom}}` : (id) => this.goToSearch(null)}
                    onSave={() => this.create(Dtos.TrmEntityStatus.Draft)}
                    onPublish={() => this.create(Dtos.TrmEntityStatus.AwaitingVerification, "Statute has been sent for verification")}
                    countries={this.state.countries}
                    statute={this.state.edited}
                    onChange={(dto) => this.updateEditor(dto)}
                    validator={this.state.validator}
                    qualifierTypes={this.state.qualifierTypes}
                    currentCountryId={this.state.currentCountryId}
                   
                />;
            case 'edit':
                return <Edit
                    onCancel={(id) => this.goToDetails(id, null)}
                    onSave={() => this.update(Dtos.TrmEntityStatus.Draft)}
                    onPublish={() => this.update(Dtos.TrmEntityStatus.AwaitingVerification, "Statute has been sent for verification")}
                    countries={this.state.countries}
                    statute={this.state.edited}
                    onChange={(dto) => this.updateEditor(dto)}
                    validator={this.state.validator}
                    qualifierTypes={this.state.qualifierTypes}
                    onEditPublished={() => this.editPublished()}
                   
                />;
            case 'details':
                return <Details
                    onBack={() => this.handleBack()}
                    onApprove={() => this.approve() }
                    onReject={() => this.reject()}
                    currentUserId={this.props.currentUserId}
                    onEdit={() => this.goToEdit(this.state.statuteId)}
                    statute={this.state.statute}
                    audit={this.state.audit.map(x => x.items)}
                    onDelete={id => this.deleteStatute(id)}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                    onCopy={(id) => window.location.href = `/statutes/draft/copy#{"statuteId":${id}}`}
                   
                />;
            case 'list':
                return <List
                    onPageChanged={(options) => this.onGridChanged(options)}
                    statutes={this.statuteStore.getCurrentData()}
                    onStatuteSelect={(id) => this.goToDetails(id, null)}
                    onCreateSelected={() => this.goToCreate()}
                    statusOptions={this.state.statusOptions}
                    qualifierTypeOptions={this.state.qualifierTypes}
                    showLiveRecords={this.props.showLiveRecords}
                    onStatutesExport={() => this.exportReport()}
                    isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}
                   
                />;
        }
    }

    private exportReportPopup: Framework.PopupBuilder;
    private exportReport() {
        this.exportReportPopup = new Framework.PopupBuilder()
            .setTitle(`Statutes Export`)
            .withQA("StatutesExportPopup")
            .setContent(<StatutesExportPopup onClose={() => {
                this.exportReportPopup.close();
                this.exportReportPopup = null;
            }}
               
            />);
        this.exportReportPopup.render();
    }

    private renderLink() {
        if (!this.state.statute.data || (!this.state.statute.data.currentAwaitingVerificationVersionId && !this.state.statute.data.currentPublishedVersionId)) return null;

        let published = !!this.state.statute.data.currentAwaitingVerificationVersionId;

        var message = published ? "There are changes to this record that are awaiting verification. Further changes cannot be made until pending changes have been approved or rejected" : "This is an edit of an already published record";
        var linkText = published ? " view the record awaiting verification" : " view the original record";
        var itemId = this.state.statute.data.currentPublishedVersionId || this.state.statute.data.currentAwaitingVerificationVersionId;

        return (<div className="flash-message alert alert-info">
            {message} - <a className="alert-link" href="#" onClick={() => this.goToDetails(itemId, "", true)} data-qa="AlertLink">{linkText}</a>.
        </div>);
    }

    private renderWarningLink() {
        if (!this.props.showLiveRecords || this.state.pageMode != 'list' || this.props.isTrmReadOnlyUser) return null;

        return Framework.Loader.for(this.state.outstandingEdits, hasEdits => {

            if (!hasEdits) return null;

            return (
                <div className="flash-message alert alert-info">There are records in Draft or Pending Verification that are not viewable here - <a className="alert-link" href='draft' data-qa="AlertViewTheseRecords">view these records</a>.</div>
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
                    onCountryChanged={(ctry) => { this.setState({ currentCountryId: ctry.id, outstandingEdits: new Framework.Pending<boolean>(Framework.LoadingStatus.Preload) }); this.statuteStore.refresh(); this.goToSearch("Country was changed successfully"); }}
                    currentCountryId={this.state.currentCountryId}
                />
                <div>
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderMessage()}
                {this.renderWarningLink()}
                {this.renderLink()}
                {this.state.error ? <Error error={this.state.error} qa="StatutesError"/> : null}
                {this.renderView()}
            </div>
        );
    }
}
