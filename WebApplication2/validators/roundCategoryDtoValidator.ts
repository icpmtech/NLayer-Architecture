import * as Validation from "./common"
import { Dtos } from "../adr";

export class RoundCategoryDtoValidator extends Validation.Results<Dtos.RoundCategoryDto>
{
    constructor(model: Dtos.RoundCategoryDto, private existingCategories: Dtos.RoundCategorySummaryDto[], showValidationErrors: boolean) {
        super(model, showValidationErrors);
    }

    description = Validation.all(this,
        () => Validation.required(this, this.model.description, "Category Description is required"),
        () => Validation.maxLength(this, this.model.description, 36, "Category Description can be a maximum of 36 characters"),
        () => Validation.isFalse(this, (this.existingCategories || []).filter(x => x.id != this.model.id).some(x => x.description == this.model.description && x.categoryType == this.model.categoryType), "A Category of this Category Type already exists with this description and must be unique within a round")
    );

    hasCategoryAdrs = Validation.required(this, this.model.hasCategoryAdrs, "Category Elections must be specified");
    hasAdrLimit = Validation.required(this, this.model.includeInAdrLimit, "ADR Limit Inclusion must be specified");
    categoryType = Validation.required(this, this.model.categoryType, "Category Type is required");

    reclaimRatePercentage = Validation.all(this,
        () => Validation.required(this, this.model.reclaimRatePercentage, "Reclaim Rate is required"),
        () => Validation.isTrue(this, this.model.reclaimRatePercentage >= 0, "Please enter a valid reclaim rate")
    );

    taxReliefFeeRate = this.model.taxReliefFeeRate ? Validation.isTrue(this, this.model.taxReliefFeeRate < 100, "Rate must be less than 100") : Validation.valid(this);
}
