import * as React from 'react';

interface AccordionState {
    open: Map<number, boolean>;
};

export class Accordion extends React.Component<{}, AccordionState> {
    constructor(props) {
        super(props);
        let open = new Map();
        React.Children.map(this.props.children, (child, index) => {
            const childElem = React.cloneElement(child as React.ReactElement<AccordionSectionProps>)
            childElem.props.open && open.set(index, true);
        });
        this.state = { open };
    }

    handleClick(index: number, isOpen: boolean, onClick?: { (open: boolean): void }) {
        const open = this.state.open;
        open.set(index, isOpen);
        this.setState({ open });
        !!onClick && onClick(isOpen);
    }

    renderChild(elem: React.ReactElement<AccordionSectionProps>, index: number) {
        const props: AccordionSectionProps = Object.assign({}, elem.props, {
            open: this.state.open.get(index),
            onClick: (isOpen) => this.handleClick(index, isOpen, elem.props.onClick)
        });
        return React.cloneElement(elem, props);
    }

    render() {
        return <div>
            {React.Children.map(this.props.children, (elem, index) => this.renderChild(elem as any, index))}
        </div>
    }
}


interface AccordionSectionProps {
    title: string;
    qa: string;
    open?: boolean;
    onClick?: { (value: boolean): void };
};

export class AccordionSection extends React.Component<AccordionSectionProps, {}> {
    render() {
        let isOpen = this.props.open !== false;
        let cStyle: any = { height: isOpen ? 'auto' : '0' };
        let className = "fa fa-chevron-circle-" + (isOpen ? 'up' : 'down');

        return (
            <div className="accordion" data-qa={this.props.qa + "Accordion"}>
                <div onClick={() => this.props.onClick(!isOpen)}>
                    <i className={className}></i>
                    <span style={{ marginLeft: '10px', fontWeight: 700 }} data-qa={this.props.qa}>{this.props.title}</span>
                </div>
                <div className="accordion-content" style={cStyle} data-qa={this.props.qa + "AccordionContent"}>{this.props.children}</div>
            </div>
        );
    }
};