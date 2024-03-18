import * as React from 'react';
import * as Form from "../../../components";
import { Apis, Dtos } from '../../../adr';
import { connect, Pending, Loader, FormBuilder, LoadingStatus,  } from "../../../classes";
import { StatefulEditor } from '../../../components/inputs/statefulEditor';

interface State {
    announcement: Pending<Dtos.AnnouncementDto>;
    successMessage?: string;
    errorMessage?: string;
}

export class Page extends React.Component<{}, State> {

    constructor() {
        super();

        this.state = { announcement: new Pending<Dtos.AnnouncementDto>(LoadingStatus.Preload) };
    }

    componentDidMount() {
        connect(new Apis.AnnouncementsApi().getAnnouncement(Dtos.AnnouncementKey.General), this.state.announcement, x => {
            if (x.isDone()) {
                this.setState({ announcement: x })
            }
        });
    }

    render() {
        return (<div>
            <h3>System Message</h3>
            {this.state.successMessage && <Form.Message message={this.state.successMessage} type={"success"} qa="SuccessMessage"/>}
            {this.state.errorMessage && <Form.Message message={this.state.errorMessage} type={"alert"} qa="ErrorMessage"/>}
            <p data-qa="SystemMessage">The System Message will be displayed to users when they log in. To hide the message, leave it blank.</p>
            {this.renderForm()}
        </div>);
    }

    private renderForm() {
        return Loader.for(this.state.announcement, announcement => {
            let fb = FormBuilder.for(this.state.announcement)
                .addCustom(" ", <StatefulEditor initialValue={announcement.content} onChange={(x) => this.state.announcement.data.content = x} readOnly={false} />, null)
                ;

            return (<div>
                {fb.render()}
                {this.renderButtons()}
            </div>);
        });
    }

    private renderButtons() {
        return (<div className="text-end">
            <button data-qa="SaveChangesButton" className="btn btn-primary" onClick={() => this.save()}>Save Changes</button>
        </div>);
    }

    private save() {
        this.setState({ successMessage: null, errorMessage: null });

        connect(new Apis.AnnouncementsApi().setAnnouncement(Dtos.AnnouncementKey.General, { content: this.state.announcement.data.content }), null, x => {
            if (x.isFailed() || x.error) {
                this.setState({ errorMessage: x.error.userMessage });
            }
            else if (x.isDone()) {
                this.setState({ successMessage: "Announcement was updated successfully" });
            }
        });
    }
}