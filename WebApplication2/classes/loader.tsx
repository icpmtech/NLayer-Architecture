import * as React from 'react';
import { Pending } from './pending';
import { AppError } from "./appError";
import { LoadingComponent } from '../components'

/**
 * @class Loader
 * utility class for rendering a LoadingComponent with a Pending object
 */
export class Loader {
    public static for<T>(
        pending: Pending<T>,
        render: { (data: T): React.ReactNode },
        renderError?: { (error: AppError): React.ReactNode },
        renderLoading?: { (): React.ReactNode }
    ): JSX.Element {
        const Component = LoadingComponent as Newable<LoadingComponent<T>>;
        return <Component
            pending={pending || new Pending<T>()}
            render={render}
            renderError={renderError}
            renderLoading={renderLoading}
        />;
    }
};
