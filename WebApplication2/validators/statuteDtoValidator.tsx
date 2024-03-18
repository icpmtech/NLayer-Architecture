import * as Validation from "./common"
import { Dtos } from "../adr";
import { StatuteExceptionDtoValidator } from "./statuteExceptionDtoValidator";

export class StatuteDtoValidator extends Validation.Results<Dtos.StatuteDto> {

    constructor(model: Dtos.StatuteDto, show: boolean) {
        super(model, show);        
    }

    reclaimMarket = Validation.required(this, this.model.reclaimMarket, "Reclaim Market is required");
    effectiveDate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.effectiveDate, "Effective Date is required");
    qualifierType = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.qualifierType, "Qualifier Type is required");

    statuteOfLimitations = this.model.status === Dtos.TrmEntityStatus.Draft
        ? Validation.valid(this)
        : Validation.all(this,
            () => Validation.required(this, this.model.statuteOfLimitationsDays || this.model.statuteOfLimitationsMonths, "Statute of Limitations is required"),
            () => Validation.nonZeroNumber(this, this.model.statuteOfLimitationsDays || this.model.statuteOfLimitationsMonths, "Statute of Limitations is required")
        );

    qualifierDate = this.model.qualifierType === Dtos.StatuteQualifierType.FromDateAfterPayDate
        ? Validation.all(this,
            () => Validation.required(this, this.model.qualifierMonth, "Qualifier Date is required"),
            () => Validation.required(this, this.model.qualifierDay, "Qualifier Date is required"),
            () => Validation.nonZeroNumber(this, this.model.qualifierMonth, "Qualifier Date is required"),
            () => Validation.nonZeroNumber(this, this.model.qualifierDay, "Qualifier Date is required"))
        : Validation.valid(this);

    exceptions = Validation.optionalChild(this, this.model.exceptions, (e, i) => new StatuteExceptionDtoValidator(e, this.model.exceptions, i, this.showValidationErrors()));
}