import * as React from 'react';
import { UploadComponent } from "../../components";
import { FormBuilder } from "../../classes";
import { ParticipantPositionReasonDtoValidator } from '../../validators/participantPositionReasonDtoValidator';
import { ParticipantPositionReason } from "../participantPositions/reasonPopup";

interface Props {
    eventId: number;
    participantId: number;
    isGoalUser: boolean;
    onUploadComplete: () => void;
    saveUrl: string;
    onClose: { (): void };
    requiresSaveReason: boolean;
};

interface State {
    reason?: ParticipantPositionReason;
    validator?: ParticipantPositionReasonDtoValidator;
}

export class Upload extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        var reason = { reason: null, authoriser: null, required: this.props.requiresSaveReason } as ParticipantPositionReason;
        var validator = new ParticipantPositionReasonDtoValidator(reason, false);

        this.state = { reason, validator };
    }

    render() {
        var text = this.props.participantId != null || !this.props.isGoalUser ? "Downstream Subscribers'" : "Participants";
        
        let form = FormBuilder.for(this.state.reason)
            .isWide(true)
            .narrowErrors(true)
            .addTextArea("Reason for Change", m => m.reason, (m, v) => { m.reason = v; this.setState({ reason: m }); }, "ReasonForChange", this.state.validator.reason)
            .addTextInput("Authorizer of Change", m => m.authoriser, (m, v) => { m.authoriser = v; this.setState({ reason: m }); }, "AuthorizerOfChange", this.state.validator.authoriser)
            ;

        return (
            <div className="popup-container" data-qa="PopupContainer">
                <span>Please upload the {text} Record Date Positions:</span>
                <ul style={{ paddingLeft: '15px' }}>
                    <li>A template is available from the grid.</li>
                    <li>Be aware that all current RD positions will be replaced by the contents of the file.</li>
                    <li>{text} not included in the file, will be recorded with a RD position of 0.</li>
                    {this.props.requiresSaveReason && <li>A change reason must be provided if positions are being updated.</li>}
                </ul>

                {this.props.requiresSaveReason && form.render()}

                <UploadComponent
                    onComplete={(success) => success && this.props.onUploadComplete()}
                    saveData={{
                        eventId: this.props.eventId.toString(),
                        participantId: this.props.participantId ? this.props.participantId.toString() : null,
                        reason: this.state.reason.reason,
                        authoriser: this.state.reason.authoriser
                    }}
                    saveUrl={this.props.saveUrl}
                    qa="UploadComponent"
                    onCancelAndClose={() => this.props.onClose()}
                />                
            </div>);
    }
}