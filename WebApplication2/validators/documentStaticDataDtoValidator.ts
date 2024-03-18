import * as Validation from "../validators/common"
import { Dtos } from "../adr";

export class DocumentStaticDataDtoValidator extends Validation.Results<Dtos.DocumentStaticDataDto>{

	constructor(model: Dtos.DocumentStaticDataDto, showValidationErrors: boolean) {
		super(model, showValidationErrors);

		this.documentTemplate = Validation.all(this, 
			() => Validation.required(this, this.model.documentTemplate, "Document template is required"),
			() => Validation.isTrue(this, !!this.model.documentTemplate.name.replace(' ', '').length, "Document template is required"), // Ensure template does not consist only of spaces
			() => Validation.isFalse(this, this.model.documentTemplate.name === "n/a", "Document template is required")
		);
	}

	title = Validation.required(this, this.model.documentTitle, "Document title is required");

	documentTemplate: Validation.Result;

	countryOfIssuance = Validation.required(this, this.model.countryOfIssuance, "Country of Issuance Required");

	appliesTo = Validation.required(this, this.model.appliesTo, "Document Applies To is required");

	physicalRequired = Validation.required(this, this.model.physicalRequired, "Required");

	systemGeneratedForm = Validation.required(this, this.model.systemGeneratedForm, "Required");
}