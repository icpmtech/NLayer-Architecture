import * as React from 'react';
import { DateTime } from './stateless';

interface Auditable {
    createdBy: string,
    createdOn: Date,
    lastUpdatedBy: string,
    lastUpdatedOn: Date,
}

interface Props {
    auditableEntity: Auditable;
}

export class Audit extends React.Component<Props, {}> {
    render() {
        let auditableEntity = this.props.auditableEntity;
        return (
            <div>
                <legend>Audit Details</legend>
                <fieldset className="form-horizontal d-flex flex-column" data-qa="AuditDetails">
                    <div className="row col-md-12">
                        <div className="d-flex col-md-5 offset-md-1">
                            <label className="col-md-4 text-end px-2"><strong>Created by:</strong></label>
                            <div className="col-md-6 px-2" data-qa="CreatedBy">{auditableEntity.createdBy} </div>
                        </div>
                        <div className="d-flex col-md-5">
                            <label className="col-md-4 text-end px-2"><strong>Created on:</strong></label>
                            <div className="col-md-6px-2 px-2 "><DateTime date={auditableEntity.createdOn} qa="CreatedOn"/></div>
                        </div>
                    </div>
                    <div className="row col-md-12">
                        <div className="d-flex col-md-5 offset-md-1">
                            <label className="col-md-4 text-end px-2"><strong>Last modified by:</strong></label>
                            <div className="col-md-6 px-2" data-qa="LastUpdatedBy">{auditableEntity.lastUpdatedBy} </div>
                        </div>
                        <div className="d-flex col-md-5">
                            <label className="col-md-4 text-end px-2"><strong>Last modified on:</strong></label>
                            <div className="col-md-6 px-2"><DateTime date={auditableEntity.lastUpdatedOn} qa="LastModifiedOn"/></div>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }
}