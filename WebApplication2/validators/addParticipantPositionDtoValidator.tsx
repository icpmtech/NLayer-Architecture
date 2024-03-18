import * as Validation from "./common"
import { Dtos } from "../adr";
import { AddAdrPosition } from "../pages/participantPositions/addPosition";

export class AddParticipantPositionDtoValidator extends Validation.Results<AddAdrPosition>{

    participant = Validation.required(this, this.model.participant, "Participant is required");
    position = Validation.all(this,
        () => Validation.required(this, this.model.adrPosition, "Adr Posiiton is required"),
        () => Validation.nonZeroNumber(this, this.model.adrPosition, "Adr Position must be greater than zero")
    );
}
