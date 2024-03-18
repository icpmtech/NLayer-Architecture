import * as React from 'react';
import { Apis, Dtos } from '../../../../adr';
import { connect, DialogBuilder, LoadingStatus, Pending, safeClone } from '../../../../classes';
import { BeneficialOwnerManualEntry, GridRowDto } from './beneficialOwnerManualEntry';
import { BeneficialOwnerUpload } from './beneficialOwnerUpload';


interface Props {
    pageMode: 'manual' | 'upload';
    claimId: number;
    roundId: number;
    returnUrl: string;
    hasCategoryElections: boolean;
    stateChangeInProgress?: boolean;
    onBack: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
    hasBeneficialOwners: (hasBenOwners: boolean) => void;
    saveMode?: 'back' | 'save' | 'next';
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    onSaveCancelled: () => void;
    onFileUploaded: () => void;
    securityType: Dtos.SecurityType;
    isIrishEvent: boolean;
    currentStage: Dtos.BatchClaimEntrystage;
}

interface State {
    pageMode?: 'manual' | 'upload';
    warningRequired?: boolean;
    beneficialOwners?: Pending<GridRowDto[]>;
    uploadedBeneficialOwners?: number;
    boErrors?: string[];
}

export class BeneficialOwnerPage extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            pageMode: props.pageMode,
            warningRequired: false,
            beneficialOwners: new Pending<GridRowDto[]>(LoadingStatus.Preload),
            boErrors: []
        };
    }

    componentDidMount() {
        this.ensureBeneficialOwners();
        this.ensureSummary();
    }

    private cancelChanges() {
        let previousStepId = (this.props.hasCategoryElections ? Dtos.BatchClaimEntrystage.CategoryElection : Dtos.BatchClaimEntrystage.Creation);

        if (previousStepId == Dtos.BatchClaimEntrystage.Creation) {
            let d = new DialogBuilder();

            d.setTitle("Claims Process")
                .setMessage(`The Beneficial Owner information entered will be lost. Are you sure you want to go to the previous step?`)
                .setConfirmHandler(() => this.confirmCancel(previousStepId))
                .setCancelHandler(() => d.close())
                .withQA("BeneficialOwnerInformationWillBeLostDialog")
                .open()
                ;

            return;
        }
        else {
            this.confirmCancel(previousStepId);
        }
    }

    private saveChanges(goToPreview: boolean) {
        this.props.onSaveInProgress(goToPreview ? 'next' : 'save');

        if (this.state.pageMode === 'manual' && this.state.boErrors.length) {
            let d = new DialogBuilder();

            let errorItemIndexes = this.state.beneficialOwners.data.map((x, i) => { return { errors: this.state.boErrors.find(l => l == x.uiid) != null, index: i } }).filter(x => x.errors).map(x => x.index + 1);
            let errorItemsText = errorItemIndexes.join(', ');
            let multipleErrorRows = errorItemIndexes.length > 1;

            d.setTitle("Manual Entry")
                .setMessage(`The Beneficial Owner${multipleErrorRows ? "s" : ""} in row${multipleErrorRows ? "s" : ""} ${errorItemsText} (rows marked with a red block) ha${multipleErrorRows ? "ve" : "s"} validation errors, therefore will not be saved. Are you sure you want to continue?`)
                .setConfirmHandler(() => this.confirmSave(goToPreview))
                .setCancelHandler(() => { this.props.onSaveCancelled(); d.close(); })
                .withQA("BeneficialOwnerErrors")
                .open()
                ;
            return;
        }
        else {
            this.confirmSave(goToPreview);
        }
    }

    private confirmCancel(previousStep: Dtos.BatchClaimEntrystage) {
        $("form[name='stageChangeForm']").find("#SetWorkflowStep").val(previousStep as number);
        var form = $("form[name='stageChangeForm']");
        form.submit();
    }

    private confirmSave(goToPreview: boolean) {
        this.props.hasBeneficialOwners(this.state.uploadedBeneficialOwners > 0 ||
            (this.state.beneficialOwners.data && this.state.beneficialOwners.data.length > 0));

        if (goToPreview) {
            this.props.onNext();
        }
        else {
            this.props.onSaveAndExit();
        }
    }

    render() {
        return (<div>
            <div className="k-content k-state-active" data-qa="BeneficialOwnerUploadDiv">
                {this.renderTabs()}
                <div style={{ border: "1px solid lightgrey", padding: "10px" }}>
                    {(this.state.pageMode == "upload" || this.props.currentStage == Dtos.BatchClaimEntrystage.UploadFailed) &&
                        <BeneficialOwnerUpload
                            returnUrl={this.props.returnUrl}
                            roundId={this.props.roundId}
                            claimId={this.props.claimId}
                            dataHasBeenUploaded={!!this.state.uploadedBeneficialOwners}
                            onFileUploaded={() => { this.props.onFileUploaded(); this.ensureSummary(); this.setState({ warningRequired: true }) }}
                            onFileFailed={() => this.ensureSummary()}
                            onBack={this.props.onBack}
                            hasCategoryElections={this.props.hasCategoryElections}
                            saveChanges={(preview) => this.saveChanges(preview)}
                            saveMode={this.props.saveMode}
                            saveInProgress={this.props.stateChangeInProgress}
                            onSaveInProgress={(mode) => { this.props.onSaveInProgress(mode); }}
                            securityType={this.props.securityType}
                            fileUploadTabSelected={true}
                            currentStage={this.props.currentStage}
                        />}
                    {(this.state.pageMode == "manual" && this.props.currentStage != Dtos.BatchClaimEntrystage.UploadFailed) && 
                        <BeneficialOwnerManualEntry
                            roundId={this.props.roundId}
                            claimId={this.props.claimId}
                            onEntry={() => this.setState({ warningRequired: true })}
                            beneficialOwners={this.state.beneficialOwners}
                            beneficialOwnerUpdated={(bo) => this.updateBeneficialOwnerErrors(bo.uiid, bo.hasErrors)}
                            beneficialOwnersUpdated={(bos) => {
                                this.props.hasBeneficialOwners(true);
                                this.setState({ beneficialOwners: new Pending<GridRowDto[]>(LoadingStatus.Done, bos) });
                                this.highlightEditCell();
                            }}
                            onSave={(stepNext) => this.saveChanges(stepNext)}
                            hasCategoryElections={this.props.hasCategoryElections}
                            onBack={() => { this.props.onBack(); }}
                            saveInProgress={this.props.stateChangeInProgress}
                            saveMode={this.props.saveMode}
                            onSaveInProgress={(mode) => { this.props.onSaveInProgress(mode); }}
                            securityType={this.props.securityType}
                            isIrishEvent={this.props.isIrishEvent}
                        />}
                </div>
            </div>
        </div>);
    }

    private updateBeneficialOwnerErrors(uiid: string, hasErrors: boolean) {
        let info = safeClone(this.state.boErrors);

        if (!hasErrors && info.filter(x => x == uiid).length) {
            info.splice(info.indexOf(uiid), 1);
        }

        else if (hasErrors && !info.filter(x => x == uiid).length) {
            info.push(uiid);
        }

        this.setState({ boErrors: info });
    }

    private highlightEditCell() {
        var grid = $("#adr-manual-entry-grid div.react-grid").data("kendoGrid");
        let cell = (grid.lockedContent || grid.content).find(`tr:eq(${this.state.beneficialOwners.data.length - 1}) div[data-column-name="FamilyName"]`).closest('td');
        grid.editCell(cell);
    }

    private ensureBeneficialOwners() {
        let query = { id: this.props.claimId } as Dtos.GetBatchClaimBenOwnersQuery;

        connect(new Apis.BeneficialOwnerApi().getAllByClaimId(query, 1, 20), null, (bos) => {
            if (bos.isReady() && bos.data.count)
                this.setState({ warningRequired: true });

            if (bos.isDone()) {
                let box = bos.data.items.map(x => { var l = x as GridRowDto; l.uiid = kendo.guid(); return l });
                this.setState({ beneficialOwners: new Pending<GridRowDto[]>(LoadingStatus.Done, box) })
            }
        });
    }

    private ensureSummary() {
        connect(new Apis.BatchClaimApi().getSummaryById(this.props.claimId), null, x => {
            if (x.isDone()) {
                this.setState({ uploadedBeneficialOwners: x.data.numberBoIncluded });
            }
        });
    }

    private changePageState(mode: 'manual' | 'upload') {
        if (mode === this.state.pageMode) return;

        let msg = this.state.pageMode === 'manual'
            ? 'If you change to the Upload Template Entry, the BO information that you entered in the Manual Entry will be lost. Are you sure you want to change to the Upload Template Entry?'
            : 'If you change to the Manual Entry, the file that you uploaded in the Upload Template Entry will be lost. Are you sure you want to change to the Manual entry?';

        if (this.state.warningRequired) {
            let d = new DialogBuilder();

            d.setTitle("Claims Process")
                .setMessage(msg)
                .setConfirmHandler(() => { this.confirmChangePageState(mode) })
                .setCancelHandler(() => { d.close(); })
                .withQA("ClaimsProcessDialog")
                .open();
        }
        else {
            this.confirmChangePageState(mode);
        }
    }

    private confirmChangePageState(mode: 'manual' | 'upload') {
        connect(new Apis.BatchClaimApi().update(this.props.claimId,
            { claimId: this.props.claimId, workflowStep: mode == 'manual' ? Dtos.BatchClaimEntrystage.AddBeneficialOwnersManualEntry : Dtos.BatchClaimEntrystage.AddBeneficialOwnersUpload } as Dtos.UpdateClaimDto),
            null,
            x => {
                this.setState({ pageMode: mode, warningRequired: false });

                this.ensureBeneficialOwners();
                this.ensureSummary();
            });
    }

    private renderTabs() {
        if (this.props.currentStage == Dtos.BatchClaimEntrystage.UploadFailed) {
            return null;
        }

        let activeTabClasses = "k-state-active k-tab-on-top";
        let infoTitle = "For up to 20 beneficial owners you can use the manual entry. For more than 20 use the Upload.";

        return (<div className="k-reset k-tabstrip-items">
            <li className="k-item info-Icon k-first" style={{ paddingRight: "5px", paddingTop: "5px" }}>
                <div id="infoBtnUploadIcon" className="custom-upload-info-icon" data-qa="UploadInfoIcon">
                    <span className="fa fa-info-circle" title={infoTitle} style={{ fontSize: "1.5em", fontFamily: "FontAwesome" }} data-qa="InfoTitle"></span>
                </div>
            </li>
            <li className={"k-item k-state-default " + (this.state.pageMode == 'manual' ? activeTabClasses : '')} role="tab">
                <span className="k-link" onClick={(e) => this.changePageState('manual')} data-qa="ManualLink">Manual</span>
            </li>
            <li className={"k-item k-state-default k-last " + (this.state.pageMode == 'upload' ? activeTabClasses : '')} role="tab">
                <span className="k-link" onClick={(e) => this.changePageState('upload')} data-qa="UploadLink">Upload</span>
            </li>
        </div>);
    }
}
