import * as React from 'react';

export interface step{
    value: number;
    name: string;
    state: string;
    //state: 'active' | 'complete' | 'disabled' | 'none';
}

interface Props{
    steps: step[]
}

export class ClaimSteppedTracker extends React.Component<Props, {}>{

        constructor(props: Props) {
        super(props);
    }
    
    private renderStep(step: step, index: number) {
        return(
            <li className={"progress-step " + "is-" + step.state.split(' ').join(' is-')} key={index + 1} data-qa="ClaimProgressStep">
                <span className="progress-marker" data-qa="ProgressMarker">{index + 1}</span>
                <span className="progress-text" data-qa="ProgressText">
                    <h4 className="progress-title" data-qa="ProgressTitle">{step.name}</h4>
                </span>
                <div className="progress-arrow" data-qa="ProgressArrow"></div>
            </li>
        );
    }

    render() {
        return <ul className="progress-tracker progress-tracker--spaced progress-tracker--word progress-tracker--word-center" data-qa="ClaimProgressTracker">
            {this.props.steps.map((x, i) => { return this.renderStep(x, i) })}
        </ul>;
    }
}
