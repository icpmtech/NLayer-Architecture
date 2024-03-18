import * as React from 'react';
import { Pending } from "./pending";
import { ColumnBuilder } from "./columnBuilder";
import { LoadingComponent } from "../components/loadingComponent";

/**
 * @class DetailsBuilder
 * allow the setup of data T in a columned layout for display
 */
export class DetailsBuilder<T> {
    public columns: ColumnBuilder<T>[];
    private data: Pending<T>;
    private headings: { (data: T): React.ReactNode }[] = [];
    private isPanel: boolean;
    private _qa: string;

    constructor(data: Pending<T>, isPanel?: boolean) {
        this.columns = [];
        this.data = data;
        this.isPanel = isPanel;
    }

    addColumn(
        headerTitle: string,
        headerValue: { (data: T): string },
        width: number,
        qa: string,
        titleWidth?: number,
        contentWidth?: number
    ) {
        let column = new ColumnBuilder<T>(
            headerTitle,
            headerValue,
            this.data.data,
            width,
            qa,
            titleWidth,
            contentWidth,
            this.isPanel
        );
        this.columns.push(column);
        return column;
    }

    addHeading(delegate: { (model: T): React.ReactNode }): this {
        this.headings.push(delegate);
        return this;
    }

    withQA(qa: string) {
        this._qa = qa;
        return this;
    }

    render() {
        const LoadingPanelOfT = LoadingComponent as Newable<LoadingComponent<T>>;
        return <LoadingPanelOfT pending={this.data} render={(item) => this.renderDetails(item)}/>
    }

    private renderHeadings(item: T) {
        return (
            !this.isPanel ? this.headings.map((heading, index) => <div key={"headings" + index} className="details-heading" data-qa={this._qa + "Heading"}> {heading(item)} </div>) : null
        );
    }

    private renderPanelHeadings(item: T) {
        return this.headings.length && this.isPanel
            ? <div className="details-header-caption" style={{ fontSize: '1.2em', border:'0', marginBottom: '-23px', textAlign: 'center'}}> {this.headings[0](item)} </div>
            : null
    }

    private renderDetails(item: T) {
        return (
            <div data-qa={this._qa}>
                {this.renderHeadings(item)}
                <div className={"details-container " + (!!this.isPanel ? "card bg-light" : "")}>
                    {this.renderPanelHeadings(item)}
                    {this.columns.map((col, index) => col.render(index))}
                </div>
            </div>
        );
    }

    public static For<T>(data: T, isPanel?: boolean): DetailsBuilder<T> {
        return new DetailsBuilder<T>(Pending.done(data), isPanel);
    }

    public static ForPending<T>(data: Pending<T>, isPanel?: boolean): DetailsBuilder<T> {
        return new DetailsBuilder<T>(data || new Pending<T>(), isPanel);
    }
};
