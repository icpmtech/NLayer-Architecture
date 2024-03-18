import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';

interface Props {
    rounds: Framework.Pending<Dtos.RoundSummaryDto[]>;
    selectRound: { (id: number): void };
    onAddNew: { (): void };
    roundTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    canAddRound: boolean;
}

export class List extends React.Component<Props, {}> {
    render() {
        let combined = Framework.Pending.combine(this.props.rounds, this.props.roundTypes, (rounds, roundTypes) => { return { rounds, roundTypes } });
        return Framework.Loader.for(combined, combined =>
            <div>
                {this.renderGrid(combined.rounds, combined.roundTypes)}
            </div>);
    }

    renderGrid(rounds: Dtos.RoundSummaryDto[], types: Dtos.EnumDisplayDto[]) {
        let roundTypesMapped = types.map(x => { return { name: x.label, id: x.value } })

        let builder = Framework.SimpleGridBuilder.ForPending(this.props.rounds)
            .withQA("GoalRounds")
            .setRowChangeHandler(m => this.props.selectRound(m.id))
            .addString("Filing Method", x => x.filingMethod.name, null, "FilingMethod")
            .addString("Round Type", x => roundTypesMapped.find(z => z.id == x.roundType).name, null, "RoundType")
            .addString("Round Name", x => x.name, null, "RoundName")
            .addDateTime("Start Date", x => x.start, null, "StartDate", null, {showSuffix:false})
            .addDateTime("CA Web Deadline", x => x.caWebDeadline, null, "CaWebDeadline", null, { showSuffix: false })
            .addDateTime("Claim Submission Deadline", x => x.claimSubmissionDeadline, null, "ClaimSubmissionDeadline", null, { showSuffix: false })
            .addString("Status", x => x.isLocked ? "Locked" : x.isAvailiable ? "Available" : "Unavailable", null, "Status")

        if (this.props.canAddRound)
            builder.addButton("Add round", () => this.props.onAddNew(), { dataQA: "AddRoundButton", pushRemainingRight: true })

        return builder.render();
    }
}
