import * as React from 'react';

export const YesNo: React.StatelessComponent<{ value: boolean, qa: string; showNulls?: boolean }> = (props) => {
    if (props.value === true) return <span>Yes</span>;
    if (props.value === false) return <span>No</span>;
    if (props.showNulls === true) return <span>Not set</span>;
    return null;
};
