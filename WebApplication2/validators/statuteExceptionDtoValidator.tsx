import * as Validation from "./common"
import { Dtos } from "../adr";

export class StatuteExceptionDtoValidator extends Validation.Results<Dtos.StatuteExceptionDto> {
    constructor(model: Dtos.StatuteExceptionDto, allExceptions: Dtos.StatuteExceptionDto[], index:number, show: boolean) {
        super(model, show)
        //for each combination in the model see if any of the current exceptions hold same combination
        //1. Filter other exceptions (the model may be in the treaty already)
        let otherExceptions = allExceptions.filter((x, i) => i !== index);
        //2. get the first exception with a matching stock and entity type
        let dupeException = otherExceptions.find(x => model && model.countryOfResidence && x.countryOfResidence.id == model.countryOfResidence.id);
        //validate the dupeException is null
        this.duplicate = Validation.isTrue(this, !dupeException, `There is already an exception for this Country of Residence`);
    }

    countryOfResidence = Validation.required(this, this.model.countryOfResidence, "Country of Residence is required");
    qualifierType = Validation.required(this, this.model.qualifierType, "Qualifier Type is required");

    statuteOfLimitations = Validation.all(this,
        () => Validation.required(this, this.model.statuteOfLimitationsDays || this.model.statuteOfLimitationsMonths, "Statute of Limitations is required"),
        () => Validation.nonZeroNumber(this, this.model.statuteOfLimitationsDays || this.model.statuteOfLimitationsMonths, "Statute of Limitations is required"));

    qualifierDate = this.model.qualifierType === Dtos.StatuteQualifierType.FromDateAfterPayDate
        ? Validation.all(this,
            () => Validation.required(this, this.model.qualifierMonth, "Qualifier Date is required"),
            () => Validation.required(this, this.model.qualifierDay, "Qualifier Date is required"),
            () => Validation.nonZeroNumber(this, this.model.qualifierMonth, "Qualifier Date is required"),
            () => Validation.nonZeroNumber(this, this.model.qualifierDay, "Qualifier Date is required"))
        : Validation.valid(this);

    duplicate: Validation.Result;
}