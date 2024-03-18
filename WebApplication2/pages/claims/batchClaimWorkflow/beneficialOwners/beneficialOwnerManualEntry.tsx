import * as React from 'react';
import { Apis, Dtos } from '../../../../adr';
import { connect, Loader, LoadingStatus, Pending, PopupBuilder, safeClone, SimpleGridBuilder } from '../../../../classes';

interface ManualEntryProps {
    claimId: number;
    roundId: number;
    onEntry: () => void;
    beneficialOwners: Pending<GridRowDto[]>;
    beneficialOwnerUpdated: (bo: GridRowDto) => void;
    beneficialOwnersUpdated: (bos: GridRowDto[]) => void;
    onSave: (advanceToNextStep: boolean) => void;
    onBack: () => void;
    hasCategoryElections: boolean;
    saveInProgress: boolean;
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    saveMode?: 'back' | 'save' | 'next';
    securityType: Dtos.SecurityType;
    isIrishEvent: boolean;
};

interface ManualEntryState {
    categoryInfo?: Pending<Dtos.FlattenedAllEventRoundCategoryInfoDto>;
    hasErrors?: boolean;
    beneficialOwners?: GridRowDto[];
};

export interface GridErrorDto {
    propertyName: string;
    message: string;
}

export interface GridRowDto extends Dtos.BeneficialOwnerDetailsDto {
    hasErrors?: boolean;
    errors?: GridErrorDto[];
    uiid?: string;
}

export class BeneficialOwnerManualEntry extends React.Component<ManualEntryProps, ManualEntryState> {
    private maximumUploadCount: number = 20;
    private currentEditRow?: number = null;
    private currentSaveInProgressRow?: number = null;
    private workflowTriggered: boolean;
    private moveToNextStepOnWorkflow: boolean = false;

    constructor(props: ManualEntryProps) {
        super(props);

        this.state = {
            categoryInfo: new Pending<Dtos.FlattenedAllEventRoundCategoryInfoDto>(LoadingStatus.Preload),
            hasErrors: false
        };
    }

