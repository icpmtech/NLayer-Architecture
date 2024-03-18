import * as React from "react";
import { PopupBuilder } from "../../classes/popupBuilder";
import { AlertDialog } from "../../components/stateless/alertDialog";

/**
 * @class UpdateNewsAlert
 * Common alert when updating publishing certain TRM entities
 * @uses PopupBuilder
 */
export class UpdateNewsAlert {
    private alertPopup: PopupBuilder;
    private closeHandler?: () => void;

    constructor() {
        this.alertPopup = new PopupBuilder();
    }

    private handleClose = () => {
        this.alertPopup.close();
        this.closeHandler?.();
    }

    private initPopup(): this {
        this.alertPopup.setTitle("Changes log");
        this.alertPopup.setContent(
            <AlertDialog
                message={<p>Before publishing please ensure that there is a news item detailing the changes<br/>with a matching reclaim market and effective date.</p>}
                closeHandler={this.handleClose}
                qa={"new-update-alert"}
            />
        );
        return this;
    }
    
    setCloseHandler(closeHandler: () => void): this {
        this.closeHandler = closeHandler;
        return this;
    }

    open = () => {
        this.initPopup();
        this.alertPopup.render();
    }
}