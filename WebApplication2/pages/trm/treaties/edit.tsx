import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { DialogBuilder } from "../../../classes/dialogBuilder";
import { TreatyDtoValidator } from '../../../validators/treatyDtoValidator';
import { EditExceptions } from './editexceptions';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface EditProps {
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    treatyTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    treatyExceptionTypes: Framework.Pending<Dtos.EnumDisplayDto[]>;
    entityTypes: Framework.Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Framework.Pending<Dtos.StockTypeDto[]>;
    treaty: Framework.Pending<Dtos.TreatyDto>;
    validation: TreatyDtoValidator;
    onChange: (dto: Dtos.TreatyDto) => void,
    onSave: () => void;
    onPublishDraft: () => void;
    onEditPublished?: () => void;
    onCancel: () => void;
    onReciprocalChanged: (r: boolean) => void;
    createReciprocal: boolean;
    showLiveRecords: boolean;
    currentCountryId?: number;
}

interface EditState {
    isDirty: boolean;
}

export class Edit extends React.Component<EditProps, EditState> {
    
    private updateNewsAlert: UpdateNewsAlert;

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
        let mappedTreatyTypes = this.props.treatyTypes.map(x => x.map(treatyType => { return { name: treatyType.label, id: treatyType.value } }));

        let combinedAll = Framework.Pending.combine(this.props.treaty, mappedCountries, mappedTreatyTypes, (treaty, countries, treatyTypes) => { return { treaty, countries, treatyTypes }; });
        let val = this.props.validation;

        return Framework.Loader.for(combinedAll, all => {
            if (this.props.currentCountryId && !all.treaty.reclaimMarket)
                all.treaty.reclaimMarket = { id: this.props.currentCountryId } as Dtos.CountrySummaryDto;

            var form = new Framework.FormBuilder(all.treaty)
                .isWide(true)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto); })
                .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = v && this.props.countries.data.find(x => x.id === v.id), "ReclaimMarket", val.reclaimMarket)
                .addDropdown("Country of Residence", all.countries, m => all.countries.find(x => x.id === (m.countryOfResidence && m.countryOfResidence.id)), (m, v) => m.countryOfResidence = v && this.props.countries.data.find(x => x.id === v.id), "CountryOfResidence", val.countryOfResidence)
                .addDropdown("Treaty Type", all.treatyTypes, m => all.treatyTypes.find(x => x.id === m.treatyType), (m, v) => m.treatyType = v && v.id, "TreatyType", val.treatyType)
                .addTextInput("Status", m => m.statusName, null, "Status", null, { disabled: true })
                .addGroupHeading("Dates", "Dates")
                .addDate("Signed Date", m => m.signedDate, (m, v) => m.signedDate = v, "SignedDate")
                .addDate("Approved Date", m => m.approvedDate, (m, v) => m.approvedDate = v, "ApprovedDate")
                .addDate("Ratified Date", m => m.ratifiedDate, (m, v) => m.ratifiedDate = v, "RatifiedDate")
                .addDate("In Force Date", m => m.inForceDate, (m, v) => m.inForceDate = v, "InForceDate")
                .addDate("Effective Date", m => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDate", val.effectiveDate)
                .addGroupHeading("Rates", "Rates")
                .addNumber("Standard Dividend Rate(%):", m => m.standardDividendRate, (m, v) => m.standardDividendRate = v, "StandardDividendRate", val.standardDividendRate, { decimals: 4 })
                .addTextArea("Narrative", m => m.standardDividendRateNarrative, (m, v) => m.standardDividendRateNarrative = v, "NarrativeDividend", val.standardDividendRateNarrative)
                .addNumber("Standard Interest Rate(%):", m => m.standardInterestRate, (m, v) => m.standardInterestRate = v, "StandardInterestRate", val.standardInterestRate, { decimals: 4 })
                .addTextArea("Narrative", m => m.standardInterestRateNarrative, (m, v) => m.standardInterestRateNarrative = v, "NarrativeInterest", val.standardInterestRateNarrative)
                .withQA("Form")
                ;

            if (!all.treaty.id) {
                form
                    .addGroupHeading("Reciprocal Treaty", "reciprocalTreaty")
                    .addCheckBox("", m => this.props.createReciprocal, (m, v) => this.props.onReciprocalChanged(v), "ReciprocalTreaty",
                        <span>Create the corresponding reciprocal treaty between these two countries (if one does not already exist)?</span>);
            }

            return form.render();
        });
    }
    
    private showNewsAlert(onClose: () => void) {
        this.updateNewsAlert = new UpdateNewsAlert();
        this.updateNewsAlert
            .setCloseHandler(onClose)
            .open();
    }

    private renderExceptions() {
        if (!this.props.treaty.data) return null;

        return <EditExceptions
            exceptions={this.props.treaty.data.exceptions}
            entityTypes={this.props.entityTypes}
            stockTypes={this.props.stockTypes}
            treatyExceptionTypes={this.props.treatyExceptionTypes}
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
        if (!this.props.treaty.data) return null;

        return this.props.treaty.data.status == Dtos.TrmEntityStatus.Published ?
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onEditPublished())} data-qa="PublishChangesButton">Publish Changes</button> :
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onPublishDraft())} data-qa="SaveAndPublishButton">Save and publish</button>
    }

    private renderSaveAsDraftButton() {
        if (!this.props.treaty.data) return null;

        return this.props.treaty.data.status != Dtos.TrmEntityStatus.Published && <button className="btn btn-outline-secondary" onClick={() => this.props.onSave()} data-qa="SaveAsDraftButton">Save as draft</button>;
    }

    private onExceptionsChange(exceptions: Dtos.TreatyExceptionDto[]) {
        let treaty = Framework.safeClone(this.props.treaty);
        treaty.data.exceptions = exceptions;
        this.props.onChange(treaty.data);
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
                .withQA("UnsavedChangesDialog")
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel();
        }
    }
}