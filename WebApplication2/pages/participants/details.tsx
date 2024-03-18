import * as React from 'react';
import { Dtos } from '../../adr';
import { FormBuilder, Loader, Pending } from '../../classes';
import { Audit } from '../../components/audit';

interface DetailsProps {
    participant: Pending<Dtos.ParticipantDto>;
    onBack: () => void;
    canViewUsers: boolean;
    onViewUsers: () => void;
    canInviteUsers: boolean;
    onInviteUsers: () => void;
    canEdit: boolean;
    onEdit: () => void;
    asGoalUser: boolean;
}

export class Details extends React.Component<DetailsProps, {}> {

    private renderform() {
        return Loader.for(this.props.participant, participant => {
            let countryOptions = participant.country ? [{ name: participant.country.countryName, id: participant.country.id, code: participant.country.countryCode }] : [];
            return new FormBuilder(participant)
                .isDisabled(true)
                .isWide(true)
                .addTextInput("DTC code:", m => m.dtcCode, (m, v) => null, "DtcCode")
                .addTextInput("Name:", (m) => m.name, (m, v) => null, "Name")
                .addTextInput("Address 1:", (m) => m.address1, (m, v) => null, "Address1")
                .addTextInput("Address 2:", (m) => m.address2, (m, v) => null, "Address2")
                .addTextInput("Address 3:", (m) => m.address3, (m, v) => null, "Address3")
                .addTextInput("City:", (m) => m.city, (m, v) => null, "City")
                .addTextInput("State:", (m) => m.state, (m, v) => null, "State")
                .addTextInput("Zip Code / Post Code:", (m) => m.postCode, (m, v) => null, "ZipCodePostCode")
                .addDropdown("Country", countryOptions, m => countryOptions[0], (m, v) => null, "Country")
                .addTextInput("Main Contact Number", m => m.telephoneNumber, (m, v) => null, "MainContactNumber")
                .addTextInput("Main Contact Full Name", m => m.contactName, (m, v) => null, "MainContactFullName")
                .addTextInput("Main Contact Email Address", m => m.contactEmail, (m, v) => null, "MainContactEmailAddress")
                .addYesNo("Registered Shareholder", m => m.isRegisteredShareholder, null, "RegisteredShareholder", null, null)
                .addEmailList("Notification Group Email Address List", m => m.notificationGroup, (m, v) => m.notificationGroup = v, "NotificationGroupEmailAddressList")
                .withQA("ParticipantForm")
                .render()
        });
    }

    private renderBackButton(): JSX.Element {
        if (this.props.asGoalUser) {
            return <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
        }
    }

    private renderViewUsersButton(): JSX.Element {
        if (this.props.canViewUsers) {
            return <button className="btn btn-outline-secondary" onClick={() => this.props.onViewUsers()} data-qa="ViewUsersButton">View Users</button>;
        }
        return null;
    }

    private renderInviteUsersButton(): JSX.Element {
        if (this.props.canInviteUsers) {
            return <button className="btn btn-outline-secondary" onClick={() => this.props.onInviteUsers()} data-qa="InviteUsersButtons">Invite Users</button>;
        }
        return null;
    }

    private renderEditButton(): JSX.Element {
        if (this.props.canEdit) {
            return <button className="btn btn-primary" onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button>
        }
        return null;
    }

    private renderAudit() {
        if (!this.props.participant.data) return null;
        return <Audit auditableEntity={this.props.participant.data}/>
    }

    render() {
        return (
            <div>
                {this.renderform()}
                {this.renderAudit()}
                <div className="text-end">
                    {this.renderBackButton()}
                    {this.renderViewUsersButton()}
                    {this.renderInviteUsersButton()}
                    {this.renderEditButton()}
                </div>
            </div>
        );
    }
}