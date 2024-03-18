import * as React from 'react';
import { DialogBuilder, Loader, Pending, PopupBuilder, SimpleGridBuilder } from '../../../classes';
import { BatchClaimDocumentLink } from '../../../components/gridRowActions/batchClaimDocumentLink';
import { DeleteFileButton } from '../../../components/gridRowActions/deleteFileButton';
import { ConfirmationDialog } from '../../../components/stateless/confirmationDialog';
import { Dtos } from '../../../adr';

interface BatchClaimUploadedDocsProps {
    documents: Pending<Dtos.BatchClaimDocumentDto[]>;
    canDeleteFile: boolean;
    handleDeleteFile: { (id: number): void };
};

export class BatchClaimUploadedDocs extends React.Component<BatchClaimUploadedDocsProps, {}> {
    private deleteConfirmation: DialogBuilder;

    private handleDeleteButton = (file: Dtos.BatchClaimDocumentDto) => {
        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete uploaded claim document?")
            .setMessage(<p>{'Are you sure you want to delete ' + file.fileName + '?'}</p>)
            .setCancelHandler(this.deleteConfirmation.close)
            .withQA("DeleteConfirmationDialog")
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.handleDeleteFile(file.id);
            })
            .open();
    }

    private renderUploadedDocs(documents: Dtos.BatchClaimDocumentDto[]) {
        if (documents.length === 0) {
            return <div className="alert alert-info custom-info" data-qa="NoDocumentsUploaded">No documents uploaded</div>;
        }

        const builder = SimpleGridBuilder.For(documents.filter(x => !!x.fileName))
            .isResizable()
            .isScrollable()
            .addCustomColumn("File Name", m => <BatchClaimDocumentLink {...m} />, () => null, null, null, "FileName",null)
            .addDateTime("Uploaded At", m => m.uploadedAt, null, "UploadedAt")
            .addString("Uploaded By", m => m.uploadedBy, null, "UploadedBy");

        if (this.props.canDeleteFile) {
            builder.addCustomColumn(" ", m => DeleteFileButton({ document: m, clickHandler: this.handleDeleteButton, qa:"BatchClaimUploadedDocs" }), () => null, null, null, "DeleteFileButton",{ width: 50 });
        }

        return builder.render();
    }

    render() {
        return (
            <div>
                {Loader.for(this.props.documents, x => this.renderUploadedDocs(x))}
            </div>
        );
    }
};