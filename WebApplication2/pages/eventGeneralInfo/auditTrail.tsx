import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Form from '../../components';

interface AuditTrailProps {
    event: Dtos.EventDto;
    eventAudit: Dtos.EventChangeDto;
}
export class AuditTrail extends React.Component<AuditTrailProps, {}> {

    private renderAuditTrailRow(titles: string[], contents: JSX.Element[]) {
        return (
            <div className="mb-3 row" data-qa="Form">
                {titles.map((x, index) =>
                    <div key={index} className={`d-flex col-md-5${index < 1 ? ' offset-md-1' : ''}`}>
                        <label className="col-md-4 text-end px-2"><strong>{x}</strong></label>
                        <div className="col-md-6 px-2" data-qa="FormTitles">{contents[index]} </div>
                    </div>
                )}
            </div>
        );
    }

    render() {
        return (
            <div>
                <legend>Event Audit Details</legend>
                <fieldset className="form-horizontal d-flex flex-column">
                    <div className="col-md-12">
                        {this.renderAuditTrailRow(['Created By', 'Creation Date'], [<span id="createdBy" data-qa="CreatedBy">{this.props.event.createdBy}</span>, <span id="creationDate"><Form.DateTime date={this.props.event.createdOn} qa="CreatedOnDate"/></span>])}
                        {this.renderAuditTrailRow(['Last Modified By', 'Last Modified Date'], [<span id="lastModifiedBy" data-qa="LastModifiedBy">{this.props.eventAudit.changedBy}</span>, <span id="lastModifiedDate"><Form.DateTime date={this.props.eventAudit.changedAt} qa="LastModifiedDate"/></span>])}
                        {this.renderAuditTrailRow(['Event Status'], [<span id="eventStatus" data-qa="EventStatus">{this.props.event.statusName}</span>])}
                        {this.renderAuditTrailRow(['Made Live By', 'Made Live Date'], [<span id="madeLiveBy" data-qa="MadeLiveBy">{this.props.event.madeLiveBy}</span>, <span id="madeLiveDate"><Form.DateTime date={this.props.event.madeLiveOn} qa="MadeLiveDate"/></span>])}
                    </div>
                    <div className="text-end">
                        <button className="btn btn-outline-secondary" onClick={() => window.open(new Apis.EventAuditApi().downloadUrl(this.props.event.id))} data-qa="ExportFullAuditTrailButton">Export Full Audit Trail</button>
                    </div>
                </fieldset>
            </div>
        );
    }
}