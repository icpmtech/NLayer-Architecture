import * as React from 'react';
import { Dtos } from '../../../adr';
import { Pending, Loader, FormBuilder, DialogBuilder, safeClone } from '../../../classes';
import { EditExceptions } from './editExceptions';
import { WhtRateDtoValidator } from '../../../validators/whtRateDtoValidator';
import { UpdateNewsAlert } from '../updateNewsAlert'

interface EditProps {
    onCancel: () => void;
    onSave: () => void;
    onPublishDraft: () => void;
    onEditPublished?: () => void;
    whtRate: Pending<Dtos.WhtRateDto>;
    validator: WhtRateDtoValidator;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    entityTypes: Pending<Dtos.EntityTypeSummaryDto[]>;
    stockTypes: Pending<Dtos.StockTypeDto[]>;
    exceptionTypes: Pending<Dtos.EnumDisplayDto[]>;
    onChange: (dto) => void;
    showLiveRecords: boolean;
    currentCountryId?: number;
}

interface EditState {
    isDirty?: boolean
}

export class Edit extends React.Component<EditProps, EditState> {

    private updateNewsAlert: UpdateNewsAlert;

    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Pending.combine(mappedCountries, this.props.whtRate, (mappedCountries, whtRate) => { return { mappedCountries, whtRate }; });
        let val = this.props.validator;

        return Loader.for(combinedAll, loadedData => {
            if (this.props.currentCountryId && !loadedData.whtRate.reclaimMarket)
                loadedData.whtRate.reclaimMarket = { id: this.props.currentCountryId } as Dtos.CountrySummaryDto;

            return new FormBuilder(loadedData.whtRate)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto) })
                .isWide(true)
                .addDropdown("Reclaim Market", loadedData.mappedCountries.filter(x => x.code != "ALL"), m => loadedData.mappedCountries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = (v && this.props.countries.data.find(x => x.id === v.id)), "ReclaimMarket", val.reclaimMarket)
                .addDate("Effective Date", (m) => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDate", val.effectiveDate)
                .addNumber("Dividend Rate(%):", m => m.dividendRate, (m, v) => m.dividendRate = v, "DividendRate", val.dividendRate)
                .addNumber("Interest Rate(%):", m => m.interestRate, (m, v) => m.interestRate = v, "InterestRate", val.interestRate)
                .addTextInput("Status", m => m.statusName, null, "Status", null, { disabled: true })
                .withQA("Form")
                .render();
        });
    }

    renderExceptions() {
        if (!this.props.whtRate.data) return null;

        return <EditExceptions exceptions={this.props.whtRate.data.exceptions}
            onChange={(dto) => { this.setState({ isDirty: true }); this.onExceptionsChange(dto) }}
            stockTypes={this.props.stockTypes}
            entityTypes={this.props.entityTypes}
            countries={this.props.countries}
            exceptionTypes={this.props.exceptionTypes}
           
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

    private onExceptionsChange(newExceptions: Dtos.WhtRateExceptionDto[]) {
        let whtRate = safeClone(this.props.whtRate.data);
        whtRate.exceptions = newExceptions;
        this.props.onChange(whtRate);
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
        if (!this.props.whtRate.data) return null;

        return this.props.whtRate.data.status == Dtos.TrmEntityStatus.Published ?
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onEditPublished())} data-qa="PublishChangesButton">Publish Changes</button> :
            <button className="btn btn-primary" onClick={() => this.showNewsAlert(() => this.props.onPublishDraft())} data-qa="SaveAndPublish">Save and publish</button>
    }

    private renderSaveAsDraftButton() {
        if (!this.props.whtRate.data) return null;

        return this.props.whtRate.data.status != Dtos.TrmEntityStatus.Published && <button className="btn btn-outline-secondary" onClick={() => this.props.onSave()} data-qa="SaveAsDraftButton">Save as draft</button>;
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