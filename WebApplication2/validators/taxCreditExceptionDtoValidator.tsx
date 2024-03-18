import * as Validation from "./common"
import { Dtos } from "../adr";

export class TaxCreditExceptionDtoValidator extends Validation.Results<Dtos.TaxCreditExceptionDto> {
    constructor(model: Dtos.TaxCreditExceptionDto, allExceptions: Dtos.TaxCreditExceptionDto[], index:number, show: boolean) {
        super(model, show)
        //for each combination in the model see if any of the current exceptions hold same combination
        //1. Filter other exceptions (the model may be in the tax credit already)
        let otherExceptions = allExceptions.filter((x, i) => i !== index);
        //2. get the first exception with a matching stock and entity type
        let dupeException = otherExceptions.find(x => model
            && model.entityType && x.entityType.id == model.entityType.id
            && model.stockType && x.stockType.id == model.stockType.id);
        //validate the dupeException is null
        this.duplicate = Validation.isTrue(this, !dupeException, `There is already an exception for this entity type and stock type`);
    }

    entityType = Validation.required(this, this.model.entityType, "Entity Type is required");
    stockType = Validation.required(this, this.model.stockType, "Stock Type is required");
    rate = Validation.required(this, this.model.rate, "Tax Credit Rate is required");
    narrative = Validation.maxLength(this, this.model.narrative, 500, "500 characters maximum length");
    duplicate: Validation.Result;
}