    render() {
        var all = Pending.combine(this.props.beneficialOwners, this.state.categoryInfo,
            (bo, cats) => { return { beneficialOwners: bo, categories: cats } });

        return Loader.for(all, all => {
            let countries = all.categories.countries.map(country => ({ name: country.countryName, id: country.id }));
            let entities = all.categories.entityTypes.map(et => ({ name: et.description, id: et.id }));
            let categories = all.categories.categories.map(cat => ({ name: cat.displayName, id: cat.id }));

            let owners = this.props.beneficialOwners.data;

            setTimeout(() => this.showErrors(), 500);

            let grid = SimpleGridBuilder.For(owners)
                .isFixed(3)
                .isScrollable()
                .setHeight(600)
                .setRowHeight(78)
                .setSaveHandler((i, ins) => this.handleRowSave(i, ins))
                .setShowNoDataMessage(false)
                .addButton("Add Beneficial Owner", () => this.addBeneficialOwner(), { dataQA: "AddBeneficialOwnerButton", pushRemainingRight: true})
                .addCustomColumn("Row", (_, v) => <div id="rowNum">{v + 1}</div>, () => null, null, null, "Row",{ width: 45, locked: true })
                .addString("Company Name / Family Name", m => m.familyName, null, "CompanyNameFamilyName",(m, v) => { m.familyName = v; this.setEditRow(m); }, { locked: true, width: 150, columnPropertyName: "FamilyName" })
                .addString("Given Names (only for individuals)", m => m.givenNames, null, "GivenNamesOnlyForIndividuals", (m, v) => { m.givenNames = v; this.setEditRow(m); }, { locked: true, width: 150, columnPropertyName: "GivenNames" })
                .withQA("Grid")
                ;

            if (!(this.props.securityType == Dtos.SecurityType.CommonStock && this.props.isIrishEvent))
                grid.addString("TIN/Social security number", m => m.taxIdNumber, null, "TinSocialSecurityNumber", (m, v) => { m.taxIdNumber = v; this.setEditRow(m); }, { locked: true, width: 150, columnPropertyName: "TaxIdNumber" })
                    .addDate("Date of Birth (if individual)", m => m.dateOfBirth, null, "DateOfBirthIfIndividual", (m, v) => { this.setDateOfBirth(m, v); this.setEditRow(m); }, { width: 150, isDateOnly: true })
                    .addString("Registered Address - Address Line 1", m => m.addressLine1, null, "RegisteredAddressAddressLine1", (m, v) => { m.addressLine1 = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "AddressLine1" })
                    .addString("Registered Address - Address Line 2", m => m.addressLine2, null, "RegisteredAddressAddressLine2", (m, v) => { m.addressLine2 = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "AddressLine2" })
                    .addString("Registered Address - Address Line 3", m => m.addressLine3, null, "RegisteredAddressAddressLine3", (m, v) => { m.addressLine3 = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "AddressLine3" })
                    .addString("Registered Address - City", m => m.city, null, "RegisteredAddressCity", (m, v) => { m.city = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "City" })
                    .addString("Registered Address - State/Province", m => m.stateProvince, null, "RegisteredAddressStateProvince", (m, v) => { m.stateProvince = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "StateProvince" })
                    .addString("Registered Address - ZIP Code/Post Code", m => m.zip, null, "RegisteredAddressZipCodePostCode", (m, v) => { m.zip = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "Zip" })
                    .withQA("CommonStockAndIrish1")
                    ;

            grid.addDropdown("Registered Address - Country (Country of Residence)", m => m.countryOfResidence && countries.find(x => x.id == m.countryOfResidence.id), null, countries, "RegisteredAddressCountryOfResidence", (m, v) => { m.countryOfResidence = v ? all.categories.countries.find(x => x.id == v.id) : null; this.setEditRow(m); }, { width: 150, columnPropertyName: "CountryOfResidenceId" })
                .addDropdown("Entity Type", m => m.entityType && entities.find(x => x.id == m.entityType.id), null, entities, "EntityType", (m, v) => { m.entityType = v ? all.categories.entityTypes.find(x => x.id == v.id) : null; this.setEditRow(m) }, { width: 150, columnPropertyName: "EntityTypeId" })
                .addDropdown("Category", m => m.category && categories.find(x => x.id == m.category.id), null, categories, "Category", (m, v) => { m.category = v ? all.categories.categories.find(x => x.id == v.id) : null; this.setEditRow(m) }, { width: 200, columnPropertyName: "CategoryId" })
                .addNumber(`# of ${this.props.securityType == Dtos.SecurityType.CommonStock ? "Stocks" : "ADRs"}`, m => m.adrPosition, null, "SecurityType", (m, v) => { m.adrPosition = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "AdrPosition", min: 0 })
                .withQA("GridRow1")
                ;

            if (!(this.props.securityType == Dtos.SecurityType.CommonStock && this.props.isIrishEvent))
                grid.addString("Custody Account Number", m => m.custodyAccountNumber, null, "CustodyAccountNumber", (m, v) => { m.custodyAccountNumber = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "CustodyAccountNumber" })
                    .addString("Participant Unique Identifier", m => m.participantUniqueId, null, "ParticipantUniqueIdentifier", (m, v) => { m.participantUniqueId = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "ParticipantUniqueId" })
                    .addString("Foreign Tax ID", m => m.foreignTaxId, null, "ForeignTaxID", (m, v) => { m.foreignTaxId = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "ForeignTaxId" })
                    .withQA("CommonStockAndIrish2");

            if (this.props.securityType == Dtos.SecurityType.CommonStock && this.props.isIrishEvent)
                grid.addString("Name of Qi", m => m.nameOfQi, null, "NameOfQi", (m, v) => { m.nameOfQi = v; this.setEditRow(m); }, { width: 100, columnPropertyName: "NameOfQi" })
                    .addString("Contact Information", m => m.contactInformation, null, "ContactInformation", (m, v) => { m.contactInformation = v; this.setEditRow(m); }, { width: 200, columnPropertyName: "ContactInformation" })
                    .addString("V2 or V3", m => m.v2orV3, null,"V2OrV3", (m, v) => { m.v2orV3 = v; this.setEditRow(m); }, { width: 75, columnPropertyName: "V2orV3" })
                    .withQA("CommonStockAndIrish3")
                    ;

            grid.addString("Underlying Holders", m => m.underlyingHolders, null, "UnderlyingHolders", (m, v) => { m.underlyingHolders = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "UnderlyingHolders" })
                .addNumber("Share Percentage", m => m.sharePercentage, null, "SharePercentage", (m, v) => { m.sharePercentage = v; this.setEditRow(m); }, { width: 150, columnPropertyName: "SharePercentage", min: 0, decimals: 4 })
                .addCustomColumn(" ", m => this.renderDeleteButton(m), () => null, null, null, "DeleteButton", { width: 50 })
                .withQA("GridRow2")
                ;

            return (
                <div>
                    {this.renderErrorMessages(owners)}
                    <div id="adr-manual-entry-grid" data-qa="ManualEntryGrid">{grid.render()}</div>
                    {this.renderButtons()}
                </div>);
        });
    }
    private setDateOfBirth = (row: GridRowDto, date: Date) => row.dateOfBirth = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    private resizeGrid() {
        var grid = $("#adr-manual-entry-grid div.react-grid").data('kendoGrid');
        if (grid) {
            grid.resize(true);
        }
    }

