import * as React from 'react';
import { Dtos } from '../../adr';
import { PopupBuilder } from '../../classes';
import { ExportBnymOfacPopup } from './exportBnymOfacPopup';

interface Props {
    roundDetails: Dtos.RoundDto,
    finalPayDateSet: boolean,
}

export class BnymOfacReport extends React.Component<Props, {}> {

    render() {
        return (
            <div>
                <h4>BNYM Final OFAC Report</h4>
                {!this.props.roundDetails.ofacExportedAt &&
                    <p>An OFAC Final Report has not been downloaded for this Event Round</p>}
                {this.props.roundDetails.ofacExportedAt &&
                    <p>Last downloaded at {moment(
                        new Date(this.props.roundDetails.ofacExportedAt)).format("DD MMM YYYY HH:mm")} by {
                            this.props.roundDetails.ofacExportedBy}</p>}
                <button className="btn btn-primary" disabled={!this.props.finalPayDateSet} onClick={() =>
                    this.exportBnymOfacReport(this.props.roundDetails.id)} data-qa="DownloadFinalOfacReportButton">Download Final OFAC Report</button>
                {!this.props.finalPayDateSet && <p>The Final ADR Pay Date has not been set on the parent Event</p>}
            </div>
        )
    }

    private exportBnymOfacPopup: PopupBuilder;
    private exportBnymOfacReport(roundId: number) {
        this.exportBnymOfacPopup = new PopupBuilder()
            .setTitle("Export Final OFAC Report")
            .withQA("ExportFinalOfacReportPopup")
            .setContent(<ExportBnymOfacPopup roundId={roundId}onClose={() => {
                this.exportBnymOfacPopup.close();
                this.exportBnymOfacPopup = null;
            }} />)
        this.exportBnymOfacPopup.render();
    }
}