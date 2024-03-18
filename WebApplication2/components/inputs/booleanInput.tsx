import * as React from 'react';

export class BooleanInput extends React.Component<YesNoInputProps, {}> {
    private randomNum: number;

    constructor(props: YesNoInputProps) {
        super(props);
        this.randomNum = Math.floor(100000 * Math.random());     
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        !!this.props.onChange && this.props.onChange(e.currentTarget.value === "true" ? true : false);
    }

    private getId(value: boolean) {
        return this.randomNum.toString() + "-" + (value ? "yes" : "no");
    }

    private getName() {
        return this.props.name || ("radio-group-" + this.randomNum.toString());
    }

    render() {
        return (
            <div>
                <span style={{marginRight:'20px'}}>
                    <input
                        id={this.getId(true)}
                        checked={this.props.value === true}
                        className={"k-radio k-radio-md"}
                        name={this.getName()}
                        type="radio"
                        value={"true"}
                        onChange={this.onChange}
                        disabled={this.props.disabled}
                        data-qa={this.props.qa + "YesInput"}
                    />
                    <label className="k-radio-label" htmlFor={this.getId(true)}>{this.props.yesCaption || "Yes"}</label>
                </span>
                <span>
                    <input
                        checked={this.props.value === false}
                        className={"k-radio k-radio-md"}
                        id={this.getId(false)}
                        name={this.getName()}
                        type="radio"
                        value={"false"}
                        onChange={this.onChange}
                        disabled={this.props.disabled}
                        data-qa={this.props.qa + "NoInput"}

                    />
                    <label className={"k-radio-label"} htmlFor={this.getId(false)}>{this.props.noCaption || "No"}</label>
                </span>
            </div>
        );
    }
};