import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';
import { EmailChangeRequestDtoValidator } from '../../validators/emailChangeRequestDtoValidator';

interface Props {
    onClose: () => void;
    onDone: (dto: Dtos.EmailChangeRequestDto) => void;
    id: number;
}

interface State {
    dto?: Dtos.EmailChangeRequestDto;
    validation?: EmailChangeRequestDtoValidator;
}

export class RejectPopup extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);

        let dto = { id: props.id, approved: false } as Dtos.EmailChangeRequestDto;
        let val = new EmailChangeRequestDtoValidator(dto, false);

        this.state = { dto: dto, validation: val }
    }

    private renderForm() {
        let dto = this.state.dto;
        let validator = this.state.validation;

        let form = Framework.FormBuilder.for(dto)
            .setChangeHandler((dto) => this.onChange(dto))
            .isWide(false)
            .addTextArea("Rejection Reason", m => m.reason, (m, v) => m.reason = v, "RejectionReason", validator.reason, null)
            .withQA("Form");
        
        return form.render();
    }

    private onChange(dto: Dtos.EmailChangeRequestDto) {
        let validation = new EmailChangeRequestDtoValidator(dto, this.state.validation.showValidationErrors());
        this.setState({ validation, dto });
    }

    render() {
        return (
            <div className="popup-container">
                <div className="mb-3">
                    {this.renderForm()}
                </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onClose()}data-qa="CloseButton">Close</button>
                    <button className="btn btn-primary" onClick={() => this.onDone()} data-qa="RejectChangeButton">Reject Change</button>
                </div>
            </div>
        );
    }

    private onDone() {
        let dto = this.state.dto;
        var validation = new EmailChangeRequestDtoValidator(dto, true);

        this.setState({ validation });

        if (validation.isValid()) {
            this.props.onDone(dto);
        }
    }
}

