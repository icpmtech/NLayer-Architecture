import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import * as Form from '../../../components';
import { DialogBuilder } from "../../../classes/dialogBuilder";
import { TaxCreditDtoValidator } from '../../../validators/taxCreditDtoValidator';
import { EditExceptions } from './editexceptions';

interface EditProps {
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Framework.Pending<Dtos.StockTypeDto[]>;
    taxCredit: Framework.Pending<Dtos.TaxCreditDto>;
    validation: TaxCreditDtoValidator;
    onChange: (dto: Dtos.TaxCreditDto) => void,
    onSave: () => void;
    onPublishDraft: () => void;
    onEditPublished?: () => void;
    onCancel: () => void;
    showLiveRecords: boolean;
    currentCountryId?: number;
}

interface EditState {
    isDirty: boolean;
}

export class Edit extends React.Component<EditProps, EditState> {

    render() {
        return (
            <div>
                {this.renderform()}
                {this.renderExceptions()}
                {this.renderButtons()}
            </div>
        );
    }

    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Framework.Pending.combine(mappedCountries, this.props.taxCredit, (countries, taxCredit) => { return { countries, taxCredit }; });
        let val = this.props.validation;

        return Framework.Loader.for(combinedAll, all => {
            if (this.props.currentCountryId && !all.taxCredit.reclaimMarket)
                all.taxCredit.reclaimMarket = { id: this.props.currentCountryId } as Dtos.CountrySummaryDto;

            return new Framework.FormBuilder(all.taxCredit)
                .isWide(true)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto); })
                .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = v && this.props.countries.data.find(x => x.id === v.id), "ReclaimMarket", val.reclaimMarket)
                .addDropdown("Country of Residence", all.countries, m => all.countries.find(x => x.id === (m.countryOfResidence && m.countryOfResidence.id)), (m, v) => m.countryOfResidence = v && this.props.countries.data.find(x => x.id === v.id), "CountryOfResidence", val.countryOfResidence)
                .addDate("Effective Date", m => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDates", val.effectiveDate)
                .addGroupHeading("Rates", "Rates")
                .addNumber("Standard Dividend Rate(%):", m => m.standardDividendRate, (m, v) => m.standardDividendRate = v, "StandardDividendRate", val.standardDividendRate, { decimals: 4 })
                .addTextArea("Narrative", m => m.standardDividendRateNarrative, (m, v) => m.standardDividendRateNarrative = v, "NarrativeDividend", val.standardDividendRateNarrative)
                .addNumber("Standard Interest Rate(%):", m => m.standardInterestRate, (m, v) => m.standardInterestRate = v, "StandardInterestRate", val.standardInterestRate, { decimals: 4 })
                .addTextArea("Narrative", m => m.standardInterestRateNarrative, (m, v) => m.standardInterestRateNarrative = v, "NarrativeInterest", val.standardInterestRateNarrative)
                .addTextInput("Status", m => m.statusName, null, "Status", null, { disabled: true })
                .withQA("Form")
                .render();
        });
    }

    private renderExceptions() {
        if (!this.props.taxCredit.data) return null;

        return <EditExceptions
            exceptions={this.props.taxCredit.data.exceptions}
            entityTypes={this.props.entityTypes}
            stockTypes={this.props.stockTypes}
            onChange={(dtos) => { this.setState({ isDirty: true }); this.onExceptionsChange(dtos); }}
           
        />;
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.confirmCancel()} data-qa="CancelButton">Cancel</button>
                {this.renderSaveAsDraftButton()}
                {this.renderPublishButton()}
            </div>
        );
    }

    private renderPublishButton() {
        if (!this.props.taxCredit.data) return null;

        return this.props.taxCredit.data.status == Dtos.TrmEntityStatus.Published ?
            <button className="btn btn-primary" onClick={() => this.props.onEditPublished()} data-qa="PublishChangesButton">Publish Changes</button> :
            <button className="btn btn-primary" onClick={() => this.props.onPublishDraft()} data-qa="SaveAndPublishButton">Save and publish</button>
    }

    private renderSaveAsDraftButton() {
        if (!this.props.taxCredit.data) return null;

        return this.props.taxCredit.data.status != Dtos.TrmEntityStatus.Published && <button className="btn btn-outline-secondary" onClick={() => this.props.onSave()} data-qa="SaveAsDraftButton">Save as draft</button>;
    }

    private onExceptionsChange(exceptions: Dtos.TaxCreditExceptionDto[]) {
        let taxCredit = Framework.safeClone(this.props.taxCredit);
        taxCredit.data.exceptions = exceptions;
        this.props.onChange(taxCredit.data);
    }

    private confirmCancelDialog: DialogBuilder;

    private confirmCancel() {
        if (this.state && this.state.isDirty) {
            let message = <div>
                <p>You have unsaved changes, are you sure you want to cancel?</p>
            </div>;

            this.confirmCancelDialog = new DialogBuilder()
                .setMessage(message)
                .setConfirmHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                    this.props.onCancel();
                })
                .setCancelHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                })
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel();
        }
    }
}