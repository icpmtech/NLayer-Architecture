import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { connect, Loader, Pending } from '../../../classes';
import { CategoryElectionInput } from "../../../components/CategoryElectionInput";

interface WorkflowProps {
    batchClaimId: number;
    editMode: boolean;
    nextStepId: number;
    returnUrl: string;
    beneficialOwnersAvailable: boolean;
    onBack: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
    stateChangeInProgress?: boolean;
    saveMode?: 'back' | 'save' | 'next';
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    onSaveCancelled: () => void;
};

interface WorkflowState {
    categories: Pending<Dtos.CategoryPositionDto[]>;
};

export class BatchClaimCategoryElections extends React.Component<WorkflowProps, WorkflowState> {
    private batchClaimWorkflowApi;

    constructor(props: WorkflowProps, state: WorkflowState) {
        super(props, state);
        this.valueChanged = this.valueChanged.bind(this);
        this.batchClaimWorkflowApi = new Apis.BatchClaimWorkflowRoundInfoApi();

        this.state = {
            categories: null
        }
    }

    componentDidMount(): void {
        connect(new Apis.CategoryElectionsApi().getCategoryPositions(this.props.batchClaimId, false),
            this.state.categories,
            categories => {
                this.setState({ categories: categories });
            });
    }

    private saveChanges(moveToNextStep: boolean) {
        this.props.onSaveInProgress(moveToNextStep ? 'next' : 'save');

        var l = new Apis.CategoryElectionsApi().updateCategoryPositions(this.props.batchClaimId, this.state.categories.data);
        l.done(() => {
            if (moveToNextStep) {
                this.props.onNext();
            } else {
                this.props.onSaveAndExit();
            }
        });
        l.fail((d) => { this.displayErrorMessage(d.message); });
    }

    private navigateBackToReturnUrl() {
        window.location.href = this.props.returnUrl;
    }

    private displayErrorMessage(text: string) {

    }

    private valueChanged(newValue: number, index: number) {
        this.state.categories.data[index].adrPosition = newValue;
    }

    private renderCategoryInfo(category: Dtos.CategoryPositionDto, index: number) {
        return (
            <CategoryElectionInput category={category} index={index} onValueChanged={this.valueChanged} editMode={this.props.editMode}/>
        );
    }

    private renderHeader() {
        return (
            <div className="categoryElectionHeader" data-qa="CategoryElectionHeader">
                <span className="catLabel"></span>
                <span className="adrCount"># of ADRs</span>
            </div>);
    };

    private buildGrid(cats: Dtos.CategoryPositionDto[]) {
        var c1 = cats.slice();
        var c2 = c1.length > 5 ? c1.splice(c1.length / 2 + (c1.length % 2 === 1 ? 1 : 0)) : new Array<Dtos.CategoryPositionDto>();

        return (<div className="categoryElectionList" data-qa="CategoryElectionList">
            <div className="categoryElection categoryElections_left" data-qa="CategoryElectionsLeft">
                {this.renderHeader()}
                {c1.map((x, i) => this.renderCategoryInfo(x, i))}
            </div>
            <div className="categoryElection categoryElections_right" data-qa="CategoryElectionsRight">
                {(c2.length > 0) ? this.renderHeader() : ""}
                {c2.map((x, i) => this.renderCategoryInfo(x, i + c1.length))}
            </div>
        </div>);
    }

    private buildCategoriesGrid() {
        return (Loader.for(this.state.categories, a => { return this.buildGrid(this.state.categories.data) }));
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'back') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onBack()} data-qa="BackButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'back' ? 'Working...' : 'Filing Method'}
                </button>

                <button id="saveExitBtn" className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'save') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.saveChanges(false)} data-qa="SaveButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'save' ? "Saving Claim..." : "Save and Exit"}
                </button >

                <button id="nextBtn" className={"btn btn-primary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'next') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.saveChanges(true)} data-qa="NextButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'next' ? "Saving Claim..." : (this.props.beneficialOwnersAvailable ? 'Beneficial Owners' : 'Preview')}
                </button>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.buildCategoriesGrid()}
                {this.renderButtons()}
            </div>
        );
    }
}
