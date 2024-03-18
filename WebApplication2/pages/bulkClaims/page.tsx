import * as React from 'react';
import * as Framework from '../../classes';
import { Apis, Dtos } from '../../adr';
import { Search } from './search';
import { Details } from './details';
import { CreateBulkClaimPopup } from './createBulkClaimPopup';

interface PageProps {
    canCreate: boolean;
    canUpload: boolean;
    canSubmit: boolean;
    canCancelAny: boolean;
    currentUserId: number;
    bulkClaimId?: number;
    isGoal: boolean;
}

interface PageState {
    claimsList?: Framework.PagedDataState<Dtos.BulkClaimSummaryDto, Dtos.GetListBulkClaimsQuery>;
    pageMode?: 'list' | 'details';
    statusOptions?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    filingMethods?: Framework.Pending<Dtos.EnumDisplayDto[]>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    bulkClaimId?: number;
    bulkClaim?: Framework.Pending<Dtos.BulkClaimDto>;
    edited?: Dtos.BulkClaimDto;
    createError?: string;
    successMessage?: string;
}

interface UrlProps {
    bulkClaimId?: number;
}

export class Page extends React.Component<PageProps, PageState> {
    private claimsStore: Framework.PageCache<Dtos.BulkClaimSummaryDto, Dtos.GetListBulkClaimsQuery>;
    private url: Framework.UrlState<UrlProps> = new Framework.UrlState<UrlProps>();

    constructor(props: PageProps) {
        super(props);

        this.claimsStore = new Framework.PageCache<Dtos.BulkClaimSummaryDto, Dtos.GetListBulkClaimsQuery>(
            (query, page, pageSize) => new Apis.BulkClaimApi().getList(query, page, pageSize),
            () => this.state.claimsList,
            (claimsList) => this.setState({ claimsList })
        );

        this.state = {
            pageMode: 'list',
            statusOptions: new Framework.Pending<Dtos.EnumDisplayDto[]>(Framework.LoadingStatus.Preload),
            filingMethods: new Framework.Pending<Dtos.EnumDisplayDto[]>(Framework.LoadingStatus.Preload),
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(Framework.LoadingStatus.Preload),
            bulkClaim: new Framework.Pending<Dtos.BulkClaimDto>(Framework.LoadingStatus.Preload)
        };
    }

    render() {
        return (<div>
            {this.renderTitle()}
            {this.renderView()}
        </div>);
    }

