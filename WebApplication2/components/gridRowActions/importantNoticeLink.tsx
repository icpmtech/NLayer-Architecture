import * as React from 'react';
import { Apis, Dtos } from '../../adr';

export const ImportantNoticeLink: React.StatelessComponent<Dtos.EventSummaryDto> = (props) => {

    let url = new Apis.EventsApi().downloadImportantNoticeUrl(props.id);

    let link: JSX.Element;

    if (props.hasImportantNotice) {
        link =
            <span className={"react-link"} style={{ 'margin': 'auto', 'display': 'table' }}>
            <a href={url} target="_blank" data-qa="downloadImportantNotice">
                    <i className="fa fa-download" aria-hidden="true" title="Download"></i>
                </a>
            </span>;
    }
    else {
        link =
            <span className={"react-link"} style={{ 'margin': 'auto', 'display': 'table', 'color': 'grey' }}>
                <i className="fa fa-download" aria-hidden="true" title="No file available" data-qa="NoFileAvailable"></i>
            </span>;
    }

    return link;
};
