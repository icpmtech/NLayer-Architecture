import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class BenOwnerUpdateStatusDtoValidator extends Validation.Results<Dtos.BenownerUpdateStatusInClaimDto>{

    constructor(model: Dtos.BenownerUpdateStatusInClaimDto, showValidationErrors: boolean) {
        super(model, showValidationErrors);

        if (this.model.toStatusId === Dtos.BeneficialOwnerClaimStatus.Rejected || this.model.toStatusId === Dtos.BeneficialOwnerClaimStatus.OnHold) {
            this.comment = Validation.all(this,
                () => Validation.required(this, this.model.benownerClaimStatusComment, "Comment is required"),
                () => Validation.maxLength(this, this.model.benownerClaimStatusComment, 300)
            );
        }
        else {
            this.comment = Validation.maxLength(this, this.model.benownerClaimStatusComment, 300);
        }
    }
    fromStatusIds = Validation.required(this, this.model.fromStatusIds, "At least one selection is required")
    status = Validation.required(this, this.model.toStatusId, "Status is required");
    comment: Validation.Result;
}