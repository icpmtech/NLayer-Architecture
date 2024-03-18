import * as React from 'react';

interface MessageProps {
    qa: string;
    message?: string;
    type: "success" | "alert" | "info";
    hide?: boolean;
    allowClose?:boolean;
    onClose?: { (): void };
    scrollTo?: boolean;
    useRowLayout?: boolean;
};
interface MessageState {
    hide: boolean;
};

export class Message extends React.Component<MessageProps, MessageState> {
    private elem: HTMLDivElement;
    constructor(props: MessageProps) {
        super(props);
        this.state = { hide: !!props.hide };
    }

    componentWillReceiveProps(newProps: MessageProps) {
        this.setState({ hide: newProps.hide });
    };

    handleClose = () => {
        this.setState({ hide: true });
        !!this.props.onClose && this.props.onClose();
    }

    className() {
        let classes = ["flash-message", "alert", "alert-dismissible", "d-flex"];
        switch (this.props.type) {
            case "alert": classes.push("alert-danger"); break;
            case "success": classes.push("alert-success"); break;
            case "info": classes.push("alert-info"); break;
        }

        if (!this.props.useRowLayout) {
            classes.push("flex-column");
        }

        return classes.join(" ");
    }

    renderMessage() {
        return (
            <div ref={e => this.elem = e} className={this.className()} data-qa={this.props.qa + "Message"} role="alert">
                <span dangerouslySetInnerHTML={{ __html: this.props.message }} />
                {this.props.allowClose !== false ? <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" data-qa="CloseButton" onClick={this.handleClose}></button> : null}
                {this.props.children}

            </div >
        );
    }

    componentDidMount() {
        if (this.props.scrollTo) this.elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    render() {
        return !this.state.hide ? this.renderMessage() : null;
    }
};