    private renderButtons() {
        return (
            <div className="text-end" style={{ marginTop: 10 }}>
                <button className={"btn btn-outline-secondary" + ((this.props.saveInProgress && this.props.saveMode == 'back') ? " btn-loading" : "")} disabled={this.props.saveInProgress} onClick={() => this.props.onBack()} data-qa="WorkingFilingMethodButton">
                    {this.props.saveInProgress && this.props.saveMode == 'back' ? 'Working...' : (this.props.hasCategoryElections ? 'Category Elections' : 'Filing Method')}
                </button>

                <button id="saveExitBtn" className={"btn btn-outline-secondary" + ((this.props.saveInProgress && this.props.saveMode == 'save') ? " btn-loading" : "")} disabled={this.props.saveInProgress} onClick={() => this.saveChanges(false)} data-qa="SaveAndExitButton">
                    {this.props.saveInProgress && this.props.saveMode == 'save' ? "Saving Claim..." : "Save and Exit"}
                </button >

                <button id="nextBtn" className={"btn btn-primary" + ((this.props.saveInProgress && this.props.saveMode == 'next') ? " btn-loading" : "")} disabled={this.props.saveInProgress} onClick={() => { this.showErrors(); this.saveChanges(true) }} data-qa="PreviewButton">
                    {this.props.saveInProgress && this.props.saveMode == 'next' ? "Saving Claim..." : "Preview"}
                </button>
            </div>
        );
    }

    componentDidMount(): void {
        this.ensureCategories();
    }

    private saveChanges(moveToNextStep: boolean) {
        this.props.onSaveInProgress(moveToNextStep ? 'next' : 'save');

        if (this.currentEditRow != null) {
            var grid = $("#adr-manual-entry-grid div.react-grid").data('kendoGrid');
            grid.closeCell();
            grid.saveRow();
            grid.saveChanges();

            var component = this;
            setTimeout(function () { component.saveWait(moveToNextStep) }, 500);
        }
        else {
            this.saveWait(moveToNextStep);
        }
    }

    private saveWait(moveToNextStep: boolean) {
        if (this.currentEditRow != null && this.currentSaveInProgressRow == null) {
            this.updateBeneficialOwnerRecord(this.currentEditRow, false, true, moveToNextStep);
        }
        else if (this.currentSaveInProgressRow != null) {
            this.workflowTriggered = true;
            this.moveToNextStepOnWorkflow = moveToNextStep;
        }
        else {
            this.props.onSave(moveToNextStep);
        }
    }

    private setEditRow(model: GridRowDto) {
        this.currentEditRow = this.props.beneficialOwners.data.indexOf(model);
    }

    private renderDeleteButton(model: GridRowDto): JSX.Element {
        let component = this;

        return (
            <div className="float-end" onClick={() => component.deleteBeneficialOwner(model)} style={{ cursor: 'pointer' }} data-qa="DeleteButton" onKeyDown={() => component.deleteBeneficialOwner(model)}>
                <div className="k-button btn-circle k-grid-CustomCancel">
                    <span className="k-icon k-delete" title="Delete" data-qa="DeleteIcon"></span>
                </div>
            </div>
        );
    }

    private handleRowSave(index: number, insertNewRecord: boolean) {
        let createNewRow = insertNewRecord && index == this.props.beneficialOwners.data.length - 1 && this.props.beneficialOwners.data.length < this.maximumUploadCount;
        this.updateBeneficialOwnerRecord(index, createNewRow, false);
    }

