import * as Validation from "./common"
import { Dtos } from "../adr";

export class CounterpartyDtoValidator extends Validation.Results<Dtos.BalanceSheetCounterpartyDto> {
    constructor(model: Dtos.BalanceSheetCounterpartyDto, allCounterparties: Dtos.BalanceSheetCounterpartyDto[], index: number, show: boolean) {
        super(model, show)
        //for each combination in the model see if any of the current exceptions hold same combination
        //1. Filter other exceptions (the model may be in the treaty already)
        //let otherCounterparties = allCounterparties.filter((x, i) => i !== index);
        //2. get the first exception with a matching stock and entity type
        //let dupeException = otherCounterparties.find(x => model && model.entityType && x.entityType.id == model.entityType.id && model.stockType && x.stockType.id == model.stockType.id);
        //validate the dupeException is null
        //this.duplicate = Validation.isTrue(this, !dupeException, `There is already an exception for this entity type and stock type`);
    }

    name = Validation.required(this, this.model.name, "Counterparty Name is required");
    type  = Validation.required(this, this.model.type, "Counterparty Type is required");
    rate = Validation.required(this, this.model.adrs, "ADR Balance is required");

    duplicate: Validation.Result;
}
