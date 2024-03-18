import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class ChangeEventStatusDtoValidator extends Validation.Results<Dtos.ChangeEventStatusDto>{

    constructor(model: Dtos.ChangeEventStatusDto, showValidationErrors: boolean){
        super(model, showValidationErrors);

        if(this.model.eventStatus === Dtos.EventStatusLookup_Status.Canceled || this.model.eventStatus === Dtos.EventStatusLookup_Status.Unavailable)
        {
            this.comment = Validation.all(this,
                () => Validation.required(this, this.model.comment, "Comment is required"),
                () => Validation.maxLength(this, this.model.comment, 300)
            );
        }
        else
        {
            this.comment = Validation.maxLength(this, this.model.comment, 300);
        }
    }

    status =  Validation.required(this, this.model.eventStatus, "Status is required");
    comment: Validation.Result;
}