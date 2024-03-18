import * as Validation from "./common";
import { PasswordValidator } from "./passwordValidator";
import { Dtos } from "../adr";

export class ChangePasswordDtoValidator extends Validation.Results<Dtos.ChangePasswordDto>{

    currentPassword = Validation.required(this, this.model.currentPassword, "Current Password is required");

    password = Validation.subValidation(this, new PasswordValidator(this.model.newPassword, this.showValidationErrors()), "New Password does not meet the password rules");

    passwordCheck = Validation.all(this,
        () => Validation.required(this, this.model.newPasswordCheck, "Password confirmation is required"),
        () => Validation.isTrue(this, this.model.newPassword === this.model.newPasswordCheck, "New Passwords must match")
    );
}