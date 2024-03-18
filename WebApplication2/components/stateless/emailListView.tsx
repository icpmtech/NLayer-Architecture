import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { Result } from '../../validators/common';

interface emailListViewProps {
    displayLimit: number;
    emailList: string[];
    validation: Result[];
}

export const EmailListView: React.StatelessComponent<emailListViewProps> = (props) => {

    const listStyle = { display: 'inline-block', marginLeft: '15px' };

    if (!props.emailList || !props.emailList.length) return null;

    if (props.emailList.length > props.displayLimit) {
        let errors = props.emailList.map((x, i) => { return { entry: x, validation: props.validation[i], errorIndex: i }; }).filter(x => !x.validation.isValid());
        if (errors && errors.length) {
            return (
                <div style={listStyle} data-qa="Errors">
                    <div style={{ color: 'red' }} data-qa="ErrorMessage">There are errors with the following email addresses:</div>
                    <ul style={{ display: 'inline-block', listStyleType: 'none', paddingLeft: '5px' }} data-qa="ErrorList">
                        {errors.map((err, index) => renderEmailEntry(err.entry, err.validation, index))}
                    </ul>
                </div>
            );
        }
        else {
            return <div style={listStyle} data-qa="EnteredAmountMessage">You've entered {props.emailList.length} email addresses </div>
        }
    }

    return (
        <div style={listStyle}>
            <div data-qa="EnteredAmountMessage">You've entered {props.emailList.length} email addresses:</div>
            <ul style={{ display: 'inline-block', listStyleType: 'none', paddingLeft: '5px' }} data-qa="EmailList">
                {props.emailList.map((email, index) => renderEmailEntry(email, props.validation && props.validation[index], index))}
            </ul>
        </div>
    );
};

const renderEmailEntry = (email: string, validation: Result, index: number) => {

    return (
        <li key={index}>
            <span style={{ color: validation && validation.isValid() ? 'green' : 'orange', marginRight: '5px' }}
                className={validation && validation.isValid() ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle'} data-qa="ValidEmail">
            </span>
            {email}
            <span style={{ color: 'red', marginLeft: '15px' }} data-qa="InvalidEmail">
                {validation && validation.showValidationErrors() && !validation.isValid() && validation.errorMessage}
            </span>
        </li>);
}