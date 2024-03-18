import * as React from 'react';
import { Dtos } from '../../../adr';
import { Loader, Pending, PopupBuilder, SimpleGridBuilder } from '../../../classes';
import { EditCommentButton } from '../../../components/gridRowActions/editCommentButton';
import { EditCommentComponent } from './editComment';

interface BeneficialOwnerDocumentsProps {
    canAddComments: boolean;
    canViewComments: boolean;
    documents: Pending<Dtos.BeneficialOwnerDocumentsDto[]>;
    editCommentHandler?: (BeneficialOwnerDocumentsDto) => void;
};

interface BeneficialOwnerDocumentsState {
    document?: Dtos.BeneficialOwnerDocumentsDto;
    submitted: boolean;
};

export class BeneficialOwnerDocuments extends React.Component<BeneficialOwnerDocumentsProps, BeneficialOwnerDocumentsState> {

    private commentPopup: PopupBuilder;
    constructor(props: BeneficialOwnerDocumentsProps) {
        super(props);
        this.state = { submitted: false };
    }

    private renderCommentPopup = (file: Dtos.BeneficialOwnerDocumentsDto) => {
        this.commentPopup = new PopupBuilder();
        this.commentPopup.setContent(
            <EditCommentComponent
                file={file}
                onCancel={this.commentPopup.close}
                onUpdate={(updatedFile) => this.props.editCommentHandler(updatedFile)}
               
            />
        );
        this.commentPopup.setTitle("Edit comment");
        this.commentPopup.render();
    }

    private renderMessage(documents: Dtos.BeneficialOwnerDocumentsDto[]) {
        if (documents.length === 0) {
            return <div className="alert alert-info custom-info" data-qa="NoDocumentsRequired">No documents required</div>
        }
        return <div></div>;
    }

    private renderDocs(documents: Dtos.BeneficialOwnerDocumentsDto[]) {
        if (documents.length > 0) {
            const builder = SimpleGridBuilder.For(documents, null)
                .isWordBreakable()
                .addString("Document", m => m.documentName, null, "Document")
                .addYesNo("System Generated Document?", m => m.systemGeneratedForm, null, "SystemGeneratedDocument")
                .addYesNo("Physical Document Required?", m => m.physicalRequired, null, "PhysicalDocumentRequired")
                .withQA("DocumentGrid");
            if (this.props.canViewComments) {
                builder.addString("Comments", m => m.comments, null, "CommentsHeader");
            }
            if (this.props.canAddComments) {
                builder.addCustomColumn(" ", null, () => null, null, null, "Comments", { width: 30 });
                builder.columns[4].getValue = m => EditCommentButton({ document: m, clickHandler: (m) => this.renderCommentPopup(m), qa:"AddComments"});
            }
            return builder.render();
        }

        return <div></div>
    }

    render() {
        return (
            <div>
                {Loader.for(this.props.documents, x => this.renderDocs(x))}
                {Loader.for(this.props.documents, x => this.renderMessage(x))}
            </div>
        );
    }
};