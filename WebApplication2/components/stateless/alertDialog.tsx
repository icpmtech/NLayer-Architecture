import * as React from 'react';

interface alertDialogProps {
    message: React.ReactNode;
    closeHandler: { (): void };
    qa: string;
};

export function AlertDialog(props: alertDialogProps): JSX.Element {
    return (
        <div>
            <div>{props.message}</div>
            <div className="msg-btns float-end" style={{marginTop: 10}}>
                <input type="button" className="adr-popup-no btn btn-primary" value="Close" onClick={props.closeHandler} data-qa={props.qa}/>
            </div>
        </div>
    );
};