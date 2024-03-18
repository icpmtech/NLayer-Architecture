import * as React from 'react';
import { Apis, Dtos } from '../../../../adr';
import { connect, Loader, LoadingStatus, Pending } from '../../../../classes';
import { BeneficialOwnerPreview } from './BeneficialOwnerPreviewGrid';
import { CategoryPreview } from './categoryPreviewGrid';

interface PageProps {
    claimId: number;
    event: Pending<Dtos.EventDto>;
    beneficialOwnersAvailable: boolean;
    onBack: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
    stateChangeInProgress?: boolean;
    saveMode?: 'back' | 'save' | 'next';
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    onSaveCancelled: () => void;
    excelExportLimit: number;
};

interface PageState {
    claimSummary: Pending<Dtos.BatchClaimSummaryDto>;
};

export class ClaimPreviewPage extends React.Component<PageProps, PageState> {

    constructor() {
        super();

        this.state = { claimSummary: new Pending<Dtos.BatchClaimSummaryDto>(LoadingStatus.Preload) };
    }

    render() {
        return Loader.for(this.props.event,
            event => {
                return (
                    <div>
                        {this.renderClaimOverview(event.securityType)}
                        <CategoryPreview claimId={this.props.claimId} eventSecurityType={event.securityType}/>
                        {this.props.beneficialOwnersAvailable &&
                            <BeneficialOwnerPreview claimId={this.props.claimId} eventSecurityType={event.securityType} excelExportLimit={this.props.excelExportLimit}/>}
                        {this.renderButtons()}
                    </div>
                );
            });
    }

    componentDidMount() {
        connect(new Apis.BatchClaimApi().getSummaryById(this.props.claimId), this.state.claimSummary, x => {
            this.setState({ claimSummary: x });
        });
    }

    private renderClaimOverview(eventSecurityType: Dtos.SecurityType) {
        if (!this.state.claimSummary.data) return;

        let info = this.state.claimSummary.data;

        return (<div>
            <legend>Preview Claim</legend>
            <div className="row">
                <div className="card bg-light" style={{ width: '100%' }}>
                    <div className="card-body">
                        <div className="row col-md-12">
                            <label className="col-md-2 col-form-label">DTC Participant</label>
                            <label className="col-md-2" data-qa="DtcParticipantNameNumber">{info.dtcParticipantName} ({info.dtcParticipantNumber})</label>

                            <label className="col-md-2 col-form-label">Submission User</label>
                            <label className="col-md-2" data-qa="SubmissionUser">{info.changeByName}</label>

                            <label className="col-md-2 col-form-label">Claimed {eventSecurityType === Dtos.SecurityType.CommonStock ? "" : "ADR "}Position</label>
                            <label className="col-md-2" data-qa="TotalAdrPosition">{info.totalAdrPosition}</label>
                        </div>
                        <div className="row col-md-12">
                            <label className="col-md-2 col-form-label">{info.dtcDSName ? "DTC Downstream Subscriber" : ""}</label>
                            <label className="col-md-2" data-qa="DtcDownstreamSubscriber">{info.dtcDSName ? (info.dtcDSName + " (" + info.dtcDSNumber + ")") : ""}</label>

                            <label className="col-md-2 col-form-label"># of Beneficial Owners included</label>
                            <label className="col-md-2" data-qa="NumberOfBeneficialOwnersIncluded">{info.numberBoIncluded}</label>

                            {eventSecurityType !== Dtos.SecurityType.CommonStock && <label className="col-md-2 col-form-label">Claimed ORD Position</label>}
                            {eventSecurityType !== Dtos.SecurityType.CommonStock && <label className="col-md-2" data-qa="ClaimedOrdPosition">{parseFloat(info.totalOrdPosition.toFixed(4))}</label>}
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'back') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onBack()} data-qa="BackButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'back' ? 'Working...' : (this.props.beneficialOwnersAvailable ? 'Beneficial Owners' : 'Category Elections')}
                </button>

                <button id="saveExitBtn" className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'save') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onSaveAndExit()} data-qa="SaveButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'save' ? "Saving Claim..." : "Save and Exit"}
                </button >

                <button id="nextBtn" className={"btn btn-primary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'next') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onNext()}data-qa="NextButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'next' ? "Saving Claim..." : "Submit"}
                </button>
            </div>
        );
    }
}