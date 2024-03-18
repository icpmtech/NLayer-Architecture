import { DocumentStaticDataDtoValidator } from '../../../validators/documentStaticDataDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { Loader, Pending, FormBuilder, AppError } from "../../../classes";
import * as Form from '../../../components';

interface CreateProps {
	document: Pending<Dtos.DocumentStaticDataDto>;
	validation: DocumentStaticDataDtoValidator;
	countries: Pending<Dtos.CountrySummaryDto[]>;
	documentTemplates: Pending<Dtos.DocumentTemplateDto[]>;
	onCancel: () => void;
	onChange: (dto: Dtos.DocumentStaticDataDto) => void;
	onSave: { (inviteUser: boolean): void };
}

interface CountryDropDown {
	name: string;
	id: number;
	code: string;
}

interface DocumentTemplateDropDown {
	name: string;
}

interface AppliesToDropDown {
	name: string;
	id: number;
}

export class Create extends React.Component<CreateProps, {}> {

	private renderForm() {
		let appliesTo: AppliesToDropDown[] = [{ name: "Each Beneficial Owner", id: Dtos.DocumentAppliesLevel.BeneficialOwner }, { name: "Batch Claim", id: Dtos.DocumentAppliesLevel.BatchClaim }, { name: "Entity Group", id: Dtos.DocumentAppliesLevel.EntityGroup }];
		let countriesForDropdown: Pending<CountryDropDown[]> = this.props.countries.map(countries =>
			countries.map(country => ({ name: country.countryName, id: country.id, code: country.countryCode }))
		);
		let documentTemplatesForDropdown: Pending<DocumentTemplateDropDown[]> = this.props.documentTemplates.map(templates =>
			templates.map(template => ({ name: template.name }))
		);

		let combinedAll = Pending.combine(this.props.document, countriesForDropdown, documentTemplatesForDropdown,
			(document, countries, documentTemplates) => { return { document, countries, documentTemplates }; });

		return Loader.for(combinedAll, p => {

			var form = new FormBuilder(p.document)
				.isWide(true)
				.setChangeHandler(dto => this.props.onChange(dto))
				.withQA("Form")
				.addTextInput("Document Title", m => m.documentTitle, (m, v) => m.documentTitle = v, "DocumentTitleInput", this.props.validation.title)
				.addDropdown("Document Template", p.documentTemplates, m => this.getDocumentTemplateValue(p.documentTemplates, m), (m, v) => this.setDocumentTemplateValue(m, v), "DocumentTemplateInput", this.props.validation.documentTemplate, null, true)
				.addYesNo("Physical Required", m => m.physicalRequired, (m, v) => m.physicalRequired = v, "PhysicalRequiredInput", this.props.validation.physicalRequired)
				.addYesNo("System Generated Form", m => m.systemGeneratedForm, (m, v) => m.systemGeneratedForm = v, "SystemGeneratedFormInput", this.props.validation.systemGeneratedForm)
				.addDropdown("Country of Issuance", p.countries, m => this.getCountryValue(p.countries, m), (m, v) => this.setCountryValue(m, v), "CountryOfIssuanceInput", this.props.validation.countryOfIssuance)
				.addDropdown("Document Applies To", appliesTo, m => this.getAppliesToValue(appliesTo, m), (m, v) => this.setAppliesToValue(m, v), "DocumentAppliesToInput", this.props.validation.appliesTo)
				.addContent(p.document.appliesTo === Dtos.DocumentAppliesLevel.EntityGroup ? <Form.Message message={"An entity group document will be generated. This includes beneficial owners whose entity type is in the rule the document is attached to and are in the same category as that rule."} allowClose={false} type={'info'} qa="EntityGroupDocumentWillBeGeneratedMessage"/> : null, "documentAppliesTo");
			return form.render();
			}
		);
	}


	private getCountryValue = (countries: CountryDropDown[], model: Dtos.DocumentStaticDataDto) => {
		return countries.find(country => country.id === (model.countryOfIssuance && model.countryOfIssuance.id));
	}

	private setCountryValue(model: Dtos.DocumentStaticDataDto, country: CountryDropDown) {
		return model.countryOfIssuance = country && this.props.countries.data.find(x => x.id === country.id);
	}

	private getDocumentTemplateValue = (documentTemplates: DocumentTemplateDropDown[], model: Dtos.DocumentStaticDataDto) => {
		return (model.documentTemplate == null) ? null : documentTemplates.find(template => template.name === model.documentTemplate.name);
	}

	private setDocumentTemplateValue(model: Dtos.DocumentStaticDataDto, documentTemplate: DocumentTemplateDropDown) {
		return model.documentTemplate = documentTemplate && this.props.documentTemplates.data.find(x => x.name === documentTemplate.name);
	}

	private getAppliesToValue = (appliesTo: AppliesToDropDown[], model: Dtos.DocumentStaticDataDto) => {
		return appliesTo.find(x => x.id === model.appliesTo);
	}

	private setAppliesToValue = (model: Dtos.DocumentStaticDataDto, apliesTo: AppliesToDropDown) => {
		return model.appliesTo = apliesTo ? apliesTo.id : null;
	}

	private renderButtons() {
		return (
			<div className="text-end">
				<button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
				<button className="btn btn-primary" onClick={() => this.props.onSave(false)} data-qa="SaveButton">Save</button>
			</div>
		);
	}

	private renderError() {
		return <Form.Error error={this.props.document.error} qa="CreateDocumentStaticDataError"/>
	}

	render() {
		return (
			<div>
				{this.renderError()}
				{this.renderForm()}
				{this.renderButtons()}
			</div>
		);
	}

}