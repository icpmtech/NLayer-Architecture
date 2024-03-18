import * as React from 'react';
import { Loader, Pending, LoadingStatus, connect, FormBuilder, DialogBuilder, safeClone } from '../../classes';
import { Apis, Dtos } from '../../adr';
import { AutoComplete, Message } from '../../components';
import { BulkClaimDtoValidator } from '../../validators/bulkClaimDtoValidator';

interface CreateProps {
    countries: Pending<Dtos.CountrySummaryDto[]>;
    filingMethods: Pending<Dtos.EnumDisplayDto[]>;
    bulkClaim: Dtos.BulkClaimDto;
    onSave: (dto: Dtos.BulkClaimDto) => void;
    onCancel: () => void;
    errorMessage?: string;
    isGoalUser: boolean;
}

interface CreateState {
    availableDates?: Pending<Date[]>;
    validator?: BulkClaimDtoValidator;
    edited?: Dtos.BulkClaimDto;
    participants?: Pending<Dtos.ParticipantSummaryDto[]>;
}

export class CreateBulkClaimPopup extends React.Component<CreateProps, CreateState> {

    constructor(props: CreateProps) {
        super(props);

        let edited = safeClone(this.props.bulkClaim);

        this.state = {
            availableDates: new Pending<Date[]>(LoadingStatus.Done, []),
            participants: new Pending<Dtos.ParticipantSummaryDto[]>(LoadingStatus.Loading),
            edited: edited,
            validator: new BulkClaimDtoValidator(edited, props.isGoalUser, false)
        };
    }

    componentDidMount() {
        if (this.props.isGoalUser) {
            this.ensureParticipants();
        }
        else {
            this.setState({ participants: new Pending<Dtos.ParticipantSummaryDto[]>(LoadingStatus.Done, []) });
        }
    }

    render() {
        let combined = Pending.combine(this.props.countries, this.props.filingMethods, this.state.participants,
            (countries, filingMethods, participants) => { return { countries, filingMethods, participants } });

        return Loader.for(combined, loaded => {
            let val = this.state.validator;

            let mappedCountries = loaded.countries.filter(x => x.countryName != "All").map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } });
            let mappedFilingMethods = loaded.filingMethods.map(filingMethod => { return { name: filingMethod.label, id: filingMethod.value } });
            let mappedParticipants = loaded.participants.map(x => { return { name: x.name + ' (' + x.dtcCode + ')', id: x.id } });

            let fb = new FormBuilder(this.state.edited)
                .isWide(true)
                .narrowErrors(true)
                .withQA("Form");

            if (this.props.isGoalUser) {
                fb.addDropdown("Participant", mappedParticipants, m => mappedParticipants.find(x => x.id == m.participantId), (m, v) => m.participantId = v && this.state.participants.data.find(x => x.id === v.id).id, "ParticipantInput", val.participant);
            }

            fb.addDropdown("Country of Issuance", mappedCountries, m => mappedCountries.find(x => x.id === (m.countryOfIssuance && m.countryOfIssuance.id)), (m, v) => { m.countryOfIssuance = v && this.props.countries.data.find(x => x.id === v.id); this.loadDatesForCountry(m.countryOfIssuance.id, m.roundType); }, "CountryOfIssuanceInput", val.countryOfIssuance)
                .addDropdown("Round", mappedFilingMethods, m => mappedFilingMethods.find(x => x.id === m.roundType), (m, v) => { m.roundType = v && v.id; this.loadDatesForCountry(m.countryOfIssuance.id, m.roundType); }, "RoundInput", val.filingMethod)
                ;

            return (
                <div className="container-fluid">
                    <div>
                        {this.props.errorMessage && <Message message={this.props.errorMessage} type="alert" qa="ErrorMessage"/>}
                    </div>
                    <div className="">{fb.render()}</div>
                    <div className="mb-3">
                        <fieldset className="form-horizontal">
                            <div className="row">
                                <label className="col-md-3 required col-form-label form-label"> ADR Record Date</label>
                                <div className="col-md-5" data-qa="ADRRecordDateInput">
                                    {Loader.for(this.state.availableDates, dates => { return this.renderDatesDropdown() })}
                                </div>
                                <div className="col-md-3 field-validation-error" data-qa="ValidationError">
                                    {this.state.validator.showValidationErrors() && !this.state.validator.date.isValid() && this.state.validator.date.errorMessage}
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="float-end mb-1 me-1" style={{ paddingTop: 10 }}>
                        <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                        <button className="btn btn-primary" onClick={() => this.saveChanges()} data-qa="SaveButton">Save</button>
                    </div>
                </div>
            );
        });
    }

    private ensureParticipants() {
        connect(new Apis.ParticipantsApi().search({ includeDownstreamSubscribers: false, includeParticipants: true, sort: { field: Dtos.ParticipantSortField.Name, asscending: true }, uiFilters: null }, 1, 10000),
            null,
            ptcs => {
                if (ptcs.isDone()) {
                    this.setState({ participants: new Pending(LoadingStatus.Done, ptcs.data.items) });
                }
            });
    }

    private saveChanges() {
        let validator = new BulkClaimDtoValidator(this.state.edited, this.props.isGoalUser, true);

        if (validator.isValid()) {
            this.props.onSave(safeClone(this.state.edited));
        }

        this.setState({ validator });
    }

    private loadDatesForCountry(id: number, filingMethod: Dtos.FilingMethod) {
        let edited = safeClone(this.state.edited);
        edited.date = null;
        this.setState({ edited });

        let query = { countryId: id, filingMethod: filingMethod };

        connect(new Apis.BulkClaimApi().getDates(query), this.state.availableDates, dates => {
            this.setState({ availableDates: dates });
        });
    }

    private renderDatesDropdown() {
        return Loader.for(this.state.availableDates, dates => {
            const TypedAutoComplete = AutoComplete as Newable<AutoComplete<Date>>;
            return <TypedAutoComplete
                options={dates}
                onChange={value => { let edited = safeClone(this.state.edited); edited.date = value; this.setState({ edited }); }}
                map={m => { return moment.utc(m).format("MMMM Do YYYY") }}
                value={dates.find(p => p === this.state.edited.date)}
                qa="AdrRecordDateTypedAutoComplete"
            />
        });
    }
}
