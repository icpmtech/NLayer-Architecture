import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components';
import { Dtos } from '../../adr';
import { VerifyUserDtoValidator } from '../../validators/verifyUserDtoValidator';
import { RejectPopup } from './rejectPopup';

interface Props {
    currentUserGroupType: Dtos.GroupType;
    userVerification: Framework.Pending<Dtos.UserVerificationDetailsDto>;
    groupEnums: Framework.Pending<Dtos.EnumDisplayDto[]>;
    editor: Dtos.VerifyUserDto;
    validator: VerifyUserDtoValidator;
    onCancel: () => void;
    onApprove: () => void;
    onReject: (Dtos: Dtos.VerifyUserDto) => void;
    onChange: (dto: Dtos.VerifyUserDto, isRejecting: boolean) => void;
    onResendInvite: () => void;
}

interface State {
}

export class Details extends React.Component<Props, State>{
    render() {
        var combined = this.props.userVerification.and(this.props.groupEnums, (userVerification, groupEnums) => { return { userVerification, groupEnums, editor: this.props.editor } });

        return Framework.Loader.for(combined, info => {
            let allowApproval = false;
            if (this.props.currentUserGroupType === Dtos.GroupType.GoalAdroit && info.userVerification.currentStatus === Dtos.UserRegStatus.PendingGoalVerification) {
                allowApproval = true;
            }
            else if (this.props.currentUserGroupType === Dtos.GroupType.Participant && info.userVerification.currentStatus === Dtos.UserRegStatus.PendingParticipantVerification) {
                allowApproval = true;
            }
            else if (this.props.currentUserGroupType === Dtos.GroupType.DownstreamSubscriber && info.userVerification.currentStatus === Dtos.UserRegStatus.PendingDownstreamSubscriberVerification) {
                allowApproval = true;
            }

            let groupTypeRequested = info.userVerification.participant == null ? Dtos.GetUserPermissionsQuery_GroupType.Goal
                : info.userVerification.downstreamSubscriber != null ? Dtos.GetUserPermissionsQuery_GroupType.DownstreamSubscriber
                    : Dtos.GetUserPermissionsQuery_GroupType.Participant;

            let rolesToRender = this.getRolesToRender(groupTypeRequested).map(x => { return { name: info.groupEnums.find(y => y.value == x).label, value: x } });

            let rolesFistStageSelected = rolesToRender.find(x => x.value == info.userVerification.requestedGroupType); 
            let rolesCurrentSelected = rolesToRender.find(x => x.value == info.editor.groupId); 

            let userDetails = Framework.FormBuilder.for(info)
                .isWide(true)
                .setChangeHandler(x => this.props.onChange(x.editor, false))
                .addCustom("", (<h4>User Information</h4>), "UserDetails", null, { noTitle: true, disabled: true });

            if (info.userVerification.invitedUser) {
                userDetails
                    .addTextInput("First Name:", x => x.userVerification.invitedUser.firstName, null, "FirstName", null, { disabled: true })
                    .addTextInput("Last Name:", x => x.userVerification.invitedUser.lastName, null, "LastName", null, { disabled: true })
                    .addTextInput("Email:", x => x.userVerification.invitedUser.email, null, "Email", null, { disabled: true })
                    .addTextInput("Contact Number:", x => x.userVerification.invitedUser.telephoneNumber, null, "ContactNumber", null, { disabled: true })
                    ;
            }
            else {
                userDetails
                    .addTextInput("Email:", x => x.userVerification.emailInvited, null, "Email", null, { disabled: true })

            }

            if (info.userVerification.participant) {
                userDetails
                    .addCustom("", (<h4>Company Information</h4>), "CompanyInformation", null, { noTitle: true, disabled: true })
                    .addTextInput("DTC Code:", x => x.userVerification.participant.dtcCode, null, "DtcCode", null, { disabled: true })
                    .addTextInput("Participant Name:", x => x.userVerification.participant.name, null, "ParticipantName", null, { disabled: true });
            }

            if (info.userVerification.downstreamSubscriber) {
                userDetails
                    .addTextInput("Downstream Subscriber Code:", x => x.userVerification.downstreamSubscriber.dtcCode, null, "DownstreamSubscriberCode", null, { disabled: true })
                    .addTextInput("Downstream Subscriber Name:", x => x.userVerification.downstreamSubscriber.name, null, "DownstreamSubscriberName", null, { disabled: true });
            }

            userDetails
                .addCustom("", (<h4>Invitation</h4>), "Invitation")
                .addTextInput("Status:", x => x.userVerification.currentStatusName, null, "Status", null, { disabled: true });

            if (info.userVerification.currentStatus === Dtos.UserRegStatus.PendingRegistration) {
                userDetails.addDateTime("Expires on:", x => x.userVerification.expiresOn, null, "ExpiresOn", null, { disabled: true })
            }

            userDetails.addTextInput("Invited by:", x => x.userVerification.invitedByName, null, "InvitedBy", null, { disabled: true })
                .addDateTime("Invited on:", x => x.userVerification.invitedOn, null, "InvitedOn", null, { disabled: true });

            if (info.userVerification.ptcVerifiedById) {
                userDetails
                    .addCustom("", (<h4>First-Stage Verification</h4>), "FirstStageVerification")
                    .addTextInput("Verified by:", x => x.userVerification.ptcVerifiedByName, null, "VerifiedBy", null, { disabled: true })
                    .addDateTime("Verified on:", x => x.userVerification.ptcVerifiedOn, null, "VerifiedOn", null, { disabled: true })
                    .addRadioButtonGroup("Role assigned:", rolesToRender, x => rolesFistStageSelected, null, "RoleAssigned", null, { disabled: true })
            }

            if (allowApproval && rolesToRender.length) {
                userDetails
                    .addCustom("", <h4>{info.userVerification.ptcVerifiedById == null ? "First" : "Second"} Stage Verification</h4>, "FirstOrSecondStageVerification")
                    .addRadioButtonGroup("Role to assign:", rolesToRender, x => rolesCurrentSelected, (x, v) => x.editor.groupId = v.value, "RoleToAssign", this.props.validator.groupId)
                    ;
            }


            return (
                <div>
                    <div>
                        {userDetails.render()}
                    </div>
                    <div className="text-end">
                        <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="BackButton">Back</button>
                        {allowApproval ? <button className="btn btn-primary" onClick={() => this.props.onApprove()} data-qa="ApproveButton">Approve</button> : null}
                        {allowApproval ? <button className="btn btn-primary" onClick={() => this.onReject()} data-qa="RejectButton">Reject</button> : null}
                        {this.props.userVerification.data && this.props.userVerification.data.currentStatus == Dtos.UserRegStatus.PendingRegistration ? <button className="btn btn-primary" onClick={() => this.props.onResendInvite()} data-qa="ResendInvitationButton">Resend Invitation</button> : null}
                    </div>
                </div>
            );
        });
    }

