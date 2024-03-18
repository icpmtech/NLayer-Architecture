import * as React from 'react';

interface ColumnFieldProps {
    content: React.ReactNode;
    contentWidth: number;
    title: string;
    titleWidth: number;
    qa: string;
    boldLabels?: boolean;
};

export const ColumnField: React.StatelessComponent<ColumnFieldProps> = (props) => {
    return (
        <div className='details-row' data-qa="Row">
            <div className='details-row-left' style={{ width: props.titleWidth + '%', fontWeight: props.boldLabels ? 700 : 'inherit' }} data-qa={props.qa + "Title"}>{props.title}</div>
            <div className='details-row-right' style={{ width: props.contentWidth + '%' }} data-qa={props.qa}>{props.content}</div>
        </div>
    );
};
