import * as Validation from "./common"
import { Dtos } from "../adr";

export class TrmRateToolValidator extends Validation.Results<Dtos.GetRatesForCountriesQuery> {
    constructor(model: Dtos.GetRatesForCountriesQuery, showValidationErrors: boolean) {
        super(model, showValidationErrors);
    }

    reclaimMarket = Validation.required(this, this.model.reclaimMarketId, "Reclaim Market is required");
    countryOfResidence = Validation.required(this, this.model.countryOfResidenceId, "Country of Residence is required");
    date = Validation.required(this, this.model.date, "Date is required");
}