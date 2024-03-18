import * as React from 'react';
import { UploadComponent, AutoComplete, NumberInput } from "../../components";
import { Apis, Dtos } from '../../adr';
import { Pending, Loader, FormBuilder } from '../../classes';
import { AddParticipantPositionDtoValidator } from '../../validators/addParticipantPositionDtoValidator';

interface Props {
    participants: Pending<Dtos.ParticipantSummaryDto[]>;
    isDownstreamSubscriber: boolean;
    onCancel: () => void;
    onConfirm: (participant: Dtos.ParticipantSummaryDto, position: number) => void;
    qa: string;
};
interface State {
    position?: AddAdrPosition;
    validator?: AddParticipantPositionDtoValidator;
}

export class AddAdrPosition {
    adrPosition: number;
    participant: Dtos.ParticipantSummaryDto;
}

export class AddPosition extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        let position = {} as AddAdrPosition
        let validator = new AddParticipantPositionDtoValidator(position, false);

        this.state = { position, validator };
    }

    render() {
        let TypedAutoComplete = AutoComplete as Newable<AutoComplete<Dtos.ParticipantSummaryDto>>;
        
        return Loader.for(this.props.participants, participants => {

            let mappedPtcs = participants.map(x => { return { id: x.id, name: x.dtcCode + " - " + x.name } });

            let form = FormBuilder.for(this.state.position)
                .isWide(true)
                .narrowErrors(true)
                .addDropdown(this.props.isDownstreamSubscriber ? "Downstream Subscriber" : "Participant",
                    mappedPtcs,
                    m => m.participant && mappedPtcs.find(x => x.id == m.participant.id),
                    (m, v) => m.participant = participants.find(x => x.id == (v && v.id)), "Participant", this.state.validator.participant)
                .addNumber("Adr Position", m => m.adrPosition, (m, v) => m.adrPosition = v, "AdrPosition", this.state.validator.position, { min: 0, decimals: 0 })
                .withQA("ParticipantForm")
                ;

            return (
            <div className='container-fluid'>
                <div className="row">
                    {form.render()}
                </div>
                <div className="d-flex justify-content-end mb-1">
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                    <button className="btn btn-primary" onClick={() => this.addPosition()}data-qa="AddButton">Add</button>
                </div>
            </div>)
        });
    }

    private addPosition() {
        var validator = new AddParticipantPositionDtoValidator(this.state.position, true);

        if (validator.isValid()) {
            this.props.onConfirm(this.state.position.participant, this.state.position.adrPosition);
        }

        this.setState({ validator: validator });
    }
}