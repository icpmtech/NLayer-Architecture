import * as Validation from "./common"
import { Dtos } from "../adr";
import { NewsSourceDtoValidator } from "./newsSourceDtoValidator";

export class NewsDtoValidator extends Validation.Results<Dtos.NewsDto>{

    reclaimMarket = Validation.required(this, this.model.reclaimMarket, "Reclaim market is required");
    effectiveDate = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.effectiveDate, "Effective date is required");
    content = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.newsContent, "News content is required");
    category = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.category, "Category is required");
    title = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.required(this, this.model.title, "Title is required");
    sources = this.model.status === Dtos.TrmEntityStatus.Draft ? Validation.valid(this) : Validation.requiredChild(this, this.model.sources, (e, i) => new NewsSourceDtoValidator(e, this.model.sources, i, this.showValidationErrors()));
}