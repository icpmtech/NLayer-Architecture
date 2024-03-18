import * as React from 'react';
import { Dtos } from '../../../adr';
import { FormBuilder, Loader, Pending } from '../../../classes';
import { Audit } from '../../../components/audit';
import { Rules } from './rules';

interface DetailsProps {
    countries: Pending<Dtos.CountrySummaryDto[]>;
    filingMethods: Pending<Dtos.FilingMethodDto[]>;
    category: Pending<Dtos.CategoryDto>;
    onBack: () => void;
    canEdit: boolean;
    onEdit: () => void;
    canDelete: boolean;
    onDelete: () => void;
}

export class Details extends React.Component<DetailsProps, {}> {

    private renderform() {
        let mappedCountries = this.props.countries.map(x => x.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        let combinedAll = Pending.combine(this.props.category, mappedCountries, this.props.filingMethods, (category, countries, filingMethods) => { return { category, countries, filingMethods }; });

        return Loader.for(combinedAll, all =>
            new FormBuilder(all.category)
                .isDisabled(true)
                .isWide(true)
                .addDropdown("Country of Issuance", all.countries, m => all.countries.find(x => x.id === (m.countryOfIssuance && m.countryOfIssuance.id)), null, "CountryOfIssuance")
                .addDropdown("Filing Method", all.filingMethods, m => all.filingMethods.find(x => x.id === (m.filingMethod && m.filingMethod.id)), null, "FilingMethod")
                .addTextInput("Category Description:", m => m.description, null, "CategoryDescription")
                .addNumber("Reclaim Rate(%):", m => m.reclaimRate, null, "ReclaimRate")
                .addNumber("Withholding Rate(%):", m => m.whtRate, null, "WithholdingRate")
                .addTextArea("Category Notes", m => m.notes, null, "CategoryNotes")
                .withQA("Form")
                .render()
        );
    }

    private renderRules() {
        if (!this.props.category.data) return null;
        return <Rules rules={this.props.category.data.rules}/>
    }

    private renderAudit() {
        if (!this.props.category.data) return null;
        return <Audit auditableEntity={this.props.category.data}/>
    }

    private renderBackButton(): JSX.Element {
        return <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
    }

    private renderEditButton(): JSX.Element {
        if (this.props.canEdit) {
            return <button className="btn btn-primary" onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>
        }
        return null;
    }

    private renderDeleteButton(): JSX.Element {
        if (this.props.canEdit) {
            return <button className="btn btn-outline-secondary" onClick={() => this.props.onDelete()} data-qa="DeleteButton">Delete</button>
        }
        return null;
    }

    render() {
        return (
            <div>
                {this.renderform()}
                {this.renderRules()}
                {this.renderAudit()}
                <div className="text-end" data-qa="Buttons">
                    {this.renderBackButton()}
                    {this.renderDeleteButton()}
                    {this.renderEditButton()}
                </div>
            </div>
        );
    }
}