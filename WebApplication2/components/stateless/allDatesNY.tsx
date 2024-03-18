import * as React from 'react';

export function AllDatesNY(): JSX.Element {
    return (
        <div className="row" style={{marginBottom: '10px'}}>
            <div className="col-md-12" data-qa="AllDatesNYNotice">
                <i>All dates are represented in New York Local Time</i>
            </div>
        </div>
    );
}