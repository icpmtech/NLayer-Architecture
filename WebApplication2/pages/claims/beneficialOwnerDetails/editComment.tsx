import * as React from 'react';
import { Dtos } from '../../../adr';
import { FormBuilder, Pending } from '../../../classes';
import * as Form from '../../../components';
import { BeneficialOwnerDocumentDtoValidator } from '../../../validators/beneficialOwnerDocumentDtoValidator';

interface EditCommentComponentProps {
    file: Dtos.BeneficialOwnerDocumentsDto;
    onCancel: () => void;
    onUpdate: (dto: Dtos.BeneficialOwnerDocumentsDto) => void;
}

interface EditCommentComponentState {
    document?: Dtos.BeneficialOwnerDocumentsDto;
    validation?: BeneficialOwnerDocumentDtoValidator;
}

export class EditCommentComponent extends React.Component<EditCommentComponentProps, EditCommentComponentState> {
    constructor(props: EditCommentComponentProps) {
        super(props);
        this.state = {
            document: Object.assign({}, this.props.file),
            validation: new BeneficialOwnerDocumentDtoValidator(Pending.done<Dtos.BeneficialOwnerDocumentsDto>({} as Dtos.BeneficialOwnerDocumentsDto).data, false)
        };
    }

    private handleUpdateClick = () => {
        let validation = new BeneficialOwnerDocumentDtoValidator(this.state.document, true);
        if (validation.isValid()) {
            let updatedComments = this.state.document ? (this.state.document.comments || null) : this.props.file.comments
            this.props.onUpdate(Object.assign({}, this.state.document, { comments: updatedComments }));
            this.props.onCancel();
        }
        else {
            this.setState({ validation });
        }
    }

    private renderForm = () => {
        let editCommentForm = new FormBuilder(this.state.document)
            .setChangeHandler(dto => {
                this.setState({
                    document: dto,
                    validation: new BeneficialOwnerDocumentDtoValidator(dto, this.state.validation.showValidationErrors())
                });
            })
            .addTextArea("Comments", m => this.state.document.comments, (m, v) => m.comments = v, "Comments",this.state.validation.comment)
            .addCustom(null, <div className="text-end"><i>Maximum 300 characters</i></div>, "CommentsBox");

        return editCommentForm.render();
    }

    render() {
        return (
            <div className="popup-container">
                <Form.FormGroup qa="EditCommentPopup">
                    <p>
                        <strong>Document:</strong>
                        {this.props.file.documentName}
                    </p>
                    {this.renderForm()}
                    <div className="text-end">
                        <button className="btn btn-outline-secondary" onClick={this.props.onCancel} data-qa="CancelButton">Cancel</button>
                        <button className="btn btn-primary" onClick={this.handleUpdateClick} data-qa="UpdateButton">Update</button>
                    </div>
                </Form.FormGroup>
            </div>
        );
    }
}