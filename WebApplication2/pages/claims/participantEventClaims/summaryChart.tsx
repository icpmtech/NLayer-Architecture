import * as React from 'react';
import { Dtos } from '../../../adr/index';

interface ChartProps {
    positionSummary: Dtos.ParticipantClaimedAdrPositionSummaryForEventDto;
}
interface ChartState {
}

export class SummaryChart extends React.Component<ChartProps, ChartState> {

    private chartDiv: HTMLDivElement;
    private widget: kendo.dataviz.ui.Chart;
    private labelLeftClass = "col-md-6 col-form-label form-label";
    private labelRightClass = "col-md-4 col-form-label form-label";
    private numberDisplayFormat = "#,###";

    constructor(props: ChartProps) {
        super(props);
    }

    shouldComponentUpdate(nextProps : ChartProps, nextState) {
        return nextProps.positionSummary !== this.props.positionSummary;
    }

    componentDidMount() {
        if (this.props.positionSummary.sprHasBeenDefined && this.widget == null) {
            this.widget = new kendo.dataviz.ui.Chart(this.chartDiv, this.setChartOptions());
        }
    }

    componentDidUpdate() {
        if (this.widget != null) {
            this.widget.setOptions(this.setChartOptions());
        }
    }

    private setChartOptions(): kendo.dataviz.ui.ChartOptions {
        return {
            title: { text: "Claim Status" },
            transitions: false,
            legend: { position: "bottom", margin: { top: -10 } },
            seriesDefaults: { type: "donut" },
            series: this.setChartData(),
            chartArea: { height: 300 },
            plotArea: { margin: { top: -37 } },
            tooltip: { visible: true, template: "#= category #: #= (value>100)?'Over allocated': '' + value + '%'#" }
        }
    }

    private setChartData(): kendo.dataviz.ui.ChartSeriesItem[] {

        let claimedPos = 0;
        let claimedDSPos = 0;
        let openDSPos = 0;
        let openPos = 100;

        if (this.props.positionSummary.maxPositions > 0) {
            claimedPos = Math.round((this.props.positionSummary.allocatedClaimed / this.props.positionSummary.maxPositions) * 10000) / 100;
            claimedDSPos = Math.round((this.props.positionSummary.claimedDSPosition / this.props.positionSummary.maxPositions) * 10000) / 100;
            openDSPos = Math.round((this.props.positionSummary.openDSPosition / this.props.positionSummary.maxPositions) * 10000) / 100;
            openPos = Math.round((this.props.positionSummary.totalOpenPosition / this.props.positionSummary.maxPositions) * 10000) / 100;
        }
        if (this.props.positionSummary.allocatedClaimed > this.props.positionSummary.maxPositions && this.props.positionSummary.sprHasBeenDefined === true) {
            claimedPos = 101;
            openPos = 0;
        }
        if (this.props.positionSummary.openDSPosition < 0) {
            claimedDSPos = claimedDSPos + openDSPos;
            openDSPos = 0;
        }
        if (this.props.positionSummary.sprHasBeenDefined === true && this.props.positionSummary.totalOpenPosition === 0 && !this.props.positionSummary.claimedDSPosition && !this.props.positionSummary.openDSPosition) {
            claimedPos = 100;
            openPos = 0;
        }

        var chartSeries: kendo.dataviz.ui.ChartSeriesItem[] = [{
            name: "Claim Status",
            overlay: { gradient: "none" },
            labels: {
                visible: true,
                position: "center",
                template: "#= (value>100)?'Over allocated': '' + value + '%'#",
                font: "1em \"Arial Black\",\"Arial Bold\",Helvetica,sans-serif",
                background: "transparent",
                color: (data: kendo.dataviz.ui.ChartSeriesClickEvent) => data.category === "Claimed Position" || data.category === "Claimed DS Position" ? "white" : "black"
            },
            data: []
        }];

        chartSeries[0].data.push({ category: "Claimed Position", value: claimedPos, color: "#ea2b02" });

        if (this.props.positionSummary.claimedDSPosition || this.props.positionSummary.openDSPosition) {
            chartSeries[0].data.push({ category: "Claimed DS Position", value: claimedDSPos, color: "#aa2b02" });
            chartSeries[0].data.push({ category: "Open DS Position", value: openDSPos, color: "rgb(190,190,190)" });
        }
        chartSeries[0].data.push({ category: "Open Position", value: openPos, color: "rgb(223, 223, 223)" });

        return chartSeries;
    }

