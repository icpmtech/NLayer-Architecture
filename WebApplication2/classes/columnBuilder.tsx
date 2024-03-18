import * as React from 'react';
import * as Stateless from "../components/stateless";

interface ColumnHeader<T> {
    title: string;
    value: { (data: T): string };
};

/**
 * @Class ColumnBuilder<T>
 * create a column for data T
 * a column consists of a title and a set of fields
 * used by the detailsBuilder to group multiple columns to show some data
 */
export class ColumnBuilder<T> {
    private fields: { (data: T): JSX.Element }[];
    private header: ColumnHeader<T>;
    private data: T;
    private width: number;
    private qa: string;
    private titleWidth?: number;
    private contentWidth?: number;
    private boldLabels?: boolean;

    constructor(headerTitle: string, headerValue: { (data: T): string }, data: T, width: number, qa: string, titleWidth?: number, contentWidth?: number, boldLabels?: boolean) {
        this.fields = [];
        this.header = { title: headerTitle, value: headerValue };
        this.data = data;
        this.width = width;
        this.titleWidth = titleWidth;
        this.contentWidth = contentWidth;
        this.boldLabels = boldLabels;
        this.qa = qa;
    }

    private addField(title: string, content: { (data: T): React.ReactNode }, qa:string): this {
        var key = this.fields.length;
        this.fields.push(data =>
            <Stateless.ColumnField
                key={key}
                title={title}
                titleWidth={this.titleWidth}
                contentWidth={this.contentWidth}
                content={content(this.data)}
                boldLabels={this.boldLabels}
                qa={qa}
            />
        );
        return this;
    }

    addCustom(title: string, getField: { (model: T): React.ReactNode }, qa:string): this {
        return this.addField(title, getField, qa);
    }

    addString(title: string, getValue: { (model: T): string }, qa: string): this {
        return this.addField(title, getValue, qa);
    }

    addYesNo(title: string, getValue: { (model: T): boolean }, qa: string): this {
        return this.addField(title, m => <Stateless.YesNo value={getValue(m)} qa={qa}/>, qa);
    }

    addNumber(title: string, getValue: { (model: T): number }, qa: string): this {
        return this.addField(title, m => getValue(m).toLocaleString('en-us'), qa);
    }

    addDate(title: string, getValue: { (model: T): Date }, qa:string, isDateOnly?: boolean): this {
        return this.addField(title, m => <Stateless.Date date={getValue(m)} isDateOnly={isDateOnly} qa={qa}/>, qa);
    }

    addDateTime(title: string, getValue: { (model: T): Date }, qa: string): this {
        return this.addField(title, (m) => <Stateless.DateTime date={getValue(m)} qa={qa}/>, qa);
    }

    render(index: number) {
        return (
            <div key={"column" + index} className='details-column' style={{ width: this.width + '%' }} data-qa={this.qa + "Column"}>
                <div className='details-header' style={{ height: !this.header.title.trim().length ? '30px' : null }} data-qa={this.qa + "Header"}>
                    <div className='details-left-header' style={{ width: this.titleWidth + '%' }} data-qa={this.qa + "Title"}>
                        {this.header.title}
                    </div>
                    <div className='details-right-header' style={{ width: this.contentWidth + '%' }} data-qa={this.qa}>
                        {this.header.value(this.data)}
                    </div>
                </div>
                {this.fields.map(renderFn => renderFn(this.data))}
            </div>
        );
    }
};
