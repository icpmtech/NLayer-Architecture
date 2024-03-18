import * as React from 'react';

export interface RadioButtonGroupProps<T> extends InputProps<T> {
    options: T[];
    horizontal?: boolean;
}

export class RadioButtonGroup<T extends { name: string }> extends React.Component<RadioButtonGroupProps<T>, {}> {
    private randomNum: number;

    constructor(props: RadioButtonGroupProps<T>) {
        super(props);
        this.randomNum = Math.floor(100000 * Math.random());
    }

    private onChange(item: T, checked: boolean) {
        this.props.onChange(item);
    }

    private getId(index:number) {
        return (this.props.name || "radio-group-" + this.randomNum.toString()) + "-" + index;
    }

    render() {
        return (
            <div >
                {this.props.options.map((x, i) =>
                    <span key={i}>
                        <span style={{marginRight: '20px'}}>
                            <input
                                id={this.getId(i)}
                                className={"k-radio k-radio-md"}
                                type="radio"
                                name={this.props.name || ("radio-group-" + this.randomNum.toString())}
                                checked={!!this.props.value && this.props.value.name === x.name}
                                disabled={this.props.disabled}
                                onChange={(e) => this.onChange(x, e.currentTarget.checked)}
                                value={x.name}
                                data-qa={this.props.qa + "Radio"}
                            />
                            <label htmlFor={this.getId(i)} className={"k-radio-label"}>
                                {x.name}
                            </label>
                        </span>
                    </span>
                )}
            </div>
        );
    }


}