import * as Validation from "./common"
import { Dtos } from "../adr";


export class UserDtoValidator extends Validation.Results<Dtos.UserDetailsDto>{
    firstName = Validation.all(this,
        () => Validation.required(this, this.model.firstName, "First name is required"),
        () => Validation.maxLength(this, this.model.firstName, 40)
    );

    lastName = Validation.all(this,
        () => Validation.required(this, this.model.lastName, "Last name is required"),
        () => Validation.maxLength(this, this.model.lastName, 40)
    );

    telephoneNumber = Validation.all(this,
        () => Validation.required(this, this.model.telephoneNumber, "Contact number is required"),
        () => Validation.maxLength(this, this.model.telephoneNumber, 40)
    );
}
