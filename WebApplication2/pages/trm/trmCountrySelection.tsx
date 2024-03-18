import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { Pending, FormBuilder, connect, Loader, LoadingStatus } from "../../classes";

interface Props {
    onCountryChanged: (ctry: Dtos.CountrySummaryDto) => void;
    currentCountryId: number;
}

interface State {
    countries?: Pending<Dtos.CountrySummaryDto[]>
    currentCountry?: Pending<Dtos.CountrySummaryDto>;
    changeMode?: boolean;
}

export class TrmCountrySelection extends React.Component<Props, State> {

    private country: Dtos.CountrySummaryDto;

    constructor() {
        super();

        this.state = {
            changeMode: false,
            countries: new Pending<Dtos.CountrySummaryDto[]>(LoadingStatus.Preload),
            currentCountry: new Pending<Dtos.CountrySummaryDto>(LoadingStatus.Preload)
        };
    }

    render() {
        let combined = Pending.combine(this.state.currentCountry, this.state.countries, (current, countries) => { return { current: current, countries: countries } });

        return Loader.for(combined, combined => {
            let mappedCountries = combined.countries.map(l => { return { id: l.id, name: l.countryName } });

            var form = FormBuilder.for(this.state.currentCountry.data)
                .isInline(true)
                .isWide(true)
                .setChangeHandler(ctry => this.countryChanged(ctry))
                .withQA("Form")
                .addDropdown(null, mappedCountries, x => mappedCountries.find(y => y.id == x.id), (m, v) => m.id = (v ? v.id : null), "CurrentCountry", null,
                {
                    hasOptionsLabel: false,
                    hideValidation: true,
                    noTitle: true,
                    additionalContent: <span style={{ color: 'skyBlue', marginTop: '8px', display: 'inline-block', marginLeft: '5px', cursor: 'pointer' }} onClick={() => this.setState({ changeMode: false })} data-qa="CancelButton">Cancel</span>
                })
                ;

            return (<div>
                <div style={{ display: 'inline-block', width: '100%', height: '65px' }}>
                    {!this.state.changeMode &&
                        <div>
                        <h2 style={{ display: 'inline-block' }}>
                            {!!combined.current && (<span>Selected Country: <b data-qa="SelectedCountry">{combined.current.countryName}</b></span>)}
                            {!combined.current && <b data-qa="NoSelectedCountry">No Country Selected</b>}</h2>
                        <span style={{ marginLeft: '25px', color: 'skyBlue', cursor: 'pointer' }} onClick={() => this.setState({ changeMode: true })} data-qa="ChangeButton">Change</span>
                        </div>}
                    {this.state.changeMode && <div style={{ position: 'relative', paddingTop: '15px' }}>{form.render()}</div>}
                </div>
                <hr />
            </div>);
        });
    }

    componentDidMount() {
        this.ensureCountries();
    }

    componentWillReceiveProps() {
        this.ensureCountries();
    }

    ensureCountries() {
        connect(new Apis.CountriesApi().getAll(false), this.state.countries, x => {
            if (x.isDone()) {
                let currentCountry = x.data.find(l => l.id == this.props.currentCountryId);
                this.setState({ countries: x, currentCountry: new Pending(LoadingStatus.Done, currentCountry) });
            }
        });
    }

    countryChanged(country: Dtos.CountrySummaryDto) {
        this.setState({ changeMode: false });
        $.get('/account/SwitchTrmCountry?countryId=' + country.id).done(x => this.props.onCountryChanged(country));
    }
}
