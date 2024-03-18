import * as React from 'react';
import { Apis, Dtos } from '../../../adr';
import * as Framework from "../../../classes";

interface SearchProps {
    validationErrors: Framework.Pending<Dtos.PagedResultDto<Dtos.BatchClaimValidationFailureDto>>;
    onPageChanged: { (options: Framework.IGridBuilderChangeArgs<Dtos.GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField>): void }
    currentFilter: Dtos.GetListBatchClaimValidationErrorsQuery;
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
        const sort = Dtos.GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField;

        const p = Framework.PageableGridBuilder
            .ForPendingPage<Dtos.BatchClaimValidationFailureDto, Dtos.GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField>(gridPageSize, this.props.validationErrors, (options) => this.props.onPageChanged(options))
            .withQA("bulk-claims-list")
            .isSortable()
            .isFilterable()
            .isResizable()
            .isScrollable()
            .addNumber("Line Number", x => x.lineNumber, sort.LineNumber, "LineNumber",null, { width: 125 })
            .addString("Error Text", x => x.errorMessage, sort.ErrorMessage, "ErrorText")
            ;

        return p.render();
    }
}
