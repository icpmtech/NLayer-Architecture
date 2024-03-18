import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import { Pending, Loader, FormBuilder, LoadingStatus } from '../../classes';
import { AppError } from "../../classes/appError";
import * as Form from '../../components';
import { Audit } from "../../components/audit";

interface DetailsProps {
    downSub: Pending<Dtos.ParticipantDto>;
    canEdit: boolean;
    canDelete: boolean;
    onBack: () => void;
    onEdit: () => void;
    isGoalUser: boolean;
    onDelete: () => void;
    canInviteUsers: boolean;
    onInviteUsers: () => void;
    saveError: AppError;
    canGoToUsers: boolean;
    onGoToUsers: () => void;
}

export class Details extends React.Component<DetailsProps, {}> {

    private renderform() {
        return Loader.for(this.props.downSub, downSub => {
            let countryOptions = downSub.country ? [{ name: downSub.country.countryName, id: downSub.country.id, code: downSub.country.countryCode }] : [];
            var downSubForm = new FormBuilder(downSub)
                .isDisabled(true)
                .isWide(true)
                .addAutoComplete("Participant", [downSub.parent], m => m.dtcCode + " - " + m.name, m => downSub.parent, (m, v) => null, "Participant", null, { disabled: true })
                .addTextInput("DS Code:", m => m.dtcCode, (m, v) => null, "DsCode")
                .addTextInput("DS Name:", (m) => m.name, (m, v) => null, "DsName")
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
                .addEmailList("Notification Group Email Address List", m => m.notificationGroup, (m, v) => m.notificationGroup = v, "NotificationGroupEmailAddressList")
                .addEmailList("Participant Notification Group Email Address List", m => m.parentNotificationGroup, (m, v) => m.parentNotificationGroup = v, "ParticipantNotificationGroupEmailAddressList")
                .withQA("Form")
                ;

            if (this.props.isGoalUser) {
                downSubForm.addCustom(" ", this.renderDivider(), "IsGoalUserDetailsForm", null, null)
                    .addYesNo("Can View Claim Details", (m) => m.canViewDetails, (m, v) => m.canViewDetails = v, "CanViewClaimDetails", null, { yesOptionCaption: "Full Details", noOptionCaption: "Summary" })
                    .addYesNo("Can Submit & Continue Claims", (m) => m.canManageClaims, (m, v) => m.canManageClaims = v, "CanSubmitAndContinueClaims", null)
                    .addYesNo("Can Cancel Claims", (m) => m.canCancelClaims, (m, v) => m.canCancelClaims = v, "CanCancelClaims", null)
                    .withQA("IsGoalUserDetails");
            }

            return downSubForm.render();
        });
    }

    private renderDivider() {
        return (<div><hr /><b>Parent Permissions</b></div>);
    }

    private renderDeleteButton() {
        return Loader.for(this.props.downSub, downSub => {
            var allowDelete = !(downSub.hasUsers || downSub.hasBatchClaims || downSub.hasPositions || downSub.parent == null);
            return this.props.canDelete && allowDelete && (<button className="btn btn-outline-secondary" onClick={() => this.props.onDelete()} data-qa="DeleteButton">Delete</button>)
        });
    }

    private renderError(): JSX.Element {
        return <Form.Error error={this.props.downSub.error || this.props.saveError} qa="DownstreamSubscriberDetailsError"/>
    }

    private renderAudit() {
        if (!this.props.downSub.data) return null;
        return <Audit auditableEntity={this.props.downSub.data}/>
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onBack()} data-qa="BackToListButton">Back to List</button>
                {this.props.canGoToUsers ? <button className="btn btn-outline-secondary" onClick={() => this.props.onGoToUsers()} data-qa="ViewUsersButton">View Users</button> : null}
                {this.renderDeleteButton()}
                {this.props.canInviteUsers ? <button className="btn btn-outline-secondary" onClick={() => this.props.onInviteUsers()} data-qa="InviteUsersButton">Invite Users</button> : null}
                {this.props.canEdit ? <button className="btn btn-primary" onClick={() => this.props.onEdit()} data-qa="EditButton">Edit</button> : null}
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderError()}
                {this.renderform()}
                {this.renderAudit()}
                {this.renderButtons()}
            </div>
        );
    }
}