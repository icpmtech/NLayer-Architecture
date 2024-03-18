import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from "../../../classes";
import * as Components from '../../../components';

interface Props {
    onClose: () => void;
    isBinarisedExport: boolean;
};

interface State {
    outstandingEdits?: Framework.Pending<boolean>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    selectedReclaimMarketId: number;
    exportError?: Framework.AppError;
    exportSuccess?: boolean;
};

export class GtrsExportPopup extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            outstandingEdits: new Framework.Pending<boolean>(),
            exportError: null,
            exportSuccess: false,
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            selectedReclaimMarketId: 0
        };
    }

    private componentDidMount() {
        Framework.connect(
            new Apis.TrmApi().hasOutstandingEdits({
                checkTreaty: true,
                checkWht: true,
                checkTaxCredit: true,
                checkStatute: false,
                checkNews: false,
                includeAwaitingVerification: true,
                includeDraft: false,
                reclaimMarketId: null,
                countryOfResidenceId: null
            }),
            this.state.outstandingEdits,
            outstandingEdits => this.setState({ outstandingEdits: outstandingEdits }));

        Framework.connect(new Apis.CountriesApi().getAllGtrs(true), this.state.countries, countries => this.setState({ countries: countries }));
    }

    private onExportClick = () => {
        let api = new Apis.ReportsApi();
        let method = this.props.isBinarisedExport ? api.queueGtrsBinarisedReport(this.state.selectedReclaimMarketId) : api.queueGtrsReport(this.state.selectedReclaimMarketId)
        
        Framework.connect(method, null, response => {
            if (response.isFailed()) {
                this.setState({ exportError : response.error });
            }
            else if (response.isDone()) {
                this.setState({ exportSuccess: true, exportError: null });
            }
        })
    }

    private renderSuccess() {
        return this.state.exportSuccess ? <Components.Message type="success" message={"Successfully started export process"} onClose={() => this.props.onClose()} qa="SuccessfullyStartedExportProcessMessage"/> : null;
    }

    private renderWarning() {
        return (
            <div className="flash-message alert alert-info" data-qa="RecordsAwaitingApprovalAlert">Please be advised there are records awaiting approval, therefore the data in the export file may be incorrect.</div>
        );
    }

    private renderText(countries: Dtos.CountrySummaryDto[]) {
        const TypedDropdown = Components.Dropdown as Newable<Components.Dropdown<{ id: number, name: string }>>;
        let options = countries.map(x => { return { id: x.id, name: x.countryName }; });
        let selected = options.find(x => x.id === (this.state.selectedReclaimMarketId));

        return (
            <div>
                {!this.state.exportSuccess && !this.props.isBinarisedExport ? <p>Select the Reclaim Market for which the report will be generated.</p> : null}
                {!this.state.exportSuccess && !this.props.isBinarisedExport ? <div style={{ width: '100%' }}><TypedDropdown options={options} value={selected} hasOptionsLabel={false} onChange={(country) => { this.setState({ selectedReclaimMarketId: country.id }) }} qa="ReclaimMarketDropdown"/></div> : null}
                {!this.state.exportSuccess ? <p>Click the button below to start the export process.</p> : null}
                <p>When the export is ready for download you will be notified by email.</p>
                <p>To download the exported files go to the <a href="/reports/export" data-qa="ReportsLink">Reports</a> page.<br /><br /></p>
            </div>
        );
    }

    private renderButtons() {
        return (
            <div className={"col-md-6 float-end mb-1"} style={{ paddingRight: '5px' }}>
                <button className="btn btn-primary float-end" disabled={this.state.exportSuccess} onClick={() => this.onExportClick()} data-qa="ExportButton">Export </button>
                <button className="btn btn-outline-secondary float-end" style={{ marginRight: '5px' }} onClick={this.props.onClose}data-qa="CloseButton">Close</button>
            </div>
        );
    }

    render() {
        let pending = this.state.outstandingEdits.and(this.state.countries, (hasEdits, countries) => {return { hasEdits, countries }});
        return Framework.Loader.for(pending, p => {
            return (
            <div className="popup-container-small">
                <Components.Error error={this.state.exportError} qa="GTRSExportPopupError"/>
                {p.hasEdits && this.renderWarning()}
                {this.renderSuccess()}
                {this.renderText(p.countries)}
                {this.renderButtons()}
            </div>
        );})
    }
};