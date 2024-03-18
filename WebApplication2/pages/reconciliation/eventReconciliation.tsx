import * as React from 'react';
import { ViewBalanceSheet } from './viewBalanceSheet';
import { EditBalanceSheet } from './editBalanceSheet';
import { Dtos, Apis } from '../../adr';
import { Pending, Loader, connect, AppError, UrlState, UrlHelpers, LoadingStatus, safeClone } from '../../classes';
import { Message, Error } from '../../components';
import { BalanceSheetDtoValidator } from "../../validators/balanceSheetDtoValidator";
import * as qs from 'qs';

interface Props {
    event: Dtos.EventDto;
    onBalanceSheetUpdated: () => void;
}

interface UrlProps {

}

interface State {
    currentView?: 'view' | 'edit';
    error?: AppError;
    message?: string;
    balanceSheet?: Pending<Dtos.BalanceSheetDto>;
    edited?: Pending<Dtos.BalanceSheetDto>;
    counterpartyTypes?: Pending<Dtos.EnumDisplayDto[]>;
    validation?: BalanceSheetDtoValidator;
    balanceSheetUploaded?: boolean;
}

export class EventReconciliation extends React.Component<Props, State>
{
    constructor(props: Props) {
        super(props);
        this.state = {
            currentView: 'view',
            balanceSheet: new Pending<Dtos.BalanceSheetDto>(),
            edited: new Pending<Dtos.BalanceSheetDto>(),
            counterpartyTypes: new Pending<Dtos.EnumDisplayDto[]>(),
            balanceSheetUploaded: this.props.event.balanceSheetUploaded
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
        let routeUrl = `/event/view/${this.props.event.id}`;
        var urlProps = url.read();

        if (currPath.indexOf(routeUrl + '/balance/edit') !== -1) {
            this.goToEditBalance();
        }
        else {
            this.goToView();
        }
    }

    private setPageState = (state: State): void => {
        this.setState(state);
        let url = new UrlState<UrlProps>();
        let routeUrl = `/event/view/${this.props.event.id}`;

        let query = qs.parse(url.getCurrentQuery());
        if (state.currentView === "view") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'view'], query))
        }
        else if (state.currentView === "edit") {
            url.push(UrlHelpers.buildUrl([routeUrl, 'balance', 'edit'], query))
        }
        else {
            url.push(UrlHelpers.buildUrl([routeUrl], query));
        }
    }

    private ensureBalanceSheet() {
        connect(new Apis.EventBalanceSheetApi().getBalanceSheet(this.props.event.id), this.state.balanceSheet, (bs) => {
            if (bs.isDone()) {
                if (this.state.currentView == "edit") {
                    let edited = safeClone(bs);
                    this.setState({ balanceSheet: bs, edited: edited });
                } else {
                    this.setState({ balanceSheet: bs });
                }
            }
            else if (bs.isFailed()) {
                let newDto = { eventId: this.props.event.id, ratioAdr: this.props.event.ratioAdr, ratioOrd: this.props.event.ratioOrd, counterparties: [] } as Dtos.BalanceSheetDto;
                this.setState({
                    balanceSheet: new Pending<Dtos.BalanceSheetDto>(LoadingStatus.Done, newDto),
                    edited: new Pending<Dtos.BalanceSheetDto>(LoadingStatus.Done, newDto)
                });
            }
        });
    }

    private ensureCounterpartyTypes() {
        if (this.state.counterpartyTypes.state === LoadingStatus.Preload || this.state.counterpartyTypes.state === LoadingStatus.Stale) {
            connect(new Apis.EnumApi().counterpartyType(), this.state.counterpartyTypes, counterpartyTypes => this.setState({ counterpartyTypes }));
        }
    }

    private goToView(message?: string) {
        this.ensureBalanceSheet();
        this.setPageState({
            currentView: 'view',
            validation: null,
            error: null,
            message: message
        });
    }

    private goToEditBalance() {
        this.ensureBalanceSheet();
        this.ensureCounterpartyTypes();
        let edited = safeClone(this.state.balanceSheet);
        this.setPageState({
            currentView: 'edit',
            validation: new BalanceSheetDtoValidator(edited.data, false),
            error: null,
            edited: edited
        });
    }

    render() {
        return (
            <div>
                {this.renderMessage()}
                <Error error={this.state.error} qa="EventReconciliationError"/>
                {this.renderContent()}
            </div>
        );
    }

    renderContent() {
        switch (this.state.currentView) {
        case "view":
            return <ViewBalanceSheet
                balanceSheetUploaded={this.state.balanceSheetUploaded}
                balanceSheet={this.state.balanceSheet}
                onEdit={() => this.goToEditBalance()}
               
            />;
        case "edit":
            return <EditBalanceSheet
                balanceSheet={this.state.edited}
                event={this.props.event}
                counterpartyTypes={this.state.counterpartyTypes}
                validator={this.state.validation}
                onChange={(dto) => this.updateEditor((dto))}
                onCancel={() => this.goToView()}
                onSave={() => this.update()}
               
            />;
        }
    }

    private updateEditor(dto: Dtos.BalanceSheetDto) {
        this.setState({
            edited: new Pending(LoadingStatus.Done, dto),
            validation: new BalanceSheetDtoValidator(dto, this.state.validation.showValidationErrors())
        });
    }

    private update() {
        let newDto = this.state.edited.data;

        let validation = new BalanceSheetDtoValidator(newDto, true);

        if (validation.isValid()) {
            connect(new Apis.EventBalanceSheetApi().update(this.props.event.id, newDto), null, bs => {

                if (bs.state === LoadingStatus.Failed) {
                    //Set it to done as will redisplay grid
                    this.setState({ validation: validation, error: bs.error });
                }
                else if (bs.state === LoadingStatus.Done) {
                    this.setState({ balanceSheet: new Pending<Dtos.BalanceSheetDto>(), balanceSheetUploaded: true });
                    this.goToView("Balance Sheet updated successfully");
                    this.props.onBalanceSheetUpdated();
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

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }
}