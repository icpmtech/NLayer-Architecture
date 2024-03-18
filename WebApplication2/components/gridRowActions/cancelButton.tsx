import * as React from 'react';
import { Dtos } from '../../adr/index';

export interface CancelButtonProps<T> {
    clickHandler?: (doc: T) => void;
    qa: string;
    disabled?: boolean;
    dto: T;
    dtoName?: string;
};

export function CancelButton<T>(props: CancelButtonProps<T>): JSX.Element {

    let buttonTitle = !!props.disabled ? `${props.dtoName} cannot be canceled` : `Cancel ${props.dtoName}`;
    let onButtonClick = !!props.disabled ? () => null : () => props.clickHandler(props.dto);
    let bntDisabledClass = !!props.disabled ? "btn-disabled" : "";

    return (
        <span className={"react-link"} style={{ 'margin': 'auto', 'display': 'table' }} title={buttonTitle} >
            <a className={"k-button btn-circle " + bntDisabledClass} onClick={onButtonClick} data-qa={props.qa}>
                <i className="k-icon k-delete"></i>
            </a>
        </span>
    );
};