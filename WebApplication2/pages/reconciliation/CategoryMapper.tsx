import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Framework from '../../classes';
import * as Form from '../../components';
import { Dtos } from '../../adr';

interface Props {
    matchingCategories: Dtos.MatchingSameRateCategoriesDto;
    onCancel: { (): void };
    onUpdate: { (categories: Dtos.AdroitCategoryDescriptionDto[]): void };
}

interface State {
    edited: Dtos.AdroitCategoryDescriptionDto[];
}

export class CategoryMapper extends React.Component<Props, State> {

    private elem: HTMLDivElement;
    private widget: kendo.ui.Window;

    constructor(props: Props, state: State) {
        super(props, state);
        let initial = this.props.matchingCategories.dtcRateCategories.map(x => (this.createResultElement(x)));

        this.state = {edited: this.props.matchingCategories.adroitMatchingRateCategories};
    }

    private createResultElement(dtc: Dtos.DtcCategoryDescriptionDto) {
        let matchingAdroit = this.props.matchingCategories.adroitMatchingRateCategories
            .find(y => y.dtcDescription === dtc.dtcDescription && y.whtRate === dtc.whtRate);

        return {
            id: matchingAdroit ? matchingAdroit.id : 0,
            whtRate: dtc.whtRate,
            dtcDescription: dtc.dtcDescription,
            description: matchingAdroit ? matchingAdroit.description : ''
        } as Dtos.AdroitCategoryDescriptionDto;
    }

    componentDidMount() {
        this.elem = document.createElement("div");
        let innerContentDiv = document.createElement("div");
        innerContentDiv.classList.add("innerReactDiv");
        this.elem.appendChild(innerContentDiv);

        document.body.appendChild(this.elem);

        this.widget = new kendo.ui.Window(this.elem,
            {
                title: "",
                draggable: false,
                modal: true,
                pinned: false,
                resizable: false,
                close: () => this.props.onCancel(),
                
            });

        this.renderInnerContent();
    }

    componentWillUnmount() {
        this.widget.destroy();
    }

    componentDidUpdate() {
        this.renderInnerContent();
    }

    render() {
        return <noscript />;
    }

    private renderInnerContent() {
        var elemToRender = this.elem.getElementsByClassName("innerReactDiv")[0];
        ReactDOM.render(this.innerContent(), elemToRender);
        this.widget.center();
    }

    private innerContent() {
        let form = Framework.FormBuilder.for(this.props.matchingCategories)
            .isWide(true)
            .addContent(
                <div className="row">
                    <h3><span>Multiple Categories With Same Rate</span></h3></div>, "MultipleCategoriesWithSameRate");

        this.state.edited.forEach((x, i) => form.addCustom("",
            this.renderDtccCategory(i,
                this.props.matchingCategories.dtcRateCategories.filter(y => y.whtRate === x.whtRate)),
            "AdrPopup",
            null,
            { noTitle: true }));

        return <div className="adr-popup-section container-fluid ps-0">
                   { form.render() }
                   <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onUpdate(this.state.edited)} data-qa="RunButton">Run</button>
                   </div>
               </div>
    }

    private renderDtccCategory(index: number, adroitCats: Dtos.DtcCategoryDescriptionDto[]) {
        const TypedDropdown = Form.Dropdown as Newable<Form.Dropdown<{ id: number, name: string }>>;
        let options = adroitCats.map((x, i) => { return { id: i, name: x.dtcDescription }; });
        let selected = options.find(x => x.name === this.state.edited[index].dtcDescription);

        var result = this.state.edited[index];

        return (
            <div className="row">
                <div style={{ float: 'left' }}>
                    <div className="form-row-text"><b>Rate:</b></div>
                </div>
                <div style={{ width: '10%', float: 'left' }}>
                    <div className="form-row-text" data-qa="WhtRate">{result.whtRate + "%"}</div>
                </div>
                <div style={{ float: 'left' }}>
                    <div className="form-row-text"><b>Adroit:</b></div>
                </div>
                <div style={{ width: '30%', float: 'left' }}>
                    <div className="form-row-text" data-qa="Description">{result.description}</div>
                </div>
                <div style={{ float: 'left' }}>
                    <div className="form-row-text"><b>DTC:</b></div>
                </div>
                <div style={{ width: '30%', float: 'left' }}>
                    <TypedDropdown options={options} value={selected} onChange={v => this.updateResults(v ? v.name : null, index)} isFormControl={true} disabled={false} qa="DtcDropdown"/>
                </div>
            </div>
        );
    }

    private updateResults(description: string, index: number) {
        let edited = this.state.edited;
        edited[index].dtcDescription = description;
        this.setState({ edited });
    }
}