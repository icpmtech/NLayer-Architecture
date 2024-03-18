import * as Validation from "./common"
import { Dtos } from "../adr";
import { ParticipantPositionReason } from "../pages/participantPositions/reasonPopup";

export class ParticipantPositionReasonDtoValidator extends Validation.Results<ParticipantPositionReason> {

    reason = this.model.required ? Validation.all(this,
        () => Validation.required(this, this.model.reason, "Reason for Change is required"),
        () => Validation.maxLength(this, this.model.reason, 250, "Reason for Change can be a maximum of 250 characters")
    ) : Validation.valid(this);

    authoriser = this.model.required ? Validation.all(this,
        () => Validation.required(this, this.model.authoriser, "Authorizer of Change is required"),
        () => Validation.maxLength(this, this.model.authoriser, 50, "Authorizer of Change can be a maximum of 50 characters")
    ) : Validation.valid(this);
}
