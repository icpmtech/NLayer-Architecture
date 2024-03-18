import * as React from 'react';
import { Dtos } from '../../adr';
import { AppError, FormBuilder, Loader, Pending } from "../../classes";
import * as Form from '../../components';
import { DownstreamSubscriberDtoValidator } from '../../validators/downstreamSubscriberDtoValidator';

interface CreateProps {
    countries: Pending<Dtos.CountrySummaryDto[]>;
    downSub: Pending<Dtos.ParticipantDto>;
    isEditScreen?: boolean;
    notificationGroupLimit: number;
    onCancel: () => void;
    onChange: (dto: Dtos.ParticipantDto) => void;
    onSave: { (): void };
    participants: Pending<Dtos.ParticipantListSummaryDto[]>;
    saveError: AppError;
    validation: DownstreamSubscriberDtoValidator;
    isGoalUser?: boolean;
}

export class Create extends React.Component<CreateProps, {}> {

    private renderForm() {
        let mappedForDropdown = this.props.countries.map(countries => countries.map(country => { return { name: country.countryName, id: country.id, code: country.countryCode } }));
        const combined = Pending.combine(mappedForDropdown, this.props.downSub, this.props.participants, (countries, downSub, participants) => { return { countries, downSub, participants } })

        return Loader.for(combined, data => {
            const downSubForm = new FormBuilder(data.downSub).isWide(true).setChangeHandler(dto => this.props.onChange(dto));
            if (this.props.isEditScreen) { // No options list needed, only current parent Participant. No change handler or validation needed.
                downSubForm.addAutoComplete("Participant", [data.downSub.parent], m => m.dtcCode + " - " + m.name, m => data.downSub.parent, (m, v) => null, "Participant", null, { disabled: true });
            }
            else {
                downSubForm.addAutoComplete("Participant", data.participants, m => m.dtcCode + " - " + m.name, m => data.participants.find(x => x.id === (m.parent && m.parent.id)), (m, v) => m.parent = v && this.props.participants.data.find(x => x.id === v.id), "Participant",this.props.validation.parent, null)
            }

            downSubForm
                .addTextInput("DS code", m => m.dtcCode, (m, v) => m.dtcCode = v, "DsCode", this.props.validation.dtcCode)
                .addTextInput("DS Name", (m) => m.name, (m, v) => m.name = v, "DsName", this.props.validation.name)
                .addTextInput("Address 1", (m) => m.address1, (m, v) => m.address1 = v, "Address1", this.props.validation.address1)
                .addTextInput("Address 2", (m) => m.address2, (m, v) => m.address2 = v, "Address2", this.props.validation.address2)
                .addTextInput("Address 3", (m) => m.address3, (m, v) => m.address3 = v, "Address3", this.props.validation.address3)
                .addTextInput("City", (m) => m.city, (m, v) => m.city = v, "City", this.props.validation.city)
                .addTextInput("State", (m) => m.state, (m, v) => m.state = v, "State", this.props.validation.state)
                .addTextInput("Zip Code / Post Code", (m) => m.postCode, (m, v) => m.postCode = v, "ZipCodePostCode", this.props.validation.postCode)
                .addDropdown("Country", data.countries, m => data.countries.find(x => x.id === (m.country && m.country.id)), (m, v) => m.country = v && this.props.countries.data.find(x => x.id === v.id), "Country")
                .addTextInput("Main Contact Number", (m) => m.telephoneNumber, (m, v) => m.telephoneNumber = v, "MainContactNumber", this.props.validation.telephoneNumber)
                .addTextInput("Main Contact Full Name", (m) => m.contactName, (m, v) => m.contactName = v, "MainContactFullName", this.props.validation.contactName)
                .addTextInput("Main Contact Email Address", (m) => m.contactEmail, (m, v) => m.contactEmail = v, "MainContactEmailAddress", this.props.validation.contactEmail)
                .addEmailList("Notification Group Email Address List", m => m.notificationGroup, (m, v) => m.notificationGroup = v, "NotificationGroupEmailAddressList", this.props.validation.notificationGroupLength, this.props.validation.notificationGroup.results.map(x => x.email), { maxEmails: this.props.notificationGroupLimit, listDisplayLimit: 10, noTitle: true })
                .addEmailList("Participant Notification Group Email Address List", m => m.parentNotificationGroup, (m, v) => m.parentNotificationGroup = v, "ParticipantNotificationGroupEmailAddressList", this.props.validation.parentNotificationGroupLength, this.props.validation.parentNotificationGroup.results.map(x => x.email), { maxEmails: this.props.notificationGroupLimit, listDisplayLimit: 10, noTitle: true })
                .withQA("SubForm")
                ;

            if (this.props.isGoalUser) {
                downSubForm.addCustom(" ", this.renderDivider(), "IsGoalUserDetailsForm", null, null)
                    .addYesNo("Can View Claim Details", (m) => m.canViewDetails, (m, v) => m.canViewDetails = v, "CanViewClaimDetails", this.props.validation.canViewDetails, { yesOptionCaption: "Full Details", noOptionCaption: "Summary" })
                    .addYesNo("Can Submit & Continue Claims", (m) => m.canManageClaims, (m, v) => m.canManageClaims = v, "CanSubmitAndContinueClaims", this.props.validation.canManageClaims)
                    .addYesNo("Can Cancel Claims", (m) => m.canCancelClaims, (m, v) => m.canCancelClaims = v, "CanCancelClaims", this.props.validation.canCancelClaims)
                    .withQA("IsGoalUserDetails");
            }

            return downSubForm.render();
        })
    }

    private renderDivider() {
        return (<div><hr /><b>Parent Permissions</b></div>);
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="SaveButton">Save</button>
            </div>
        );
    }

    private renderError() {
        return <Form.Error error={this.props.downSub.error || this.props.saveError} qa="DownstreamSubscribersCreateError"/>
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