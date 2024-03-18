import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import * as Framework from '../../classes';
import * as Components from '../../components';

interface Props {
    showClaimedTotals: boolean;
    canContinueToDetails: boolean;
    positions: Framework.Pending<Dtos.ParticipantPositionDto[]>;
    claimedApprovedPositions: Framework.Pending<Dtos.ParticipantClaimedApprovedPositionsDto[]>;
    downloadUrl: string;
    canUpload: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    onUpload: () => void;
    onClear: () => void;
    eventId: number;
    onViewClaims: (dto: Dtos.ParticipantPositionDto) => void;
    onPositionUpdated: () => void;
    onAdd: () => void;
    onDeletePosition: (dto: Dtos.ParticipantPositionDto) => void;
}

interface State {
    updatedPositions: Dtos.ParticipantPositionDto[];
}

export class List extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = { updatedPositions: [] };
    }

    render() {
        var combined = Framework.Pending.combine(this.props.positions,
            this.props.claimedApprovedPositions,
            (positions, claimedApprovedPositions) => {
                return { positions, claimedApprovedPositions };
            });

        return Framework.Loader.for(combined, x => {
            var grid = Framework.SimpleGridBuilder.ForPending(this.props.positions)
                .isResizable()
                .isScrollable()
                .setSaveHandler((rowIndex, addNew) => { this.props.onPositionUpdated(); })
                .addString("Code", x => x.dtcCode, Dtos.ParticipantPositionsForEventQuery_SortField.Code, "Code")
                .addString("Name", x => x.name, Dtos.ParticipantPositionsForEventQuery_SortField.Name, "Name", null, { width: "450px" })
                .addNumber("Position", x => x.adrPosition, Dtos.ParticipantPositionsForEventQuery_SortField.Postion, "Position", this.props.canUpdate ? (m, v) => m.adrPosition = v : null, { min: 0, decimals: 0 })
                ;

            grid.addNumber(this.props.showClaimedTotals ? "Part. ADRs Claimed" : "ADRs Claimed",
                x => this.props.claimedApprovedPositions.map(caps => caps.find(cap => cap.id === x.participantId))
                    .map(cap => cap.claimedPosition).data,
                null, "AdrsClaimed",null,
                { filterable: false })
                .addNumber(this.props.showClaimedTotals ? "Part. ADRs Approved" : "ADRs Approved",
                x => this.props.claimedApprovedPositions.map(caps => caps.find(cap => cap.id === x.participantId))
                    .map(cap => cap.approvedPosition).data,
                    null, "AdrsApproved",null,
                { filterable: false });

            if (this.props.showClaimedTotals) {
                grid.addNumber("DS Allocation",
                    x => this.props.claimedApprovedPositions.map(caps => caps.find(cap => cap.id === x.participantId))
                        .map(cap => cap.allocatedPosition).data,
                    null, "DsAllocation", null,
                    { filterable: false });

                grid.addNumber("Total ADRs Allocated",
                    x => this.props.claimedApprovedPositions.map(caps => caps.find(cap => cap.id === x.participantId))
                        .map(cap => cap.totalPosition).data,
                    null, "TotalADRsAllocated",null,
                    { filterable: false });
            }

            grid.addCustomExcelButton("Download Template / Export", () => this.props.downloadUrl, "ExcelButton", "DownloadTemplateExportExcelButton");

            if (!this.props.canContinueToDetails) {
                grid.addCustomColumn("", (m) => <Components.IconButton onClick={() => this.props.onViewClaims(m)} icon="nav" size={16} qa="ContinueIcon"/>, m => m.id, "object", null, "continue",{ sortable: false, filterable: false, headerTemplate: "", width: 32 });
            }
            let pushRemainingRight = true;
            if (this.props.canUpdate) {
                grid.addButton("Add Position", () => this.props.onAdd(), { dataQA: "AddPosition", pushRemainingRight});
                pushRemainingRight = false;
            }
            if (this.props.canDelete) {
                grid.addButton("Clear All Positions", () => this.props.onClear(), { dataQA: "ClearAllPositions", pushRemainingRight: pushRemainingRight});
                pushRemainingRight =  false;
            }

            if (this.props.canUpload) {
                grid.addButton("Upload Positions", () => this.props.onUpload(), { dataQA: "Upload", pushRemainingRight: pushRemainingRight});
                pushRemainingRight = false;
            }

            grid.addCustomColumn("", (m, i) => <Components.IconButton onClick={() => this.props.onDeletePosition(m)} icon="delete" size={16} qa="DeleteIcon"/>, m => m.id, null, "object", "delete", { sortable: false, filterable: false, headerTemplate: "", width: 32 });

            return grid.render();
        });
    }
}
