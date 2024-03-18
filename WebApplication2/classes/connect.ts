import { LoadingStatus, Pending } from "./pending";
import { AppError } from "./appError";
import { QAIndicator } from "./qa";

/**
 * bind a promise to a Pending object then give that Pending as an arg to given method
 * @param data - the Promise, typically an ajax request
 * @param current - an initial state for the Pending object
 * @param setState - a callback to use when the promise evaluates. Typically a setState on a react component
 */
export function connect<TDto>(
    data: JQueryPromise<TDto>,
    current: Pending<TDto>,
    setState: (payload: Pending<TDto>) => void
) {
    QAIndicator.IncrementLoadingCount();
    setState(new Pending<TDto>(LoadingStatus.Loading, current && current.data));

    data.done(x => {
        setState(new Pending<TDto>(LoadingStatus.Done, x));
        QAIndicator.DecrementLoadingCount();
    });

    data.fail(x => {
        setState(new Pending<TDto>(LoadingStatus.Failed, null, x as AppError));
        QAIndicator.IncrementErrorCount((x as AppError).userMessage);
    });
}
