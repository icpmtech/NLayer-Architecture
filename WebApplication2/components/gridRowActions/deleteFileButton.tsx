import * as React from 'react';

interface deleteFileProps<T> {
    document: T;
    qa: string;
    clickHandler?: (id: T) => void;
};

export function DeleteFileButton<T>(props: deleteFileProps<T>): JSX.Element {
    var onClick = function () {
        props.clickHandler(props.document)
    };

    return (
        <div className="float-end" onClick={onClick} style={{ cursor: 'pointer' }} onKeyDown={onClick}>
            <div className="k-button btn-circle k-grid-CustomCancel">
                <span className="k-icon k-delete" title="Delete" data-qa={props.qa}></span>
            </div>
        </div>
    );
};
