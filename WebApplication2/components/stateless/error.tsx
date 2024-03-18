import { Message } from '../inputs';
import * as React from 'react';
import { AppError } from "../../classes/appError";

interface ErrorProps {
    error: AppError
    qa: string;
    customError?: string[]
    allowClose?: boolean;
    maxErrors?: number;
};


export const Error: React.StatelessComponent<ErrorProps> = (props) => {
    let maxErrors = props.maxErrors || 10;
    if (!props.error && !props.customError) return null;
    let messages:string[] = [];

    //add validation fails
    if (props.error && props.error.serverError && props.error.serverError.failures && Array.isArray(props.error.serverError.failures)) {
        messages = messages.concat(props.error.serverError.failures.map(x => x.message));
    }

    //add custom fails
    if (props.customError) {
        messages = messages.concat(props.customError);
    }

    //filter empty
    messages = messages.filter(x => !!x);

    //if still empty add usermessage
    if (!messages.length && props.error && props.error.userMessage) {
        messages[0] = props.error.userMessage;
    }

    if (messages.length > 1 && messages.length > maxErrors) {
        return <Message scrollTo={true} type="alert" allowClose={props.allowClose} qa={props.qa + "MaxErrorsMessage"}>
            <p>{messages.length + 1} errors. Showing first {maxErrors} errors</p>
            <ul style={{ padding: '14px' }} data-qa="ErrorList">{messages.filter((x, i) => i < maxErrors).map((x, i) => <li key={i} data-qa={props.qa + "ErrorItem"}>{x}</li>)}</ul>
        </Message>;
    }
    else if (messages.length > 1) {
        return <Message scrollTo={true} type="alert" allowClose={props.allowClose} qa={props.qa + "ErrorsMessage"}>
            <ul style={{ padding: '14px' }} data-qa={props.qa + "ErrorList"}>{messages.map((x, i) => <li key={i} data-qa={props.qa + "ErrorItem"}>{x}</li>)}</ul>
        </Message>;
    }
    else if (messages.length == 1) {
        return <Message scrollTo={true} type="alert" allowClose={props.allowClose} qa={props.qa + "AllowClose"}>{messages[0]}</Message>
    }
    else {
        return null;
    }
};