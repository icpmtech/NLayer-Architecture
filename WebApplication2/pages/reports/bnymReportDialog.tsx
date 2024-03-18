import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { DateTime, ReportDocumentLink, Dropdown, Error, DateInput } from '../../components';
import { connect, Pending, Loader, PagedDataState, PageCache, PageableGridBuilder, AppError, PopupBuilder, FormBuilder, LoadingStatus } from "../../classes";

interface Props {
    onSave: (country: Dtos.CountrySummaryDto, date: Date) => void;
    onCancel: () => void;
}

interface State {
    countries: Pending<Dtos.CountrySummaryDto[]>;
    selectedDate?: Date;
    selectedCountry?: Dtos.CountrySummaryDto;
}

export class BnymReportDialog extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { countries: new Pending<Dtos.CountrySummaryDto[]>(LoadingStatus.Done, []) };
    }

    render() {
        const TypedDropdown = Dropdown as Newable<Dropdown<{ id: number, name: string }>>;

        return (<div className="">
            <div className="row col-md-10">
                <div className="col-md-3 required-fields required">ADR Record Date</div>
                <div className="col-md-6"><DateInput onChange={(d) => { this.setState({ selectedDate: d, selectedCountry: null }); if (d) this.ensureCountriesForDate(d); }} value={this.state.selectedDate} qa="AdrRecordDateInput" /></div>
            </div>
            <div className="row col-md-10">
                <div className="col-md-3 required-fields required">Country of Issuance</div>
                <div className="col-md-6">
                    {Loader.for(this.state.countries, countries => {
                        let mappedCountries = countries.filter(x => x.countryName != "All").map(country => { return { name: country.countryName, id: country.id } });
                        return <TypedDropdown isFormControl={true} options={mappedCountries} value={this.state.selectedCountry && mappedCountries.find(x => x.id == this.state.selectedCountry.id)} hasOptionsLabel={false} onChange={(x) => { this.setState({ selectedCountry: this.state.countries.data.find(y => x.id == y.id) }) }} qa="CountriesDropdown" />
                    })}
                </div>
            </div>
            <div className="d-flex flex-column mb-3"></div>
            <div className="d-flex flex-column mb-3">
                <div className="col-md-12 required-fields required">Mandatory to run report</div>
            </div>
            <div className="float-end" style={{ marginTop: '10px' }}>
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave(this.state.selectedCountry, this.state.selectedDate)} data-qa="RunReportButton">Run Report</button>
            </div>
        </div>);
    }

    private ensureCountriesForDate(date: Date) {
        connect(new Apis.EventsApi().countriesForDate({ date, depositoryBnym: true, depositoryJpm: false, depositoryCB: false, depositoryDB: false }), this.state.countries, countries => { this.setState({ countries }); });
    }
}