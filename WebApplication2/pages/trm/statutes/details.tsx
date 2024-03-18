import * as React from 'react';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder, DialogBuilder, SimpleGridBuilder } from '../../../classes';
import { Audit } from '../../../components/audit';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface Props {
    statute: Pending<Dtos.StatuteDto>;
    audit: Pending<Dtos.StatuteAuditDto[]>;
    currentUserId: number;
    isTrmReadOnlyUser: boolean;
    onBack: () => void;
    onEdit: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete: (id) => void;
    onCopy: (id) => void;
}

export class Details extends React.Component<Props, {}> {
    private monthNames: { name: string, id: number}[]; 
    private updateNewsAlert: UpdateNewsAlert;

    private constructor() {
        super();

        this.monthNames = moment.months().map((m, i) => { return { name: m, id: i + 1 } });
    }

    private renderform() {
        return Loader.for(this.props.statute, rate => {
            let f = new FormBuilder(rate)
                .isDisabled(true)
                .isWide(true)
                .addTextInput("Reclaim Market", m => m.reclaimMarket.countryName, null, "ReclaimMarket")
                .addDate("Effective Date", (m) => m.effectiveDate, null, "EffectiveDate")
                .addCustom("Statute of Limitations", this.renderStatutoryRate(rate.statuteOfLimitationsMonths, rate.statuteOfLimitationsDays), "StatuteOfLimitations")
                .addTextInput("Qualifier Type", m => m.qualifierTypeName, null, "QualifierType")
                .withQA("Form");

            if (rate.qualifierType === Dtos.StatuteQualifierType.FromDateAfterPayDate) {
                f.addCustom("Month", this.renderQualifierDate(rate.qualifierMonth, rate.qualifierDay), "Month");
            }

            f.addTextInput("Status", m => m.statusName, null, "Status");
            return f.render();
        });
    }
            
    private renderNewsAlert() {
        this.updateNewsAlert = new UpdateNewsAlert();
        this.updateNewsAlert
            .open();
    }

    private renderStatutoryRate(statuteMonths: number, statuteDays: number): JSX.Element {
        let years = statuteMonths > 11 ? Math.floor(statuteMonths / 12) : 0;
        let months = statuteMonths % 12;

        return new FormBuilder()
            .isInline(true)
            .addNumber("Years", x => years, null, "Years", null, { disabled: true, width: '100px', labelPosition: 'right' })
            .addNumber("Months", x => months, null, "Months", null, { disabled: true, width: '100px', labelPosition: 'right' })
            .addNumber("Days", x => statuteDays, null, "Days", null, { disabled: true, width: '100px', labelPosition: 'right' })
            .render()
            ;
    }

    private renderQualifierDate(qualifierMonth?: number, qualifierDay?: number): JSX.Element {
        if (!this.props.statute.isDone()) return null;
                
        return FormBuilder.for(this.props.statute.data)
            .isInline(true)
            .addTextInput("", x => qualifierMonth ? this.monthNames.find(l => l.id == qualifierMonth).name : null, null, "QualifierMonth", null, { disabled: true })
            .addNumber("Day", x => x.qualifierDay, null, "QualifierDay", null, { disabled: true })
            .render();
    }

    private renderButtons(): JSX.Element {
        var combined = Pending.combine(this.props.statute, this.props.audit, (statute, audit) => { return { statute, audit } })

        return Loader.for(combined, (combined) => {
            var canApprove = this.props.currentUserId != combined.audit[0].changeById;
            
            combined.statute.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && this.renderNewsAlert()

            return (
                <div>
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()}>Back to List</button>
                    {combined.statute.status == Dtos.TrmEntityStatus.Draft && <button className="btn btn-outline-secondary" onClick={() => this.deleteStatute()} data-qa="DeleteButton">Delete</button>}
                    {combined.statute.status !== Dtos.TrmEntityStatus.AwaitingVerification && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" disabled={combined.statute.currentAwaitingVerificationVersionId != null} onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>}
                    {combined.statute.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="ApproveButton">Approve</button>}
                    {combined.statute.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onReject()} data-qa="RejectButton">Reject</button>}
                    {combined.statute.status === Dtos.TrmEntityStatus.Published && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" onClick={() => this.props.onCopy(this.props.statute.data.id)} data-qa="CopyButton">Copy</button>}
                </div>);
        });
    };

    private renderExceptions() {
        if (!this.props.statute || !this.props.statute.data) return null;
        if (!this.props.statute.data.exceptions || this.props.statute.data.exceptions.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="ThisStatuteHasNoExceptions">This Statute has no exceptions</div>);
        }
        
        return SimpleGridBuilder.For(this.props.statute.data.exceptions)
            .addString("Country of Residence", x => x.countryOfResidence.countryName, null, "CountryOfResidence")
            .addString("Statute of Limitations",
                x => (x.statuteOfLimitationsMonths ? (x.statuteOfLimitationsMonths >= 12 ? `${Math.floor(x.statuteOfLimitationsMonths / 12)} Years, ` : "") : "")
                    + (x.statuteOfLimitationsMonths ? `${x.statuteOfLimitationsMonths % 12} Months` : "")
                    + (x.statuteOfLimitationsDays && x.statuteOfLimitationsMonths ? ", " : "")
                    + (x.statuteOfLimitationsDays ? `${x.statuteOfLimitationsDays} Days` : ""), null, "StatuteOfLimitations")
            .addString("Qualifier Date", x => x.qualifierMonth ? (this.monthNames.find(y => y.id == x.qualifierMonth).name + ' ' + x.qualifierDay) : null, null, "QualifierDate")
            .withQA("Grid")
            .render();
    }

    private renderAudit() {
        if (!this.props.audit.data) return null;
        var auditableEntity = {
            createdBy: this.props.audit.data[this.props.audit.data.length - 1].changeByName,
            createdOn: this.props.audit.data[this.props.audit.data.length - 1].changedOn,
            lastUpdatedBy: this.props.audit.data[0].changeByName,
            lastUpdatedOn: this.props.audit.data[0].changedOn
        }
        return <Audit auditableEntity={auditableEntity}/>
    }

    private deleteConfirmation: DialogBuilder;
    private deleteStatute() {

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Statute?")
            .setMessage(<p>{'Are you sure you want to delete this Statute?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.onDelete(this.props.statute.data.id)
            })
            .withQA("DeleteConfirmationDialog")
            .open();
    }

    render() {
        return (
            <div>
                {this.renderform()}
                {this.renderExceptions()}
                {this.renderAudit()}
                <div className="text-end">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}