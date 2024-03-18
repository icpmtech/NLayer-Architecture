import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from "../../classes";

interface SearchProps {
    validationErrors: Framework.Pending<Dtos.PagedResultDto<Dtos.BulkClaimValidationFailureDto>>;
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField>): void }
    currentFilter: Dtos.GetListBulkClaimValidationErrorsQuery;
}

export class ValidationFailuresGrid extends React.Component<SearchProps, {}> {
    
    render() {
        return (
            <div>
                <h3>Validation Failures</h3>
                {this.renderGrid()}
            </div>
        );
    }

    private renderGrid() {
        const gridPageSize = 10;
        const sort = Dtos.GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField;

        const p = Framework.PageableGridBuilder
            .ForPendingPage<Dtos.BulkClaimValidationFailureDto, Dtos.GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField>(
                gridPageSize,
                this.props.validationErrors,
                (options) => this.props.onPageChanged(options))
            .withQA("bulk-claims-list")
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .addString("Event Cusip", x => x.eventCusip, sort.EventCusip, "EventCusip", null, { width: 125 })
            .addNumber("Line Number", x => x.lineNumber, sort.LineNumber, "LineNumber", null, { width: 125 })
            .addString("Error Text", x => x.errorMessage, sort.ErrorMessage, "ErrorText")
            ;

        return p.render();
    }
}
