import { DocumentStaticDataDtoValidator } from '../../../validators/documentStaticDataDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import {
    connect,
    Loader,
    LoadingStatus,
    Pending,
    PopupBuilder,
    IGridBuilderChangeArgs,
    PageableGridBuilder,
    UrlState,
    PagedDataState,
    PageCache,
    UrlHelpers
} from "../../../classes";
import { Search } from './search';
import { Create } from './create';
import { Edit } from './edit';
import { Details } from './details';
import { Message } from '../../../components';

interface PageProps {
    canEditDocumentStaticData: boolean;
};

interface PageState {
    documentId?: number;
    documentList?: PagedDataState<Dtos.DocumentStaticDataSummaryDto, Dtos.DocumentStaticDataSearchQuery>;
    pageMode?: 'createNew' | 'details' | 'edit' | 'search';
    countries?: Pending<Dtos.CountrySummaryDto[]>;
    documentTemplates?: Pending<Dtos.DocumentTemplateDto[]>;
    documentCategoriesDocId?: number;
    documentCategories?: Pending<Dtos.DocumentCategorySummaryDto[]>;
    document?: Pending<Dtos.DocumentStaticDataDto>;
    edited?: Pending<Dtos.DocumentStaticDataDto>;
    validation?: DocumentStaticDataDtoValidator;
    successMessage?: string;
    errorMessage?: string
};

interface UrlProps {
    documentId: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private url: UrlState<UrlProps> = new UrlState<UrlProps>();
    private documentStore: PageCache<Dtos.DocumentStaticDataSummaryDto, Dtos.DocumentStaticDataSearchQuery>;

    constructor(props: PageProps) {
        super(props);

        this.documentStore = new PageCache<Dtos.DocumentStaticDataSummaryDto, Dtos.DocumentStaticDataSearchQuery>(
            (query, page, pageSize) => new Apis.DocumentStaticDataApi().search(query, page, pageSize),
            () => this.state.documentList,
            (documentList) => this.setState({ documentList })
        );

        this.state = {
            pageMode: "search",
            countries: new Pending<Dtos.CountrySummaryDto[]>(),
            documentTemplates: new Pending<Dtos.DocumentTemplateDto[]>(),
            documentCategories: new Pending<Dtos.DocumentCategorySummaryDto[]>(),
            document: new Pending<Dtos.DocumentStaticDataDto>()
        };
    }

