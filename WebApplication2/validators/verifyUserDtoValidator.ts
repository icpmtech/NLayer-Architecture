import * as Validation from "./common"
import { Dtos } from "../adr";

export class VerifyUserDtoValidator extends Validation.Results<Dtos.VerifyUserDto>{
    constructor(model: Dtos.VerifyUserDto, private isRejecting: boolean, showValidationErrors : boolean) {
        super(model, showValidationErrors);
    }

    reason = this.isRejecting ? Validation.required(this, this.model.reason, "A reason for rejection is required") : Validation.valid(this);
    groupId = !this.isRejecting ? Validation.required(this, this.model.groupId, "A role must be selected") : Validation.valid(this);
}