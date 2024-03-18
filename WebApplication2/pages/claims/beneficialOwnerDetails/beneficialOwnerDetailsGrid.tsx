import * as React from 'react';
import { Dtos } from '../../../adr';
import { DetailsBuilder, Pending } from '../../../classes';
import * as Stateless from '../../../components/stateless';

interface BeneficialOwnerDetailsProps {
    ownerDetails?: Pending<Dtos.BeneficialOwnerDetailsDto>;
    eventDetails?: Dtos.EventDto;
};

export class BeneficialOwnerDetailsGrid extends React.Component<BeneficialOwnerDetailsProps, {}> {

    private renderDetails() {
        let builder = DetailsBuilder.ForPending(this.props.ownerDetails);
        builder.addHeading(x =>
            <span>
                {`Issuer: `}{x.eventIssuer}
            </span>);
        builder.addHeading(x =>
            <span>{`ADR Record Date: `}
                <Stateless.Date date={x.eventAdrRecordDate} qa="AdrRecordDate"/>
            </span>);

        let col1 = builder.addColumn("Batch claim #", x => x.batchClaimNumber, 35, "BatchClaimNumber", 50, 50);
        col1.addString("Company Name/ Family Name", x => x.familyName, "CompanyNameFamilyName");
        col1.addString("Given Names", x => x.givenNames, "GivenNames");
        col1.addString("Category", x => x.category.displayName, "Category");
        col1.addCustom("Reclaim Rate", x => `${x.reclaimRate}%`, "ReclaimRate");
        col1.addString("Entity Type", x => x.entityType.description, "EntityType");
        col1.addString("Country of Residence", x => x.countryOfResidence.countryName, "CountryOfResidence");

        if (this.props.eventDetails.securityType == Dtos.SecurityType.CommonStock)
            col1.addString("Name of QI", x => x.nameOfQi, "NameOfQi");

        let col2 = builder.addColumn("Beneficial Owner Claim ID", x => x.benownerClaimReference, 35, "BeneficialOwnerClaimId", 55, 45);
        col2.addString("Address Line 1", x => x.addressLine1, "AddressLine1");
        col2.addString("Address Line 2", x => x.addressLine2, "AddressLine2");
        col2.addString("Address Line 3", x => x.addressLine3, "AddressLine3");
        col2.addString("City", x => x.city, "City")
        col2.addString("State/ Province", x => x.stateProvince, "StateProvince");
        col2.addString("Zip Code/ Postal Code", x => x.zip, "ZipCodePostCode");

        if (this.props.eventDetails.securityType == Dtos.SecurityType.CommonStock)
            col2.addString("Contact Information", x => x.contactInformation, "ContactInformation");

        let col3 = builder.addColumn("BO Claim Status", x => x.benOwnerClaimStatusName, 30, "BeneficialOwnerClaimStatus", 55, 45);
        col3.addString("TIN/ Social Security No.", x => x.taxIdNumber, "TaxIdNumber");
        col3.addString("Foreign Tax ID", x => x.foreignTaxId, "ForeignTaxId");
        col3.addString("Custody Account Number", x => x.custodyAccountNumber, "CustodyAccountNumber");
        col3.addString("Participant Unique Identifier", x => x.participantUniqueId, "ParticipantUniqueIdentifier");
        col3.addNumber("ADR Position", x => x.adrPosition, "AdrPosition");
        if (this.showPossibleDuplicate()) {
            col3.addYesNo("Possible Duplicate", x => x.isPossibleDuplicate, "PossibleDuplicate");
        }
        if (this.props.eventDetails.securityType == Dtos.SecurityType.CommonStock)
            col3.addString("V2 or V3", x => x.v2orV3, "V2OrV3");
        col3.addString("Underlying Holders", x => x.underlyingHolders, "UnderlyingHolders")
        col3.addCustom("Share Percentage", x => x.sharePercentage == null ? null : `${x.sharePercentage}%`, "SharePercentage");

        return builder.render();
    }


    private showPossibleDuplicate(): boolean {
        if (this.props.ownerDetails.isReady()) {
            let preventShowing = [Dtos.BeneficialOwnerClaimStatus.InPreparation, Dtos.BeneficialOwnerClaimStatus.Canceled];
            if (preventShowing.indexOf(this.props.ownerDetails.data.benOwnerClaimStatusId) === -1) {
                return true;
            }
        }
        return false;
    }

    render() {
        return this.renderDetails();
    }
}