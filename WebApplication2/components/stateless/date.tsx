import * as React from 'react';

interface DateProps {
    date: Date;
    qa: string;
    isDateOnly?: boolean;
};

export const Date: React.StatelessComponent<DateProps> = (props) => {
    let date: string = "";
    if (props.date) {
        try {
            let parsedDate = moment.utc(props.date);
            if (props.isDateOnly === false) {
                parsedDate = parsedDate.tz('America/New_York')
            }
            date = parsedDate.format('DD MMM YYYY');
        }
        catch (error) { }
    }
    return <span data-qa={props.qa}>{date}</span>
};
