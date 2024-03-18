import * as Validation from "./common"
import { Dtos } from "../adr";

export class CategoryDtoValidator extends Validation.Results<Dtos.CategoryDto>{

    countryOfIssuance = Validation.required(this, this.model.countryOfIssuance, "Country of issuance is required");
    description = Validation.required(this, this.model.description, "Description is required");
    filingMethod = Validation.required(this, this.model.filingMethod, "Filing method is required");
    notes = Validation.valid(this);
    reclaimRate = Validation.required(this, this.model.reclaimRate, "Reclaim rate is required");
    //This might be needed in the future but currently the rules are being validated before in inserting into the dto
    //so will be fine for now
    //rules = Validation.required(this, this.model.rules);
}
