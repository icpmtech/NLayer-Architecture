import * as React from 'react';
import { Apis, Dtos } from '../../adr';

export const BatchClaimDocumentLink: React.StatelessComponent<Dtos.BatchClaimDocumentDto> = (props) => {
    let url = new Apis.BatchClaimDocumentsApi().getDocumentContentUrl(props.id);
    return <a href={url} target="_blank" data-qa="BatchClaimDocumentLink">{props.fileName}</a>
};
