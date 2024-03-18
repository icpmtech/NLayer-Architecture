import * as React from 'react';

interface formGroupProps {
    qa: string;
};

export const FormGroup: React.StatelessComponent<formGroupProps> = (props) => {
    return <div className="mb-3" data-qa={props.qa}>{props.children}</div>
};
