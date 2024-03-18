import * as Validation from "./common"
import { Dtos } from "../adr";

export class CreateEmailChangeRequestDtoValidator extends Validation.Results<Dtos.CreateEmailChangeRequestDto> {
    constructor(model: Dtos.CreateEmailChangeRequestDto, private existingEmail: string, showValidationErrors: boolean) {
        super(model, showValidationErrors);
    }

    userId = Validation.required(this, this.model.userId);

    newEmail = Validation.all(this,
        () => Validation.required(this, this.model.newEmail, "New email is required"),
        () => Validation.email(this, this.model.newEmail),
        () => Validation.isFalse(this, this.model.newEmail === this.existingEmail, `Email address is already ${this.existingEmail}`)
    );
}