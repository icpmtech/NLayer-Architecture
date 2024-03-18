import * as React from 'react';
import { Pending, DetailsBuilder } from '../../classes';
import { Apis, Dtos } from '../../adr';

interface PageProps {
    particpant: Pending<Dtos.ParticipantDto>;
};

export class ParticipantBanner extends React.Component<PageProps, {}> {

    private createColumn1(builder: DetailsBuilder<Dtos.ParticipantDto>) {
        const col1 = builder
            .addColumn("", x => null, 45, "ParticipantBannerColumnDTCCode", 30, 70)
            .addString(this.props.particpant.data == null || this.props.particpant.data.parent != null ? "D.S. Code:" : "DTC Code:", x => x.dtcCode, "DSDtcCode");

        if (this.props.particpant.data != null && this.props.particpant.data.parent != null) {
            col1.addString("Client of DTC Code:", x => x.parent.dtcCode, "ClientOfDtcCode")
        }
    }

    private createColumn2(builder: DetailsBuilder<Dtos.ParticipantDto>) {
        const col1 = builder
            .addColumn("", x => null, 45, "ParticipantBannerColumnParticipantName", 30, 70)
            .addString(this.props.particpant.data == null || this.props.particpant.data.parent != null ? "D.S.Name:" : "Participant Name:", x => x.name, "DSParticipantName")

        if (this.props.particpant.data != null && this.props.particpant.data.parent != null) {
            col1.addString("Participant Name:", x => x.parent.name, "ParticipantName")
        }
    }

    renderBanner() {
        const builder = DetailsBuilder.ForPending(this.props.particpant, true)
            .withQA("participant-banner");

        this.createColumn1(builder);
        this.createColumn2(builder);

        return builder.render();
    }

    render() {
        return this.renderBanner();
    }
}