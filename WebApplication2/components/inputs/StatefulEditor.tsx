import * as React from 'react';
import RichTextEditor from 'react-rte';
import 'react-rte/lib/RichTextEditor.css';
import 'draft-js/dist/Draft.css';

interface RteProps {
    onChange: any;
    initialValue?: string;
    readOnly: boolean;
}
interface RteState {
    value: any;
}
export class StatefulEditor extends React.Component<RteProps,RteState>{
    constructor(props) {
        super(props)
        if (this.props.initialValue) {
            this.state = {
                value: RichTextEditor.createValueFromString(this.props.initialValue, 'html')
            }
        }
        else {
            this.state = { value: RichTextEditor.createEmptyValue() }
        }
    }

    private onChange = (value) => {
        this.setState({ value });
        if (this.props.onChange) {
            this.props.onChange(
                value.toString('html')
            );
        }
    };

    render() {
        return (
            <RichTextEditor
                value={this.state.value}
                onChange={this.onChange}
                toolbarConfig={toolbarConfig}
                readOnly={this.props.readOnly}
                />
        );
    }
}
const toolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
        { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' }
    ],
    BLOCK_TYPE_DROPDOWN: [
        { label: 'Normal', style: 'unstyled' },
        { label: 'Heading Large', style: 'header-one' },
        { label: 'Heading Medium', style: 'header-two' },
        { label: 'Heading Small', style: 'header-three' }
    ],
    BLOCK_TYPE_BUTTONS: [
        { label: 'UL', style: 'unordered-list-item' },
        { label: 'OL', style: 'ordered-list-item' }
    ]
};