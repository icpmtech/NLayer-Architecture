import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { DateTime } from '../../../components/stateless';
import { Audit } from '../../../components/audit';
import { StatefulEditor } from '../../../components/inputs/statefulEditor';

interface DetailsProps {
    news: Framework.Pending<Dtos.NewsDto>;
    newsAudit: Framework.Pending<Dtos.NewsAuditDto[]>;
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    currentUserId: number;
    isTrmReadOnlyUser: boolean;
    onBack: () => void;
    onEdit: () => void;
    onApprove: () => void;
    onReject: () => void;
    onDelete: (id) => void;
}

export class Details extends React.Component<DetailsProps, {}> {

    private renderForm() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Framework.Pending.combine(this.props.news,
            mappedCountries,
            (news, countries) => { return { news, countries }; });

        return Framework.Loader.for(combinedAll, all =>
            new Framework.FormBuilder(all.news)
                .isDisabled(true)
                .isWide(true)
                .addDropdown("Reclaim Market", all.countries, m => all.countries.find(x => x.id === (m.reclaimMarket && m.reclaimMarket.id)), (m, v) => m.reclaimMarket = v && this.props.countries.data.find(x => x.id === v.id), "ReclaimMarket")
                .addTextInput("Title", m => m.title, (m, v) => m.title = v, "Title")
                .addTextArea("Summary", x => x.summaryText, (m, v) => m.summaryText = v, "Summary")
                .addCustom("Content", <StatefulEditor initialValue={(all.news as Dtos.NewsDto).newsContent}
                    onChange={(x)=>x}
                    readOnly={true} />, "Content")
                .addTextInput("Category", m => m.category, (m, v) => m.category = v, "Category")
                .addDate("Effective Date", m => m.effectiveDate, (m, v) => m.effectiveDate = v, "EffectiveDate")
                .addTextInput("Status", m => m.statusName, null, "Status")
                .withQA("Form")
                .render()
        );
    }

    private renderSources() {
        if (!this.props.news.data) return null;
        if (!this.props.news.data.sources || this.props.news.data.sources.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="ThisNewsHasNoSources">This News has no sources</div>);
        }

        return Framework.SimpleGridBuilder.For(this.props.news.data.sources)
            .addString("Name", x => x.name, null, "Name")
            .addDate("Date", x => x.date, null, "Date")
            .addString("Source", x => x.source, null, "Source")
            .render();
    }

    private renderAudit() {
        if (!this.props.newsAudit.data) return null;
        var auditableEntity = {
            createdBy: this.props.newsAudit.data[this.props.newsAudit.data.length - 1].changeByName,
            createdOn: this.props.newsAudit.data[this.props.newsAudit.data.length - 1].changedOn,
            lastUpdatedBy: this.props.newsAudit.data[0].changeByName,
            lastUpdatedOn: this.props.newsAudit.data[0].changedOn
        }
        return (<Audit auditableEntity={auditableEntity}/>);
    }    

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteNews() {

        this.deleteConfirmation = new Framework.DialogBuilder();
        this.deleteConfirmation
            .setTitle("Delete News?")
            .setMessage(<p>{'Are you sure you want to delete this News?'}</p>)
            .setCancelHandler(() => this.deleteConfirmation.close())
            .setConfirmHandler(() => {
                this.deleteConfirmation.close();
                this.props.onDelete(this.props.news.data.id)
            })
            .withQA("DeleteConfirmation")
            .open();
    }
    private renderButtons(): JSX.Element {
        var combined = Framework.Pending.combine(this.props.news, this.props.newsAudit, (news, audit) => { return { news, audit } })

        return Framework.Loader.for(combined, (combined) => {
            var canApprove = this.props.currentUserId != combined.audit[0].changeById;

            return (<div>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
                {!this.props.isTrmReadOnlyUser && combined.news.status === Dtos.TrmEntityStatus.Draft && <button className="btn btn-outline-secondary" onClick={() => this.deleteNews()} data-qa="DeleteButton">Delete</button>}
                {!this.props.isTrmReadOnlyUser && combined.news.status !== Dtos.TrmEntityStatus.AwaitingVerification && <button className="btn btn-primary" disabled={combined.news.currentAwaitingVerificationVersionId != null} onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>}
                {!this.props.isTrmReadOnlyUser && combined.news.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="ApproveButton">Approve</button>}
                {!this.props.isTrmReadOnlyUser && combined.news.status === Dtos.TrmEntityStatus.AwaitingVerification && canApprove && <button className="btn btn-primary" onClick={() => this.props.onReject()} data-qa="RejectButton">Reject</button>}
            </div>)
        });
    }

    render() {
        return (
            <div>
                {this.renderForm() }
                {this.renderSources()}
                {this.renderAudit()}
                <div className="text-end">
                    {this.renderButtons()}
                </div>
            </div>
        );
    }
}