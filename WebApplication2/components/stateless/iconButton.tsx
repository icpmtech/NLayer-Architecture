import * as React from 'react';

import { Icon, IconProps } from './icon';

interface IconButtonProps extends IconProps {
    onClick: () => void;
    qa: string;
};


export const IconButton: React.StatelessComponent<IconButtonProps> = (props) => {
    return (
        <span style={{ cursor: "pointer" }} data-qa={props.qa} onClick={() => props.onClick()}>
            <Icon {...props} />
        </span>
    );
}