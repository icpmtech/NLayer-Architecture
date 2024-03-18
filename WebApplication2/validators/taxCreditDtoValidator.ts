import * as Validation from "./common"
import { Dtos } from "../adr";

export class TaxCreditDtoValidator extends Validation.Results<Dtos.TaxCreditDto>{
    reclaimMarket = Validation.required(this, this.model.reclaimMarket, "Reclaim Market is required");
    countryOfResidence = Validation.required(this, this.model.countryOfResidence, "Country of Residence is required");
    effectiveDate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.effectiveDate, "Effective Date is required");
    standardDividendRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.standardDividendRate, "Standard Dividend Rate is required");
    standardDividendRateNarrative = Validation.maxLength(this, this.model.standardDividendRateNarrative, 500, "500 characters maximum length");
    standardInterestRate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.standardInterestRate, "Standard Interest Rate is required");
    standardInterestRateNarrative = Validation.maxLength(this, this.model.standardInterestRateNarrative, 500, "500 characters maximum length");
}
