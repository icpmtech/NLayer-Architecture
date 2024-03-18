import * as Validation from "./common"
import { Dtos } from "../adr";

export class EmailChangeRequestDtoValidator extends Validation.Results<Dtos.EmailChangeRequestDto>{
    approved = Validation.required(this, this.model.approved, "You must specify if the request is approved or rejected");
    reason = Validation.all(this,
        () => this.model.approved === false ? Validation.required(this, this.model.reason, "Reason is required") : Validation.valid(this)
    );
}