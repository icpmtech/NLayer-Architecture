import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';
import { VerifyUserDtoValidator } from '../../validators/verifyUserDtoValidator';

interface Props {
    onClose: () => void;
    onDone: (dto: Dtos.VerifyUserDto) => void;
}

interface State {
    reason?: string;
    validation?: VerifyUserDtoValidator;
}

export class RejectPopup extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            reason: "",
            validation: new VerifyUserDtoValidator({ reason: "", groupId: null }, true, false)
        }
    }

    render() {
        return (
            <div className="popup-container large">
                <div className="mb-3">
                    <span className="col-form-label form-label required" data-qa="RejectionReason">Rejection reason</span>
                    {this.state.validation.showValidationErrors() && !this.state.validation.isValid() ? <div className="field-validation-error" data-qa="ValidationError">{this.state.validation.reason.errorMessage}</div> : null}
                    <div>
                        <Components.TextArea value={this.state.reason} onChange={(reason) => this.onChange(reason)} qa="RejectionReasonTextArea"/>
                    </div>
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onClose()}data-qa="CloseButton">Close</button>
                    <button className="btn btn-primary" onClick={() => this.onDone()} data-qa="ContinueButton">Continue</button>
                </div>
            </div>
        );
    }

    private onChange(reason: string) {
        var validation = new VerifyUserDtoValidator({ reason: reason, groupId: null }, true, this.state.validation && this.state.validation.showValidationErrors());
        this.setState({ reason, validation });
    }

    private onDone() {
        var dto = { reason: this.state.reason, groupId: null };
        var validation = new VerifyUserDtoValidator(dto, true, true);
        this.setState({ validation });
        if (validation.isValid()) {
            this.props.onDone(dto);
        }
    }
}

