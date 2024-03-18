import * as React from 'react';
import { Dtos } from '../../adr';
import { marked } from 'marked';
import * as Framework from '../../classes';

export interface DisclaimerTabsProps {
    bulkClaimDisclaimers: Dtos.BulkClaimDisclaimerDto[];
    disclaimersStatus: { key: string, accepted: boolean }[];
    onAcceptedChange: { (disclaimerKey: string, accepted: boolean): void };
};

export class DisclaimerTabs extends React.Component<DisclaimerTabsProps, {}> {
    private elem: HTMLDivElement;

    constructor(props: DisclaimerTabsProps) {
        super(props)
    }

    componentDidMount() {
        $(this.elem).kendoTabStrip({
            animation: false,
            tabPosition:"left"
        })
        .data("kendoTabStrip")
        .select(0);
    }

    private renderAcceptButton = (key: string) => {
        var status = this.props.disclaimersStatus.find(item => item.key == key);
        return new Framework.FormBuilder()
            .isWide(false)
            .addCheckBox(" ", m => status.accepted, (m, accepted) => { this.props.onAcceptedChange(status.key, accepted); }, "CheckBoxAccept", <strong> I ACCEPT</strong>, null, { noTitle: true })
            .render();
    }

    private renderTab = (disclaimer: Dtos.BulkClaimDisclaimerDto, index: number) => {
        var status = this.props.disclaimersStatus.find(item => item.key == disclaimer.key);
        return (
            <li key={index} data-qa="DisclaimerTitle">{disclaimer.title}<span className={"accepted" + (status.accepted ? " k-icon k-i-check" : "")} data-qa="Accepted"></span></li>
        );
    }

    private renderTabContent = (disclaimer: Dtos.BulkClaimDisclaimerDto, index: number) => {
        return (
            <div key={index}>
                <span dangerouslySetInnerHTML={{ __html: marked.parse(disclaimer.disclaimerContent, { sanitize: true }) }} data-qa="Disclaimer"></span>
                <span>{this.renderAcceptButton(disclaimer.key) }</span>
            </div>
        );
    }

    render() {
        return (
            <div id="disclaimersTabstrip" ref={e => this.elem = e} data-qa="TabStrip">
                <ul>{this.props.bulkClaimDisclaimers.map(this.renderTab) }</ul>
                {
                    this.props.bulkClaimDisclaimers.map(this.renderTabContent)
                }
            </div>
        );
    }
};