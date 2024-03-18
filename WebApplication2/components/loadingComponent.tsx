import * as React from 'react';
import { Pending, LoadingStatus } from "../classes/pending";
import { AppError } from "../classes/appError";
import * as Components from "./";

interface LoadingProps<T> {
    pending: Pending<T>;
    render: (data: T, loading?: boolean) => React.ReactNode;
    renderError?: { (error: AppError): React.ReactNode };
    renderLoading?: { (): React.ReactNode };
};

/**
 * component to render a given ReactNode based on the state of a given Pending object
 */
export class LoadingComponent<T> extends React.Component<LoadingProps<T>, {}> {
    render() {
        let result;

        switch (this.props.pending.state) {
            // don't render anything as the request hasn't been made
            case LoadingStatus.Preload:
                return null;
            // request completed, call the given render function
            case LoadingStatus.Done:
                result = this.renderDone(this.props.pending.data, false);
                break;
            // request is loading or data marked as stale
            case LoadingStatus.Stale:
            case LoadingStatus.Loading:
                // if we have data render it, otherwise call the loading function
                if (this.props.pending.data) {
                    result = this.renderDone(this.props.pending.data, true);
                } else {
                    result = this.renderLoading();
                }
                break;
            // request failed for some reason, call the error function to handle it
            case LoadingStatus.Failed:
                result = this.renderError(this.props.pending.error);
                break;
            // shouldn't ever be in a status not handled above
            default:
                throw new Error("Broken pending data, status missing.");
        }

        if (typeof result === "string") {
            return <span data-qa="StringResult">{result}</span>;

        } else if (Array.isArray(result)) {
            return <div data-qa="ArrayResult">{result}</div>;

        } else {
            return result as JSX.Element;
        }
    }

    private renderDone(data: T, loading: boolean): any {
        return this.props.render(data, loading);
    }

    private renderLoading(): React.ReactNode {
        return !!this.props.renderLoading ? this.props.renderLoading() : this.spinner();
    }

    private renderError(error: AppError): React.ReactNode {
        if (this.props.renderError) {
            return this.props.renderError(error);
        }
        return <Components.Error error={error} allowClose={false} qa="LoadingComponentError"/>;
    }

    private spinner(): React.ReactNode {
        return <span data-qa="Spinner">Loading....</span>;
    }
}