    private initNewDocument(): Dtos.DocumentStaticDataDto {
        return {
            id: null,
            documentTitle: null,
            documentTemplate: null,
            status: null,
            statusName: null,
            physicalRequired: false,
            countryOfIssuance: { countryName: "All", id: 0, countryCode: "ALL" },
            appliesTo: Dtos.DocumentAppliesLevel.BeneficialOwner,
            appliesToName: null,
            systemGeneratedForm: false,
            isUsed: null,
            canEditAllFields: null,
            createdBy: null,
            createdOn: null,
            lastUpdatedBy: null,
            lastUpdatedOn: null,
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
        var docId = this.url.read().documentId;
        if (currPath.indexOf('/documentstaticdata/list/createNew') !== -1) {
            this.goToCreate();
        }
        else if (currPath.indexOf('/documentstaticdata/list/details') !== -1 && docId) {
            this.goToDetails(docId, null, null, true);
        }
        else if (currPath.indexOf('/documentstaticdata/list/edit') !== -1 && docId) {
            this.goToEdit(docId);
        }
        else {
            this.goToSearch(null, null);
        }
    }

    private setPageState = (state: PageState): void => {
        this.setState(state);
        if (state.pageMode === "details") {
            this.url.push(UrlHelpers.buildUrl(['/documentstaticdata', 'list', 'details']))
            this.url.update({ documentId: state.documentId })
        }
        else if (state.pageMode === "createNew") {
            this.url.push(UrlHelpers.buildUrl(['/documentstaticdata', 'list', 'createNew']))
        }
        else if (state.pageMode === "edit") {
            this.url.push(UrlHelpers.buildUrl(['/documentstaticdata', 'list', 'edit']))
            this.url.update({ documentId: state.documentId })
        }
        else {
            this.url.push(UrlHelpers.buildUrl(['/documentstaticdata', 'list']));
        }
    }


    private onGridChanged(options: IGridBuilderChangeArgs<Dtos.DocumentStaticDataSortField>) {
        this.documentStore.setCurrent({ sort: options.sort, uiFilters: options.filters, countryOfIssuanceId: null, status: null }, options.page, options.pageSize, false);
    }

    private EnsureCountries() {
        if (this.state.countries.state === LoadingStatus.Preload || this.state.countries.state === LoadingStatus.Stale) {
            connect(new Apis.CountriesApi().getAll(true), this.state.countries, countries => this.setState({ countries }));
        }
        return this.state.countries;
    }

    private EnsureDocumentTemplates() {
        if (this.state.documentTemplates.state === LoadingStatus.Preload || this.state.documentTemplates.state === LoadingStatus.Stale) {
            connect(new Apis.DocumentTemplatesApi().getAll(true), this.state.documentTemplates, documentTemplates => this.setState({ documentTemplates }));
        }
        return this.state.documentTemplates;
    }

    private EnsureDocumentCategories(documentId: number) {
        if (!this.state.documentCategoriesDocId || this.state.documentCategoriesDocId != documentId 
            || this.state.documentCategories.state === LoadingStatus.Preload || this.state.documentCategories.state === LoadingStatus.Stale) 
        {
        connect(new Apis.DocumentStaticDataApi().getCategories(documentId), new Pending<Dtos.DocumentCategorySummaryDto[]>(), documentCategories => 
            this.setState({ documentCategories: documentCategories, documentCategoriesDocId: documentId }));
        }
        return this.state.documentCategories;
    }

    private goToSearch(message: string, errorMessage: string) {
        this.setPageState({
            pageMode: 'search',
            documentId: null,
            document: new Pending<Dtos.DocumentStaticDataDto>(),
            edited: new Pending<Dtos.DocumentStaticDataDto>(),
            successMessage: message,
            errorMessage: errorMessage
        });
    }

    private goToCreate() {
        let newDto = this.initNewDocument();

        this.EnsureCountries();
        this.EnsureDocumentTemplates();

        this.setPageState({
            pageMode: 'createNew',
            documentId: null,
            document: new Pending<Dtos.DocumentStaticDataDto>(),
            edited: new Pending(LoadingStatus.Done, newDto),
            validation: new DocumentStaticDataDtoValidator(newDto, false),
            successMessage: null
        });

    }

    private goToDetails(id: number, successMessage: string, errorMessage: string, reload: boolean) {
        this.EnsureCountries();

        let preload = new Pending<Dtos.DocumentStaticDataDto>();
        if (!reload && this.state.document && this.state.document.data && this.state.document.data.id == id) {
            preload = this.state.document
        }

        this.setPageState({
            pageMode: 'details',
            successMessage: successMessage,
            errorMessage: errorMessage,
            documentId: id,
            document: preload,
            edited: new Pending<Dtos.DocumentStaticDataDto>(),
            validation: null
        });

        if (preload.state != LoadingStatus.Done && preload.state != LoadingStatus.Loading) {
            connect(new Apis.DocumentStaticDataApi().get(id), preload, (document) => {
                if (this.state.documentId === id) {
                    this.setState({ document })
                }
            });
        }
    }

    private goToEdit(id: number) {
        
        let documentPreload =  this.state.document && this.state.document.data && this.state.document.data.id == id
            ? this.state.document : new Pending<Dtos.DocumentStaticDataDto>();

        this.EnsureCountries();
        this.EnsureDocumentTemplates();
        this.EnsureDocumentCategories(id);

        this.setPageState({
            pageMode: 'edit',
            documentId: id,
            document: documentPreload,
            edited: documentPreload.map(x => JSON.parse(JSON.stringify(x)) as Dtos.DocumentStaticDataDto),
            validation: documentPreload.map(x => new DocumentStaticDataDtoValidator(x, false)).data || new DocumentStaticDataDtoValidator(this.initNewDocument(), false),
            successMessage: null
        });
        
        if (documentPreload.state != LoadingStatus.Done && documentPreload.state != LoadingStatus.Loading) {
            connect(new Apis.DocumentStaticDataApi().get(id), documentPreload, (document) => {
                if (this.state.documentId === id) {
                    let edited = document.map(x => JSON.parse(JSON.stringify(x)) as Dtos.DocumentStaticDataDto);
                    let validation = document.map(x => new DocumentStaticDataDtoValidator(x, false)).data || new DocumentStaticDataDtoValidator(this.initNewDocument(), false);
                    this.setState({ document, edited, validation });
                }
            });
        }
    }


    private deleteDocument(id: number) {
        connect(new Apis.DocumentStaticDataApi().delete(id), null, response => {
            if (response.state === LoadingStatus.Failed) {
                this.goToDetails(id, null, response.error.userMessage, false)
            }
            else if (response.state === LoadingStatus.Done) {
                this.documentStore.refresh();
                this.goToSearch("Document Static Data deleted successfully", null);
            }
        })
    }


    private saveNewDocument() {
        let validation = new DocumentStaticDataDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.DocumentStaticDataApi().create(this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ edited: new Pending(LoadingStatus.Done, this.state.edited.data, x.error), validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.documentStore.refresh();
                    this.goToDetails(x.data, "Document Static Data created successfully", null, true);
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

    private editDocument() {
        let validation = new DocumentStaticDataDtoValidator(this.state.edited.data, true);

        if (validation.isValid()) {
            connect(new Apis.DocumentStaticDataApi().update(this.state.documentId, this.state.edited.data), null, x => {
                if (x.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ edited: new Pending(LoadingStatus.Done, this.state.edited.data, x.error), validation: validation });
                }
                else if (x.state === LoadingStatus.Done) {
                    this.documentStore.refresh();
                    this.goToDetails(this.state.documentId, "Document Static Data saved successfully", null, true);
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


    private renderView() {
        switch (this.state.pageMode) {
            case 'createNew':
                return <Create
                    countries={this.state.countries}
                    documentTemplates={this.state.documentTemplates}
                    document={this.state.edited}
                    validation={this.state.validation}
                    onChange={(dto) => this.setState({ edited: new Pending(LoadingStatus.Done, dto), validation: new DocumentStaticDataDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    onCancel={() => this.goToSearch(null, null)}
                    onSave={(invite) => this.saveNewDocument()}
                />;
            case 'edit':
                return <Edit
                    countries={this.state.countries}
                    documentTemplates={this.state.documentTemplates}
                    documentCategories={this.state.documentCategories}
                    document={this.state.edited}
                    validation={this.state.validation}
                    canEditDocumentStaticData={this.props.canEditDocumentStaticData}
                    onChange={(dto) => this.setState({ edited: new Pending(LoadingStatus.Done, dto), validation: new DocumentStaticDataDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    onCancel={() => this.goToDetails(this.state.documentId, null, null, false)}
                    onSave={() => this.editDocument()}
                />;
            case 'details':
                return <Details
                    countries={this.state.countries}
                    document={this.state.document}
                    onBack={() => this.goToSearch(null, null)}
                    canEditDocumentStaticData={this.props.canEditDocumentStaticData}
                    onDelete={(id) => this.deleteDocument(id)}
                    onEdit={(id) => this.goToEdit(id)}
                />;
            default:
                return <Search
                    canEditDocumentStaticData={this.props.canEditDocumentStaticData}
                    onAddSelected={() => this.goToCreate()}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    documents={this.documentStore.getCurrentData()}
                    onDocumentSelected={(dto) => this.goToDetails(dto.id, null, null, false)}
                    currentFilter={this.documentStore.getCurrentFilter()}
                />;
        }
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "createNew":
                return "Create Document Static Data"
            case "details":
                return "View Document Static Data"
            default:
                return "Document Static Data"
        }
    }

    private renderSuccessMessage() {
        if (!this.state.successMessage) return null;
        return <Message type="success" message={this.state.successMessage} qa="SuccessMessage"/>
    }

    private renderErrorMessage() {
        if (!this.state.errorMessage) return null;
        return <Message type="alert" message={this.state.errorMessage} qa="ErrorMessage"/>
    }

    render() {
        return (
            <div>
                <div>
                    <h1 data-qa="AdminDocumentStaticDataTitle">{this.renderTitle()}</h1>
                </div>
                {this.renderSuccessMessage()}
                {this.renderErrorMessage()}
                {this.renderView()}
            </div>
        );
    }
}