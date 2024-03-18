import { Dtos } from '../adr';
import * as Validation from './common';

export class SetSecurityQuestionDtoValidator extends Validation.Results<Dtos.SetSecurityQuestionDto> {

    securityAnswer = Validation.all(this,
        () => Validation.required(this, this.model.answer, "Security answer is required"),
        () => Validation.minLength(this, this.model.answer, 4),
        () => Validation.maxLength(this, this.model.answer, 50)
    );

    securityQuestion = Validation.required(this, this.model.question, "Security question  is required");
}
