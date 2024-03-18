import * as React from 'react';

export interface TabComponentProps {
    tabs: string[];
    qa: string;
    selectedTab?: number;
    onSelectedTabChange: { (i: number): void };
};

export class TabComponent extends React.Component<TabComponentProps, {}> {
    private elem: HTMLDivElement;

    componentDidMount() {
        $(this.elem).kendoTabStrip({
            animation: false,
            select: this.onSelectTab
        })
        .data("kendoTabStrip")
        .select(this.props.selectedTab);
    }

    onSelectTab = (e) => {
        this.props.onSelectedTabChange($(e.item).index());
    }

    renderTabs() {
        return this.props.tabs.map((tab, i) => <li key={i}>{tab}</li>);
    }

    render() {
        return (
            <div ref={e => this.elem = e} data-qa={this.props.qa + "TabComponent"}>
                <ul>{this.renderTabs()}</ul>
                {this.props.children}
            </div>
        );
    }
};