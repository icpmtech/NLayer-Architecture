import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Form from '../components';

/**
 * @class PopupBuilder
 * provide an interface for creating a popup
 */
export class PopupBuilder {
    private widget: kendo.ui.Window;
    private content: React.ReactElement<PopupContentProps>;
    private elem: HTMLDivElement;
    private title: string;
    private onClose: () => void = () => null;  // Defaults to '()=>null'
    private _width: number;
    private _height: number;
    private _qa: string;

    setContent(content: React.ReactElement<PopupContentProps>): this {
        this.content = <div className="popup-scrollable">{content}</div>;
        return this;
    }

    setOnCloseAction(onClose: () => void): this {
        this.onClose = onClose;
        return this;
    }

    setTitle(value: string): this {
        this.title = value;
        return this;
    }

    withQA(qa: string): this {
        this._qa = qa;
        return this;
    }

    setWidth(width?: number): this {
        this._width = width;
        return this;
    }

    setHeight(height?: number): this {
        this._height = height;
        return this;
    }

    open = () => {
        this.render();
    }

    close = () => {
        this.widget.close();
    }

    destroy = () => {
        this.widget.destroy();
    }

    centreWindow = () => {
        setTimeout(() => { this.widget.center().open() })
    }

    private createWindow(): void {
        if (!this.widget) {
            this.elem = document.createElement("div");
            this.widget = new kendo.ui.Window(this.elem, {
                title: this.title,
                draggable: true,
                modal: true,
                pinned: true,
                resizable: false,
                width: this._width,
                height: this._height,
                close: () => this.onClose()
            });
        }
        ReactDOM.render(this.content, this.elem);
    }

    render() {
        this.createWindow();
        this.centreWindow();
    }
}
