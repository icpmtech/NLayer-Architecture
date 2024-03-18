import * as Validation from "./common"
import { Dtos } from "../adr";

export class RoundDtoValidator extends Validation.Results<Dtos.RoundDto>{
    constructor(model: Dtos.RoundDto, showValidationErrors: boolean) {
        super(model, showValidationErrors);
    }

    dtccSupported = Validation.required(this, this.model.dtccSupported, "DTCC Supported is required");
    adrOrdRatioRounding = Validation.required(this, this.model.adrOrdRatioRounding, "ADR/ORD Ratio Rounding is required");
    payingAgent = Validation.required(this, this.model.payingAgent, "Paying Agent is required");
    paymentMethod = Validation.required(this, this.model.paymentMethod, "Payment Method is required");
    minimumCharge = Validation.required(this, this.model.minimumCharge, "Minimum Charge is required");
    expectedPaymentPeriod = Validation.valid(this);
    eventId = Validation.required(this, this.model.eventId, "Event is required");
    filingMethod = Validation.required(this, this.model.filingMethod, "Filing Method is required");
    name = Validation.required(this, this.model.name, "Round Name is required");
    roundType = Validation.required(this, this.model.roundType, "Round Type is required");

    start = Validation.all(this,
        () => Validation.required(this, this.model.start, "Start Time is required"),
        () => Validation.isDate(this, this.model.start),
        () => Validation.isTrue(this, this.model.start.getMinutes() % 30 === 0, "Start Time must be on the hour or half-hour")
    );

    caWebDeadline = Validation.all(this,
        () => this.model.dtccSupported ? Validation.required(this, this.model.caWebDeadline, "Web CA Deadline is required if DTCC is supported") : Validation.valid(this),
        () => Validation.isDate(this, this.model.caWebDeadline),
        () => Validation.isTrue(this, !this.model.caWebDeadline || (this.model.caWebDeadline > this.model.start), "Web CA Deadline must be after the Start Time")
    );

    claimSubmissionDeadline = Validation.all(this,
        () => Validation.required(this, this.model.claimSubmissionDeadline, "Claim Submission Deadline is required"),
        () => Validation.isDate(this, this.model.claimSubmissionDeadline)
    );

    taxReliefFeeRate = this.model.taxReliefFeeRate ? Validation.isTrue(this, this.model.taxReliefFeeRate < 100, "Rate must be less than 100") : Validation.valid(this);}