    componentDidMount() {
        if (this.props.bulkClaimId) {
            this.goToDetails(this.props.bulkClaimId);
        }

        this.setStateFromPath();
        this.ensureStatusOptions();
        this.ensureFilingMethods();
        this.ensureCountries();
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case 'list': return (<h2>Bulk Claims</h2>);
            case 'details': return (<h2>Bulk Claim Details</h2>);
        }
    }

    private renderView() {
        switch (this.state.pageMode) {
            case 'list':
                return <Search
                    bulkClaims={this.claimsStore.getCurrentData()}
                    currentFilter={this.claimsStore.getCurrentFilter()}
                    statusOptions={this.state.statusOptions}
                    filingMethods={this.state.filingMethods}
                    onCreate={() => this.createClaim()}
                    onBulkClaimSelected={(dto) => { dto.status !== Dtos.BulkClaimStatus.Canceled && this.goToDetails(dto.id) }}
                    onPageChanged={(options) => this.onGridChanged(options)}
                    canCreate={this.props.canCreate}
                    isGoal={this.props.isGoal}
                />;
            case 'details':
                return this.renderDetailsTab();
        }
    }

    private renderDetailsTab() {
        return Framework.Loader.for(this.state.bulkClaim, claim => {
            let date = claim.date;

            let query = this.state.bulkClaim.data
                ? {
                    countryOfIssuanceId: this.state.bulkClaim.data.countryOfIssuance.id,
                    eventAdrDate: moment.utc(date).toDate(),
                    filingMethod: this.state.bulkClaim.data.roundType
                }
                : null;

            return <Details
                bulkClaim={this.state.bulkClaim}
                bulkClaimId={this.state.bulkClaimId}
                canCancelAny={this.props.canCancelAny}
                canUpload={this.props.canUpload}
                canSubmit={this.props.canSubmit}
                isGoalUser={this.props.isGoal}
                currentUserId={this.props.currentUserId}
                query={query}
                currentStep={this.state.bulkClaim.data ? this.state.bulkClaim.data.status as number : 0}
                onUploadComplete={() => { this.ensureBulkClaim(this.state.bulkClaimId, true); }}
                onClaimSubmitted={() => { this.ensureBulkClaim(this.state.bulkClaimId, true); this.setState({ successMessage: "Your Bulk Claim has been submitted successfully" }); }}
                onClaimCancelled={() => { this.claimsStore.refresh(); this.goToSearch(); }}
                onBack={() => { this.claimsStore.refresh(); this.goToSearch(); }}
            />;
        });
    }

    private popup: Framework.PopupBuilder;

    private createClaim() {
        let edited = {} as Dtos.BulkClaimDto;
        this.setState({ edited });

        this.popup = new Framework.PopupBuilder()
            .setTitle("Create Bulk Claim")
            .setHeight(380)
            .setWidth(800)
            .setContent(
            <CreateBulkClaimPopup
                bulkClaim={edited}
                countries={this.state.countries}
                filingMethods={this.state.filingMethods}
                onSave={(dto) => this.saveBulkClaim(dto)}
                onCancel={() => this.popup.close()}
                errorMessage={this.state.createError}
                isGoalUser={this.props.isGoal}
            />)
            ;

        this.popup.open();
    }

    private saveBulkClaim(dto: Dtos.BulkClaimDto) {
        Framework.connect(new Apis.BulkClaimApi().create(dto), null, x => {
            if (x.isDone()) {
                this.popup.close();
                this.goToDetails(x.data.id);
            }
            else if (x.isFailed()) {
                this.goToDetails(x.data.id);
                this.setState({ createError: x.error.userMessage });
            }
        })
    }

    private goToDetails(id: number) {
        this.url.push(Framework.UrlHelpers.buildUrl(['/bulkclaims/list', 'details']));
        this.url.update({ bulkClaimId: id });

        this.ensureBulkClaim(id, true);

        this.setState({ bulkClaimId: id, pageMode: 'details', successMessage: null });
    }

    private goToSearch() {
        this.url.push(Framework.UrlHelpers.buildUrl(['/bulkclaims/list']));

        this.claimsStore.refresh();

        this.setState({ bulkClaimId: null, pageMode: 'list' });
    }

    private setStateFromPath() {
        let currPath = this.url.getCurrentPath();
        var id = this.url.read().bulkClaimId;

        if (currPath.indexOf(`/bulkclaims/list/details`) !== -1 && id) {
            this.goToDetails(id);
        }
        else {
            this.goToSearch();
        }
    }

    private ensureBulkClaim(id: number, reload?: boolean, reloadOnStateChangeOnly?: boolean) {
        let preload = new Framework.Pending<Dtos.BulkClaimDto>();

        if (!reload && this.state.bulkClaim && this.state.bulkClaim.data && this.state.bulkClaim.data.id == id) {
            preload = this.state.bulkClaim;
        }

        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.BulkClaimApi().getById(id), preload, (bulkClaim) => {
                if (bulkClaim.isDone() && bulkClaim.data.id == this.state.bulkClaimId) {
                    if (bulkClaim.data.status == Dtos.BulkClaimStatus.Processing) {
                        setTimeout(() => { this.ensureBulkClaim(id, true, true); }, 5000);
                    }

                    if (!reloadOnStateChangeOnly || bulkClaim.data.status != this.state.bulkClaim.data.status)
                        this.setState({ bulkClaim, bulkClaimId: id });
                }
                else if (bulkClaim.isFailed()) {
                    this.setState({ bulkClaim })
                }
                else if (!bulkClaim.isReady() && !reloadOnStateChangeOnly) {
                    this.setState({ bulkClaim })
                }
            });
        }
    }

    private ensureCountries() {
        var countries = this.state.countries;
        if (!countries || countries.state == Framework.LoadingStatus.Preload || countries.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(true), countries, countries => this.setState({ countries }));
        }
    }

    private ensureStatusOptions() {
        var statusOptions = this.state.statusOptions;
        if (!statusOptions || statusOptions.state == Framework.LoadingStatus.Preload || statusOptions.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().bulkClaimStatusOptions(), statusOptions, statusOptions => this.setState({ statusOptions }));
        }
    }

    private ensureFilingMethods() {
        var filingMethods = this.state.filingMethods;
        if (!filingMethods || filingMethods.state == Framework.LoadingStatus.Preload || filingMethods.state == Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.EnumApi().filingMethods(), filingMethods, filingMethods => this.setState({ filingMethods }));
        }
    }

    private onGridChanged(options: Framework.IGridBuilderChangeArgs<Dtos.GetListBulkClaimsQuery_BulkClaimSortField>) {
        this.claimsStore.setCurrent({ sort: options.sort, uiFilters: options.filters }, options.page, options.pageSize, false);
    }
}