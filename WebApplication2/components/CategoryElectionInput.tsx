import * as React from 'react';
import { NumberInput } from "./inputs/number";
import {Dtos} from "../adr/index";

interface CategoryElectionProps {
    onValueChanged,
    category: Dtos.CategoryPositionDto;
    index: number;
    editMode: boolean;
};

interface State {
};

export class CategoryElectionInput extends React.Component<CategoryElectionProps, {}> {
    constructor(props: CategoryElectionProps) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
    }
    
    private valueChanged(value) {
        this.props.onValueChanged(value, this.props.index);
    }

    render() {
        var categoryADRinfo;

        if (this.props.editMode && this.props.category.hasCategoryAdrs) categoryADRinfo = <NumberInput decimals={0} min={0} value={this.props.category.adrPosition} onChange={this.valueChanged} qa="NumberInput"/>;
        else if (this.props.category.hasCategoryAdrs) categoryADRinfo = <span>{this.props.category.adrPosition}</span>;
        else categoryADRinfo = <span><i>Beneficial owner entry required</i></span>;

        return (
            <div>
                <span className="catLabel" data-qa="CategoryElectionLabel">{this.props.category.categoryName}</span>
                <span className="catInput" data-qa="CategoryElectionInput">{categoryADRinfo}</span>
            </div>
        );
    }
}