    private ensureCategories() {
        if (this.state.categoryInfo.state === LoadingStatus.Preload || this.state.categoryInfo.state === LoadingStatus.Stale) {
            var query = { roundId: this.props.roundId } as Dtos.GetAllEventRoundCategoriesForRoundQuery;
            connect(new Apis.BatchClaimWorkflowRoundInfoApi().getCategoriesForEventRound(query), this.state.categoryInfo, categoryInfo => this.setState({ categoryInfo }));
        }
    }

    private updateBeneficialOwnerRecord(index: number, createNewRow: boolean, triggerSaveEvent?: boolean, moveToNextStep?: boolean) {
        var record = this.props.beneficialOwners.data[index];

        if (!record) return;

        this.currentSaveInProgressRow = index;

        if (!record.id) {
            connect(new Apis.BeneficialOwnerApi().create(record as Dtos.BenownerCreateDto), null, bo => {
                if (bo.state == LoadingStatus.Done) {
                    this.showBeneficialOwnerUpdates(record, bo.data, index, null, triggerSaveEvent, moveToNextStep, createNewRow);
                }
                else if (bo.state === LoadingStatus.Failed) {
                    this.showBeneficialOwnerUpdates(record, bo.data, index, bo.error.serverError as any, triggerSaveEvent, moveToNextStep, createNewRow);
                }
            });
        }
        else {
            connect(new Apis.BeneficialOwnerApi().update(record.id, record as Dtos.BenownerUpdateDto), null, bo => {
                if (bo.state === LoadingStatus.Done) {
                    this.showBeneficialOwnerUpdates(record, bo.data, index, null, triggerSaveEvent, moveToNextStep, createNewRow);
                }
                else if (bo.state === LoadingStatus.Failed) {
                    this.showBeneficialOwnerUpdates(record, bo.data, index, bo.error.serverError as any, triggerSaveEvent, moveToNextStep, createNewRow);
                }
            });
        }
    }

    private showBeneficialOwnerUpdates(originalRecord: GridRowDto, updatedItem: Dtos.BeneficialOwnerDetailsDto, index: number, error: any, triggerSaveEvent?: boolean, moveToNextStep?: boolean, createNewRow?: boolean) {
        $(`#adr-manual-entry-grid .k-grid-content tr:eq('${index}')`).find('td').toggleClass('k-dirty', false);

        originalRecord.hasErrors = !!error;
        if (!originalRecord.id && updatedItem) originalRecord.id = updatedItem.id;

        originalRecord.errors = originalRecord.hasErrors ? this.getBeneficialOwnerErrorsFromResponse(error.failures) : [];

        this.showValidationErrors(originalRecord, index, originalRecord.errors);
        this.props.beneficialOwnerUpdated(originalRecord);

        if (triggerSaveEvent) {
            this.props.onSave(moveToNextStep);
        }

        if (this.workflowTriggered) {
            this.props.onSave(this.moveToNextStepOnWorkflow);

            // If the user selects 'no' to continue, we no longer want to invoke the workflow to continue after each beneficial owner update.
            this.workflowTriggered = false;
            this.moveToNextStepOnWorkflow = false;
        }

        if (createNewRow) {
            this.addBeneficialOwner();
        }

        this.currentSaveInProgressRow = null;
        this.currentEditRow = null;
        this.resizeGrid();
    }

    private getBeneficialOwnerErrorsFromResponse(data: any): GridErrorDto[] {
        let result = data as GridErrorDto[];
        return result;
    }

    private showValidationErrors(record: GridRowDto, index: number, errors: GridErrorDto[]) {
        $(`#adr-manual-entry-grid tr`).toggleClass("k-state-selected", false);

        let errorRow = $(`#adr-manual-entry-grid .k-grid-content, #adr-manual-entry-grid .k-grid-content-locked`).find(`tr:eq('${index}')`);
        errorRow.find('td').toggleClass("cell-invalid", false).find('span').toggleClass('k-dirty', false);
        errorRow.find('td:eq(0)')
            .toggleClass("row-as-unsaved", false)
            .toggleClass("row-as-invalid", errors != null && errors.length > 0)
            .toggleClass("row-as-saved", errors != null && errors.length == 0);

        if (errors) {
            errors.forEach((x, i) => {
                let cell = errorRow.find(`div[data-column-name="${x.propertyName}"]`).closest('td');

                cell.toggleClass("cell-invalid", record.hasErrors);
                cell.find('.validation-arrow').attr('title', x.message);
                cell.find('span').toggleClass('k-dirty', false);
            });
        }
    }

