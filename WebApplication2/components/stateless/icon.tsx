import * as React from 'react';

export interface IconProps {
    icon: "delete" | "nav";
    qa: string;
    size?: number;
    color?: string;
};

const paths: { [key: string]: { paths: string[] } } = {
    "nav": {
        paths: [
            "M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13z",
            "M11.086 22.086l2.829 2.829 8.914-8.914-8.914-8.914-2.828 2.828 6.086 6.086z"
        ]
    },
    "delete": {
        paths: [
            "M16 0c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zM16 29c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13z",
            "M21 8l-5 5-5-5-3 3 5 5-5 5 3 3 5-5 5 5 3-3-5-5 5-5z"
        ]
    }
};

export const Icon: React.StatelessComponent<IconProps> = (props) => {
    const styles = {
        svg: {
            display: 'inline-block',
            verticalAlign: 'middle',
        },
        path: {
            fill: props.color || "grey",
            strokeWidth: "1"
        },
    };

    return (
        <svg
            style={styles.svg}
            width={`${props.size || 16}px`}
            height={`${props.size || 16}px`}
            viewBox="0 0 32 32"
            data-qa={props.qa}
            >
            {paths[props.icon].paths.map((p, i) => <path key={"path" + i} style={styles.path} d={p}></path>)}
        </svg>
    );
};



