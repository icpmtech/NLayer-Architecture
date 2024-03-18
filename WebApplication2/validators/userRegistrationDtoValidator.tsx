import * as Validation from "./common";
import { PasswordValidator, PasswordNotRequiredValidator } from "./passwordValidator";
import { Dtos } from "../adr";

export class UserRegistrationDtoValidator extends Validation.Results<Dtos.UserRegistrationDetailsDto>{
    email = Validation.required(this, this.model.email, "Email is required");

    password = Validation.subValidation(this, this.model.isExistingUser ? new PasswordNotRequiredValidator(this.model.password, false) : new PasswordValidator(this.model.password, this.showValidationErrors()),
        this.model.isExistingUser ? "Password is required" : "Password does dont meet the password rules");

    passwordCheck = this.model.isExistingUser ? Validation.valid(this) : Validation.all(this,
        () => Validation.required(this, this.model.passwordCheck, "Password confirmation is required"),
        () => Validation.isTrue(this, this.model.password === this.model.passwordCheck, "Passwords must match")
    );

    firstName = this.model.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.firstName, "First name is required");

    lastName = this.model.isExistingUser ? Validation.valid(this) : Validation.required(this, this.model.surname, "Last name is required");

    contactNumber = this.model.isExistingUser ? Validation.valid(this) : Validation.all(this,
        () => Validation.required(this, this.model.contactNumber, "Contact number is required"),
    );

    termsAndConditions = Validation.all(this,
        () => Validation.required(this, this.model.termsAndConditions, ""),
        () => Validation.isTrue(this, this.model.termsAndConditions, "You must accept the terms & conditions")
    );
    privacyAndLegalInfo = Validation.all(this,
        () => Validation.required(this, this.model.privacyAndLegalInformation, ""),
        () => Validation.isTrue(this, this.model.privacyAndLegalInformation, "You must accept the privacy & legal information"),
    );
}