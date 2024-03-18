import * as React from 'react';
import { CheckBox } from './checkBox';

export interface CheckBoxGroupProps<T> extends InputProps<T[]> {
    options: T[];
    horizontal?: boolean;
    displayInline?: boolean;
}

export class CheckBoxGroup<T extends { name: string }> extends React.Component<CheckBoxGroupProps<T>, {}> {
    private randomNum: number;

    constructor(props: CheckBoxGroupProps<T>) {
        super(props);
        this.randomNum = Math.floor(100000 * Math.random());
    }

    private onChange(item: T, checked: boolean) {
        if (checked) {
            this.props.onChange(this.props.options.filter(x => x == item || !!this.props.value.find(y => y.name == x.name)));
        }
        else {
            this.props.onChange(this.props.options.filter(x => x != item && !!this.props.value.find(y => y.name == x.name)));
        }
    }

    private getId(index: number) {
        return "checkbox-group-" + this.randomNum.toString() + "-" + index;
    }

    private getName() {
        return this.props.name || ("checkbox-group-" + this.randomNum.toString());
    }

    private renderInput(dto: T, i: number) {
        return (
            <span>
                <CheckBox
                    value={!!this.props.value.find(y => y.name == dto.name)}
                    onChange={v => this.onChange(dto, v)}
                    disabled={this.props.disabled}
                    name={dto.name}
                    groupName={this.getName()}
                    labelClassName={this.props.horizontal === true ? "horizontal-checkbox-label" : ""}
                    qa={this.props.qa}
                    />
            </span>
        );
    }

    private renderVertical() {
        return <div style={this.props.options.length > 4 ? { columnCount: 2 } : {}}>{this.props.options.map((x, i) => <div key={i}>{this.renderInput(x, i)}</div>)}</div>;
    }

    private renderHorizontal() {
        let displayFormat = this.props.displayInline ? "inline-block" : "block";
        return <div style={{ display: displayFormat }}>{this.props.options.map((x, i) => <span key={i} style={{ marginRight: '30px' }}>{this.renderInput(x, i)}</span>)}</div>;
    }

    render() {
        return this.props.horizontal === true
            ? this.renderHorizontal()
            : this.renderVertical()
    };
}