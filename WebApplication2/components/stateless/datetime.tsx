import * as React from 'react';

export const DateTime: React.StatelessComponent<{ date: Date, qa: string, showSuffix?: boolean }> = (props) => {
    let result: string = "";

    if (props.date) {
        try {
            let parsedDate = moment(props.date).tz('America/New_York');
            result = parsedDate.format('DD MMM YYYY HH:mm z');
        }
        catch (error) { }
    }
    return <span data-qa={props.qa}>{result}</span>
};
