﻿import { Dtos } from '../adr';
import * as Validation from './common';

export class UserInvitationsDtoValidator extends Validation.Results<Dtos.UserInvitationsDto> {
    emails = Validation.requiredChild(this, this.model.emails, (m) => new EmailsValidator(m, this.showValidationErrors()));
}

export class EmailsValidator extends Validation.Results<string>
{
    email = Validation.all(this,
        () => Validation.required(this, this.model, "Email cannot be empty"),
        () => Validation.email(this, this.model)
    );
}