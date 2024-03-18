import * as React from 'react';
import { Result } from "../../validators/common";

export const Validation: React.StatelessComponent<{ validation: Result; }> = (props) => {
    if (!props.validation || props.validation.isValid() || !props.validation.showValidationErrors()) return null;
    return <span className="text-danger" data-qa="Validation">{props.validation.errorMessage}</span>;
}