import * as React from 'react';
import { Dtos } from '../../../adr';
import * as Framework from '../../../classes';
import { IconButton } from '../../../components'
import { NewsSourceDtoValidator } from '../../../validators/newsSourceDtoValidator';
import { SourceEditor } from './sourceEditor';

interface EditProps {
    sources: Dtos.NewsSourceDto[];
    onChange: (dtos: Dtos.NewsSourceDto[]) => void;
}

interface EditState {
    source?: Dtos.NewsSourceDto,
    newsSourceValidation?: NewsSourceDtoValidator,
    sourceIndex?: number
}

export class EditSources extends React.Component<EditProps, EditState>
{
    render() {
        return (
            <div>
                <div className="text-end"><button className="btn btn-primary" style={{ marginBottom: "5px" }} onClick={() => this.createSource()} data-qa="AddSourceButton">Add Source</button></div>
                {this.renderSources()}
                {this.renderPopup()}
            </div>
        );
    }

    renderSources() {
        if (!this.props.sources || this.props.sources.length == 0) {
            return (<div className="col-md-12 accordion" data-qa="ThisNewsItemHasNoSources">This News Item has no sources</div>);
        }

            return Framework.SimpleGridBuilder.For(this.props.sources)
                .addString("Name", x => x.name, null, "Name")
                .addDate("Date", x => x.date, null, "Date")
                .addString("Source", x => x.source, null, "Source")
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.editSource(m, i)} icon="nav" size={16} qa="EditIcon"/>, m => m.id, null, "object", "Edit", { sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .addCustomColumn("", (m, i) => <IconButton onClick={() => this.deleteSource(m, i)} icon="delete" size={16} qa="DeleteIcon"/>, m => m.id, null, "object", "Delete",{ sortable: false, filterable: false, headerTemplate: "", width: 32 })
                .withQA("Grid")
                .render();
    }

    private deleteConfirmation: Framework.DialogBuilder;
    private deleteSource(exception: Dtos.NewsSourceDto, index: number) {

        if (index != -1) {
            this.deleteConfirmation = new Framework.DialogBuilder();
            this.deleteConfirmation
                .setTitle("Delete source?")
                .setMessage(<p>{'Are you sure you want to delete this source?'}</p>)
                .setCancelHandler(() => this.deleteConfirmation.close())
                .setConfirmHandler(() => {
                    this.deleteConfirmation.close();
                    let dtos = Framework.safeClone(this.props.sources);
                    dtos.splice(index, 1);
                    this.props.onChange(dtos);
                })
                .withQA("DeleteSourceConfirmation")
                .open();
        }
    }

    private editSource(exception: Dtos.NewsSourceDto, index: number) {
        let clonedSource = Framework.safeClone(exception);
        let validator = new NewsSourceDtoValidator(clonedSource, this.props.sources, index, false);
        this.setState({ source: clonedSource, newsSourceValidation: validator, sourceIndex: index });
    }

    private createSource() {
        let newSource: Dtos.NewsSourceDto = { id: null, name: null, source: null, date: null };
        let validator = new NewsSourceDtoValidator(newSource, this.props.sources, -1, false);
        this.setState({ source: newSource, newsSourceValidation: validator, sourceIndex: -1 });
    }

    private completeSave(item: Dtos.NewsSourceDto, exceptions: Dtos.NewsSourceDto[], index: number) {
        let dtos = exceptions ? Framework.safeClone(exceptions) : [];

        if (index != -1) {
            dtos[index] = item;
        }
        else {
            dtos.push(item);
        }
        this.props.onChange(dtos);
        this.setState({ source: null, newsSourceValidation: null, sourceIndex: null });
    }

    private saveSource() {
        let validator = new NewsSourceDtoValidator(this.state.source, this.props.sources, this.state.sourceIndex, true);
        if (validator.isValid()) {
            this.completeSave(this.state.source, this.props.sources, this.state.sourceIndex);
        }
        else {
            this.setState({ newsSourceValidation: validator });
        }
    }

    private renderPopup() {
        if (!this.state || !this.state.source) return null;
        return (
            <SourceEditor
                source={this.state.source}
                validation={this.state.newsSourceValidation}
                onChange={m => this.updateSource(m)}
                onSave={() => this.saveSource()}
                onCancel={() => this.cancelSource()}
               
            />
        );
    }

    private updateSource(source: Dtos.NewsSourceDto) {
        var validator = new NewsSourceDtoValidator(source, this.props.sources, this.state.sourceIndex, this.state.newsSourceValidation.showValidationErrors());
        this.setState({ source: source, newsSourceValidation: validator });
    }

    private cancelSource() {
        this.setState({ source: null, newsSourceValidation: null, sourceIndex: null });
    }
}