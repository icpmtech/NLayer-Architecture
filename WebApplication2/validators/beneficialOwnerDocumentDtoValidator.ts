import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class BeneficialOwnerDocumentDtoValidator extends Validation.Results<Dtos.BeneficialOwnerDocumentsDto>{

    comment = Validation.all(this,
        () => Validation.required(this, this.model.comments, "Comment is required"),
        () => Validation.maxLength(this, this.model.comments, 300, "300 character max length")
    );
    
}