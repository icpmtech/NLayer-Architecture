import { marked } from 'marked';
import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import { connect, FormBuilder, Loader, LoadingStatus, Pending } from '../../../classes';
import * as Form from '../../../components';

interface Props {
    batchClaimId: number;
    eventDetails: Dtos.EventDto;
    onBack: () => void;
    onNext: () => void;
    onSaveAndExit: () => void;
    stateChangeInProgress?: boolean;
    saveMode?: 'back' | 'save' | 'next';
    onSaveInProgress: (mode: 'back' | 'save' | 'next') => void;
    onSaveCancelled: () => void;
}

interface State {
    disclaimerAccepted?: boolean;
    error?: string;
    depositoryDisclaimerText?: Pending<string>;
    goalDisclaimerText?: Pending<string>;

}

export class SubmitClaimPage extends React.Component<Props, State>
{
    constructor() {
        super();

        this.state = {
            disclaimerAccepted: false,
            depositoryDisclaimerText: new Pending<string>(LoadingStatus.Preload),
            goalDisclaimerText: new Pending<string>(LoadingStatus.Preload),
         };
    }

    render() {
        var combinedDisclaimers = Pending.combine(this.state.depositoryDisclaimerText, this.state.goalDisclaimerText, (depoText, goalText) => { return { depoText, goalText } });

        return Loader.for(combinedDisclaimers,
            disclaimers => {
                return <div data-qa="DisclaimerError">
                    {this.state.error && <Form.Error error={null} customError={[this.state.error]} qa="SubmitBatchClaimError"/>}
                    {this.props.eventDetails.sponsored ? <div dangerouslySetInnerHTML={{ __html: disclaimers.depoText }}></div> : null}
                    <div dangerouslySetInnerHTML={{ __html: disclaimers.goalText }}></div>
                    {this.renderAcceptButton()}
                    {this.renderButtons()}
                </div>
            },
            () => {
                return <div>
                    <span data-qa="DisclaimerError">{"Unable to load disclaimer. Please contact support."}</span>
                </div>
            }
        );
    }

    componentDidMount() {
        if (!this.props.eventDetails.sponsored) {
            // Depository disclaimer not required
            this.setState({ depositoryDisclaimerText: new Pending(LoadingStatus.Done, null) });
        } else {
            this.LoadDepositoryDisclaimer();
        }
        this.loadGoalDisclaimer();
    }

    private LoadDepositoryDisclaimer() {

        if (this.props.eventDetails.depositoryBnym) {
            var staticDataKey = Dtos.StaticContentKey.BatchClaimTerms_DepositoryBnym;
        } else if (this.props.eventDetails.depositoryCb) {
            var staticDataKey =  Dtos.StaticContentKey.BatchClaimTerms_DepositoryCb;
        } else if (this.props.eventDetails.depositoryDb) {
            var staticDataKey =  Dtos.StaticContentKey.BatchClaimTerms_DepositoryDb;
        } else if (this.props.eventDetails.depositoryJpm) {
            var staticDataKey =  Dtos.StaticContentKey.BatchClaimTerms_DepositoryJpm;
        }

        // Load location specific or, if unavailable, the default depository disclaimer
        connect(new Apis.StaticContentApi().getLocalContent(staticDataKey, this.props.eventDetails.countryofIssuance.id),
            this.state.goalDisclaimerText,
            x => {
                if (x.isDone()) {
                    let parsedText = marked.parse(x.data, { sanitize: true });
                    this.setState({ depositoryDisclaimerText: new Pending(LoadingStatus.Done, parsedText) });
                }
                else if (x.isFailed()) {
                    this.setState({depositoryDisclaimerText: new Pending(LoadingStatus.Failed, null)});
                }
            }
        );
    }

    private loadGoalDisclaimer() {

        connect(new Apis.StaticContentApi().getContent(Dtos.StaticContentKey.BatchClaimTerms),
            this.state.goalDisclaimerText,
            x => {
                if (x.isDone()) {
                    let parsedText = marked.parse(x.data, { sanitize: true });
                    this.setState({ goalDisclaimerText: new Pending(LoadingStatus.Done, parsedText) });
                }
                else if (x.isFailed()) {
                    this.setState({depositoryDisclaimerText: new Pending(LoadingStatus.Failed, null)});
                }
            }
        );
    }

    private saveChanges() {
        if (!this.state.disclaimerAccepted) {
            this.setState({ error: "You must accept the terms to submit your claim" });
            return;
        }

        this.props.onSaveInProgress('next');

        connect(new Apis.BatchClaimApi().submit(this.props.batchClaimId), null, x => {
            if (x.isDone()) {
                this.props.onNext()
            }
            else if (x.isFailed()) {
                this.setState({ error: x.error.userMessage });
                this.props.onSaveCancelled();
            }
        });
    }

    private renderAcceptButton() {
        return new FormBuilder()
            .isWide(false)
            .addCheckBox(" ", m => this.state.disclaimerAccepted, (m, v) => this.setState({ disclaimerAccepted: v }), "CheckBoxAccept", <span>I ACCEPT</span>, null, {noTitle: true})
            .render();
    }

    private renderButtons() {
        return (
            <div className="text-end">
                <button className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'back') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onBack()} data-qa="BackButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'back' ? 'Working...' : 'Preview'}
                </button>

                <button id="saveExitBtn" className={"btn btn-outline-secondary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'save') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.props.onSaveAndExit()} data-qa="SaveButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'save' ? "Saving Claim..." : "Save and Exit"}
                </button >

                <button id="nextBtn" className={"btn btn-primary" + ((this.props.stateChangeInProgress && this.props.saveMode == 'next') ? " btn-loading" : "")} disabled={this.props.stateChangeInProgress} onClick={() => this.saveChanges()}data-qa="NextButton">
                    {this.props.stateChangeInProgress && this.props.saveMode == 'next' ? "Submitting Claim..." : "Submit"}
                </button>
            </div>
        );
    }
}
