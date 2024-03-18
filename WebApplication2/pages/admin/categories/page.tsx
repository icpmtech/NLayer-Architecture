import { CategoryDtoValidator } from '../../../validators/categoryDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { connect, LoadingStatus, Pending, IGridBuilderChangeArgs, UrlState, PagedDataState, PageCache, UrlHelpers, PopupBuilder, DialogBuilder, AppError } from "../../../classes";
import { Search } from './search';
import { Details } from './details';
import { Edit } from './edit';
import { Message, Error } from '../../../components';

// THINGS TO REMEMBER FOR THIS PAGE:
// - Reclaim Rate numeric grid filter needs to be set at 6 decimal digits 
// - Filing method grid filter needs to be a multi-select
// - Reclaim Rate decimals in the view/edit/create? pages needs to be specific
// - Rule addition is enabled only when specific fields have been filled-in first

interface PageProps {
    canCreateCategories: boolean;
    canDeleteCategories: boolean;
    canEditCategories: boolean;
};

interface PageState {
    categoryId?: number;
    categoryList?: PagedDataState<Dtos.CategorySummaryDto, Dtos.CategorySearchQuery>;
    pageMode?: 'createNew' | 'details' | 'search' | 'edit';
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    filingMethods?: Pending<Dtos.FilingMethodDto[]>;
    entityTypes?: Pending<Dtos.EntityTypeSummaryDto[]>;
    documentStore?: Map<number, Pending<Dtos.DocumentSummaryDto[]>>;
    category?: Pending<Dtos.CategoryDto>;
    edited?: Pending<Dtos.CategoryDto>;
    validation?: CategoryDtoValidator;
    message?: string;
    error?: AppError;
};

interface UrlProps {
    categoryId: number;
}

export interface ruleDto {
    id: number,
    countries: Dtos.CountrySummaryDto[]
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private categoryStore: PageCache<Dtos.CategorySummaryDto, Dtos.CategorySearchQuery>;
    private rulePopup: PopupBuilder;

    constructor(props: PageProps) {
        super(props);

        this.categoryStore = new PageCache<Dtos.CategorySummaryDto, Dtos.CategorySearchQuery>(
            (query, page, pageSize) => new Apis.CategoriesApi().search(query, page, pageSize),
            () => this.state.categoryList,
            (categoryList) => this.setState({ categoryList })
        );

        this.state = {
            pageMode: "search",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            filingMethods: new Pending<Dtos.FilingMethodDto[]>(),
            category: new Pending<Dtos.CategoryDto>(),
            entityTypes: new Pending<Dtos.EntityTypeSummaryDto[]>(),
            documentStore: new Map()
        };
    }

    private initNewCategory(): Dtos.CategoryDto {
        return {
            notes: null,
            rules: [],
            id: null,
            countryOfIssuance: null,
            filingMethod: null,
            description: null,
            reclaimRate: null,
            whtRate: null,
            createdBy: null,
            createdOn: null,
            lastUpdatedBy: null,
            lastUpdatedOn: null
        };
    }

