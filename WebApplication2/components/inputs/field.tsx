import { fail } from 'assert';
import * as React from 'react';
import * as Validation from '../../validators/common'

interface FieldProps {
    title: string;
    validation: Validation.Result;
    qa: string;
    altLayout?: boolean;
    inlineLayout?: boolean;
    additionalContent: JSX.Element;
    className?: string;
    allowNoTitle?: boolean;
    labelPosition: 'left' | 'right';
    narrowErrors?: boolean;
    hideValidation?: boolean;
};

export class Field extends React.Component<FieldProps, {}> {
    renderTitle() {
        if (!!this.props.title) {
            let classes = this.props.altLayout ? ['col-md-3', 'col-form-label' , 'form-label'] : (this.props.inlineLayout ? ['col-form-label' , 'form-label'] : ['col-form-label', , 'form-label', 'd-block']);
            let isRequired = false;
            if (this.props.validation && this.props.validation.isRequired()) {
                isRequired = true;
            }
            if (isRequired) {
                classes.push("required");
            }
            if (this.props.className) {
                classes.push(this.props.className);
            }
            if (this.props.labelPosition === 'left' && (this.props.altLayout || (!this.props.altLayout && this.props.inlineLayout))) {
                classes.push('text-end');
            }

            return <label className={classes.join(" ")}>{this.props.title}</label>
        }
        return null;
    }

    renderErrors() {
        if (!this.props.validation || !this.props.validation.showValidationErrors() || this.props.validation.isValid()) {
            return null;
        }
        return <div className={this.props.altLayout ? "field-validation-error" : "text-danger"} data-qa="Error">{this.props.validation.errorMessage}</div>;
    }

    renderRegularLayout() {
        return (
            <div className="mb-3 d-flex flex-column" data-qa={this.props.qa + "RegularLayout"}>
                {(!this.props.inlineLayout || this.props.labelPosition === 'left') && this.renderTitle()}
                {this.renderErrors()}
                {this.props.children}
                {this.props.additionalContent}
                {(this.props.inlineLayout && this.props.labelPosition === 'right') && this.renderTitle()}
            </div>
        );
    }

    renderAltLayout() {
        let className = (this.props.allowNoTitle && !this.props.title) ? "col-md-6" : "col-md-5";
        return (
            <div className="mb-3 row" data-qa={this.props.qa + "AlternateLayout"}>
                {this.renderTitle()}
                <div className={className} data-qa={this.props.qa}>
                    {this.props.children}
                </div>
                {!(!!this.props.hideValidation) && this.props.validation && this.props.validation.showValidationErrors() && !this.props.validation.isValid() && <div className={this.props.narrowErrors ? "col-md-3" : "col-md-4"}>
                    {this.renderErrors()}
                </div>}
                {this.props.additionalContent}
            </div>
        );
    }

    render() {
        return this.props.altLayout ? this.renderAltLayout() : this.renderRegularLayout();
    }
};
