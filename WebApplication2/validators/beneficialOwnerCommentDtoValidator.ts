import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class BeneficialOwnerCommentDtoValidator extends Validation.Results<Dtos.BeneficialOwnerCommentDto>{

    comment = Validation.all(this,
        () => Validation.required(this, this.model.comment, "A comment is required"),
        () => Validation.maxLength(this, this.model.comment, 300, "300 character max length")
    );
}