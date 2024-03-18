import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class UpdateClaimStatusDtoValidator extends Validation.Results<Dtos.BenownerUpdateStatusByIdsDto>{

    constructor(model: Dtos.BenownerUpdateStatusByIdsDto, showValidationErrors: boolean){
        super(model, showValidationErrors);

        if(this.model.benownerClaimStatusId === Dtos.BeneficialOwnerClaimStatus.Rejected || this.model.benownerClaimStatusId === Dtos.BeneficialOwnerClaimStatus.OnHold)
        {
            this.comment = Validation.all(this,
                () => Validation.required(this, this.model.benownerClaimStatusComment, "Comment is required"),
                () => Validation.maxLength(this, this.model.benownerClaimStatusComment, 300, "Comments should have a maximum of 300 characters")
            );
        }
        else
        {
            this.comment = Validation.maxLength(this, this.model.benownerClaimStatusComment, 300, "Comments should have a maximum of 300 characters");
        }
    }

    status =  Validation.required(this, this.model.benownerClaimStatusId, "Please select a status");
    comment: Validation.Result;
}