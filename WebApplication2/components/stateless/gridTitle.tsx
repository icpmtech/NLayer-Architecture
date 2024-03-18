import * as React from 'react';

interface titleProps {
    title: string;
    qa: string;
};

export const GridTitle: React.StatelessComponent<titleProps> = (props) => {
    return <div className="grid-heading" data-qa={props.qa}>{props.title}</div>
};
