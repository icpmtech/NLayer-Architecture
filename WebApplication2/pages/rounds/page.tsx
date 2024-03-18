import * as React from 'react';
import * as qs from 'qs';
import { Apis, Dtos } from '../../adr';
import { Pending, LoadingStatus, connect, AppError, UrlState, UrlHelpers, PopupBuilder, DialogBuilder } from '../../classes';
import { Error, Message } from '../../components';
import { List } from './list';
import { View } from './view';
import { Edit } from './edit';
import { CategoryView } from './categoryview';
import { CategoryEdit } from './categoryedit';
import { Trail } from './trail';

import { RoundDtoValidator } from '../../validators/roundDtoValidator';
import { RoundCategoryDtoValidator } from '../../validators/roundCategoryDtoValidator';

interface Props {
    eventId: number,
    canUserEdit: boolean,
    canAddCategory: boolean,
    canEditRound: boolean,
    canDeleteRound: boolean,
    canLockRound: boolean,
    canChangeEventRoundAvailability: boolean,
    canCreateRound: boolean,
}

interface UrlProps {
    roundId: number;
    categoryId?: number;
}

interface State {
    currentView?: 'list' | 'view' | 'create' | 'edit' | 'category-view' | 'category-edit' | 'category-create';

    filingMethods?: Pending<Dtos.FilingMethodDto[]>;
    paymentMethods?: Pending<Dtos.PaymentMethodDto[]>;

    countries?: Pending<Dtos.CountrySummaryDto[]>;
    entityTypes?: Pending<Dtos.EntityTypeSummaryDto[]>;
    documents?: Pending<Dtos.DocumentSummaryDto[]>;

    event?: Pending<Dtos.EventDto>;
    eventTypes?: Pending<Dtos.EnumDisplayDto[]>;

    rounds?: Pending<Dtos.RoundSummaryDto[]>;

    deletingReport?: boolean;

    roundId?: number;
    roundStore?: Map<number, Pending<Dtos.RoundDto>>;

    categoriesStore?: Map<number, Pending<Dtos.RoundCategorySummaryDto[]>>;

    categoryStore?: Map<number, Pending<Dtos.RoundCategoryDto>>;
    categoryPermissionStore?: Map<number, Pending<Dtos.RoundCategoryPermissionsDto>>;
    categoryId?: number;

    error?: AppError;
    message?: string;
}

