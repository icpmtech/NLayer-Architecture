import * as React from 'react';

interface headingProps {
    title: string;
    classes: string;
    qa: string;
};

export const FormGroupHeading: React.StatelessComponent<headingProps> = (props) => {
    let classname = !!props.classes ? "" : props.classes;
    return <h4 data-qa={props.qa} className={props.classes}>{props.title}</h4>;
};
