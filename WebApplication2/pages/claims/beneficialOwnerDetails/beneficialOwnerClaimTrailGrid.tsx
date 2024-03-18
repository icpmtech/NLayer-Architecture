import * as React from 'react';
import { Dtos } from '../../../adr';
import { PopupBuilder, SimpleGridBuilder } from '../../../classes';
import { AddCommentPopup } from './beneficialOwnerAddComment';


interface BeneficialOwnerClaimTrailProps {
    claims?: Dtos.BeneficialOwnerClaimTrailDto[];
    boId: number;
    onCommentAdd: { (): void };
    canAddBeneficialOwnerComment: boolean;
};

export class BeneficialOwnerClaimTrailGrid extends React.Component<BeneficialOwnerClaimTrailProps, {}> {
    private popup: PopupBuilder;

    handleCommentConfirm = () => {
        this.destroyPopup();
        !!this.props.onCommentAdd && this.props.onCommentAdd();
    }

    destroyPopup() {
        this.popup.destroy();
        delete this.popup;
    }

    renderCommentPopup = () => {
        if (!this.popup) {
            this.popup = new PopupBuilder();
            this.popup.setTitle("Add Comment");
            this.popup.withQA("AddCommentPopUp");
        }

        this.popup.setContent(<AddCommentPopup
            boId={this.props.boId}
            onConfirm={this.handleCommentConfirm}
            onClose={() => this.destroyPopup()}
           
        />);
        this.popup.render();
    }

    render() {
        const builder = SimpleGridBuilder.For(this.props.claims)
            .isWordBreakable()
            .addString("Users", x => x.user, null, "Users")
            .addString("Action", x => x.action, null, "Action")
            .addString("Comments", x => x.comments, null, "Comments")
            .addDateTime("Date", m => m.timeOfStatusChange, null, "Date")
            .withQA("Comments");
        if (this.props.canAddBeneficialOwnerComment) {
            builder.addButton("Add Comment", this.renderCommentPopup, {dataQA: "AddCommentButton", pushRemainingRight: true});
        }
        return builder.render();
    }
};
