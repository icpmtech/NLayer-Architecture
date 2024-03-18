import * as React from 'react';
import { Apis, Dtos } from '../adr';
import * as Framework from '../classes';
import * as Component from '../components';
import { Page as TrmPortal } from './trm/page';
import { Page as ParticipantPortal } from './portal/page';

interface Props {
    isGoalUser: boolean;
    isParticipantUser: boolean;
    isTrmUser: boolean;
    isDownstreamSubscriberUser: boolean;
    isTrmReadOnlyUser: boolean;
    isUnknownUser: boolean;
    currentUserId: number;
    currentTrmCountryId?: number;
};

interface State {
    userguide?: Framework.Pending<Dtos.StaticFileConentKey>;
    announcement?: Framework.Pending<Dtos.AnnouncementDto>;
    showAnnouncement?: Framework.Pending<boolean>;
};

export class Home extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            userguide: new Framework.Pending<Dtos.StaticFileConentKey>(),
            announcement: new Framework.Pending<Dtos.AnnouncementDto>(),
            showAnnouncement: new Framework.Pending<boolean>()
        };
    }

    componentDidMount() {
        Framework.connect(new Apis.StaticContentApi().getUserGuideType(), this.state.userguide, (userguide) => this.setState({ userguide: userguide }));
        Framework.connect(new Apis.AnnouncementsApi().showAnnoucement(), this.state.showAnnouncement,
            (show) => {
                // Avoid DB call if preferences are set to hide the announcement
                if (show) Framework.connect(new Apis.AnnouncementsApi().getAnnouncement(Dtos.AnnouncementKey.General), this.state.announcement, (announcement) => {
                    this.setState({ announcement: announcement });
                });
                this.setState({ showAnnouncement: show });
            }
        );
    }

    cancelAnnouncement() {
        Framework.connect(new Apis.AnnouncementsApi().cancelAnnouncement(), this.state.showAnnouncement, (show) => this.setState({ showAnnouncement: show }));
    }

    render() {
        return (<div>

            {this.props.isUnknownUser && this.renderUnknownUserMessage()}

            {!this.props.isTrmUser && this.renderAnnouncement()}
 
            {this.props.isGoalUser && this.renderMain()}

            {(this.props.isParticipantUser || this.props.isDownstreamSubscriberUser) && <ParticipantPortal currentUserId={this.props.currentUserId}/>}

            {(this.props.isTrmUser || this.props.isTrmReadOnlyUser) && <TrmPortal currentTrmCountryId={this.props.currentTrmCountryId} isTrmReadOnlyUser={this.props.isTrmReadOnlyUser}/>}

        </div>);
    }

    renderMain() {
        return (
            <div className="row">
                <div className="col-md-7 intro">
                    <div className="offset-md-1 col-md-10">
                        <div className="mb-3">
                            <h4>Welcome to ADROIT™</h4>
                        </div>
                    </div>
                    <div className="offset-md-1 col-md-10">
                        <div className="mb-3">
                            <p>Welcome to Goal Group’s ADROIT™ suite of withholding tax relief services for securities held at The Depository Trust Company (DTC). This service provides DTC Participants with the tools needed to efficiently lodge documentation needed to support withholding tax relief claims filed through DTC’s TaxRelief via CA Web and to file long form tax reclamations as described in DTC Important Notices issued by ADR Depositary Banks.</p>
                        </div>
                    </div>
                    <div className="offset-md-1 col-md-10">
                        <div className="mb-3">
                            {this.renderUserGuide()}
                        </div>
                    </div>
                    <div className="offset-md-1 col-md-10">
                        <div className="mb-3">
                            <p>EMail: <a href="mailto:adroitsupport@goalgroup.com" data-qa="SupportEmailLink">adroitsupport@goalgroup.com</a></p>
                        </div>
                    </div>
                    <div className="offset-md-1 col-md-10">
                        <div className="mb-3">
                            <p>Tel: +1 (212) 248-9130</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderUserGuide() {
        let guide = this.state.userguide.data;

        if (guide) {
            let url = new Apis.StaticContentApi().downloadUrl(guide);
            return (<p>If you need help please download the <a href={url} target="_blank" data-qa="UserGuideLink"> User Guide</a> or contact our help desk:</p>);
        }

        return (<p>If you need help please contact our help desk:</p>);
    }

    private renderAnnouncement() {
        return Framework.Loader.for(this.state.showAnnouncement,
            showAnnouncement => {
                if (!showAnnouncement) return null;

                return Framework.Loader.for(this.state.announcement,
                    announcement => {
                        if (announcement.content == null) return null;
                        return <Component.Message message={announcement.content} allowClose={true} type={'info'} onClose={() => this.cancelAnnouncement()} qa="AnnounceMessage"/>
                    },
                    error => { return null; },
                    () => null
                );
            },
            error => { return null; },
            () => null
        );
    }

    private renderUnknownUserMessage() {
        return (<Component.Message message={'Your permissions are not enabled in ADRoit. Please speak to a system administrator.'}
            allowClose={true} type={'alert'} qa="YourPermissionsAreNotEnabledInAdroitMessage"/>);
    }
}
