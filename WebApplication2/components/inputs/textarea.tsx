import * as React from 'react';

export class TextArea extends React.Component<InputProps<string>, InputState> {
    constructor(props: InputProps<string>) {
        super(props);
        this.state = { value: props.value || "" };
    }

    componentWillReceiveProps(nextProps: InputProps<string>) {
        if (nextProps.value !== this.props.value) {
            this.setState({ value: nextProps.value || "" });
        }
    }

    handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.currentTarget.value;
        this.setState({ value });
        !!this.props.onChange && this.props.onChange(value);
    }

    render() {
        return <textarea
            className={"k-textbox" + `${!!this.props.isFormControl ? ' form-control' : ''}` + " full-size"}
            name={this.props.name}
            value={this.state.value}
            disabled={!!this.props.disabled}
            onChange={this.handleChange}
            placeholder={this.props.placeholder || ""}
            style={{ resize: 'vertical' }}
            data-qa={this.props.qa + "TextArea"}
        />
    }
};