import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from "../../../classes";

interface SearchProps {
    news: Framework.Pending<Dtos.PagedResultDto<Dtos.NewsSummaryDto>>
    countries: Framework.Pending<Dtos.CountrySummaryDto[]>;
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetNewsList_SortField>): void }
    onNewsSelected: { (category: Dtos.NewsSummaryDto): void };
    onAddSelected: { (): void };
    onNewsReport: { (): void };
    currentFilter: Dtos.GetNewsList;
    statusOptions: Framework.Pending<Dtos.EnumDisplayDto[]>;
    showLiveRecords: boolean;
    isTrmReadOnlyUser: boolean;
}

export class Search extends React.Component<SearchProps, {}> {

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetNewsList_SortField;
        

        return Framework.Loader.for(this.props.statusOptions, loaded => {
            let statusToInclude = [Dtos.TrmEntityStatus.Draft, Dtos.TrmEntityStatus.AwaitingVerification];
            let filteredStatusOptions = this.props.statusOptions.map(x => x.filter(y => statusToInclude.indexOf(y.value) != -1).map(x => x.label)).data;

            const p = Framework.PageableGridBuilder
                .ForPendingPage<Dtos.NewsSummaryDto, Dtos.GetNewsList_SortField>(gridPageSize, this.props.news, (options) => this.props.onPageChanged(options))
                .withQA("trm-news")
                .isSortable()
                .isFilterable()
                .isResizable()
                .isScrollable()
                .setRowChangeHandler(dto => this.props.onNewsSelected(dto))
                .addString("Reclaim Market", x => x.reclaimMarket.countryName, sort.ReclaimMarket, "ReclaimMarket")
                .addString("Title", x => x.title, sort.Title, "Title")
                .addString("Category", x => x.category, sort.Category, "Category")
                .addDate("Effective Date", x => x.effectiveDate, sort.EffectiveDate, "EffectiveDate")
                ;

            if (!this.props.showLiveRecords) {
                p.addString("Status", x => x.statusName, sort.Status, "Status", null, { filterItems: filteredStatusOptions });
                p.addButton("Create News", () => this.props.onAddSelected(), { dataQA: "CreateNews", pushRemainingRight: true });
            } else if(!this.props.isTrmReadOnlyUser) {
                p.addButton("News Report", () => this.props.onNewsReport(), { dataQA: "NewsReport", pushRemainingRight: true});
            }

            return p.render();
        });
    }

    render() {
        return this.renderGrid();
    }

}
