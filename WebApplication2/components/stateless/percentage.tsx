import * as React from 'react';

interface Props {
    value: number;
    qa: string;
    isFraction?: boolean;
    decimals?: number;
};

export const Percentage: React.StatelessComponent<Props> = (props) => {
    let val = props.value;
    if (val || val === 0) {
        if (props.isFraction === true) {
            val = val * 100;
        }
        return <span data-qa={props.qa}>{val} %</span>
    }
    return null;
};
