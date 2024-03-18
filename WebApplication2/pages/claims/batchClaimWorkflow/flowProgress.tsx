import * as React from 'react';
import { Dtos } from '../../../adr';
import { ClaimSteppedTracker, step } from '../../../components/claimSteppedTracker';

interface FlowProgressProps {
    currentStep: number;
    elections?: boolean;
    beneficialOwners?: boolean;
}

interface FlowProgressState {
    currentStep: number;
}

export class FlowProgress extends React.Component<FlowProgressProps, FlowProgressState> {
    constructor(props: FlowProgressProps) {
        super(props);

        this.state = {
            currentStep: props.currentStep
        };
    }

    private getStates() {
        let steps: step[] = [
            { value: 10, name: 'Filing Method', state: 'none' },
            { value: 20, name: 'Category Election', state: (this.props.currentStep === Dtos.BatchClaimEntrystage.Creation || this.props.elections ? 'none' : 'disabled') },
            { value: 30, name: 'Beneficial Owners', state: (this.props.currentStep === Dtos.BatchClaimEntrystage.Creation || this.props.beneficialOwners ? 'none' : 'disabled') },
            { value: 44, name: 'Processing', state: 'none' },
            { value: 45, name: 'Failed to Process', state: 'none' },
            { value: 50, name: 'Preview Claim', state: 'none' },
            { value: 60, name: 'Submit Claim', state: 'none' }
        ];

        // hide 'failed' step, unl;ess actually failed
        if (this.props.currentStep === Dtos.BatchClaimEntrystage.UploadFailed)
            steps = steps.filter(x => x.value != Dtos.BatchClaimEntrystage.Preview);
        else
            steps = steps.filter(x => x.value != Dtos.BatchClaimEntrystage.UploadFailed);

        steps.forEach((x, i) => {
            if (x.value === this.props.currentStep && x.state !== 'disabled') x.state = 'active';
            else if (x.value < this.props.currentStep && x.state === 'disabled') x.state = 'disabled complete';
            else if (x.value < this.props.currentStep) x.state = 'complete';

            return x;
        });

        return steps;
    }


    render() {
        return (
            <div>
                <ClaimSteppedTracker steps={this.getStates()}/>
            </div>
        );
    }
}