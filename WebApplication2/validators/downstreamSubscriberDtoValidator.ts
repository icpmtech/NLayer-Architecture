import * as Validation from "./common";
import { ParticipantDtoValidator, NotificationGroupValidator } from "./participantDtoValidator";
import { Dtos } from "../adr";

export class DownstreamSubscriberDtoValidator extends ParticipantDtoValidator {

    parent = Validation.required(this, this.model.parent, "Participant is required");

    dtcCode = Validation.all(this,
        () => Validation.required(this, this.model.dtcCode, "DS Code is required"),
        () => Validation.maxLength(this, this.model.dtcCode, 10),
        () => Validation.alphanumeric(this, this.model.dtcCode, "DS Code can only contain numbers and letters")
    );

    canViewDetails = Validation.required(this, this.model.canViewDetails, "Detail level is required");
    canManageClaims = Validation.required(this, this.model.canManageClaims, "Can Manage Claims is required");
    canCancelClaims = Validation.required(this, this.model.canCancelClaims, "Can Cancel Claims is required");
    
    parentNotificationGroupLength = Validation.all(this,
        () => Validation.isTrue(this, this.model.parentNotificationGroup.length <= 20, "A maximum of 20 emails can be set"),
        () => Validation.isTrue(this, this.model.parentNotificationGroup && this.model.parentNotificationGroup.length ?
            this.model.parentNotificationGroup.map(x => x.length).reduce((a, b) => a + b) <= 1000 : null, "Maximum of 1000 characters"));

    parentNotificationGroup = Validation.optionalChild(this, this.model.parentNotificationGroup, (m) => new NotificationGroupValidator(m, this.showValidationErrors()));
}