import * as React from 'react';

interface confirmationDialogProps {
    message: React.ReactNode;
    cancelHandler: { (): void };
    confirmHandler: { (): void };
    confirmText: string;
    cancelText: string;
    qa: string;
};

export function ConfirmationDialog(props: confirmationDialogProps): JSX.Element {
    return (
        <div>
            <div>{props.message}</div>
            <div className="msg-btns float-end">
                <input type="button" className="adr-popup-no btn btn-outline-secondary" value={props.cancelText} onClick={props.cancelHandler} data-qa={props.qa + "CancelButton"}/>
                <button className="adr-popup-yes btn btn-primary" onClick={props.confirmHandler} data-qa={props.qa + "ConfirmButton"}>{props.confirmText}</button>
            </div>
        </div>
    );
};
