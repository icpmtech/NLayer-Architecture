import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';
import { RoundDtoValidator } from '../../validators/roundDtoValidator'

interface Props {
    eventId: number;
    event: Framework.Pending<Dtos.EventDto>;
    round: Framework.Pending<Dtos.RoundDto>;
    filingMethods: Framework.Pending<Dtos.FilingMethodDto[]>;
    paymentMethods: Framework.Pending<Dtos.PaymentMethodDto[]>;
    onCancel: { (): void };
    onSave: { (dto: Dtos.RoundDto): void };
    roundTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
}

interface State {
    editor?: Dtos.RoundDto;
    validation?: RoundDtoValidator;
    isDirty?: boolean;
}

export class Edit extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = this.getEditorState(props.round);;
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.round.isDone() && this.props.round.data != nextProps.round.data) {
            this.setState(this.getEditorState(nextProps.round));
        }
    }

    private getEditorState(round: Framework.Pending<Dtos.RoundDto>): State {
        if (round.isDone()) {
            let dto = round.data || { eventId: this.props.eventId } as Dtos.RoundDto;
            let editor = Framework.safeClone(dto);
            let validation = new RoundDtoValidator(editor, false);
            return { editor, validation, isDirty: false };
        }
        return { isDirty: false };
    }

    render() {
        let combined = Framework.Pending.combine(this.props.round, this.props.filingMethods, this.props.paymentMethods, this.props.roundTypes, this.props.event, (round, filingMethods, paymentMethods, roundTypes, event) => { return ({ round, filingMethods, paymentMethods, roundTypes, event }); });
        return (<div>
            {Framework.Loader.for(combined, x => this.renderForm(this.state.editor, x.filingMethods, x.paymentMethods, x.roundTypes))}
            <Components.AllDatesNY />
            {this.renderButtons()}
        </div>)
    }

    private renderForm(round: Dtos.RoundDto, filingMethods: Dtos.FilingMethodDto[], paymentMethods: Dtos.PaymentMethodDto[], roundTypes: Dtos.EnumDisplayDto[]) {
        let val = this.state.validation;
        let roundTypesMapped = roundTypes.map(x => { return { name: x.label, id: x.value } });
        if (this.props.event.data.eventType.id !== Dtos.EventType.CashAndStockOption) {
            round.roundType = this.props.event.data.eventType.id;
        }
        // Setting the default value for adrOrdRatioRounding to false, so the 'No' option is selected only when creating a round and NOT when editing 
        if (!round.adrOrdRatioRounding) {
            this.state.editor.adrOrdRatioRounding = false;
        }
        return new Framework.FormBuilder(round)
            .withQA(round.id ? "goal-round-edit": "goal-round-create")
            .isWide(true)
            .setChangeHandler((dto) => this.onChange(dto))
            .addDropdown("Filing Method", filingMethods, m => filingMethods.find(x => x.id == (m.filingMethod && m.filingMethod.id)), (m, v) => m.filingMethod = v, "FilingMethod", val.filingMethod)
            .addTextInput("Round Name", m => m.name, (m, v) => m.name = v, "RoundName", val.name)
            .addDropdown("Round Type", roundTypesMapped, m => roundTypesMapped.find(x => x.id === m.roundType), (m, v) => { m.roundType = v.id }, "RoundType", val.roundType, { disabled: this.props.event.data.eventType.id !== Dtos.EventType.CashAndStockOption })
            .addDateTime("Start Date and Time", m => m.start, (m, v) => m.start = v, "StartDateAndTime", val.start, {showInvalidFormatError: false})
            .addDateTime("Claim Submission Deadline Date and Time", m => m.claimSubmissionDeadline, (m, v) => m.claimSubmissionDeadline = v, "ClaimSubmissionDeadlineDateAndTime", val.claimSubmissionDeadline, { showInvalidFormatError: false })
            .addYesNo("DTCC Supported", m => m.dtccSupported, (m, v) => m.dtccSupported = v, "DtccSupported", val.dtccSupported)
            .addDateTime("CA Web Election Deadline Date and Time", m => m.caWebDeadline, (m, v) => m.caWebDeadline = v, "CaWebElectionDeadlineDateAndTime", val.caWebDeadline, { showInvalidFormatError: false })
            .addTextInput("Paying Party", m => m.payingAgent, (m, v) => m.payingAgent = v, "PayingParty", val.payingAgent)
            .addDropdown("Payment Method", paymentMethods, m => paymentMethods.find(x => x.id == (m.paymentMethod && m.paymentMethod.id)), (m, v) => m.paymentMethod = v, "PaymentMethod", val.paymentMethod)
            .addNumber("Minimum Charge per BO (USD)", x => x.minimumCharge, (m, v) => m.minimumCharge = v, "MinimumChargePerBOUSD", val.minimumCharge, { width: '230px' })
            .addNumber("Expected payment period (days)", m => m.expectedPaymentPeriod, (m, v) => m.expectedPaymentPeriod = v, "ExpectedPaymentPeriodDays", val.expectedPaymentPeriod, { width: '230px' })
            .addYesNo("ADR/ORD Ratio Rounding", m => m.adrOrdRatioRounding, (m, v) => m.adrOrdRatioRounding = v, "AdrORDRatioRounding", val.adrOrdRatioRounding)
            .addNumber("FX Rate", x => x.fxRate, (m, v) => m.fxRate = v, "FxRate", null, { width: '230px' })
            .addNumber("Custodial Fee Amount (curr)", x => x.custodialFeeAmountCurrency, (m, v) => m.custodialFeeAmountCurrency = v, "CustodialFeeAmount", null, { width: '230px' })
            .addNumber("Tax Relief Fee Rate", x => x.taxReliefFeeRate, (m, v) => m.taxReliefFeeRate = v, "TaxReliefFeeRate", val.taxReliefFeeRate, { width: '230px' })
            .render();
    }

    private renderButtons() {
        let disabled = !this.props.round.isDone();
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.confirmCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.onSave()} disabled={disabled} data-qa="SaveButton">Save</button>
            </div>
        );
    }

    private onChange(dto: Dtos.RoundDto) {
        let validation = new RoundDtoValidator(dto, this.state.validation.showValidationErrors());
        this.setState({ editor: dto, validation, isDirty: true});
    }

    private onSave() {
        let validator = new RoundDtoValidator(this.state.editor, true);
        if (validator.isValid()) {
            this.props.onSave(this.state.editor);
        }
        else {
            this.setState({ validation: validator });
        }
    }

    private confirmCancelDialog: Framework.DialogBuilder;
    private confirmCancel() {
        if (this.state && this.state.isDirty) {
            let message = <div>
                <p>You have unsaved changes, are you sure you want to cancel?</p>
            </div>;

            this.confirmCancelDialog = new Framework.DialogBuilder()
                .setMessage(message)
                .setConfirmHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                    this.props.onCancel();
                })
                .setCancelHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                })
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel();
        }
    }
}