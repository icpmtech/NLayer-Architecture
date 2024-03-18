import * as React from "react";
import { PopupBuilder } from "../classes/popupBuilder";
import { ConfirmationDialog } from "../components/stateless/confirmationDialog";

/**
 * @class DialogBuilder
 * wrap the popupBuilder for easy re-use of a comfirmation dialog
 * @uses PopupBuilder
 */
export class DialogBuilder {
    private confirmationPopup: PopupBuilder;
    private message: React.ReactNode;
    private title: string;
    private cancelText: string = "No";
    private confirmText: string = "Yes";
    private cancelHandler: {(): void};
    private confirmHandler: {(): void};
    private _width: number;
    private _height: number;
    private qa: string;

    constructor() {
        this.confirmationPopup = new PopupBuilder();
        this.message = "";
        this.title = "";
        this.qa = "";
    }

    private handleCancel = () => {
        !!this.cancelHandler && this.cancelHandler();
    }

    private handleConfirm = () => {
        this.confirmationPopup.close();
        !!this.confirmHandler && this.confirmHandler();
    }

    private initPopup(): this {
        this.confirmationPopup.setTitle(this.title);
        this.confirmationPopup.setHeight(this._height);
        this.confirmationPopup.setWidth(this._width);
        this.confirmationPopup.withQA(this.qa);

        this.confirmationPopup.setContent(
            <ConfirmationDialog
                message={this.message}
                cancelHandler={this.handleCancel}
                confirmHandler={this.handleConfirm}
                confirmText={this.confirmText}
                cancelText={this.cancelText}
                qa={this.qa}
            />
        );
        return this;
    }

    setTitle(value: string): this {
        this.title = value;
        return this;
    }

    setMessage(message: React.ReactNode): this {
        this.message = message;
        return this;
    }

    setConfirmText(value: string): this {
        this.confirmText = value;
        return this;
    }

    setCancelText(value: string): this {
        this.cancelText = value;
        return this;
    }

    setCancelHandler(delegate: { (): void }): this {
        this.cancelHandler = delegate;
        return this;
    }

    setConfirmHandler(delegate: { (): void }): this {
        this.confirmHandler = delegate;
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

    withQA(qa: string): this {
        this.qa = qa;
        return this;
    }

    open = () => {
        this.initPopup();
        this.confirmationPopup.render();
    }

    close = () => {
        this.confirmationPopup.close();
    } 
}