export class Page extends React.Component<Props, State>
{
    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: 'list',
            event: new Pending<Dtos.EventDto>(),
            eventTypes: new Pending<Dtos.EnumDisplayDto[]>(),
            rounds: new Pending<Dtos.RoundDto[]>(),
            roundStore: new Map<number, Pending<Dtos.RoundDto>>(),
            categoriesStore: new Map<number, Pending<Dtos.RoundCategorySummaryDto[]>>(),
            categoryStore: new Map<number, Pending<Dtos.RoundCategoryDto>>(),
            categoryPermissionStore: new Map<number, Pending<Dtos.RoundCategoryPermissionsDto>>(),
            filingMethods: new Pending<Dtos.FilingMethodDto[]>(),
            paymentMethods: new Pending<Dtos.PaymentMethodDto[]>(),
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            entityTypes: new Pending<Dtos.EntityTypeSummaryDto[]>(),
            documents: new Pending<Dtos.DocumentSummaryDto[]>(),
            deletingReport: false
        };
    }

    componentDidMount = () => {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let url = new UrlState<UrlProps>();
        let currPath = url.getCurrentPath();
        let routeUrl = `/event/view/${this.props.eventId}`;
        var urlProps = url.read();

        if (currPath.indexOf(routeUrl + '/category/create') !== -1 && urlProps && urlProps.roundId) {
            this.goToCreateCategory(urlProps.roundId);
        }
        else if (currPath.indexOf(routeUrl + '/category/edit') !== -1 && urlProps && urlProps.roundId && urlProps.categoryId) {
            this.goToEditCategory(urlProps.roundId, urlProps.categoryId);
        }
        else if (currPath.indexOf(routeUrl + '/category/view') !== -1 && urlProps && urlProps.roundId && urlProps.categoryId) {
            this.goToViewCategory(urlProps.roundId, urlProps.categoryId);
        }
        else if (currPath.indexOf(routeUrl + '/view') !== -1 && urlProps && urlProps.roundId) {
            this.goToViewRound(urlProps.roundId);
        }
        else if (currPath.indexOf(routeUrl + '/edit') !== -1 && urlProps && urlProps.roundId) {
            this.goToEditRound(urlProps.roundId);
        }
        else if (currPath.indexOf(routeUrl + '/create') !== -1) {
            this.goToCreateRound();
        }
        else {
            this.goToListRounds();
        }
    }

    private setPageState = (state: State): void => {
        this.setState(state);
        let url = new UrlState<UrlProps>();
        let routeUrl = `/event/view/${this.props.eventId}`;

        let query = qs.parse(url.getCurrentQuery());
        if (state.currentView === "view") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'view'], query))
            url.update({ roundId: state.roundId })
        }
        else if (state.currentView === "create") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'create'], query))
        }
        else if (state.currentView === "edit") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'edit'], query))
            url.update({ roundId: state.roundId })
        }
        else if (state.currentView === "category-view") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'category', 'view'], query))
            url.update({ roundId: state.roundId, categoryId: state.categoryId })
        }
        else if (state.currentView === "category-edit") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'category', 'edit'], query))
            url.update({ roundId: state.roundId, categoryId: state.categoryId })
        }
        else if (state.currentView === "category-create") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'category', 'create'], query))
            url.update({ roundId: state.roundId })
        }
        else {
            url.push(UrlHelpers.buildUrl([routeUrl], query));
        }
    }

    componentWillMount() {
        connect(new Apis.EventsApi().getById(this.props.eventId), this.state.event, (event) => {
            this.setState({ event }, () => {
                //if the current view needs documents we will now be able to load them
                //the ensure documents uses the state.event so needs to be called after the setstate has completed
                if (event.isDone()) {
                    switch (this.state.currentView) {
                        case 'category-view':
                        case 'category-edit':
                        case 'category-create':
                            this.ensureDocuments();
                            break;
                    }
                }
            });
        });
    }


    render() {
        return (
            <div>
                <Trail event={this.state.event} round={this.state.roundStore.get(this.state.roundId)} category={this.state.categoryStore.get(this.state.categoryId)} currentPage={this.getPageTitle()}/>
                {this.renderMessage()}
                <Error error={this.state.error} qa="RoundsError"/>
                {this.renderContent()}
            </div>
        );
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private getPageTitle() {
        switch (this.state.currentView) {
            case "list":
                return "Rounds";
            case "edit":
                return "Edit Round";
            case "create":
                return "Create Round";
            case "category-edit":
                return "Edit Category";
            case "category-create":
                return "Create Category";
        }
        return null;
    }

    private renderContent() {
        switch (this.state.currentView) {
            case "list":
                return <List
                    roundTypes={this.state.eventTypes}
                    rounds={this.state.rounds}
                    selectRound={(id) => this.goToViewRound(id)}
                    onAddNew={() => this.goToCreateRound()}
                    canAddRound={this.props.canEditRound}
                    />
            case "view":
                return <View
                    round={this.state.roundStore.get(this.state.roundId)}
                    event={this.state.event}
                    eventTypes={this.state.eventTypes}
                    categories={this.state.categoriesStore.get(this.state.roundId)}
                    onBackToList={() => this.goToListRounds()}
                    onEdit={(id) => this.goToEditRound(id)}
                    onViewCategory={(id) => this.goToViewCategory(this.state.roundId, id)}
                    onAddCategory={() => this.goToCreateCategory(this.state.roundId)}
                    onToggleAvailable={() => this.sendUpdateRound(this.state.roundId, (dto) => dto.isAvailiable = !dto.isAvailiable, (dto) => dto.isAvailiable ? "Round is now available" : "Round is now unavailable")}
                    onToggleLocked={() => this.sendUpdateRound(this.state.roundId, (dto) => dto.isLocked = !dto.isLocked, dto => dto.isLocked ? "Round is now locked" : "Round is now unavailable")}
                    canEdit={this.props.canEditRound}
                    canToggleAvailable={this.props.canChangeEventRoundAvailability}
                    canToggleLocked={this.props.canLockRound}
                    canDelete={this.props.canDeleteRound}
                    onDelete={() => this.onDeleteRound()}
                       />
            case "edit":
            case "create":
                return <Edit
                    roundTypes={this.state.eventTypes}
                    eventId={this.props.eventId}
                    event={this.state.event}
                    round={this.state.roundId ? this.state.roundStore.get(this.state.roundId) : new Pending<Dtos.RoundDto>(LoadingStatus.Done)}
                    filingMethods={this.state.filingMethods}
                    paymentMethods={this.state.paymentMethods}
                    onCancel={() => this.cancelRoundEdit()}
                    onSave={(dto) => this.saveRound(dto)}
                />
            case "category-view":
                return <CategoryView
                    event={this.state.event}
                    category={this.state.categoryStore.get(this.state.categoryId)}
                    onBackToRound={() => this.goToViewRound(this.state.roundId)}
                    onEdit={() => this.goToEditCategory(this.state.roundId, this.state.categoryId)}
                    onDelete={() => this.onDeleteCategory()}
                    categoryPermissions={this.state.categoryPermissionStore.get(this.state.categoryId)}
                    categoryTypes={this.state.eventTypes}
                    />
            case "category-edit":
            case "category-create":
                return <CategoryEdit
                    roundId={this.state.roundId}
                    category={this.state.categoryId ? this.state.categoryStore.get(this.state.categoryId) : new Pending<Dtos.RoundCategoryDto>(LoadingStatus.Done)}
                    categoryPermissions={this.state.categoryId ? this.state.categoryPermissionStore.get(this.state.categoryId) : new Pending<Dtos.RoundCategoryPermissionsDto>(LoadingStatus.Done, { canDeleteCategory: false, canEditCategory: true, canEditCategoryRules: true, canEditCategoryRates: true })}
                    existingCategories={this.state.categoriesStore.get(this.state.roundId)}
                    countries={this.state.countries}
                    documents={this.state.documents}
                    entityTypes={this.state.entityTypes}
                    onCancel={() => this.cancelCategoryEdit()}
                    onSave={(dto) => this.saveCategory(dto)}
                    beforeRuleChange={(dto) => this.beforeRuleChange(dto)}
                    categoryTypes={this.state.eventTypes}
                    roundTypeActual={this.state.roundStore.get(this.state.roundId).data && this.state.roundStore.get(this.state.roundId).data.roundType}
                    />
            default:
                return <noscript/>;
        }
    }

    private ensureRounds() {
        let current = this.state.rounds;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.RoundApi().search(this.props.eventId), current, (rounds) => this.setState({ rounds }));
        }
    }

    private ensureRound(id: number, eventId: number) {
        let current = this.state.roundStore.get(id);
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.RoundApi().get(id), current, (round) => {
                var store = this.state.roundStore;
                if (round.isDone() && round.data.eventId !== eventId) {
                    store.set(id,
                        new Pending<Dtos.RoundDto>(LoadingStatus.Failed,
                            round.data,
                            {
                                userMessage: "This round is not a child of the current event",
                                clientError: null,
                                serverError: null
                            }));
                    this.goToListRounds();
                } else {
                    store.set(id, round);
                }
                this.setState({ roundStore: store });
            });
        }
    }

    private ensureCategories(roundId: number) {
        let current = this.state.categoriesStore.get(roundId);
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.RoundCategoriesApi().search(roundId), current, (categories) => {
                var store = this.state.categoriesStore;
                store.set(roundId, categories);
                this.setState({ categoriesStore: store });
            });
        }
    }

    private ensureCategory(categoryId: number, roundId: number) {
        let category = this.state.categoryStore.get(categoryId);
        if (!category || category.state === LoadingStatus.Preload || category.state === LoadingStatus.Stale || (category.state === LoadingStatus.Failed && category.data)) {
            connect(new Apis.RoundCategoriesApi().get(categoryId), category, (r) => {
                var store = this.state.categoryStore;
                if (r.isDone() && r.data.eventRoundId !== roundId) {
                    store.set(categoryId,
                        new Pending<Dtos.RoundCategoryDto>(LoadingStatus.Failed,
                            r.data,
                            {
                                userMessage: "This category is not a child of the current event round",
                                clientError: null,
                                serverError: null
                            }));
                    this.goToViewRound(roundId);
                } else {
                    store.set(categoryId, r);
                }
                this.setState({ categoryStore: store });
            });
        }
    }

    private ensureCategoryPermission(categoryId: number) {
        let permissions = this.state.categoryPermissionStore.get(categoryId);
        if (!permissions || permissions.state === LoadingStatus.Preload || permissions.state === LoadingStatus.Stale) {
            connect(new Apis.RoundCategoriesApi().permissions(categoryId), permissions, (r) => {
                var store = this.state.categoryPermissionStore;
                store.set(categoryId, r);
                this.setState({ categoryPermissionStore: store });
            });
        }
    }

    private ensureFilingMethods() {
        let current = this.state.filingMethods;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.FilingMethodsApi().getAll(), current, (filingMethods) => this.setState({ filingMethods }));
        }
    }

    private ensureEventTypes() {
        let current = this.state.eventTypes;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.EnumApi().eventTypes(), current, (eventTypes) => this.setState({ eventTypes }));
        }
    }

    private ensurePaymentMethods() {
        let current = this.state.paymentMethods;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.PaymentMethodsApi().getAll(), current, (paymentMethods) => this.setState({ paymentMethods }));
        }
    }

    private ensureCountries() {
        let current = this.state.countries;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(false), current, (countries) => this.setState({ countries }));
        }
    }

    private ensureEntityTypes() {
        let current = this.state.entityTypes;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            connect(new Apis.EntityTypesApi().getAll(), current, (entityTypes) => this.setState({ entityTypes }));
        }
    }

    private ensureDocuments() {
        let current = this.state.documents;
        if (!current || current.state === LoadingStatus.Preload || current.state === LoadingStatus.Stale) {
            let countyOfIssuance = this.state.event.map(x => x.countryofIssuance && x.countryofIssuance.id);
            if (countyOfIssuance.isDone()) {
                //can only get docs if the event has been loaded
                let docsRequest: Dtos.DocumentStaticDataSearchQuery = { countryOfIssuanceId: countyOfIssuance.data, sort: null, status: null, uiFilters: null };
                connect(new Apis.DocumentStaticDataApi().search(docsRequest, 1, 1000).then(x => x.items.map(doc => { return { id: doc.id, documentName: doc.documentTitle, documentAppliesToId: doc.appliesTo, systemGeneratedForm: doc.systemGeneratedForm }; })), this.state.documents, (documents) => this.setState({ documents }));
            }
        }
    }
    private goToListRounds(message?: string) {
        this.ensureRounds();
        this.ensureEventTypes();
        this.setPageState({
            currentView: 'list',
            roundId: null,
            categoryId: null,
            error: null,
            message: message
        });
    }

    private goToViewRound(roundId: number, message?: string) {
        this.ensureRound(roundId, this.props.eventId);
        this.ensureCategories(roundId);
        this.ensureEventTypes();
        this.setPageState({
            currentView: 'view',
            roundId: roundId,
            categoryId: null,
            error: null,
            message: message
        });

    }

    private goToEditRound(roundId: number, message?: string) {
        this.ensureRound(roundId, this.props.eventId);
        this.ensureFilingMethods();
        this.ensureEventTypes();
        this.ensurePaymentMethods();

        this.setPageState({
            currentView: 'edit',
            roundId: roundId,
            categoryId: null,
            error: null,
            message: message
        });
    }

    private goToCreateRound(message?: string) {
        this.ensureEventTypes();
        this.ensureFilingMethods();
        this.ensurePaymentMethods();
        this.setPageState({
            currentView: 'create',
            roundId: null,
            categoryId: null,
            error: null,
            message: message
        });
    }

    private goToViewCategory(roundId: number, categoryId: number, message?: string) {
        this.ensureEventTypes();
        this.ensureRound(roundId, this.props.eventId);
        this.ensureCategory(categoryId, roundId);
        this.ensureCategoryPermission(categoryId);
        this.ensureCountries();
        this.ensureEntityTypes();
        this.ensureDocuments();
        this.setPageState({
            categoryId: categoryId,
            roundId: roundId,
            currentView: "category-view",
            error: null,
            message: message
        });
    }

    private goToEditCategory(roundId: number, categoryId: number, message?: string) {
        this.ensureEventTypes();
        this.ensureRound(roundId, this.props.eventId);
        this.ensureCategories(roundId);
        this.ensureCategory(categoryId, roundId);
        this.ensureCategoryPermission(categoryId);
        this.ensureCountries();
        this.ensureEntityTypes();
        this.ensureDocuments();

        this.setPageState({
            categoryId: categoryId,
            roundId: roundId,
            currentView: 'category-edit',
            error: null,
            message: message
        });
    }

    private goToCreateCategory(roundId: number, message?: string) {
        this.ensureEventTypes();
        this.ensureRound(roundId, this.props.eventId);
        this.ensureCategories(roundId);
        this.ensureCountries();
        this.ensureEntityTypes();
        this.ensureDocuments();
        this.setPageState({
            roundId: roundId,
            categoryId: null,
            currentView: 'category-create',
            error: null,
            message: message
        });
    }

    private saveRound(round: Dtos.RoundDto) {
        let api = new Apis.RoundApi();
        let isUpdate = !!round.id;
        let pendingSave = isUpdate ? api.update(round.id, round) : api.create(round);
        connect(pendingSave, null, result => {
            if (result.isDone()) {
                let rounds = this.state.rounds;
                rounds && rounds.setStale();
                let roundStore = this.state.roundStore;
                roundStore.set(round.id, new Pending(LoadingStatus.Done, result.data));

                this.setState({ rounds: rounds, roundStore: roundStore });
                this.goToViewRound(result.data.id, isUpdate ? "Round sucessfully updated": "Round sucessfully created");
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });
    }

    private saveCategory(category: Dtos.RoundCategoryDto) {
        let api = new Apis.RoundCategoriesApi();
        let isUpdate = !!category.id;
        let pendingSave = isUpdate ? api.update(category.id, category) : api.create(category);
        connect(pendingSave, null, result => {
            if (result.isDone()) {
                let categoriesStore = this.state.categoriesStore;
                categoriesStore.get(result.data.eventRoundId).setStale();

                let categoryStore = this.state.categoryStore;
                categoryStore.set(result.data.id, result);

                this.setState({ categoriesStore, categoryStore });

                if (isUpdate) {
                    this.goToViewCategory(this.state.roundId, result.data.id, "Category sucessfully updated");
                }
                else {
                    this.goToViewRound(result.data.eventRoundId, "Category sucessfully created");
                }
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });
    }

    private cancelRoundEdit() {
        let id = this.state.roundId;
        if (id) {
            this.goToViewRound(id);
        }
        else {
            this.goToListRounds();
        }
    }

    private cancelCategoryEdit() {
        let categoryId = this.state.categoryId;
        let roundId = this.state.roundId;
        if (categoryId) {
            this.goToViewCategory(roundId, categoryId);
        }
        else {
            this.goToViewRound(roundId);
        }
    }

    private sendUpdateRound(roundId: number, update: { (dto: Dtos.RoundDto): void }, getMessage: {(dto:Dtos.RoundDto): string}) {
        let dto = this.state.roundStore.get(roundId).data;
        update(dto);
        connect(new Apis.RoundApi().update(roundId, dto), null, (result) => {
            if (result.isDone()) {
                let roundStore = this.state.roundStore;
                roundStore.set(roundId, result);
                let rounds = this.state.rounds;
                rounds.setStale();
                this.setState({ rounds, roundStore, error: null, message: getMessage(dto) });
            }
            else if (result.isFailed()) {
                this.setState({ error: result.error });
            }
        });
    }

    private ruleChangeDialog: DialogBuilder;
    private beforeRuleChange(ruleDto: Dtos.DocumentRuleDto): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            let request: Dtos.ValidateRoundCategoryDto = {
                countryIds: ruleDto.countries.map(x => x.id),
                entityIds: ruleDto.entities.map(x => x.id),
                eventCategoryId: this.state.categoryId,
                eventRoundId: this.state.roundId
            }
            connect(new Apis.RoundCategoriesApi().validateRule(request), null, (result) => {
                if (result.isDone()) {
                    if (result.data.length) {

                        let message = (<div>
                            <p>The rule you are trying to create has the following conflict(s):</p>
                            <ul>{result.data.map(x => <li>{x}</li>)}</ul>
                            <p>Do you still want to create this rule?</p>
                        </div>);

                        this.ruleChangeDialog = new DialogBuilder()
                            .setTitle("Rule warning")
                            .setMessage(message)
                            .setConfirmHandler(() => {
                                this.ruleChangeDialog.close();
                                this.ruleChangeDialog = null;
                                resolve()
                            })
                            .setCancelHandler(() => {
                                this.ruleChangeDialog.close();
                                this.ruleChangeDialog = null;
                                reject()
                            });
                        this.ruleChangeDialog.open();
                    }
                    else {
                        resolve();
                    }
                }
                else if (result.isFailed()) {
                    this.setState({ error: result.error });
                    reject();
                }
            });
        });
        return promise;
    }

    private deleteConfirmation: DialogBuilder;

    private onDeleteCategory() {
        let catId = this.state.categoryId;
        let roundId = this.state.roundId;

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete category?")
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                connect(new Apis.RoundCategoriesApi().delete(catId), null, result => {
                    if (result.isDone()) {
                        this.state.categoriesStore.get(roundId).setStale();
                        this.goToViewRound(roundId, "Category sucessfully deleted");
                    }
                    else if (result.isFailed()) {
                        this.setState({ error: result.error });
                    }
                });
            });

        if (this.state.categoriesStore.get(roundId) && this.state.categoriesStore.get(roundId).data && !this.state.categoriesStore.get(roundId).data.some(x => x.id != catId)) {
            this.deleteConfirmation.setMessage(<div>
                <p>You are about to delete the category with its information and document rules.</p>
                <p>This is the last category associated with the round. If the round is left without categories, Participants will not be able to add Beneficial Owners to Batch Claims (because no category will be available).</p>
                <p> Are you sure you want to proceed?</p>
            </div>);
        }
        else {
            this.deleteConfirmation.setMessage(<div>
                <p>You are about to delete the category with its information and document rules.</p>
                <p> Are you sure you want to proceed?</p>
            </div>);
        }

        this.deleteConfirmation.open();
    }

    private onDeleteRound() {
        let roundId = this.state.roundId;
        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete round?")
            .setMessage(<div>
                <p>You are about to delete the round with all the categories and document rules in it.</p>
                <p>Are you sure you want to proceed?</p>
            </div>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                connect(new Apis.RoundApi().delete(roundId), null, (result) => {
                    if (result.isDone()) {
                        this.state.rounds.setStale();
                        this.goToListRounds("Round sucessfully deleted");
                    }
                    else if (result.isFailed()) {
                        this.setState({ error: result.error });
                    }
                });
            })
            .open();
    }
}