import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Pages from './pages';
import { Apis } from './adr';

import { QAIndicator } from './classes';

import './styles/details.css';
import './vendor/startswith-polyfill.js';

let pages: { [key: string]: { (props: any): JSX.Element } } = {};

window["qa"] = QAIndicator;

export function registerPage(id: string, make: (props: any) => JSX.Element) {
    pages[id] = make;
}

let load = function () {
    registerPage("react-batch-claim-details", props => <Pages.Claims.BatchClaimDetails {...props}/>);
    registerPage("react-beneficial-owner-claims", props => <Pages.Claims.BeneficialOwnerClaims {...props}/>);
    registerPage("react-beneficial-owner-details", props => <Pages.Claims.BeneficialOwnerDetails {...props}/>);
    registerPage("react-participant-batch-claims", props => <Pages.Claims.ParticipantBatchClaims {...props}/>);
    registerPage("react-batch-claim-create", props => <Pages.Claims.CreateClaim {...props}/>);
    registerPage("react-batch-claim-category-election", props => <Pages.Claims.BatchClaimCategoryElections {...props}/>);
    registerPage("react-batch-claim-beneficial-owners", props => <Pages.Claims.BeneficialOwnerPage {...props}/>);
    registerPage("react-progress-model", props => <Pages.Claims.BatchClaimWorkflowWidget {...props}/>);
    registerPage("react-batch-claim-workflow", props => <Pages.Claims.BatchClaimWorkflow {...props}/>);
    registerPage("react-categories", props => <Pages.CategoriesPage {...props}/>);
    registerPage("react-claim-preview-beneficial-owners", props => <Pages.Claims.ClaimPreviewPage {...props}/>);
    registerPage("react-submit-claim", props => <Pages.Claims.SubmitClaimPage {...props}/>);
    registerPage("react-claim-preview", props => <Pages.Claims.ClaimPreviewPage {...props}/>);
    registerPage("react-demo-components", props => <Pages.ReactDemo {...props}/>);
    registerPage("react-document-static-data", props => <Pages.DocumentStaticDataPage {...props}/>);
    registerPage("react-downstream-subscribers", props => <Pages.DownstreamSubscriberPage {...props}/>);
    registerPage("react-event-copy", props => <Pages.EventCopy {...props}/>);
    registerPage("react-event-general-info", props => <Pages.EventGeneralInfoPage {...props}/>);
    registerPage("react-events-list-as-articipant", props => <Pages.ListAsParticipant {...props}/>);
    registerPage("react-events-list-as-goal", props => <Pages.EventsAsGoalPage {...props}/>);
    registerPage("react-export-rpa", props => <Pages.ExportRpa {...props}/>);
    registerPage("react-file-manager", props => <Pages.UserGuideUpload {...props}/>);
    registerPage("react-participant-event-claims", props => <Pages.Claims.ParticipantEventClaims {...props}/>);
    registerPage("react-participant-search", props => <Pages.ParticipantsPageGoal {...props}/>);
    registerPage("react-participant-details", props => <Pages.ParticipantsPageParticipant {...props}/>);
    registerPage("react-participant-positions", props => <Pages.ParticipantPositions {...props}/>);
    registerPage("react-reports-export", props => <Pages.Reports {...props}/>);
    registerPage("react-sdn-list", props => <Pages.SdnUpload {...props}/>);
    registerPage("react-rounds", props => <Pages.RoundsPage {...props}/>);
    registerPage("react-home", props => <Pages.Home {...props}/>);
    registerPage("react-ds-positions", props => <Pages.ParticipantPositions {...props}/>);
    registerPage("react-invite-users", props => <Pages.InviteUsers {...props}/>);
    registerPage("react-invite-goal-users", props => <Pages.InviteGoalUsers {...props}/>);
    registerPage("react-users", props => <Pages.UsersPage {...props}/>);
    registerPage("react-edit-user-profile", props => <Pages.EditCurrentUserPage {...props}/>);
    registerPage("react-user-registration", props => <Pages.UserRegistration {...props}/>);
    registerPage("react-create-email-change-request", props => <Pages.CreateChangeEmailAddress {...props}/>);
    registerPage("react-user-registrations", props => <Pages.UserRegistrationsPage {...props}/>);
    registerPage("react-treaties", props => <Pages.TrmTreatiesPage {...props}/>);
    registerPage("react-wht-rates", props => <Pages.WhtRatesPage {...props}/>);
    registerPage("react-statutes", props => <Pages.StatutesPage {...props}/>);
    registerPage("react-change-password", props => <Pages.ChangePassword {...props}/>);
    registerPage("react-set-security-question", props => <Pages.SetSecurityQuestion {...props}/>);
    registerPage("react-user-registration-prepare", props => <Pages.InivitaionsPrepare {...props}/>);
    registerPage("react-user-registration-accept", props => <Pages.InivitaionsAccept {...props}/>);
    registerPage("react-tax-credits", props => <Pages.TaxCreditsPage {...props}/>);
    registerPage("react-news", props => <Pages.NewsPage {...props}/>);
    registerPage("react-trm-awaiting-verification", props => <Pages.AwaitingVerificationPage {...props}/>);
    registerPage("react-trm-rates", props => <Pages.TrmRatesPage {...props}/>);
    registerPage("react-bulk-claims", props => <Pages.BulkClaimsPage {...props}/>);
    registerPage("react-footer", props => <Pages.Footer {...props}/>);
    registerPage("react-edit-announcement", props => <Pages.AnnouncementsPage {...props}/>);
    registerPage("react-reports-and-reconciliation", props => <Pages.ReconciliationPage {...props}/>);

    let elements = Object.keys(pages)
        .map(key => document.getElementById(key))
        .filter(x => !!x);

    if (elements && elements.length) {
        elements.forEach(element => {
            //use the serialisation from json to handle dates etc that use string examination
            var props = JSON.parse(JSON.stringify($(element).data()));
            var reactElement = pages[element.id](props);
            console.log("Rendering react", element.id, props);
            ReactDOM.render(reactElement, element, () => QAIndicator.Initalise());
        });
        return;
    }
    else {
        QAIndicator.Initalise();
    }

    //console.log("Unable to load page element component. Looking for...", Object.keys(pages));
};

window.addEventListener('load', load);
window["reloadReact"] = () => load();  // can be used by non-react pages to reload the react components when necessary (e.g. data attribute changes)
window["Apis"] = Apis; //useful for testing