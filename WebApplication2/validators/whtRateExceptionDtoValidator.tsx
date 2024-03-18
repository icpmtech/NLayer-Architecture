import * as Validation from "./common"
import { Dtos } from "../adr";

export class WhtRateExceptionDtoValidator extends Validation.Results<Dtos.WhtRateExceptionDto> {
    constructor(model: Dtos.WhtRateExceptionDto, allExceptions: Dtos.WhtRateExceptionDto[], index:number, show: boolean) {
        super(model, show)
        //for each combination in the model see if any of the current exceptions hold same combination
        //1. Filter other exceptions (the model may be in the treaty already)
        let otherExceptions = allExceptions.filter((x, i) => i !== index);
        //2. get the exceptions with a matching stock and entity type and country of residence
        let dupeExceptions = otherExceptions.find(x => x.countries.some(y => model.countries.some(c => y.id === c.id || c.countryCode === "ALL") || y.countryCode === "ALL") && x.entityTypes.some(y => model.entityTypes.some(c => c.id == y.id)) && x.stockTypes.some(y => model.stockTypes.some(c => c.id == y.id)));
        let dupeCountries = dupeExceptions && dupeExceptions.countries.filter(x => model.countries.some(y => model.countries.some(c => y.id === c.id || c.countryCode === "ALL") || y.countryCode === "ALL")).map(x => x.countryName).join(", ");
        let dupeEntities = dupeExceptions && dupeExceptions.entityTypes.filter(x => model.entityTypes.some(y => x.id == y.id)).map(x => x.description).join(", ");
        let dupeStocks = dupeExceptions && dupeExceptions.stockTypes.filter(x => model.stockTypes.some(y => x.id == y.id)).map(x => x.name).join(", ");
        
        //validate the dupeException is null
        this.duplicate = Validation.isTrue(this, !dupeExceptions, `The combination '${dupeCountries}' - '${dupeEntities}' - '${dupeStocks}' is present in another exception`);
    }

    rate = this.model.exceptionType == Dtos.WhtRateExceptionType.Treaty ? Validation.required(this, this.model.rate, "Rate is required") : Validation.valid(this);
    reclaimRate = this.model.exceptionType == Dtos.WhtRateExceptionType.Reclaim ? Validation.required(this, this.model.reclaimRate, "Reclaim rate is required when using reclaim rate option") : Validation.valid(this);
    exceptionType = Validation.required(this, this.model.exceptionType, "Exception Type is required");
    narrative = Validation.maxLength(this, this.model.narative, 500, "500 characters maximum length");

    countries = Validation.all(this,
        () => Validation.required(this, this.model.countries, "At least one country is mandatory"),
        () => this.model.countries.some(x => x.countryCode === "ALL") ? Validation.exactArrayLength(this, this.model.countries, 1, "'All' must not be selected in conjunction with other countries") : Validation.valid(this));

    entityTypes = Validation.required(this, this.model.entityTypes, "At least one entity type is mandatory");
    stockTypes = Validation.required(this, this.model.stockTypes, "At least one stock type is mandatory");
    duplicate: Validation.Result;
}
