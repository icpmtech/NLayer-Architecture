import * as Validation from "./common"
import { Dtos } from "../adr";
import { WhtRateExceptionDtoValidator } from "./whtRateExceptionDtoValidator";

export class WhtRateDtoValidator extends Validation.Results<Dtos.WhtRateDto>{

    reclaimMarket = Validation.required(this, this.model.reclaimMarket, "Reclaim Market is required");
    effectiveDate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.effectiveDate, "Effective date is required");
    dividendRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.dividendRate, "Dividend rate is required");
    interestRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.interestRate, "Interest rate is required");
    narative = Validation.valid(this);
    exceptions = Validation.optionalChild(this, this.model.exceptions, (e, i) => new WhtRateExceptionDtoValidator(e, this.model.exceptions, i, this.showValidationErrors()));
}