import * as Validation from "./common"
import { Dtos } from "../adr";
import { TreatyExceptionDtoValidator } from './treatyExceptionDtoValidator';

export class TreatyDtoValidator extends Validation.Results<Dtos.TreatyDto>{

    treatyType = Validation.required(this, this.model.treatyType, "Treaty Type is required");
    reclaimMarket = Validation.required(this, this.model.reclaimMarket, "Reclaim Market is required");
    countryOfResidence = Validation.required(this, this.model.countryOfResidence, "Country of Residence is required");
    effectiveDate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.effectiveDate, "Effective Date is required");
    standardDividendRateNarrative = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.maxLength(this, this.model.standardDividendRateNarrative, 500, "500 characters maximum length");
    standardInterestRateNarrative = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.maxLength(this, this.model.standardInterestRateNarrative, 500, "500 characters maximum length");
    exceptions = Validation.optionalChild(this, this.model.exceptions, (e, i) => new TreatyExceptionDtoValidator(e, this.model.exceptions, i, this.showValidationErrors()));
    standardDividendRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.standardDividendRate, "Standard Dividend Rate is required");
    standardInterestRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.standardInterestRate, "Standard Interest Rate is required");
}
