import * as React from 'react';

interface TimeProps {
    date: Date;
    qa: string;
};

export const Time: React.StatelessComponent<TimeProps> = (props) => {
    let time: string = "";

    if (props.date) {
        try {
            let parsedDate = moment(props.date).tz('America/New_York')
            time = parsedDate.format('HH:mm z');
        }
        catch (error) { }
    }
    return <span data-qa={props.qa}>{time}</span>
};
