import * as Validation from "./common";

export class PasswordValidatorBase extends Validation.Results<string> {

    public helpers = {
        containsOneUppercase: (value: string) => { return !!value && value.match(/[A-Z]/) != null; },
        containsOneLowercase: (value: string) => { return !!value && value.match(/[a-z]/) != null; },
        containsOneNumber: (value: string) => { return !!value && value.match(/[0-9]/) != null; }
    }
  
    private countNumeric(value: string): number {
        var i = 0;
        var character = '';
        var count = 0;

        if (!value) return 0;

        while (i < value.length) {
            character = value[i];
            if (!isNaN(parseInt(character))) count++;
            i++;
        }

        return count;
    }
    private countUppercase(value: string): number {
        var i = 0;
        var character = '';
        var count = 0;

        if (!value) return 0;

        while (i < value.length) {
            character = value[i];
            if (character.match(/[A-Z]/)) count++;
            i++;
        }

        return count;
    }
    private countLowercase(value: string): number {
        var i = 0;
        var character = '';
        var count = 0;

        if (!value) return 0;

        while (i < value.length) {
            character = value[i];
            if (character.match(/[a-z]/)) count++;
            i++;
        }

        return count;
    }
}

export class PasswordNotRequiredValidator extends PasswordValidatorBase {
    required = Validation.valid(this);
    minLength = Validation.valid(this);
    hasUppercase = Validation.valid(this);
    hasLowercase = Validation.valid(this);
    hasNumber = Validation.valid(this);
}

export class PasswordValidator extends PasswordValidatorBase {
    required = Validation.required(this, this.model, "Password is required");
    minLength = Validation.minLength(this, this.model, 8, "Password must be at least 8 characters long");
    hasUppercase = Validation.isTrue(this, this.helpers.containsOneUppercase(this.model), "Password must contain at least one uppercase letter");
    hasLowercase = Validation.isTrue(this, this.helpers.containsOneLowercase(this.model), "Password must contain at least one lowercase letter");
    hasNumber = Validation.isTrue(this, this.helpers.containsOneNumber(this.model), "Password must contain at least one number");
}
