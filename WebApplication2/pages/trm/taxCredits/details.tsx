import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { DateTime } from '../../../components/stateless';
import { Audit } from '../../../components/audit';

interface DetailsProps {
    taxCredit: Framework.Pending<Dtos.TaxCreditDto>;
    taxCreditAudit: Framework.Pending<Dtos.TaxCreditAuditDto[]>;
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
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

    private renderForm() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Framework.Pending.combine(this.props.taxCredit,
            mappedCountries,
            (taxCredit, countries) => { return { taxCredit, countries }; });

        return Framework.Loader.for(combinedAll, all =>
            new Framework.FormBuilder(all.taxCredit)
                .isDisabled(true)
                .isWide(true)
                .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), null, "ReclaimMarket")
                .addDropdown("Country of Residence", all.countries, m => all.countries.find(x => x.id === (m.countryOfResidence && m.countryOfResidence.id)), null, "CountryOfResidence")
                .addDate("Effective Date", m => m.effectiveDate, null, "EffectiveDate")
                .addGroupHeading("Rates", "Rates")
                .addNumber("Standard Dividend Rate(%):", m => m.standardDividendRate, null, "StandardDividendRate")
                .addTextArea("Narrative", m => m.standardDividendRateNarrative, null, "NarritiveDividend")
                .addNumber("Standard Interest Rate(%):", m => m.standardInterestRate, null, "StandardInterestRate")
                .addTextArea("Narrative", m => m.standardInterestRateNarrative, null, "NarritiveInterest")
                .addTextInput("Status", m => m.statusName, null, "Status", null, { disabled: true })
                .withQA("Form")
                .render()
        );
    }

    private renderExceptions() {
        if (!this.props.taxCredit || !this.props.taxCredit.data) return null;

        if (!this.props.taxCredit.data.exceptions || this.props.taxCredit.data.exceptions.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="TaxCreditHasNoExceptions">This Tax Credit has no exceptions</div>);
        }

        return Framework.SimpleGridBuilder.For(this.props.taxCredit.data.exceptions)
            .addString("Entity Type", x => x.entityType.description, null, "EntityType")
            .addString("Stock Type", x => x.stockType.name, null, "StockType")
            .addPercentage("Rate", x => x.rate, null, "Rate")
            .addString("Narrative", x => x.narrative, null, "Narrative")
            .render();
    }

    private renderAudit() {
        if (!this.props.taxCreditAudit.data) return null;
        var auditableEntity = {
            createdBy: this.props.taxCreditAudit.data[this.props.taxCreditAudit.data.length - 1].changeByName,
            createdOn: this.props.taxCreditAudit.data[this.props.taxCreditAudit.data.length - 1].changedOn,
            lastUpdatedBy: this.props.taxCreditAudit.data[0].changeByName,
            lastUpdatedOn: this.props.taxCreditAudit.data[0].changedOn
        }
        return (<Audit auditableEntity={auditableEntity}/>);
    }

    private renderButtons(): JSX.Element {
        var combined = Framework.Pending.combine(this.props.taxCredit, this.props.taxCreditAudit, (taxCredit, audit) => { return { taxCredit, audit } })

        return Framework.Loader.for(combined, (combined) => {
            var canApprove = this.props.currentUserId != combined.audit[0].changeById;
            
            return (<div>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
                {combined.taxCredit.status === Dtos.TrmEntityStatus.Draft && <button className="btn btn-outline-secondary" onClick={() => this.deleteTaxCredit()} data-qa="DeleteButton">Delete</button>}
                {combined.taxCredit.status !== Dtos.TrmEntityStatus.AwaitingVerification && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" disabled={(this.props.taxCredit.data && this.props.taxCredit.data.currentAwaitingVerificationVersionId) != null} onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>}
                {combined.taxCredit.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="AprroveButton">Approve</button>}
                {combined.taxCredit.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onReject()} data-qa="RejectButton">Reject</button>}
                {combined.taxCredit.status === Dtos.TrmEntityStatus.Published && !this.props.isTrmReadOnlyUser && <button className="btn btn-primary" onClick={() => this.props.onCopy(this.props.taxCredit.data.id)} data-qa="CopyButton">Copy</button>}
            </div>)
        });
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteTaxCredit() {

        this.deleteConfirmation = new Framework.DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete Tax Credit?")
            .setMessage(<p>{'Are you sure you want to delete this Tax Credit?'}</p>)
            .withQA("DeleteTaxCreditConfirmation")
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.onDelete(this.props.taxCredit.data.id)
            })
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