import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { DateTime } from '../../../components/stateless/datetime';
import { DialogBuilder, Pending, Loader, FormBuilder, LoadingStatus } from '../../../classes';
import { Audit } from '../../../components/audit';

interface DetailsProps {
	canEditDocumentStaticData: boolean;
	countries: Pending<Dtos.CountrySummaryDto[]>;
	document: Pending<Dtos.DocumentStaticDataDto>;
	onBack: () => void;
	onDelete: (id: number) => void;
	onEdit: (id: number) => void;
}

export class Details extends React.Component<DetailsProps, {}> {

	private confirmationPopup: DialogBuilder;

	private canDocumentBeDeleted(): boolean {
		if (this.props.canEditDocumentStaticData === true && !this.props.document.data.isUsed) {
			return true;
		}
		return false;
	}

	private showDeleteConfirmationPopup() {
		this.confirmationPopup = new DialogBuilder();
		this.confirmationPopup
			.setTitle("Delete Document Static Data")
			.setMessage(`Are you sure you want to delete the document with title ${this.props.document.data.documentTitle}?`)
			.setConfirmHandler(() => this.props.onDelete(this.props.document.data.id))
			.setCancelHandler(this.confirmationPopup.close)
			.withQA("DeleteConfirmationDialog")
			.open();
	}

	private renderform(document: Dtos.DocumentStaticDataDto) {
		var form = new FormBuilder(document)
			.isDisabled(true)
			.isWide(true)
			.withQA("Form")
			.addTextInput("Document Title:", m => m.documentTitle, (m, v) => null, "DocumentTitle")
			.addTextInput("Document Template:", m => m.documentTemplate.name, (m, v) => null, "DocumentTemplate", null, null, true)
			.addYesNo("Physical Required:", m => m.physicalRequired, () => null, "PhysicalRequiredInput",null)
			.addYesNo("System Generated Form:", m => m.systemGeneratedForm, () => null, "SystemGeneratedForm", null)
			.addTextInput("Country of Issuance:", m => m.countryOfIssuance.countryName, (m, v) => null, "CountryOfIssuance")
			.addTextInput("Applies To:", (m) => m.appliesToName, (m, v) => null, "AppliesTo");

		return form.render();
	}

	private renderAudit(document: Dtos.DocumentStaticDataDto) {
		if (!this.props.document.data) return null;
		return <Audit auditableEntity={this.props.document.data}/>
	}

	private renderAuditWithoutUpdatedByFields(document: Dtos.DocumentStaticDataDto): JSX.Element {
		return (
			<fieldset className="form-horizontal">
				<div className="col-md-12 offset-md-1">
					<p className="block text-muted" data-qa="CreatedBy">Created By : {document.createdBy}</p>
					<p className="block text-muted" data-qa="CreatedOn">Created On : <DateTime date={document.createdOn} data-qa="DateTime"qa="CreatedOnDateTime"/></p>
				</div>
			</fieldset>
		);
	}

	private renderBackButton(): JSX.Element {
		return <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
	}

	private renderDeleteButton(): JSX.Element {
		return <button className="btn btn-primary" disabled={!this.canDocumentBeDeleted()} onClick={() => this.showDeleteConfirmationPopup()} data-qa="DeleteButton">Delete</button>
	}

	private renderEditButton(): JSX.Element {
		if (this.props.canEditDocumentStaticData) {
			return <button className="btn btn-primary" onClick={() => this.props.onEdit(this.props.document.data.id)} data-qa="EditButton">Edit</button>
		}
		return null;
	}

	render() {
		return Loader.for(this.props.document, document =>
			<div>
				{this.renderform(document)}
				{this.renderAudit(document)}
				<div className="text-end" data-qa="Buttons">
					{this.renderBackButton()}
					{this.renderDeleteButton()}
					{this.renderEditButton()}
				</div>
			</div>
		);
	}
}