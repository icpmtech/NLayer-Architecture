import * as React from 'react';
import * as Framework from '../../classes';
import { Apis, Dtos } from '../../adr';
import * as Form from './../../components';
import {DisclaimerTabs} from './disclaimerTabs' 

interface Props {
    bulkClaimId: number;
    onCancel: () => void;
    onSubmit: () => void;
}

interface State {
    allDisclaimersAccepted?: boolean;
    bulkClaimDisclaimers: Framework.Pending<Dtos.BulkClaimDisclaimerDto[]>;
    disclaimersStatus: { key: string, accepted: boolean }[];
}

export class DisclaimerPopup extends React.Component<Props, State> {
    private elem: HTMLDivElement;
    constructor(props: Props) {
        super(props)
        this.state = {
            allDisclaimersAccepted: false,
            bulkClaimDisclaimers: new Framework.Pending<Dtos.BulkClaimDisclaimerDto[]>(),
            disclaimersStatus: []
        };
    }

    componentDidMount() {
        this.ensureTermsAndConditions();
    }

    onAcceptedChange = (key: string, accepted: boolean) => {
        var items = Framework.safeClone(this.state.disclaimersStatus);
        items.find(i => i.key == key).accepted = accepted;

        var allAccepted = true;
        items.forEach((item, index) => {
            if (!item.accepted) {
                allAccepted = false 
            }
        });

        this.setState({ allDisclaimersAccepted: allAccepted, disclaimersStatus: items });
    }
  
    render() {
        return (
            <div>
                {this.getBulkClaimDisclaimers() }
            </div>
            
        );
    }

    private getBulkClaimDisclaimers(): React.ReactNode {
        return Framework.Loader.for(this.state.bulkClaimDisclaimers,
            disclaimers => {
                return (<div>
                        <div className="flash-message alert alert-info" data-qa="BulkClaimDisclaimer">
                                <strong>Warning</strong>
                                <p>Please note that your Bulk Claim will be automatically processed by Adroit upon submission and cannot be reversed.</p>
                            </div>
                        <DisclaimerTabs bulkClaimDisclaimers={disclaimers} disclaimersStatus={this.state.disclaimersStatus} onAcceptedChange={this.onAcceptedChange}></DisclaimerTabs>
                            {this.renderButtons() }
                        </div>)
            });
    }

    renderButtons() {
        return (
            <div style={{ paddingTop: 10 }} data-qa="Buttons">
                <div className="float-end">
                    <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                    <button className="btn btn-primary" disabled={!this.state.allDisclaimersAccepted} onClick={() => this.props.onSubmit()} data-qa="SubmitButton">Submit</button>
                </div>
                <div style={{ marginRight: 10 }} className={"float-end flash-message alert alert-danger" + (this.state.allDisclaimersAccepted ? " invisible" : "")} data-qa="AcceptAllDisclaimers">
                    <strong>You must accept all disclaimers before you can submit your claim.</strong>
                </div>
            </div>
        );
    }

    private ensureTermsAndConditions() {
        Framework.connect(new Apis.BulkClaimApi().getBulkClaimDisclaimers(this.props.bulkClaimId),
            this.state.bulkClaimDisclaimers,
            x => {
                if (x.isDone()) {
                    var statuses = [];
                    x.data.forEach((d, i) => statuses.push({ key: d.key, accepted:false })); 
                    this.setState({ disclaimersStatus: statuses, bulkClaimDisclaimers: new Framework.Pending(Framework.LoadingStatus.Done, x.data) })
                }
            });
    }
}