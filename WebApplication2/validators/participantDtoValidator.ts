import * as Validation from "./common"
import { Dtos } from "../adr";

export class ParticipantDtoValidator extends Validation.Results<Dtos.ParticipantDto>{

    dtcCode = Validation.all(this,
        () => Validation.required(this, this.model.dtcCode, "DTC Code is required"),
        () => Validation.maxLength(this, this.model.dtcCode, 10),
        () => Validation.alphanumeric(this, this.model.dtcCode, "DTC Code can only contain numbers and letters")
    );

    name = Validation.all(this,
        () => Validation.required(this, this.model.name, "Name is required"),
        () => Validation.maxLength(this, this.model.name, 200)
    );

    parent = Validation.valid(this);

    address1 = Validation.maxLength(this, this.model.address1, 35);

    address2 = Validation.maxLength(this, this.model.address2, 35);

    address3 = Validation.maxLength(this, this.model.address3, 35);

    city = Validation.maxLength(this, this.model.city, 35);

    state = Validation.maxLength(this, this.model.state, 35);

    postCode = Validation.maxLength(this, this.model.postCode, 20);

    telephoneNumber = Validation.maxLength(this, this.model.telephoneNumber, 40);

    contactName = Validation.maxLength(this, this.model.contactName, 100);

    contactEmail = Validation.all(this,
        () => Validation.maxLength(this, this.model.contactEmail, 200),
        () => Validation.email(this, this.model.contactEmail)
    );

    notificationGroupLength = Validation.all(this,
        () => Validation.isTrue(this, this.model.notificationGroup.length <= 20, "A maximum of 20 emails can be set"),
        () => Validation.isTrue(this, this.model.notificationGroup && this.model.notificationGroup.length ?
            this.model.notificationGroup.map(x => x.length).reduce((a, b) => a + b) <= 1000 : null, "Maximum of 1000 characters"));

    notificationGroup = Validation.optionalChild(this, this.model.notificationGroup, (m) => new NotificationGroupValidator(m, this.showValidationErrors()));
}

export class NotificationGroupValidator extends Validation.Results<string>
{
    email = Validation.all(this,
        () => Validation.isTrue(this, !!this.model, "Email cannot be empty"),
        () => Validation.email(this, this.model)
    )
}