    private getDisplayLabel(value, sprHasBeenDefined) {
        if (value === 0 && !sprHasBeenDefined) {
            return "to be def.";
        }
        return kendo.toString(value, this.numberDisplayFormat);
    }

    private renderSummary() {
        var headerCssClass = "row form-horizontal " + (this.props.positionSummary.sprHasBeenDefined ? "" : "extraHeaderSpace");
        var openPositionApplyCss = this.props.positionSummary.totalOpenPosition < 0 && (this.props.positionSummary.maxPositions > 0 || this.props.positionSummary.sprHasBeenDefined);

        return (
            (<div>
                <div className={headerCssClass}>
                    <div className={this.labelLeftClass}>Total RD Position:</div>
                    <div className={this.labelRightClass} data-qa="TotalRdPosition">{this.getDisplayLabel(this.props.positionSummary.maxPositions, this.props.positionSummary.sprHasBeenDefined)}</div>
                </div>
                <div className="row form-horizontal">
                    <label className={this.labelLeftClass}>Claimed Position:</label>
                    <label className={this.labelRightClass} data-qa="ClaimedPosition">{kendo.toString(this.props.positionSummary.allocatedClaimed, this.numberDisplayFormat)}</label>
                </div>
                {
                    this.renderUnallocatedRow()
                }
                <div className="row form-horizontal">
                    <label className={this.labelLeftClass}>Open Position:</label>
                    <label className={this.labelRightClass + (openPositionApplyCss ? " negativeNumber" : "")} data-qa="OpenPosition">
                        {this.props.positionSummary.maxPositions === 0 && !this.props.positionSummary.sprHasBeenDefined
                            ? this.getDisplayLabel(0, this.props.positionSummary.sprHasBeenDefined)
                            : kendo.toString(this.props.positionSummary.totalOpenPosition, this.numberDisplayFormat)}
                    </label>
                </div>
                {this.renderDSLabels()}
            </div>)
        );
    }

    private renderUnallocatedRow() {
        if (!this.props.positionSummary.unallocatedClaimed) return null;
        return <div className="row form-horizontal">
            <label className={this.labelLeftClass}>Unallocated Position:</label>
            <label className={this.labelRightClass} data-qa="UnallocatedPosition">{kendo.toString(this.props.positionSummary.unallocatedClaimed, this.numberDisplayFormat)}</label>
        </div>

    }

    private renderDSLabels() {
        var openPositionApplyCssDS = this.props.positionSummary.openDSPosition < 0;

        return ((this.props.positionSummary.openDSPosition > 0 || this.props.positionSummary.claimedDSPosition > 0) &&
            <div>
                <div className="row form-horizontal">
                    <label className={this.labelLeftClass}>DS Claimed Position</label>
                <label className={this.labelRightClass} data-qa="DsClaimedPosition">
                        {kendo.toString(this.props.positionSummary.claimedDSPosition, this.numberDisplayFormat)}
                    </label>
                </div>
                <div className="row form-horizontal">
                    <label className={this.labelLeftClass}>DS Open Position</label>
                <label className={this.labelRightClass + (openPositionApplyCssDS ? " negativeNumber" : "")} data-qa="DsOpenPosition">
                        {kendo.toString(this.props.positionSummary.openDSPosition, this.numberDisplayFormat)}
                    </label>
                </div>
            </div>
        );
    }

    private renderChart() {
        return (<div ref={elem => this.chartDiv = elem}></div>);
    }

    render() {
        return (
            <div data-qa="ParticipantClaimsChart">
                {this.renderChart()}
                {this.renderSummary()}
            </div>
        );
    }
}