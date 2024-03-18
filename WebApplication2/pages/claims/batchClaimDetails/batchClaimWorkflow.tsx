import * as React from 'react';
import { ClaimSteppedTracker, step } from '../../../components/claimSteppedTracker';

interface BatchClaimWorkflowProps {
    steps: step[];
    currentStep: number;
    qa:string;
    elections?: boolean;
    beneficialOwners?: boolean;
}

interface BatchClaimWorkflowState {
    currentStep: number;
}

export class BatchClaimWorkflowWidget extends React.Component<BatchClaimWorkflowProps, BatchClaimWorkflowState> {
    constructor(props: BatchClaimWorkflowProps) {
        super(props);

        this.state = {
            currentStep: props.currentStep
        };
    }

    private getStates() {
        let steps: step[] = [
            { value: 10, name: 'Filing Method', state: 'none' },
            { value: 20, name: 'Category Election', state: (this.props.elections ? 'none' : 'disabled') },
            { value: 30, name: 'Beneficial Owners', state: (this.props.beneficialOwners ? 'none' : 'disabled') },
            { value: 50, name: 'Preview Claim', state: 'none' },
            { value: 60, name: 'Submit Claim', state: 'none' }
        ];
        
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