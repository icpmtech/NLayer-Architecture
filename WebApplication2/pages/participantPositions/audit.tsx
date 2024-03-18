import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from '../../classes';
import { DateTime } from '../../components/stateless';

interface Props {
    audit: Framework.Pending<Dtos.ParticipantAuditDto>;
}

export class Audit extends React.Component<Props, {}>{
    render() {
        return this.props.audit.data ? this.renderDetails(this.props.audit.data) : null;
    }

    renderDetails(audit: Dtos.ParticipantAuditDto) {
        return (
            <div className="mb-3 row">
                <div className="row col-md-12">
                    <label className="col-md-2 offset-md-1 text-end"><strong>Last updated by</strong></label>
                    <div className="col-md-3" data-qa="LastChangedBy">{audit.lastChangedByUser || "N/A"}</div>
                    <label className="col-md-2 text-end"><strong>Last updated on</strong></label>
                    <div className="col-md-3" data-qa="LastUpdatedOn">{audit.lastUpdatedOn ? <DateTime date={audit.lastUpdatedOn} qa={ "LastUpdatedOnDateTime"}/> : "N/A"}</div>
                </div>
                <div className="row col-md-12">
                    <label className="col-md-2 offset-md-1 text-end">{audit.updateReason && <strong>Reason for Change</strong>}</label>
                    <div className="col-md-3" data-qa="UpdateReason">{audit.updateReason}</div>
                    <label className="col-md-2 text-end">{audit.updateAuthoriser && <strong>Authorizer of Change</strong>}</label>
                    <div className="col-md-3" data-qa="UpdateAuthorizer">{audit.updateAuthoriser}</div>
                </div>
            </div>
        );
    }
}