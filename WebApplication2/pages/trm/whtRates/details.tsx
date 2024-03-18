import * as React from 'react';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder, DialogBuilder } from '../../../classes';
import { ExceptionDetails } from './exceptionDetails';
import { Audit } from '../../../components/audit';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface Props {
    whtRate: Pending<Dtos.WhtRateDto>;
    audit: Pending<Dtos.WhtRateAuditDto[]>;
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

    private updateNewsAlert: UpdateNewsAlert;
    
    private renderform() {
        return Loader.for(this.props.whtRate, rate =>
            new FormBuilder(rate)
                .isDisabled(true)
                .isWide(true)
                .addTextInput("Reclaim Market", m => m.reclaimMarket.countryName, null, "ReclaimMarket")
                .addDate("Effective Date", (m) => m.effectiveDate, null, "EffectiveDate")
                .addNumber("Dividend Rate(%):", m => m.dividendRate, null, "DividendRate")
                .addNumber("Interest Rate(%):", m => m.interestRate, null, "InterestRate")
                .addTextInput("Status", m => m.statusName, null, "Status")
                .withQA("Form")
                .render()
        )
    }
        
    private renderNewsAlert() {
        this.updateNewsAlert = new UpdateNewsAlert();
        this.updateNewsAlert
            .open();
    }

    private renderButtons(): JSX.Element {
        let combined = Pending.combine(this.props.whtRate, this.props.audit, (whtRate, audit) => { return { whtRate, audit } })

        return Loader.for(combined, (combined) => {
            let canApprove = this.props.currentUserId != combined.audit[0].changeById;

            combined.whtRate.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && this.renderNewsAlert()

            return (
                <div>
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
                    {combined.whtRate.status === Dtos.TrmEntityStatus.Draft && <button className="btn btn-outline-secondary" onClick={() => this.deleteWhtRate()} data-qa="BackToListButton">Delete</button>}
                    {combined.whtRate.status !== Dtos.TrmEntityStatus.AwaitingVerification && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" disabled={(this.props.whtRate.data && this.props.whtRate.data.currentAwaitingVerificationVersionId) != null} onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>}
                    {combined.whtRate.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="ApproveButton">Approve</button>}
                    {combined.whtRate.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onReject()} data-qa="RejectButton">Reject</button>}
                    {combined.whtRate.status === Dtos.TrmEntityStatus.Published && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" onClick={() => this.props.onCopy(this.props.whtRate.data.id)} data-qa="CopyButton">Copy</button>}
                </div>);
        });
    };

    private renderExceptions() {
        return Loader.for(this.props.whtRate, rate => {
            return (<ExceptionDetails exceptions={rate.exceptions}/>); });
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
    private deleteWhtRate() {

        this.deleteConfirmation = new DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Withholding Rate?")
            .setMessage(<p>{'Are you sure you want to delete this Withholding Rate?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.onDelete(this.props.whtRate.data.id)
            })
            .withQA("DeleteWithholdingRateDialog")
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