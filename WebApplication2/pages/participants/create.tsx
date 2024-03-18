import * as React from 'react';
import { Dtos } from '../../adr';
import { AppError, FormBuilder, Loader, Pending } from "../../classes";
import * as Form from '../../components';
import { ParticipantDtoValidator } from '../../validators/participantDtoValidator';

interface CreateProps {
    canInviteUsers: boolean;
    participant: Dtos.ParticipantDto;
    validation: ParticipantDtoValidator;
    countries: Pending<Dtos.CountrySummaryDto[]>;
    onCancel: () => void;
    onChange: (dto: Dtos.ParticipantDto) => void;
    onSave: { (inviteUser: boolean): void };
    notificationGroupLimit: number;
    error?: AppError;
    saveInProgress: boolean;
    saveAndInviteInProgress: boolean;
}

export class Create extends React.Component<CreateProps, {}> {

    private renderForm() {
        let mappedForDropdown = this.props.countries.map(countries => countries.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));

        return Loader.for(mappedForDropdown, mappedCountries =>
            new FormBuilder(this.props.participant)
                .isWide(true)
                .setChangeHandler(dto => this.props.onChange(dto))
                .addTextInput("DTC code", m => m.dtcCode, (m, v) => m.dtcCode = v, "DtcCode", this.props.validation.dtcCode)
                .addTextInput("Name", (m) => m.name, (m, v) => m.name = v, "Name", this.props.validation.name)
                .addTextInput("Address 1", (m) => m.address1, (m, v) => m.address1 = v, "Address1", this.props.validation.address1)
                .addTextInput("Address 2", (m) => m.address2, (m, v) => m.address2 = v, "Address2", this.props.validation.address2)
                .addTextInput("Address 3", (m) => m.address3, (m, v) => m.address3 = v, "Address3", this.props.validation.address3)
                .addTextInput("City", (m) => m.city, (m, v) => m.city = v, "City", this.props.validation.city)
                .addTextInput("State", (m) => m.state, (m, v) => m.state = v, "State", this.props.validation.state)
                .addTextInput("Zip Code / Post Code", (m) => m.postCode, (m, v) => m.postCode = v, "ZipCodePostCode", this.props.validation.postCode)
                .addDropdown("Country", mappedCountries, m => mappedCountries.find(x => x.id === (m.country && m.country.id)), (m, v) => m.country = v && this.props.countries.data.find(x => x.id === v.id), "Country")
                .addTextInput("Main Contact Number", (m) => m.telephoneNumber, (m, v) => m.telephoneNumber = v, "MainContactTelephoneNumber", this.props.validation.telephoneNumber)
                .addTextInput("Main Contact Full Name", (m) => m.contactName, (m, v) => m.contactName = v, "MainContactFullName", this.props.validation.contactName)
                .addTextInput("Main Contact Email Address", (m) => m.contactEmail, (m, v) => m.contactEmail = v, "MainContactEmailAddress", this.props.validation.contactEmail)
                .addYesNo("Registered Shareholder", m => m.isRegisteredShareholder, (m, v) => m.isRegisteredShareholder = v, "RegisteredShareholder", null)
                .addEmailList("Notification Group Email Address List", m => m.notificationGroup, (m, v) => m.notificationGroup = v, "NotificationGroupEmailAddressList", this.props.validation.notificationGroupLength, this.props.validation.notificationGroup.results.map(x => x.email), { maxEmails: this.props.notificationGroupLimit, listDisplayLimit: 10, noTitle: true })
                .withQA("ParticipantForm")
                .render()
        );
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className={"btn btn-primary" + (this.props.saveInProgress ? " btn-loading" : "")} disabled={this.props.saveInProgress || this.props.saveAndInviteInProgress} onClick={() => this.props.onSave(false)} data-qa="SaveButton">{this.props.saveInProgress ? "Saving..." : "Save"}</button>
                {this.props.canInviteUsers ? <button className={"btn btn-primary" + (this.props.saveAndInviteInProgress ? " btn-loading" : "")} disabled={this.props.saveInProgress || this.props.saveAndInviteInProgress} onClick={() => this.props.onSave(true)} data-qa="SaveAndInviteUsersButton">{this.props.saveAndInviteInProgress ? "Saving..." : "Save and Invite Users"}</button> : null}
            </div>
        );
    }

    private renderError() {
        return <Form.Error error={this.props.error} qa="ParticipantsCreateError"/>
    }

    render() {
        return (
            <div>
                {this.renderError()}
                {this.renderForm()}
                {this.renderButtons()}
            </div>
        );
    }

}