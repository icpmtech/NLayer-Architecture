import * as Validation from "./common"
import { Dtos } from "../adr";

export class NewsSourceDtoValidator extends Validation.Results<Dtos.NewsSourceDto> {
    constructor(model: Dtos.NewsSourceDto, allExceptions: Dtos.NewsSourceDto[], index:number, show: boolean) {
        super(model, show)
    }

    name = Validation.required(this, this.model.name, "Name is required");
    date = Validation.required(this, this.model.date, "Date is required");
}
