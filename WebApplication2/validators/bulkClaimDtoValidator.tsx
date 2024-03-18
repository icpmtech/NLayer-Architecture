import * as Validation from "./common"
import { Dtos } from "../adr";

export class BulkClaimDtoValidator extends Validation.Results<Dtos.BulkClaimDto>{

    constructor(model: Dtos.BulkClaimDto, private isGoalUser: boolean, showValidationErrors: boolean) {
        super(model, showValidationErrors);
    }

    countryOfIssuance = Validation.required(this, this.model.countryOfIssuance, "Country of Issuance is required");
    date = Validation.required(this, this.model.date, "Adr Record Date is required");
    filingMethod = Validation.required(this, this.model.roundType, "Round Type is required");
    participant = this.isGoalUser ? Validation.required(this, this.model.participantId, "Participant is required") : Validation.valid(this);
}
