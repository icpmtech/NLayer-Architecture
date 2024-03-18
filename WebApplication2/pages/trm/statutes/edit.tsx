import * as React from 'react';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder, DialogBuilder, safeClone } from '../../../classes';
import { EditExceptions } from './editExceptions';
import { QualifierDate } from './qualifierDate';
import { StatuteOfLimitationsMonths } from './statuteOfLimitationsMonths';
import { StatuteDtoValidator } from '../../../validators/statuteDtoValidator';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface EditProps {
    onCancel: (id) => void;
    onSave: () => void;
    onPublish: () => void;
    onEditPublished?: () => void;
    statute: Pending<Dtos.StatuteDto>;
    validator: StatuteDtoValidator;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    qualifierTypes: Pending<Dtos.EnumDisplayDto[]>;
    onChange: (dto) => void;
    currentCountryId?: number;
}

interface EditState {
    isDirty?: boolean;
}

export class Edit extends React.Component<EditProps, EditState> {
    
    private updateNewsAlert: UpdateNewsAlert;

    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let mappedQualifierTypes = this.props.qualifierTypes.map(x => x.map(qt => { return { name: qt.label, id: qt.value } }));
        let combinedAll = Pending.combine(mappedCountries, mappedQualifierTypes, this.props.statute, (mappedCountries, mappedQualifierTypes, statute) => { return { mappedCountries, mappedQualifierTypes, statute }; });
        let val = this.props.validator;

        return Loader.for(combinedAll, loadedData => {
            if (this.props.currentCountryId && !loadedData.statute.reclaimMarket)
                loadedData.statute.reclaimMarket = { id: this.props.currentCountryId } as Dtos.CountrySummaryDto;

            let form = new FormBuilder(loadedData.statute)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto) })
                .isWide(true)
                .addDropdown("Reclaim Market", loadedData.mappedCountries, m => loadedData.mappedCountries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = (v && this.props.countries.data.find(x => x.id === v.id)), "ReclaimMarket", val.reclaimMarket)
                .addDate("Effective Date", (m) => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDate", val.effectiveDate)
                .addCustom("Statute of Limitations", this.renderStatuteMonths(loadedData.statute), "StatueOfLimitation", val.statuteOfLimitations)
                .addDropdown("Qualifier Type", loadedData.mappedQualifierTypes, m => loadedData.mappedQualifierTypes.find(x => x.id === m.qualifierType), (m, v) => m.qualifierType = v && v.id, "QualifierType", val.qualifierType)
                .withQA("Form")

            if (loadedData.statute.qualifierType === Dtos.StatuteQualifierType.FromDateAfterPayDate) {
                form.addCustom("Qualifier Date", this.renderQualifierDate(loadedData.statute.qualifierMonth, loadedData.statute.qualifierDay), "QualifierDate", val.qualifierDate);
            }

            form.addTextInput("Status", m => m.statusName, null, "Status", null, { disabled: true });
            return form.render();
        });
    }
    private statuteMonthsChanged(months?: number) {
        this.props.statute.data.statuteOfLimitationsMonths = months;
    }

    private statuteDaysChanged(days?: number) {
        this.props.statute.data.statuteOfLimitationsDays = days;
    }

    private qualifierDateChanged(month?: number, day?: number) {
        this.props.statute.data.qualifierMonth = month;
        this.props.statute.data.qualifierDay = day;
    }

    private renderStatuteMonths(statute: Dtos.StatuteDto) {
        return (<StatuteOfLimitationsMonths months={statute.statuteOfLimitationsMonths} days={statute.statuteOfLimitationsDays} onMonthsChange={x => this.statuteMonthsChanged(x)} onDaysChange={x => this.statuteDaysChanged(x)}/>);
    }

    private renderQualifierDate(qualifierMonth?: number, qualifierDay?: number): JSX.Element {
        return (<QualifierDate onChange={x => this.qualifierDateChanged(x.month, x.day)} qualifier={{ month: qualifierMonth, day: qualifierDay }}/>);
    }

    renderExceptions() {
        return this.props.statute.data && <EditExceptions
            countries={this.props.countries}
            exceptions={this.props.statute.data.exceptions}
            onChange={(dto) => { this.setState({ isDirty: true }); this.onExceptionsChange(dto) }}
            qualifierTypes={this.props.qualifierTypes}
           
        />;
    }
    
    private showNewsAlert(onClose: () => void) {
        this.updateNewsAlert = new UpdateNewsAlert();
        this.updateNewsAlert
            .setCloseHandler(onClose)
            .open();
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
                    this.props.onCancel(this.props.statute.data.id);
                })
                .setCancelHandler(() => {
                    this.confirmCancelDialog.close();
                    this.confirmCancelDialog = null;
                })
                ;
            this.confirmCancelDialog.open();

        }
        else {
            this.props.onCancel(this.props.statute.data.id);
        }
    }

    private onExceptionsChange(newExceptions: Dtos.StatuteExceptionDto[]) {
        let statute = safeClone(this.props.statute.data);
        statute.exceptions = newExceptions;
        this.props.onChange(statute);
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
        if (!this.props.statute.data) return null;

        return this.props.statute.data.status == Dtos.TrmEntityStatus.Published ?
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onEditPublished())} data-qa="PublishChangesButton">Publish Changes</button> :
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onPublish())} data-qa="SaveAndPublishButton">Save and publish</button>
    }

    private renderSaveAsDraftButton() {
        if (!this.props.statute.data) return null;

        return this.props.statute.data.status != Dtos.TrmEntityStatus.Published && <button className="btn btn-outline-secondary" onClick={() => this.props.onSave()} data-qa="SaveAsDraftButton">Save as draft</button>;
    }

    render() {
        return (
            <div>
                {this.renderform()}
                {this.renderExceptions()}
                <div className="text-end">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}