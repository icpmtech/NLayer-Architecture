import * as React from 'react';
import { Apis, Dtos } from '../../adr';

export const ReportDocumentLink: React.StatelessComponent<Dtos.GeneratedFileDto> = (props) => {
    let url = new Apis.ReportsApi().getGeneratedFileContentUrl(props.id);
    return <a href={url} target="_blank" data-qa="ReportsDocLink">{props.displayName}</a>
};
