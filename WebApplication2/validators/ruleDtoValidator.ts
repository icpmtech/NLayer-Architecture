import * as Validation from "./common"
import { Dtos } from "../adr";

import {ruleDto} from '../pages/admin/categories/page';

export class RuleDtoValidator extends Validation.Results<Dtos.DocumentRuleDto>{ //use appropriate DTO when ready
    constructor(model: Dtos.DocumentRuleDto, allRules: Dtos.DocumentRuleDto[], ruleIndex:number, show: boolean) {
        super(model, show)
        //for each combination in the model see if any of the current rules hold same combination
        //1. Filter other ruies (the model may be in the category already)
        let otherRules = allRules.filter((x, i) => i !== ruleIndex);
        //2. get the first rule with a county and a entity in the model
        let dupeRule = otherRules.find(x => x.countries.some(y => model.countries.some(c => y.id === c.id)) && x.entities.some(y => model.entities.some(c => c.id == y.id)));
        //3.if there is a dupe then find dupe countires and dupe entities
        let dupeCountries = dupeRule && dupeRule.countries.filter(x => model.countries.some(y => x.id == y.id)).map(x => x.countryName).join(", ");
        let dupeEnties = dupeRule && dupeRule.entities.filter(x => model.entities.some(y => x.id == y.id)).map(x => x.description).join(", ");

        //valddate the first dupe is null
        this.duplicate = Validation.isTrue(this, !dupeRule, `The combination '${dupeCountries}' - '${dupeEnties}' is present in another rule in the category`);

    }

    countries = Validation.required(this, this.model.countries, "At least one country of residence is mandatory");
    entities = Validation.required(this, this.model.entities, "At least one entity type is mandatory");
    documents = Validation.valid(this);
    duplicate: Validation.Result;
}
