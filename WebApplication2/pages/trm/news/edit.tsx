import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { StatefulEditor } from '../../../components/inputs/statefulEditor';
import { DialogBuilder } from "../../../classes/dialogBuilder";
import { NewsDtoValidator } from '../../../validators/newsDtoValidator';
import { EditSources } from './editSources';

interface EditProps {
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    categories: Framework.Pending<string[]>;
    news: Framework.Pending<Dtos.NewsDto>;
    validation: NewsDtoValidator;
    onPublishDraft: () => void;
    onEditPublished?: () => void;
    onChange: (dto: Dtos.NewsDto) => void,
    onSave: () => void;
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
                {this.renderform() }
                {this.renderSources()}
                {this.renderSourceError() }
                {this.renderButtons() }
            </div>
        );
    }
     
    private renderSourceError() {
        return !!this.props.news && !!this.props.news.data && !!this.props.news.data.sources && !this.props.news.data.sources.length && !this.props.validation.sources.isValid() && this.props.validation.showValidationErrors()
            && <div className="field-validation-error" data-qa="YuMustAddAtLeastOneSource">You must add at least one source before you can save.</div>;
    }
    
    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));

        let combinedAll = Framework.Pending.combine(this.props.news, mappedCountries, this.props.categories,
            (news, countries, categories) => { return { news, countries, categories }; });
        let val = this.props.validation;

        return Framework.Loader.for(combinedAll, all => {
            if (this.props.currentCountryId && !all.news.reclaimMarket)
                all.news.reclaimMarket = { id: this.props.currentCountryId } as Dtos.CountrySummaryDto;

            return new Framework.FormBuilder(all.news)
                .isWide(true)
                .setChangeHandler(dto => { this.setState({ isDirty: true }); this.props.onChange(dto); })
                .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = v && this.props.countries.data.find(x => x.id === v.id), "ReclaimMarket", val.reclaimMarket)
                .addTextInput("Title", m => m.title, (m, v) => m.title = v, "Title", val.title)
                .addTextArea("Summary", x => x.summaryText, (m, v) => m.summaryText = v, "Summary")
                .addCustom("Content", <StatefulEditor initialValue={all.news.newsContent}
                    onChange={(x) => all.news.newsContent = x}
                    readOnly={false} />, "Content", val.content)
                .addAutoComplete("Category", all.categories, m => m, m => all.categories.find(x => x == m.category), (m, v) => m.category = v, "Category", this.props.validation.category, { allowAddNew: true })
                .addDate("Effective Date", m => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDate", val.effectiveDate)
                .addTextInput("Status", x => x.statusName, null, "Status", null, { disabled: true })
                .withQA("Form")
                .render();
            });
    }

    private onSourceChange(sources: Dtos.NewsSourceDto[]) {
        let news = Framework.safeClone(this.props.news);
        news.data.sources = sources;
        this.props.onChange(news.data);
    }

    private renderSources() {
        if (!this.props.news.data) return null;

        return <EditSources
            sources={this.props.news.data.sources}
            onChange={(dtos) => { this.setState({ isDirty: true }); this.onSourceChange(dtos); }}
           
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
        if (!this.props.news.data) return null;

        return this.props.news.data.status == Dtos.TrmEntityStatus.Published ?
            <button className="btn btn-primary" onClick={() => this.props.onEditPublished()} data-qa="PublishChangesButton">Publish Changes</button> :
            <button className="btn btn-primary" onClick={() => this.props.onPublishDraft()} data-qa="SaveAndPublishButton">Save and publish</button>
    }

    private renderSaveAsDraftButton() {
        if (!this.props.news.data) return null;

        return this.props.news.data.status != Dtos.TrmEntityStatus.Published && <button className="btn btn-outline-secondary" onClick={() => this.props.onSave()} data-qa="SaveAsDraftButton">Save as draft</button>;
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