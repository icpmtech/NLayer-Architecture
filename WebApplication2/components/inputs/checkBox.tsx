import * as React from 'react';

interface Props extends InputProps<boolean> {
    groupName?: string;
    labelClassName?: string;
}

export class CheckBox extends React.Component<Props, {}> {
    private randomNum: number;

    constructor(props: InputProps<boolean>) {
        super(props);
        this.randomNum = Math.floor(100000 * Math.random());
    }

    private onChange(checked: boolean) {
        !!this.props.onChange && this.props.onChange(checked);
    }

    private getId() {
        return "check-box" + this.randomNum.toString();
    }

    private getName() {
        return this.props.groupName || this.props.name || ("check-box" + this.randomNum.toString());
    }

    private getValue() {
        return this.props.name || ("check-box" + this.randomNum.toString());
    }

    render() {
        return (
            <span>
                <input
                    checked={!!this.props.value}
                    onChange={(e) => this.onChange(e.currentTarget.checked)}
                    className={"k-checkbox k-checkbox-md"}
                    id={this.getId()}
                    name={this.getName()}
                    type={"checkbox"}
                    value={this.getValue()}
                    disabled={this.props.disabled}
                    data-qa={this.props.qa + "Input"}
                />
                <label
                    className={("k-checkbox-label " + this.props.labelClassName).trim()}
                    htmlFor={this.getId()}>
                    {this.props.name || ""}
                </label>
            </span>
        );
    }
};