    private getRolesToRender(groupType: Dtos.GetUserPermissionsQuery_GroupType) {
        switch (groupType) {
            case Dtos.GetUserPermissionsQuery_GroupType.Goal:
                return [Dtos.GroupsEnum.GoalAdroitAdmin, Dtos.GroupsEnum.GoalAdroitManager, Dtos.GroupsEnum.GoalAdroitStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.Participant:
                return [Dtos.GroupsEnum.ParticipantAdmin, Dtos.GroupsEnum.ParticipantManager, Dtos.GroupsEnum.ParticipantStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.DownstreamSubscriber:
                return [Dtos.GroupsEnum.DownstreamSubscriberAdmin, Dtos.GroupsEnum.DownstreamSubscriberManager, Dtos.GroupsEnum.DownstreamSubscriberStandard];
            case Dtos.GetUserPermissionsQuery_GroupType.Trm:
                return [Dtos.GroupsEnum.GoalTrmAdmin, Dtos.GroupsEnum.GoalTrmUser];
        }
        return [];
    }


    private popup: Framework.PopupBuilder;

    private onReject() {
        this.props.onChange(this.props.editor, true);
        this.popup = new Framework.PopupBuilder()
            .setTitle("Reject User")
            .withQA("RejectUserPopup")
            .setContent(<RejectPopup onClose={() => this.onCancelReject()} onDone={(dto) => this.onRejectConfirmed(dto)}/>);
        this.popup.open();
    }

    private onRejectConfirmed(dto: Dtos.VerifyUserDto) {
        this.popup.close();
        this.popup = null;
        this.props.onReject(dto);
    }

    private onCancelReject() {
        this.props.onChange(this.props.editor, false);
        this.popup.close();
        this.popup = null;
    }
}