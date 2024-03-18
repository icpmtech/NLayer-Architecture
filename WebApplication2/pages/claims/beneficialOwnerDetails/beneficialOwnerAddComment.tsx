import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { BeneficialOwnerCommentDtoValidator } from '../../../validators/beneficialOwnerCommentDtoValidator';
import { connect, Pending, FormBuilder, Loader } from '../../../classes';
import { Message } from '../../../components';

interface AddCommentPopupProps {
    boId: number;
    onClose: { (): void };
    onConfirm: { (): void };
};

interface AddCommentPopupState {
    dto?: Dtos.BeneficialOwnerCommentDto;
    pending?: Pending<void>;
    submitted?: boolean;
    validation?: BeneficialOwnerCommentDtoValidator;
};

export class AddCommentPopup extends React.Component<AddCommentPopupProps, AddCommentPopupState> {
    constructor(props: AddCommentPopupProps) {
        super(props);
        this.state = {
            dto: { comment: "" },
            pending: null,
            submitted: false,
            validation: new BeneficialOwnerCommentDtoValidator(Pending.done<Dtos.BeneficialOwnerCommentDto>({} as Dtos.BeneficialOwnerCommentDto).data, false)
        };
    }

    handleConfirm = () => {
        let validation = new BeneficialOwnerCommentDtoValidator(this.state.dto, true);
        if (validation.isValid()) {
            connect<void>(new Apis.BeneficialOwnerApi().addComment(this.props.boId, this.state.dto), this.state.pending, response => {
                this.setState({ pending: response });
                response.isReady() && !!this.props.onConfirm && this.props.onConfirm();
            });
        }
        else {
            this.setState({ validation });
        }
    }

    renderForm() {
        let form = new FormBuilder(this.state.dto)
            .setChangeHandler(dto => {
                this.setState({ dto, validation: new BeneficialOwnerCommentDtoValidator(dto, this.state.validation.showValidationErrors()) });
            })
            .withQA("CommentForm")
            .addTextArea("Comments", m => this.state.dto.comment, (m, v) => m.comment = v, "Comments", this.state.validation.comment)
            .addCustom(null, <div className="text-end">Maximum 300 characters</div>, "CommentsBox");
        return form.render();
    }

    render() {
        return (
            <div className="popup-container">
                {Loader.for(this.state.pending, () => null, error => <Message type="alert" message={error.userMessage} qa="ErrorMessage"/>)}
                {this.renderForm()}
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={this.props.onClose} data-qa="CancelButton">Cancel</button>
                    <button className="btn btn-primary" onClick={this.handleConfirm} data-qa="SaveButton">Save</button>
                </div>
            </div>
        );
    }
}
