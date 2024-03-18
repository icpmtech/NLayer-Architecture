import * as React from 'react';

export interface TextInputProps extends InputProps<string> {
    maxLength?: number;
    type?: 'text' | 'password';
    handleKeyTyped?: boolean;
}

export class TextInput extends React.Component<TextInputProps, InputState> {
    private timeoutId: number;
    
    constructor(props: TextInputProps) {
        super(props);
        this.state = { value: props.value || "" };
    }

    componentWillReceiveProps(nextProps: InputProps<string>) {
        if (nextProps.value !== this.props.value) {
            
            this.setState({ value: nextProps.value || "" });
        
            //Cancel the debounce timout
            if (this.timeoutId) {                    
                window.clearTimeout(this.timeoutId);
                this.timeoutId = 0;
            }
        }
    }

    keyTyped = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value;
        this.setState({ value });
        this.props.onChange(value || null);
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value;
        this.setState({ value });
        this.ownDebounce(value);
    }

    private ownDebounce(value: string): void {
        //Cancel the debounce timeout before we create a new one
        if (this.timeoutId) {
            window.clearTimeout(this.timeoutId);                
            this.timeoutId = 0;
        }

        this.timeoutId = window.setTimeout(() => {                
            this.props.onChange(value || null);
            this.timeoutId = 0;
        }, 250);

    }

    render() {
        return <input
            className={"k-textbox" + `${!!this.props.isFormControl ? ' form-control' : ''}`}
            type={this.props.type != null ? this.props.type : "text"}
            name={this.props.name}
            value={this.state.value}
            disabled={!!this.props.disabled}
            onChange={this.handleChange}
            onKeyUp={this.props.handleKeyTyped && this.keyTyped}
            data-bind={"value: " + this.props.name}
            maxLength={!!this.props.maxLength ? this.props.maxLength : null}
            data-qa={this.props.qa + "TextInput"}
        />
    }
};