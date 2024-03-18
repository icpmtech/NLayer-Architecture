import { fail } from 'assert';
import * as React from 'react';
import * as Validation from '../../validators/common'

interface ListGroupFieldProps {
    validation: Validation.Result;
    qa: string;
};

export class ListGroupField extends React.Component<ListGroupFieldProps, {}> {

    renderErrors() {
        if (!this.props.validation || this.props.validation.isValid() || !this.props.validation.showValidationErrors()) {
            return null;
        }

        return (
            <div
                className={"text-danger float-end"}
                style={{ marginTop: '-5px', marginBottom: '10px', marginRight: '7px' }}
                data-qa={this.props.qa + "Error"}
                >
                {this.props.validation.errorMessage}
                
            </div>
        );
    }

    render() {
        return (
            <div className="mb-3" data-qa={this.props.qa + "ListGroupField"}>
                {this.props.children}
                {this.renderErrors()}
            </div>
        );
    }
};
