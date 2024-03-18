import * as React from 'react';
import { Pending, DetailsBuilder } from '../../classes';
import { Apis, Dtos } from '../../adr';

interface PageProps {
    particpant: Dtos.ParticipantSummaryDto;
    downstreamSubscriber: Dtos.DownstreamSubscriberSummaryDto;
    qa:string
};

export class ParticipantBanner extends React.Component<PageProps, {}> {

    renderBanner() {
        const builder = DetailsBuilder.For(this.props.particpant, true)
            .withQA("participant-banner");

        const col1 = builder
            .addColumn("", x => null, 100, "ParticipantBannerColumnParticipant", 10, 90)
            .addString(this.props.particpant == null || this.props.downstreamSubscriber != null ? "Downstream Subscriber" : "Participant",
            x => this.props.downstreamSubscriber != null
                ? (this.props.downstreamSubscriber.name + " (" + this.props.downstreamSubscriber.dtcCode + ")")
                    : (this.props.particpant.name + " (" + this.props.particpant.dtcCode + ")"), "DownstreamSubscriberParticipant");

        if (this.props.particpant != null && this.props.downstreamSubscriber != null) {
            col1.addString("Client of Participant", x => (this.props.particpant.name + " (" + this.props.particpant.dtcCode + ")"), "ClientOfParticipant");
        }
        
        return builder.render();
    }

    render() {
        return this.renderBanner();
    }
}