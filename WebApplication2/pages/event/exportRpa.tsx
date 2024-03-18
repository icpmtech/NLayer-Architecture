import * as React from 'react';
import { PopupBuilder } from "../../classes";
import { ExportRpaPopup } from './exportRpaPopup';

interface PageProps {
    roundId: number;
};

export class ExportRpa extends React.Component<PageProps, {}> {

    private popup: PopupBuilder;

    renderPopup = () => {
        this.popup = new PopupBuilder();
        this.popup
            .setTitle("Export round RPA")
            .setContent(<ExportRpaPopup roundId={this.props.roundId} onClose={() => this.popup.close()}/>)
            .withQA("Popup")
            .render();
    }

    render() {
        return <button className="btn btn-outline-secondary" disabled={!this.props.roundId} onClick={this.renderPopup} data-qa="ExportRoundRpaButton">Export round RPA</button>;
    }
};