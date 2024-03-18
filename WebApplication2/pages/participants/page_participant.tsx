import * as React from 'react';
import * as Framework from "../../classes";
import { Apis, Dtos } from '../../adr';
import { Details } from './details';
import { Edit } from './edit';
import { ParticipantDtoValidator } from '../../validators/participantDtoValidator';
import { Message } from '../../components';


interface Props {
    participantId: number;
    canEditParticipant: boolean;
    isGoalUser: boolean;
}

interface State {
    participant?: Framework.Pending<Dtos.ParticipantDto>;
    countries?: Framework.Pending<Dtos.CountrySummaryDto[]>;
    validation?: ParticipantDtoValidator;
    edited?: Dtos.ParticipantDto;
    message?: string;
    saveError?: Framework.AppError;
    pageMode?: "details" | "edit";
    saveInProgress: boolean;
}


export class PageAsParticipant extends React.Component<Props, State> {
    private url: Framework.UrlState<string> = new Framework.UrlState<string>();

    constructor(props: Props) {
        super(props);

        this.state = {
            participant: new Framework.Pending<Dtos.ParticipantDto>(),
            countries: new Framework.Pending<Dtos.CountrySummaryDto[]>(),
            saveInProgress: false
        };       
    }


    componentDidMount() {
        this.setStateFromPath();
        window.onpopstate = () => { // Capture browser back/forward events
            this.setStateFromPath();
        }
    }

    private setStateFromPath() {
        let currPath = this.url.getCurrentPath();
        if (currPath == '/participant/viewParticipant') {
            this.goToDetails(null);
            
        } else if (currPath =='/participant/viewParticipant/edit') {
            this.goToEdit();
        }
    }

    private setURL(pageMode: string) {
        if (pageMode == 'details'){
            this.url.push('/participant/viewParticipant')
        } else if (pageMode == 'edit') {
            this.url.push('/participant/viewParticipant/edit')
        }
    }

    private EnsureCountries() {
        if (this.state.countries.state === Framework.LoadingStatus.Preload || this.state.countries.state === Framework.LoadingStatus.Stale) {
            Framework.connect(new Apis.CountriesApi().getAll(false), this.state.countries, countries => this.setState({ countries }));
        }
    }

    private goToEdit() {
        this.EnsureCountries();

        let preload = this.state.participant;
        if (preload.isReady()) {
            let edited = JSON.parse(JSON.stringify(preload.data)) as Dtos.ParticipantDto;
            let validation = new ParticipantDtoValidator(edited, false);
            this.setState({ edited, validation });
            
        }
        else if (!preload.isFailed())
        {
            Framework.connect(new Apis.ParticipantsApi().getById(this.props.participantId), preload, (participant) => {
                if (participant.isDone()) {
                    let edited = JSON.parse(JSON.stringify(participant.data)) as Dtos.ParticipantDto;
                    let validation = new ParticipantDtoValidator(edited, false);
                    this.setState({ participant, edited, validation });
                }
                else {
                    this.setState({ participant });
                }
            });
        }
        
        this.setState({ pageMode: 'edit', message: null }, () => this.setURL(this.state.pageMode));
    }

    private goToDetails(message: string) {
        let preload = this.state.participant || new Framework.Pending<Dtos.ParticipantDto>();
        if (preload.state != Framework.LoadingStatus.Done && preload.state != Framework.LoadingStatus.Loading) {
            Framework.connect(new Apis.ParticipantsApi().getById(this.props.participantId), preload, (participant) => this.setState({ participant }));
        }
        this.setState({ pageMode: 'details', message }, () => this.setURL(this.state.pageMode));
        
    }

    private updateParticipant() {
        let validation = new ParticipantDtoValidator(this.state.edited, true);
        if (validation.isValid()) {
            this.setState({ saveInProgress: true });
            Framework.connect(new Apis.ParticipantsApi().update(this.props.participantId, this.state.edited), null, x => {
                if (x.state === Framework.LoadingStatus.Failed) {
                    this.setState({ saveInProgress: false, saveError: x.error, validation: validation });
                }
                else if (x.state === Framework.LoadingStatus.Done) {
                    this.setState({ saveInProgress: false, participant: x });
                    this.goToDetails('Participant was successfully updated');
                }
            })
        }
        else {
            this.setState({ validation });
        }
    }

    renderView() {
        switch (this.state.pageMode) {
            case "details":{
                 return <Details
                    participant={this.state.participant}
                    onBack={null}
                    canEdit={true}
                    onEdit={() => this.goToEdit()}
                    canInviteUsers={false}
                    onInviteUsers={null}
                    canViewUsers={false}
                    onViewUsers={null}
                    asGoalUser={this.props.isGoalUser}
                />;
            }
            case "edit": {
                return Framework.Loader.for(this.state.participant, p => <Edit
                    canInviteUsers={false}
                    countries={this.state.countries}
                    participant={this.state.edited}
                    validation={this.state.validation}
                    onCancel={() => this.goToDetails(null)}
                    onChange={(dto) => this.setState({ edited: dto, validation: new ParticipantDtoValidator(dto, this.state.validation.showValidationErrors()) })}
                    saveInProgress={this.state.saveInProgress}
                    saveAndInviteInProgress={false}
                    onSave={() => this.updateParticipant()}
                    notificationGroupLimit={20}
                    error={this.state.saveError}
                    asGoalUser={this.props.isGoalUser}
                />);
            }
        }
    }

    private renderMessage() {
        if (!this.state.message) return null;
        return <Message type="success" message={this.state.message} qa="SuccessMessage"/>
    }

    private renderTitle() {
        switch (this.state.pageMode) {
            case "details":
                return "View Participant"
            case "edit":
                return "Edit Participant"
        }
    }

    render() {
        return (
            <div>
            <div>
                <h1>{this.renderTitle()}</h1>
            </div>
                {this.renderMessage()}
                {this.renderView()}
            </div>)
    }
}

