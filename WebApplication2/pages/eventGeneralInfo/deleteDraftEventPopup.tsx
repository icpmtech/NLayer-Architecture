import * as React from 'react';
import { Apis } from '../../adr';
import { connect, LoadingStatus, Pending, PopupBuilder } from "../../classes";
import { Message } from './../../components/inputs/message';

interface PageProps {
    eventId: number;
    onClose: () => void;
};

interface PageState {
    fileDeleteError?: boolean;
};

export class DeleteDraftEventPopup extends React.Component<PageProps, PageState> {

    private deletePopup: PopupBuilder;

    constructor(props: PageProps) {
        super(props);
        this.state = { fileDeleteError: false };
    }

    private onDeleteConfirmation = () => {
        connect(new Apis.EventsApi().delete(this.props.eventId), null, response => this.handleDeleteResponse(response));
    }

    private handleDeleteResponse(response: Pending<void>) {
        if (response.state === LoadingStatus.Done) {
            window.location.href = '/event/list?deleted=true';
        }
        if (response.state === LoadingStatus.Failed) {
            this.setState({ fileDeleteError: true })
        }
    }

    private renderDeleteActions() {
        return (
            <div>
                <p>You are about to delete the event. Are you sure you want to proceed?</p>
                <br />
                <div className={"col-md-6 float-end mb-1"} style={{ paddingRight: '5px' }}>
                    <button className="btn btn-primary float-end" onClick={() => this.onDeleteConfirmation()} data-qa="DeleteConfirmationYesButton">Yes</button>
                    <button className="btn btn-outline-secondary float-end" style={{ marginRight: '5px' }} onClick={this.props.onClose} data-qa="DeleteConfirmationNoButton">No</button>
                </div>
            </div>
        );
    }

    private renderPopupContents() {
        return (
            <div className="popup-container-small">
                {this.state.fileDeleteError ? <Message type="alert" message={"Error deleting event"} qa="FileDeleteErrorMessage"/> : null}
                {this.renderDeleteActions()}
            </div>
        );
    }

    render() {
        return this.renderPopupContents();
    }

};