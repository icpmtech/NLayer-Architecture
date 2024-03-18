import * as React from 'react';
import * as Components from '../../components';
import * as Framework from '../../classes';
import { Dtos } from '../../adr';

interface Props {
    users: Framework.Pending<Dtos.PagedResultDto<Dtos.UserSummaryDto>>;
    onChange: (options: Framework.IGridBuilderChangeArgs<Dtos.UsersQuery_SortField>) => void;
    onSelect: (dto: Dtos.UserSummaryDto) => void;
    onExport: () => string;
    canExportGridToExcel: boolean;
    isGoalUser: boolean;
}

interface State {
}

export class Grid extends React.Component<Props, State>
{
    private renderGrid() {
        var grid = Framework.PageableGridBuilder.ForPendingPage<Dtos.UserSummaryDto, Dtos.UsersQuery_SortField>(10, this.props.users, (options) => this.props.onChange(options))
            .withQA("UsersGrid")
            .isFilterable()
            .isSortable()
            .isResizable()
            .isScrollable()
            .isNavigatable()
            .setRowChangeHandler((dto) => this.props.onSelect(dto))
            .addString("Email", x => x.email, Dtos.UsersQuery_SortField.Email, "Email")
            .addString("First name", x => x.firstName, Dtos.UsersQuery_SortField.FirstName, "FirstName")
            .addString("Last name", x => x.lastName, Dtos.UsersQuery_SortField.LastName, "LastName")
            ;

        if (this.props.isGoalUser) {
            grid.addYesNo("Goal access", x => x.hasGoalAccess, Dtos.UsersQuery_SortField.HasGoalAccess, "GoalAccess");
        }

        grid.addDateTime("Last Login", x => x.lastLoginDate, Dtos.UsersQuery_SortField.LastLoginDate, "LastLogin", null, { showSuffix: false })
        grid.addYesNo("Change email request pending", x => x.changeEmailRequestPending, Dtos.UsersQuery_SortField.ChangeEmailRequestPending, "ChangeEmailRequestPending");

        if (this.props.canExportGridToExcel) {
            grid.addExcelButton(() => this.props.onExport(), "ExcelButton", "ExportGridToExcelButton");
        }

        return grid.render();
    }

    render() {
        return < div >
            {this.renderGrid()}
        </div>
    }
}