    private renderErrorMessages(owners: GridRowDto[]) {
        let allMessages: JSX.Element[] = [];

        owners.forEach((owner, i) => {
            if (owner.hasErrors) {
                let BOMessages: JSX.Element[] = [];
                let errorRow = $(`#adr-manual-entry-grid .k-grid-content, #adr-manual-entry-grid .k-grid-content-locked`).find(`tr:eq('${i}')`);

                owner.errors.forEach((error, j) => {
                    let cell = errorRow.find(`div[data-column-name="${error.propertyName}"]`).closest('td');
                    const scrollableSection = cell.parents().hasClass("k-auto-scrollable");
                    const absPosition = scrollableSection ? cell.position().left + $(`.k-auto-scrollable`).scrollLeft() : null;

                    BOMessages.push(<li key={j}><a onClick={() => this.focusGridCell(i, error.propertyName, absPosition)}><b>{error.message}</b></a></li>);
                });
                allMessages.push(<li key={i}><b>Row {i+1}</b><ul>{BOMessages}</ul></li>);
            }
        });

        return allMessages.length > 0 ? (
        <div id="adr-manual-entry-grid-input-errors">
            <h4>Input Errors</h4>
            <ul>{allMessages}</ul>
        </div>)
        : null
    }

    private focusGridCell(rowIndex: number, colPropertyName: string, scrollAmount: number) {
        var grid = $("#adr-manual-entry-grid div.react-grid").data("kendoGrid");
        let errorRow = grid.content.add(grid.lockedContent).find(`tr:eq('${rowIndex}')`);
        let cell = errorRow.find(`div[data-column-name="${colPropertyName}"]`).closest('td');
        if (cell == null) cell = errorRow.find(`input`).closest('td');    // If the cell is already selected

        if (scrollAmount != null) $(`.k-auto-scrollable`).scrollLeft(scrollAmount);
        grid.editCell(cell);
    }

    private showErrors() {
        this.props.beneficialOwners.data.forEach((bo, i) => { this.showValidationErrors(bo, i, bo.errors); });
    }

    private addBeneficialOwner() {
        if (this.props.beneficialOwners.data.length >= this.maximumUploadCount) {
            new PopupBuilder()
                .setTitle("Manual Entry")
                .setContent(<div data-qa="ManualEntryIsLimitedToMaximumRows">Manual entry is limited to {this.maximumUploadCount} maximum rows</div>)
                .withQA("AddBeneficialOwnerPopup")
                .open()
                ;
        }

        else {
            this.props.onEntry();

            let updatedList = safeClone(this.props.beneficialOwners.data);
            updatedList.push(this.blankBeneficialOwner());

            this.props.beneficialOwnersUpdated(updatedList);
            this.resizeGrid();
        }
    }

    private blankBeneficialOwner(): GridRowDto {
        return {
            familyName: "",
            givenNames: "",
            uiid: kendo.guid(),
            addressLine1: "",
            addressLine2: "",
            addressLine3: "",
            city: "",
            stateProvince: "",
            zip: "",
            taxIdNumber: "",
            participantUniqueId: "",
            dateOfBirth: null,
            custodyAccountNumber: "",
            batchClaimId: this.props.claimId,
            id: null,
            adrPosition: null,
            entityType: { id: -1 } as Dtos.EntityTypeSummaryDto,
            countryOfResidence: { id: -1 } as Dtos.CountrySummaryDto,
            category: { id: - 1 } as Dtos.EventRoundCategorySummaryDto,
            hasErrors: false
        } as GridRowDto;
    }

    private deleteBeneficialOwner(dto: GridRowDto) {
        var updatedList = safeClone(this.props.beneficialOwners.data);

        updatedList.splice(this.props.beneficialOwners.data.indexOf(dto), 1);
        dto.hasErrors = false;

        this.props.beneficialOwnerUpdated(dto);
        this.props.beneficialOwnersUpdated(updatedList);

        //  no need to delete on server if it hasn't been saved yet
        if (dto.id)
            new Apis.BeneficialOwnerApi().delete(dto.id);

        this.resizeGrid();
    }
}