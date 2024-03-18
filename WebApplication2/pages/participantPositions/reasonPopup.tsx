import * as React from 'react';
import { UploadComponent, AutoComplete, NumberInput } from "../../components";
import { Apis, Dtos } from '../../adr';
import { Pending, Loader, FormBuilder } from '../../classes';
import { ParticipantPositionReasonDtoValidator } from '../../validators/participantPositionReasonDtoValidator';

interface Props {
    onCancel: () => void;
    onConfirm: (reason: string, authorisor: string) => void;
    confirmText?: string;
};
interface State {
    reason?: ParticipantPositionReason;
    validator?: ParticipantPositionReasonDtoValidator;
}

export class ParticipantPositionReason {
    reason: string;
    authoriser: string;
    required: boolean;
}

export class ReasonPopup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        let reason = { required: true } as ParticipantPositionReason
        let validator = new ParticipantPositionReasonDtoValidator(reason, false);

        this.state = { reason, validator };
    }

    render() {
        let form = FormBuilder.for(this.state.reason)
            .isWide(true)
            .narrowErrors(true)
            .addTextArea("Reason for Change ", m => m.reason, (m, v) => m.reason = v, "ReasonForChange", this.state.validator.reason)
            .addTextInput("Authorizer of Change", m => m.authoriser, (m, v) => m.authoriser = v, "AuthorizerOfChange", this.state.validator.authoriser)
            .withQA("Form")
            ;

        return (<div className='container-fluid'>
            <div className="row">
                {form.render()}
            </div>
            <div className="d-flex justify-content-end mb-1">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.addReason()}data-qa="AddButton">{this.props.confirmText || "Add"}</button>
            </div>
        </div>)
    }

    private addReason() {
        var validator = new ParticipantPositionReasonDtoValidator(this.state.reason, true);

        if (validator.isValid()) {
            this.props.onConfirm(this.state.reason.reason, this.state.reason.authoriser);
        }

        this.setState({ validator: validator });
    }
}