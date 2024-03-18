import * as React from 'react';
import { Pending, Loader, SimpleGridBuilder, DialogBuilder } from '../../../classes';
import { BatchClaimDocumentLink } from '../../../components/gridRowActions/batchClaimDocumentLink';
import { Dtos } from '../../../adr/';

interface BatchClaimGeneratedDocsProps {
    documents: Pending<Dtos.BatchClaimDocumentDto[]>;
    documentErrors: Pending<Dtos.BatchClaimDocumentErrorDto[]>;
    documentTemplateErrors: Pending<Dtos.BatchClaimDocumentTemplateErrorDto[]>;
    documentStatusId: Dtos.BatchClaimDocumentStatus;
    isGoal: boolean;
    canRegenerateClaimDocuments: boolean;
    regenerateDocuments: {(): void};
    docRegenerationLoading: boolean;
};

export class BatchClaimGeneratedDocs extends React.Component<BatchClaimGeneratedDocsProps, {}> {
    private renderMessage() {
        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.NoDocsRequired) {
            return <div className="alert alert-info custom-info" data-qa="NoDocumentsToBeSystemGeneratedStatus">No documents to be system generated</div>
        }

        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.AnalysingDocReqs) {
            return <div className="alert alert-info custom-info" data-qa="AnalysingDocumentRequirementsStatus">Analysing document requirements</div>
        }

        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.DocsGenerationInProgress) {
            return <div className="alert alert-info custom-info" data-qa="DocumentsBeingGeneratedStatus">Documents being generated</div>
        }

        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.DocsImportInProgress) {
            return <div className="alert alert-info custom-info" data-qa="DocumentsBeingImportedStatus">Documents being imported</div>
        }

        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.DocsImported) {
            return <div className="alert alert-info custom-info" data-qa="DocumentsImportedStatus">Documents imported</div>
        }

        if (this.props.documentStatusId === Dtos.BatchClaimDocumentStatus.Error) {
            if (!this.props.isGoal) return <div className="alert alert-info custom-info warning-yellow" data-qa="ErrorOccurredDuringDocumentGenerationContactGoalStatus">An error occurred during document generation. Please contact Goal to resolve this.</div>
            
            let combined = this.props.documentErrors.and(this.props.documentTemplateErrors, (errors, templateErrors) => ({errors, templateErrors}));
            return Loader.for(combined,
                x => this.renderGenerationErrors(x.errors, x.templateErrors),
                () => <div className="alert alert-info custom-info warning-yellow" data-qa="ErrorOccurredDuringDocumentGenerationStatus">An error occurred during document generation. Please contact support.</div>);
        }
        return null;
    }

    private getErrorTypeText(errors: Dtos.BatchClaimDocumentErrorDto[]): string {
        if (!errors.length) return null;
        return `Please contact support with the following error code(s): ${errors.map(error => error.failureId).join(", ")}`;
    }

    private getTemplateErrorMessage(templateError: Dtos.BatchClaimDocumentTemplateErrorDto): string {
        switch(templateError.errorType) {
            case Dtos.BatchClaimDocumentErrorType.TemplateNotFound:
                return `Template: "${templateError.templatePath}" could not be found.`;
            case Dtos.BatchClaimDocumentErrorType.TemplateNotGiven:
                return `Document: "${templateError.documentTitle}" has no template provided.`;
            case Dtos.BatchClaimDocumentErrorType.TemplateInvalid:
                return `Template: "${templateError.templatePath}" is invalid.${templateError.templateField ? ` Field: ${templateError.templateField} could not be evaluated.` : ""}`;
        }
    }

    private renderGenerationErrors(errors: Dtos.BatchClaimDocumentErrorDto[], templateErrors: Dtos.BatchClaimDocumentTemplateErrorDto[]) {
        return (
            <div className="alert alert-info custom-info warning-yellow" data-qa="ErrorMessage">
                <div data-qa="ErrorOccurredDuringDocumentGeneration">An error occurred during document generation. {this.getErrorTypeText(errors)}</div>
                {this.renderTemplateErrorsList(templateErrors)}
            </div>
        )
    }

    private renderTemplateErrorsList(templateErrors: Dtos.BatchClaimDocumentTemplateErrorDto[]) {
        if (!templateErrors.length) return null;
        return (
            <div className="template-errors-list" data-qa="TemplateErrorsList">
                <div className="template-errors-list-subheader">Please check the following template errors:</div>
                <ul data-qa="Errors">
                    {templateErrors.sort((x, y) => y.errorType - x.errorType).map((templateError, i) => <li key={i} data-qa="Error">{this.getTemplateErrorMessage(templateError)}</li>)}
                </ul>
            </div>
        )
    }

    private renderDocumentRegenerationButton() {
        var canRegenerateStatus = [Dtos.BatchClaimDocumentStatus.DocsImported, Dtos.BatchClaimDocumentStatus.NoDocsRequired, Dtos.BatchClaimDocumentStatus.Error];

        if (!this.props.canRegenerateClaimDocuments || !this.props.isGoal || canRegenerateStatus.indexOf(this.props.documentStatusId) == -1) return null;

        let loading = this.props.docRegenerationLoading;

        return (
            <div className="col-md-11 float-start">
                <button id="regenerateButton" data-qa="RegenerateDocumentButton" className={"btn btn-primary col-md-2 float-start" + (loading ? " btn-loading" : "")} disabled={loading} onClick={this.showRegenerationConfirmationPopup}>{loading ? "Regenerating..." : "Regenerate Documents"}</button>
            </div>
        )
    }

    private showRegenerationConfirmationPopup = () => {
        let dialog = new DialogBuilder();
        dialog.setTitle("Regenerate Documents")
            .setMessage(<p>Are you sure you want to regenerate the documents for this batch claim?<br/></p>)
            .setConfirmHandler(() => this.props.regenerateDocuments())
            .setCancelHandler(dialog.close)
            .withQA("RegenerateDocumentsDialog")
            .open();
	}

    private renderBuilder() {
        if (this.props.documentStatusId !== Dtos.BatchClaimDocumentStatus.NoDocsRequired) {
            return SimpleGridBuilder.ForPending(this.props.documents.map(x => x.filter(y => !!y.fileName)))
                .isResizable()
                .isScrollable()
                .withQA("Documents")
                .addCustomColumn("File Name", m => <BatchClaimDocumentLink {...m} />, () => null, null, null, null)
                .addString("Status", m => "Ready", null, "Status")
                .addDateTime("Last Date Downloaded", m => m.lastDownloadedAt, null, "LastDateDownloaded")
                .addString("Last Downloaded By", m => m.lastDownloadedBy, null, "LastDownloadedBy")
                .render();
        }

        return null;
    }

    render() {
        return (
            <div>
                {this.renderBuilder()}
                {this.renderMessage()}
                {this.renderDocumentRegenerationButton()}
            </div>
        );

    }
};