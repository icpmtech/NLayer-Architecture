import * as React from "react";
import { PopupBuilder } from "../classes/popupBuilder";
import { AlertDialog } from "../components/stateless/alertDialog";

/**
 * @class AlertBuilder
 * wrap the popupBuilder for easy re-use of an alert dialog
 * @uses PopupBuilder
 */
export class AlertBuilder {
    private alertPopup: PopupBuilder;
    private message: React.ReactNode;
    private title: string;
    private closeHandler: { (): void };
    private qa: string;

    constructor() {
        this.alertPopup = new PopupBuilder();
        this.message = "";
        this.title = "";
    }

    private handleClose = () => {
        this.alertPopup.close();
    }

    private initPopup(): this {
        this.alertPopup.setTitle(this.title);
        this.alertPopup.setContent(
            <AlertDialog
                message={this.message}
                closeHandler={this.handleClose}
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

    withQA(qa: string): this {
        this.qa = qa;
        return this;
    }

    open = () => {
        this.initPopup();
        this.alertPopup.render();
    }

    close = () => {
        this.alertPopup.close();
    }
}