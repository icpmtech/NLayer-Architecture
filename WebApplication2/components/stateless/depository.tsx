import * as React from 'react';

interface DepositoryProps {
    depositoryDb: boolean;
    depositoryCb: boolean;
    depositoryBnym: boolean;
    depositoryJpm: boolean;
};

export const Depository = (props) => {
    return <span>{DepositoryString(props)}</span>
};

export const DepositoryString = (props: DepositoryProps) => {
    let vals: string[] = [];

    if (props.depositoryBnym) { vals.push(DepositoryStringValues[0]) }

    if (props.depositoryCb) { vals.push(DepositoryStringValues[1]) }

    if (props.depositoryDb) { vals.push(DepositoryStringValues[2]) }

    if (props.depositoryJpm) { vals.push(DepositoryStringValues[3]) }

    return vals.join(", ");
};

export const DepositoryStringValues = ["BNYM", "CB", "DB", "JPM"];