    componentDidMount = () => {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let currPath = this.url.getCurrentPath();
        var catId = this.url.read().categoryId;
        if (currPath.indexOf('/categories/list/createNew') !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf('/categories/list/details') !== -1 && catId) {
            this.goToDetails(catId, null, true);
        }
        else if (currPath.indexOf('/categories/list/edit') !== -1 && catId) {
            this.goToEdit(catId, null);
        }
        else {
            this.goToSearch(null);
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "details") {
            this.url.push(UrlHelpers.buildUrl(['/categories', 'list', 'details']))
            this.url.update({ categoryId: state.categoryId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(UrlHelpers.buildUrl(['/categories', 'list', 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(UrlHelpers.buildUrl(['/categories', 'list', 'edit']))
            this.url.update({ categoryId: state.categoryId })
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/categories', 'list']));
        }
    }


    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.CategorySortField>) {
        this.categoryStore.setCurrent({ sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }

    private EnsureCountries() {
        if (this.state.countries.state === LoadingStatus.Preload || this.state.countries.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private EnsureFilingMethods() {
        if (this.state.filingMethods.state === LoadingStatus.Preload || this.state.filingMethods.state === LoadingStatus.Stale) {
            connect(new Apis.FilingMethodsApi().getAll(), this.state.filingMethods, filingMethods => this.setState({ filingMethods }));
        }
    }

    private EnsureEntities() {
        if (this.state.entityTypes.state === LoadingStatus.Preload || this.state.entityTypes.state === LoadingStatus.Stale) {
            connect(new Apis.EntityTypesApi().getAll(), this.state.entityTypes, entityTypes => this.setState({ entityTypes }));
        }
    }

    private EnsureDocuments(countryOfIssuanceId:number) {
        //find the county of issuance
        if (countryOfIssuanceId && !this.state.documentStore.has(countryOfIssuanceId)) {
            let request: Dtos.DocumentStaticDataSearchQuery = { countryOfIssuanceId, status: null, sort: null, uiFilters: null };
            connect(new Apis.DocumentStaticDataApi().search(request, 1, 1000).then(x => x.items.map(doc => { return { id: doc.id, documentName: doc.documentTitle, documentAppliesToId: doc.appliesTo, systemGeneratedForm: doc.systemGeneratedForm}; })), null, (documents) => {
                let store = this.state.documentStore;
                store.set(countryOfIssuanceId, documents);
                this.setState({ documentStore: store });
            });
        }
    }

    private goToSearch(message: string) {
        this.EnsureFilingMethods();
        this.setPageState({
            pageMode: 'search',
            categoryId: null,
            category: new Pending<Dtos.CategoryDto>(),
            edited: new Pending<Dtos.CategoryDto>(),
            message: message,
            error: null
        });
    }

    private goToCreate() {
        let newDto = this.initNewCategory();

        this.EnsureCountries();
        this.EnsureFilingMethods();
        this.EnsureEntities();

        this.setPageState({
            pageMode: 'createNew',
            categoryId: null,
            category: new Pending<Dtos.CategoryDto>(),
            edited: new Pending(LoadingStatus.Done, newDto),
            validation: new CategoryDtoValidator(newDto, false),
            message: null,
            error: null
        });

    }

    private goToDetails(id: number, message: string, reload: boolean) {
        this.EnsureCountries();
        this.EnsureFilingMethods();

        let preload = new Pending<Dtos.CategoryDto>();
        if (!reload && this.state.category && this.state.category.data && this.state.category.data.id == id) {
            preload = this.state.category
        }

        this.setPageState({
            pageMode: 'details',
            message: message,
            categoryId: id,
            category: preload,
            edited: new Pending<Dtos.CategoryDto>(),
            validation: null,
            error: null
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.CategoriesApi().get(id), preload, (category) => {
                if (this.state.categoryId === id) {
                    this.setState({ category })
                }
            });
        }
    }

    private goToEdit(id: number, message: string) {
        let preload = new Pending<Dtos.CategoryDto>();
        if (this.state.category && this.state.category.data && this.state.category.data.id == id) {
            preload = this.state.category
        }

        this.setPageState({
            pageMode: 'edit',
            message: message,
            categoryId: id,
            category: preload,
            edited: preload.map(x => JSON.parse(JSON.stringify(x)) as Dtos.CategoryDto),
            validation: preload.map(x => new CategoryDtoValidator(x, false)).data || new CategoryDtoValidator(this.initNewCategory(), false),
            error: null
        });

        this.EnsureCountries();
        this.EnsureFilingMethods();
        this.EnsureEntities();
        this.EnsureDocuments(preload.data && preload.data.countryOfIssuance && preload.data.countryOfIssuance.id);

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.CategoriesApi().get(id), preload, (category) => {
                if (this.state.categoryId === id) {
                    let edited = category.map(x => JSON.parse(JSON.stringify(x)) as Dtos.CategoryDto);
                    let validation = category.map(x => new CategoryDtoValidator(x, false)).data || new CategoryDtoValidator(this.initNewCategory(), false);
                    this.setState({ category, edited, validation });
                    this.EnsureDocuments(edited.data && edited.data.countryOfIssuance && edited.data.countryOfIssuance.id);
                }
            });
        }
    }

    private create() {
        let validation = new CategoryDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.CategoriesApi().create(this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ edited: new Pending(LoadingStatus.Done, this.state.edited.data, x.error), validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.categoryStore.refresh();
                    this.goToDetails(x.data.id, "Category was successfully created", true);
                }
                else {
                    this.setState({ edited: new Pending(x.state, this.state.edited.data), validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private deleteConfirmation: DialogBuilder;
    private delete() {
        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete category?")
            .setMessage(<p>{'Are you sure you want to delete this category?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                connect(new Apis.CategoriesApi().delete(this.state.categoryId), null, x => {
                    if (x.isReady()) {
                        this.categoryStore.refresh();
                        this.goToSearch("Category was successfully deleted");
                    }
                    else {
                        this.setState({ error: x.error });
                    }
                });
            })
            .withQA("DeleteCategoryConfirmationDialog")
            .open();
    }

    private update() {
        let validation = new CategoryDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.CategoriesApi().update(this.state.categoryId, this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ edited: new Pending(LoadingStatus.Done, this.state.edited.data, x.error), validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.categoryStore.refresh();
                    this.goToDetails(x.data.id, "Category was successfully updated", true);
                }
                else {
                    this.setState({ edited: new Pending(x.state, this.state.edited.data), validation: validation });
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    private ruleChangeDialog: DialogBuilder;
    private beforeRuleChange(ruleDto: Dtos.DocumentRuleDto): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            let request: Dtos.ValidateCategoryRuleDto = {
                countryIds: ruleDto.countries.map(x => x.id),
                entityIds: ruleDto.entities.map(x => x.id),
                countryOfIssuanceId: this.state.edited.data.countryOfIssuance.id,
                currentCategoryId: this.state.edited.data.id,
                filingMethodId: this.state.edited.data.filingMethod.id
            }
            connect(new Apis.CategoriesApi().validateRule(request), null, (result) => {
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
                            .withQA("RuleWarning")
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

    private updateEditor(dto: Dtos.CategoryDto) {
        this.setState({
            edited: new Pending(LoadingStatus.Done, dto),
            validation: new CategoryDtoValidator(dto, this.state.validation.showValidationErrors())
        });
        this.EnsureDocuments(dto.countryOfIssuance && dto.countryOfIssuance.id);
    }

    private renderView() {
        let editedCountryOfIssuanceId = this.state.edited && this.state.edited.data && this.state.edited.data.countryOfIssuance && this.state.edited.data.countryOfIssuance.id;
        switch (this.state.pageMode) {
            case 'createNew':
                return <Edit
                    countries={this.state.countries}
                    filingMethods={this.state.filingMethods}
                    category={this.state.edited}
                    documents={editedCountryOfIssuanceId ? this.state.documentStore.get(editedCountryOfIssuanceId) : new Pending<Dtos.DocumentSummaryDto[]>()}
                    entityTypes={this.state.entityTypes}
                    validation={this.state.validation}
                    onChange={(dto) => this.updateEditor(dto)}
                    onCancel={() => this.goToSearch(null)}
                    onSave={() => this.create()}
                    beforeRuleChange={(dto) => this.beforeRuleChange(dto)}
                   
                    />;
            case 'details':
                return <Details
                    countries={this.state.countries}
                    filingMethods={this.state.filingMethods}
                    category={this.state.category}
                    onBack={() => this.goToSearch(null)}
                    canEdit={this.props.canEditCategories}
                    onEdit={() => this.goToEdit(this.state.categoryId, null)}
                    canDelete={this.props.canDeleteCategories}
                    onDelete={() => this.delete()}
                   
                    />;
            case 'edit':
                return <Edit
                    countries={this.state.countries}
                    filingMethods={this.state.filingMethods}
                    documents={editedCountryOfIssuanceId ? this.state.documentStore.get(editedCountryOfIssuanceId) : new Pending<Dtos.DocumentSummaryDto[]>()}
                    entityTypes={this.state.entityTypes}
                    category={this.state.edited}
                    validation={this.state.validation}
                    onCancel={() => this.goToDetails(this.state.categoryId, null, true)}
                    onChange={(dto) => this.updateEditor(dto)}
                    onSave={() => this.update()}
                    beforeRuleChange={(dto) => this.beforeRuleChange(dto)}
                   
                    />;
            default:
                return <Search
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    categories={this.categoryStore.getCurrentData()}
                    onCategorySelected={(category) => this.goToDetails(category.id, null, false)}
                    currentFilter={this.categoryStore.getCurrentFilter()}
                    filingMethods={this.state.filingMethods}
                    canCreateCategory={this.props.canCreateCategories}
                    />;
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create Category"
            case "details":
                return "View Category"
            case "edit":
                return "Edit Category"
            default:
                return "Categories"
        }
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private renderError() {
        return <Error error={this.state.error} qa="CategoriesError"/>
    }

    render() {
        return (
            <div>
                <div data-qa="AdminCategoriesTitle">
                    <h1>{this.renderTitle()}</h1>
                </div>
                {this.renderMessage()}
                {this.renderError()}
                {this.renderView()}
            </div>
        );
    }
}



