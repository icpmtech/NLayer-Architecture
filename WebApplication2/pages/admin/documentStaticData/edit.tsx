import { DocumentStaticDataDtoValidator } from '../../../validators/documentStaticDataDtoValidator';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { DialogBuilder, Loader, Pending, FormBuilder, AppError } from "../../../classes";
import * as Form from '../../../components';

interface EditProps {
	canEditDocumentStaticData: boolean;
	document: Pending<Dtos.DocumentStaticDataDto>;
	validation: DocumentStaticDataDtoValidator;
	countries: Pending<Dtos.CountrySummaryDto[]>;
	documentTemplates: Pending<Dtos.DocumentTemplateDto[]>;
	documentCategories: Pending<Dtos.DocumentCategorySummaryDto[]>;
	onCancel: { (): void };
	onChange: (dto: Dtos.DocumentStaticDataDto) => void;
	onSave: { (): void };
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

export class Edit extends React.Component<EditProps, {}> {

	private confirmationPopup: DialogBuilder;

	private canFieldsBeEditedAsDocumentIsNotUsed(): boolean {
			// For reference sake (as I had to go figure this out), the canEditAllFields property is set to true if the document is not attached to any events
		if (this.props.canEditDocumentStaticData === true && this.props.document.data.canEditAllFields) {
			return true;
		}
		return false;
	}

	private canFieldsBeEditedIgnoringDocumentUsage(): boolean {
		// For reference sake (as I had to go figure this out), the canEditAllFields property is set to true if the document is not attached to any events
		// It has been requested that some fields are editable even if the document is used.
		if (this.props.canEditDocumentStaticData === true) {
			return true;
		}
		return false;
	}

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

		return Loader.for(combinedAll, p =>
			new FormBuilder(p.document)
				.isWide(true)
				.setChangeHandler(dto => this.props.onChange(dto))
				.withQA("Form")
				.addTextInput("Document Title", m => m.documentTitle, (m, v) => m.documentTitle = v, "DocumentTitleInput", this.props.validation.title)
				.addDropdown("Document Template", p.documentTemplates, m => this.getDocumentTemplateValue(p.documentTemplates, m), (m, v) => this.setDocumentTemplateValue(m, v), "DocumentTemplateInput", this.props.validation.documentTemplate)
				.addYesNo("Physical Required", m => m.physicalRequired, (m, v) => m.physicalRequired = v, "PhysicalRequiredInput", this.props.validation.physicalRequired)
				.addYesNo("System Generated Form", m => m.systemGeneratedForm, (m, v) => m.systemGeneratedForm = v, "SystemGeneratedFormInput", this.props.validation.systemGeneratedForm, { disabled: !this.canFieldsBeEditedAsDocumentIsNotUsed() })
				.addDropdown("Country of Issuance", p.countries, m => this.getCountryValue(p.countries, m), (m, v) => this.setCountryValue(m, v), "CountryOfIssuanceInput", this.props.validation.countryOfIssuance, { disabled: !this.canFieldsBeEditedIgnoringDocumentUsage() })
				.addDropdown("Document Applies To", appliesTo, m => this.getAppliesToValue(appliesTo, m), (m, v) => this.setAppliesToValue(m, v), "DocumentAppliesToInput", this.props.validation.appliesTo, { disabled: !this.canFieldsBeEditedIgnoringDocumentUsage() })
				.addContent(p.document.appliesTo === Dtos.DocumentAppliesLevel.EntityGroup ? <Form.Message message={"An entity group document will be generated. This includes beneficial owners whose entity type is in the rule the document is attached to and are in the same category as that rule."} allowClose={false} type={'info'} qa="EntityGroupDocumentWillBeGeneratedMessage"/> : null, "documentAppliesTo")
				.render()
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

	private showEditConfirmationPopup(hasEvents: boolean, hasCategories: boolean) {
		if (hasEvents || hasCategories) {
			this.confirmationPopup = new DialogBuilder();

			let message = !hasCategories ? <p>This document has already been associated with an event, any changes will only take effect from now and may impact live events.<br/>Are you sure you want to continue?</p>
			: !hasEvents ? <p>This document exists on a default category, any changes will only take effect from now.<br/>Are you sure you want to continue?</p>
			: <p>This document has already been associated with an event and exists on default categories, any changes will only take effect from now and may impact live events.<br/>Are you sure you want to continue?</p>

			this.confirmationPopup
				.setTitle("Save Document Static Data")
				.setMessage(message)
				.setConfirmHandler(() => this.props.onSave())
				.setCancelHandler(this.confirmationPopup.close)
				.withQA("SaveDocumentStaticDataPopup")
				.open();
		}
		else {
			this.props.onSave();
		}

	}

	private renderCategoriesList() {

		// Wait for all data to avoid page loading in at jagged intervals
		let documentCategories = Pending.combine(this.props.document, this.props.countries, this.props.documentTemplates, this.props.documentCategories,
			(document, countries, documentTemplates, documentCategories) => documentCategories);

		return Loader.for(documentCategories, docCategories => {
			if (!docCategories.length) return null;

			return <div className="document-categories-list" data-qa="DocumentCategoriesList">
				<p>This document has been added to the following default categories:</p>
				<ul>
					{docCategories.map((docCat, i) => <li key={i}><a href={`/categories/list/details#{"categoryId":${docCat.id}}`} target="_blank" data-qa={docCat.id + "Link"}>{docCat.description}</a></li>)}
				</ul>
			</div>
		}, null, () => null);
	}

	private renderButtons() {
		let dataLoading = this.props.document.isReady() && this.props.documentCategories.isReady();
		
		return (
			<div className="text-end">
				<button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
				<button className="btn btn-primary" disabled={!dataLoading} onClick={() => this.showEditConfirmationPopup(!this.props.document.data.canEditAllFields, !!this.props.documentCategories.data.length)} data-qa="SaveButton">Save</button>
			</div>
		);
	}

	private renderError() {
		return <Form.Error error={this.props.document.error} qa="EditDocumentStaticDataError"/>
	}

	render() {
		return (
			<div>
				{this.renderError()}
				{this.renderForm()}
				{this.renderCategoriesList()}
				{this.renderButtons()}
			</div>
		);
	}

}