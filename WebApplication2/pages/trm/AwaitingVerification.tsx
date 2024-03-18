import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from "../../classes";
import { History } from '../../classes/History';

interface PageState {
    list?: Framework.Pending<Dtos.AwaitingVerificationDto[]>;
}

export class Search extends React.Component<{}, PageState> {
    private urlHistory: History;
    constructor() {
        super();

        this.urlHistory = new History(false);
        this.state = {
            list: new Framework.Pending<Dtos.AwaitingVerificationDto[]>()
        }
    }

    componentDidMount = () => {
        Framework.connect(new Apis.TrmApi().getList(null), this.state.list, list => this.setState({ list }));
    }

    private onRowSelected(dto: Dtos.AwaitingVerificationDto) {
        let encodedUrl = this.urlHistory.getCurrentEncodedUrl();
        let stringType = "";
        switch (dto.entityType) {
            case ("News"):
                stringType = 'news/draft/details?backurl=' + encodedUrl + '#{"newsId":';
                break;
            case ("Treaty"):
                stringType = 'treaties/draft/details?backurl=' + encodedUrl + '#{"treatyId":';
                break;
            case ("Tax Credit"):
                stringType = 'taxCredits/draft/details?backurl=' + encodedUrl + '#{"taxCreditId":';
                break;
            case ("Withholding Rate"):
                stringType = 'whtRate/draft/details?backurl=' + encodedUrl + '#{"whtRateId":';
                break;
            case ("Statute"):
                stringType = 'statutes/draft/details?backurl=' + encodedUrl + '#{"statuteId":';
                break;
        }
        window.location.href = "/" + stringType + dto.id + "}";
    }

    private renderGrid() {

        const sort = Dtos.ListEntitiesAwaitingVerificationQuery_ListAwaitingVerificationSortField;
        
        return Framework.Loader.for(this.state.list, data => {
                return Framework.SimpleGridBuilder.For(data)
                .withQA("trm-awaiting-verif")
                .isSortable()
                //.isFilterable()
                .isResizable()
                .isScrollable()
                    
                .setRowChangeHandler(dto => this.onRowSelected(dto))
                .addString("Type", x => x.entityType, sort.EntityType, "Type")
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                .addString("Country of Residence", x => x.countryOfResidence != null ? x.countryOfResidence.countryName : null, sort.CountryOfResidence, "CountryOfResidence")
                .addString("Changed by", x => x.changedByName, sort.ChangedBy, "ChangedBy")
                .withQA("Grid")
                .render()
        });
    }

    renderTitle() {
        return "Verifications";
    }

    render() {
        return (<div>
                    <div>
                        <h1>{this.renderTitle()}</h1>
                    </div>
                {this.renderGrid()}
            </div>
        )
    }
}
