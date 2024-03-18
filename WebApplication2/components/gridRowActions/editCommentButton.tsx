import * as React from 'react';

interface editCommentProps<T> {
    document: T;
    qa: string;
    clickHandler?: (id: T) => void;
};

export function EditCommentButton<T>(props: editCommentProps<T>): JSX.Element {
    const onClick = () => {
        !!props.clickHandler && props.clickHandler(props.document);
    };

    return (
        <div className="float-end cursor-pointer" onClick={onClick} onKeyDown={onClick}>
            <i className="fa fa-pencil" aria-hidden="true" title="Edit" data-qa={props.qa}></i>
        </div>
    );
};
