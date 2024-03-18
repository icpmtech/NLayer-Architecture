import * as React from 'react';
import * as Framework from '../../classes';
import { Dtos, Apis } from '../../adr';


interface Props {
    onChange: (options: Framework.IGridBuilderChangeArgs<Dtos.ListPendingUserRegistrationsQuery_SortField>) => void;
    onSelect: (dto: Dtos.UserRegistrationSummaryDto) => void;
    userRegs: Framework.Pending<Dtos.PagedResultDto<Dtos.UserRegistrationSummaryDto>>;
    statusOptions: Framework.Pending<Dtos.EnumDisplayDto[]>;
    currentUserGroupType: Dtos.GroupType;
    participantId?: number;
}

interface State {
    participant: Framework.Pending<Dtos.ParticipantDto>;
}

export class Grid extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);

        this.state = {
            participant: new Framework.Pending<Dtos.ParticipantDto>()
        };
    }

    componentDidMount() {
        if (this.props.participantId) {
            Framework.connect(new Apis.ParticipantsApi().getById(this.props.participantId), this.state.participant, ptc => {
                if (ptc.isDone()) {
                    this.setState({ participant: ptc });
                }
            });
        }
        else {
            this.setState({ participant: new Framework.Pending<Dtos.ParticipantDto>(Framework.LoadingStatus.Done, {} as Dtos.ParticipantDto) });
        }
    }

    render() {
        let statusToExclude = [Dtos.UserRegStatus.PendingEmailConfirmation, Dtos.UserRegStatus.Completed, Dtos.UserRegStatus.PendingDownstreamSubscriberVerification];
        let filteredStatusOptions = this.props.statusOptions.map(x => x.filter(y => statusToExclude.indexOf(y.value) == -1).map(x => x.label));

        var combined = Framework.Pending.combine(
            filteredStatusOptions,
            this.state.participant,
            (options, participant) => { return { options, participant } }
        );

        return Framework.Loader.for(combined, loaded => {
            let grid = Framework.PageableGridBuilder.ForPendingPage<Dtos.UserRegistrationSummaryDto, Dtos.ListPendingUserRegistrationsQuery_SortField>(10, this.props.userRegs, (args) => this.props.onChange(args))
                .withQA("user-registration-grid")
                .isFilterable()
                .isSortable()
                .isResizable()
                .isScrollable()
                .isNavigatable()
                .setRowChangeHandler((dto) => this.props.onSelect(dto));

            grid.addString("Email", x => x.email, Dtos.ListPendingUserRegistrationsQuery_SortField.Email, "Email")
                .addString("Status", x => x.userRegStatusName, Dtos.ListPendingUserRegistrationsQuery_SortField.UserRegsStatus, "Status", null, { filterItems: loaded.options })
                .addDateTime("Since", x => x.userRegStatusSince, Dtos.ListPendingUserRegistrationsQuery_SortField.UserRegsStatusSince, "Since")
                .addYesNo("Link Expired", x => x.hasExpired, Dtos.ListPendingUserRegistrationsQuery_SortField.HasExpired, "LinkExpired");

            if (this.props.currentUserGroupType == Dtos.GroupType.GoalAdroit) {
                grid.addString("Participant DTC Code", x => x.ptcDtcCode, Dtos.ListPendingUserRegistrationsQuery_SortField.PtcDtcCode, "ParticipantDTCCode")
                    .addString("Participant Name", x => x.ptcName, Dtos.ListPendingUserRegistrationsQuery_SortField.PtcName, "ParticipantName");
            }

            if (this.props.currentUserGroupType == Dtos.GroupType.GoalAdroit || (loaded.participant && loaded.participant.hasDownstreamSubscribers)) {
                grid.addString("Downstream Subscriber DTC Code", x => x.dsCode, Dtos.ListPendingUserRegistrationsQuery_SortField.DsCode, "DownstreamSubscriberDTCCode")
                    .addString("Downstream Subscriber Name", x => x.dsName, Dtos.ListPendingUserRegistrationsQuery_SortField.DsName, "DownstreamSubscriberName")
            }

            return grid.render()
        });
    }

}