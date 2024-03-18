import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { NewsSourceDtoValidator } from '../../../validators/newsSourceDtoValidator';
import { Validation } from '../../../components/stateless/validation'; 

interface EditorProps {
    source: Dtos.NewsSourceDto;
    validation: NewsSourceDtoValidator;
    onChange: { (m: Dtos.NewsSourceDto): void };
    onSave: { (): void };
    onCancel: { (): void };
}

export class SourceEditor extends React.Component<EditorProps, {}>
{
    private elem: HTMLDivElement;
    private widget: kendo.ui.Window;

    componentDidMount() {
        this.elem = document.createElement("div");
        let innerContentDiv = document.createElement("div");
        innerContentDiv.classList.add("innerReactDiv");
        this.elem.appendChild(innerContentDiv);

        document.body.appendChild(this.elem);

        this.widget = new kendo.ui.Window(this.elem, {
            title: "",
            draggable: false,
            modal: true,
            pinned: false,
            resizable: false,
            close: () => this.props.onCancel()
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
        var val = this.props.validation;

        let form = new Framework.FormBuilder(this.props.source)
            .isWide(true)
            .setChangeHandler(m => this.props.onChange(m))
            .withQA("Form")
            .addContent(<div className="row"><h3><span>News Source Editor</span></h3></div>, "NewsSourceEditor")
            .addTextInput("Name", m => m.name, (m, v) => m.name = v, "Name", val.name)
            .addDate("Date", m => m.date, (m, v) => m.date = v, "Date", val.date)
            .addTextInput("Source", m => m.source, (m, v) => m.source = v, "Source");

        return <div className="adr-popup-section container-fluid ps-0">
            {form.render()}
            <div className="text-end">
                <button className="btn btn-outline-secondary" onClick={() => this.props.onCancel()} data-qa="CancelButton">Cancel</button>
                <button className="btn btn-primary" onClick={() => this.props.onSave()} data-qa="UpdateButton">Update</button>
            </div>
        </div>
    }
}