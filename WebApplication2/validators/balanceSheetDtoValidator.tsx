import * as Validation from "./common"
import { Dtos } from "../adr";
import { CounterpartyDtoValidator } from "./counterpartyDtoValidator";

export class BalanceSheetDtoValidator extends Validation.Results<Dtos.BalanceSheetDto>{

    announcementDate = Validation.required(this, this.model.announcementDate, "Announcement Date is required");
    uniqueUniversalEventIdentifier = Validation.required(this, this.model.uniqueUniversalEventIdentifier, "Unique Universal Event Identifier is required");
    counterparties = Validation.optionalChild(this, this.model.counterparties, (e, i) => new CounterpartyDtoValidator(e, this.model.counterparties, i, this.showValidationErrors()));
}