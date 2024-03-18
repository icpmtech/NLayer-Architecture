import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { Audit } from '../../../components/audit';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface DetailsProps {
    treaty: Framework.Pending<Dtos.TreatyDto>;
    treatyAudit: Framework.Pending<Dtos.TreatyAuditDto[]>;
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    treatyTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    currentUserId: number;
    isTrmReadOnlyUser: boolean;
    onBack: () => void;
    onEdit: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete: (id) => void;
    onCopy: (id) => void;
}

export class Details extends React.Component<DetailsProps, {}> {

    private updateNewsAlert: UpdateNewsAlert;
    
    private renderForm() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let mappedTreatyTypes = this.props.treatyTypes.map(x => x.map(treatyType => { return { name: treatyType.label, id: treatyType.value } }));
        let combinedAll = Framework.Pending.combine(this.props.treaty,
            mappedCountries,
            mappedTreatyTypes,
            (treaty, countries, treatyTypes) => { return { treaty, countries, treatyTypes }; });

        return Framework.Loader.for(combinedAll, all =>
            new Framework.FormBuilder(all.treaty)
            .isDisabled(true)
            .isWide(true)
            .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), null, "ReclaimMarket")
            .addDropdown("Country of Residence", all.countries, m => all.countries.find(x => x.id === (m.countryOfResidence && m.countryOfResidence.id)), null, "CountryOfResidence")
            .addDropdown("Treaty Type", all.treatyTypes, m => all.treatyTypes.find(x => x.id === m.treatyType), null, "TreatyType")
            .addTextInput("Status", m => m.statusName, null, "Status")

            .addGroupHeading("Dates", "Dates")
            .addDate("Signed Date", m => m.signedDate, null, "SignedDate")
            .addDate("Approved Date", m => m.approvedDate, null, "ApprovedDate")
            .addDate("Ratified Date", m => m.ratifiedDate, null, "RatifiedDate")
            .addDate("In Force Date", m => m.inForceDate, null, "InForceDate")
            .addDate("Effective Date", m => m.effectiveDate, null, "EffectiveDate")
            .addGroupHeading("Rates", "Rates")
            .addNumber("Standard Dividend Rate(%):", m => m.standardDividendRate, null, "StandardDividendRate")
            .addTextArea("Narrative", m => m.standardDividendRateNarrative, null, "NarrativeDividend")
            .addNumber("Standard Interest Rate(%):", m => m.standardInterestRate, null, "StandardInterestRate")
            .addTextArea("Narrative", m => m.standardInterestRateNarrative, null, "NarrativeInterest")
            .withQA("Form")
            .render()
        );
    }
        
    private renderNewsAlert() {
        this.updateNewsAlert = new UpdateNewsAlert();
        this.updateNewsAlert
            .open();
    }

    private renderExceptions() {
        if (!this.props.treaty || !this.props.treaty.data) return null;
        if (!this.props.treaty.data.exceptions || this.props.treaty.data.exceptions.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="TreatyHasNoExceptions">This Treaty has no exceptions</div>);
        }

        return Framework.SimpleGridBuilder.For(this.props.treaty.data.exceptions)
            .addString("Entity Type", x => x.entityType.description, null, "EntityType")
            .addString("Stock Type", x => x.stockType.name, null, "StockType")
            .addString("Exception Type", x => x.exceptionTypeName, null, "ExceptionType")
            .addPercentage("Rate", x => x.rate, null, "Rate")
            .addString("Narrative", x => x.narrative, null, "Narrative")
            .withQA("Grid")
            .render();
    }

    private renderAudit() {
        if (!this.props.treatyAudit.data) return null;
        let auditableEntity = {
            createdBy: this.props.treatyAudit.data[this.props.treatyAudit.data.length - 1].changeByName,
            createdOn: this.props.treatyAudit.data[this.props.treatyAudit.data.length - 1].changedOn,
            lastUpdatedBy: this.props.treatyAudit.data[0].changeByName,
            lastUpdatedOn: this.props.treatyAudit.data[0].changedOn
        }
        return (<Audit auditableEntity={auditableEntity}/>);
    }

    private renderButtons(): JSX.Element {
        let combined = Framework.Pending.combine(this.props.treaty, this.props.treatyAudit, (treaty, audit) => { return { treaty, audit } })
        
        return Framework.Loader.for(combined, (combined) => {
            let canApprove = this.props.currentUserId != combined.audit[0].changeById;

            combined.treaty.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && this.renderNewsAlert()
            
            return (<div>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
                {combined.treaty.status === Dtos.TrmEntityStatus.Draft && <button className="btn btn-outline-secondary" onClick={() => this.deleteTreaty()} data-qa="DeleteButton">Delete</button>}
                {combined.treaty.status !== Dtos.TrmEntityStatus.AwaitingVerification && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" disabled={combined.treaty.currentAwaitingVerificationVersionId != null} onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>}
                {combined.treaty.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="ApproveButton">Approve</button>}
                {combined.treaty.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onReject()} data-qa="RejectButton">Reject</button>}
                {combined.treaty.status === Dtos.TrmEntityStatus.Published && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" onClick={() => this.props.onCopy(this.props.treaty.data.id)} data-qa="CopyButton">Copy</button>}
            </div>);
        });
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteTreaty() {

        this.deleteConfirmation = new Framework.DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Treaty?")
            .setMessage(<p>{'Are you sure you want to delete this Treaty?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.onDelete(this.props.treaty.data.id)
            })
            .withQA("DeleteTreatyDailog")
            .open();
    }

    render() {
        return (
            <div>
                {this.renderForm()}
                {this.renderExceptions()}
                {this.renderAudit()}
                <div className="text-end">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}