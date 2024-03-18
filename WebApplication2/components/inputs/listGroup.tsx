import * as React from 'react';
import { Loader, Pending } from '../../classes';
import * as Validation from '../../validators/common';

interface ListGroupProps<T> extends InputProps<T[]> {
    included: T[];
    options: T[];
    validation?: Validation.Result;
};

export class ListGroup<T extends { name: string, id: number }> extends React.Component<ListGroupProps<T>, {}> {
    private leftDiv: HTMLDivElement;
    private rightDiv: HTMLDivElement;
    private includedList: kendo.ui.ListView;
    private notIncludedList: kendo.ui.ListView;

    componentDidMount() {
        this.notIncludedList = new kendo.ui.ListView(this.leftDiv, this.initList(false));
        this.includedList = new kendo.ui.ListView(this.rightDiv, this.initList(true));
    }

    componentDidUpdate() {
        this.setListDS(this.includedList);
        this.setListDS(this.notIncludedList);
    }

    private initList(showIncluded: boolean): kendo.ui.ListViewOptions {
        let dataSource = new kendo.data.DataSource({ data: this.getAllEntries(), filter: this.getListFilter(showIncluded) });
        return { selectable: "multiple", navigatable:true, template: kendo.template(`<div data-entry-id=#:id# style="margin-left:2px">#:name#</div>`), dataSource: dataSource };
    }

    private setListDS = (list: kendo.ui.ListView) => {
        const ds = new kendo.data.DataSource({
            data: this.props.options.map(x => ({ name: x.name, id: x.id })),
            filter: list.dataSource.filter().filters
        })
        list.setDataSource(ds);
    }

    private getListFilter = (showIncluded: boolean) => {
        return showIncluded
            ? { field: "id", operator: (item, value) => this.props.included.filter(x => x.id === item).length !== 0 }
            : { field: "id", operator: (item, value) => this.props.included.filter(x => x.id === item).length === 0 };
    }

    private getAllEntries = () => {
        return this.props.options ? this.props.options.map(x => ({ name: x.name, id: x.id })) : [];
    }

    private addAllEntries = () => {
        this.updateIncluded(this.props.options);
    }

    private removeAllEntries = () => {
        console.log("removeAllEntries");
        this.updateIncluded([]);
    }

    private addSelectedEntries = () => {
        const selectedIds: number[] = [];
        this.notIncludedList.select().map((index, elem) => selectedIds.push($(elem).data('entry-id')));
        this.updateIncluded([...this.props.options.filter(x => selectedIds.indexOf(x.id) !== -1), ...this.props.included]);
    }

    private removeSelectedEntries = () => {
        const selectedIds: number[] = [];
        this.includedList.select().map((index, elem) => selectedIds.push($(elem).data('entry-id')));
        this.updateIncluded(this.props.included.filter(x => selectedIds.indexOf(x.id) === -1));
    }

    private updateIncluded(included: T[]) {
        this.props.onChange(included);
    }

    private renderList(placement: "left" | "right") {
        return (
            <div style={{width: 'min-content'}}>
                <div ref={elem => placement === 'right' ? this.rightDiv = elem : this.leftDiv = elem}></div>
            </div>
        );
    }

    private renderButtons = () => {
        const btnStyle = {
            width: '104px',
            marginBottom: '4px',
            marginLeft: '0px' // There is some bad global css in Adr.React\styles\details.css which adds a margin if there is two buttons next to each other in the html... Until that is fixed, this corrects this locally.
        };
        return (
            <div style={{width: 'min-content'}} data-qa={this.props.qa + "Buttons"}>
                <div className={"btn-group-vertical"} style={{margin: '0 auto', width: '100%'}}>
                    <button className="btn btn-outline-secondary btn-add-all" style={btnStyle} onClick={this.addAllEntries} data-qa="AddAllButton">Add All</button>
                    <button className="btn btn-outline-secondary btn-add" style={btnStyle} onClick={this.addSelectedEntries} data-qa="AddButton">Add</button>
                    <button className="btn btn-outline-secondary btn-remove" style={btnStyle} onClick={this.removeSelectedEntries} data-qa="RemoveButton">Remove</button>
                    <button className="btn btn-outline-secondary btn-remove-all" style={btnStyle} onClick={this.removeAllEntries} data-qa="RemoveAllButton"> Remove All</button>
                </div>
            </div>
        );
    }

    private renderIncludedHeader() {
        let classNames: string[] = [
            "col-form-label",
            "form-label",
            this.props.validation && this.props.validation.isRequired() ? "required" : ""
        ];
        return (
            <div className={"row"}>
                <div className="col-sm-4 offset-sm-7">
                    <h4 style={{ marginLeft: '12px', marginBottom: '-5px' }} data-qa={this.props.qa + "Header"}>
                        <label className={classNames.filter(x => !!x).join(" ")}>{this.props.name}</label>
                    </h4>
                </div>
            </div>
        );
    }

    private renderLists() {
        return (
            <div className="row" data-qa={this.props.qa + "List"}>
                {this.renderList('left')}
                {this.renderButtons()}
                {this.renderList('right')}
            </div>
        );
    }

    render(): JSX.Element {
        return (
            <div>
                {this.renderIncludedHeader()}
                {this.renderLists()}
            </div>
        );
    }
};
