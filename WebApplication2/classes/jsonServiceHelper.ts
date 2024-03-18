import { AppError } from "../classes/appError";
import { UrlHelpers } from "../classes/urlHelpers";
import { customJSONParse } from "./customJSONParse";

export interface PagedResult<T> {
    items: T[];
    fullCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export class JsonServiceHelper<TResponse> {
    public getItem(url: string) {
        return this.sendRequestForItem(url, "GET", true);
    }

    public getCollection(url: string) {
        return this.sendRequestForCollection(url, "GET");
    }

    public getPage(url: string, page: number, pageSize: number) {
        const parts: { [key: string]: string } = {};

        if (page) { parts["page"] = page.toString(); }
        if (pageSize) { parts["pagesize"] = pageSize.toString(); }

        return this.sendRequest<PagedResult<TResponse>>(UrlHelpers.buildUrl([url], parts));
    }

    public getPageFromQuery(url: string, query: any) {
        return this.sendRequest<PagedResult<TResponse>>(UrlHelpers.buildUrl([url], query));
    }

    public update(url: string, item: TResponse) {
        return this.sendRequestForItem(url, "PUT", item);
    }

    public create(url: string, item: TResponse) {
        return this.sendRequestForItem(url, "POST", item);
    }

    public remove(url: string) {
        return this.sendRequestWithNoResponse(url, "DELETE");
    }

    public sendRequestForItem(url: string, type?: string, data?: any, returnNulls?: boolean) {
        return this.sendRequest<TResponse>(url, type, data, returnNulls);
    }

    public sendRequestForCollection(url: string, type?: string, data?: any, returnNulls?: boolean) {
        return this.sendRequest<TResponse[]>(url, type, data, returnNulls);
    }

    public sendRequestForPage(url: string, type?: string, data?: any) {
        return this.sendRequest<PagedResult<TResponse>>(url, type, data);
    }

    public sendRequestWithNoResponse(url: string, type?: string, data?: any) {
        return this.sendRequest<void>(url, type, data);
    }

    private sendRequest<T>(url: string, type?: string, data?: any, returnNulls?: boolean): JQueryPromise<T> {
        const params: any = {
            cache: false,
            contentType: "application/json",
            type: type || "GET"
        };

        const rvt = $("input[name='__RequestVerificationToken']").val();
        if (rvt != null) {
            params.headers = { "RequestVerificationToken": rvt };
        }

        if (data && type !== "GET") {
            params.data = JSON.stringify(data);
        } else if (data) {
            url = UrlHelpers.buildUrl([url], data);
        }

        const result = $.Deferred<T>();

        //Max length of url is 2047 .... shouldn't need this much otherwise user is adding strange filters 
        if (url.length > 1980) {

            result.reject(new AppError(
                "Sorry too many parameters have been set",
                null,
                new Error("Requested url is too long")
                )
            );
        }
        else {

            // strongly type and map errors
            jQuery
                .ajax(url, params)
                .then(
                (data: T) => {
                    result.resolve(customJSONParse(JSON.stringify(data)));
                },
                (response: JQueryXHR, textStatus: string, errorThrown: string) => {
                    if (returnNulls && response.status === 404) {
                        result.resolve(null);
                    } else if (response.status === 422) {
                        result.resolve(response.responseJSON);
                    } else {
                        console.log("failed", response.responseJSON, response, textStatus, errorThrown);
                        if (response.status === 403 && response.responseJSON) {
                            if (response.responseJSON.notAuthenticated === true) {
                                location.reload();
                            }
                            else if (response.responseJSON.notAuthenticated === false){
                                location.href = "/?securityexception=true";
                            }
                        }
                        if (response.responseJSON) {
                            return result.reject(
                                new AppError(
                                    this.getUserMessage(response.responseJSON),
                                    this.getServerError(response.status, response.responseJSON),
                                    null)
                            );
                        }

                        return result.reject(
                            new AppError(
                                "An unexpected error occurred",
                                {
                                    message: [response.responseText || response.statusText],
                                    status: response.status,
                                    failures: null,
                                    errorType: null,
                                    innerError: null
                                }, null));
                    }
                });
        }

        return result.promise();
    }

    private getUserMessage(json): string {
        let message = json.message;

        if (!message && json.failures && json.failures.length) {
            message = json.failures[0].message;
        }

        return message || "An unexpected error occurred";
    }

    private getServerError(status: number, errorJson: any): any {
        if (!errorJson) return null;
        return errorJson;
        }
       
        /* Leaving this here for now, as we might want to revisit how server errors are handled */
        //     if (errorJson.exceptionType && errorJson.innerException && errorJson.failures && errorJson.exceptionMessage) {
        //         let exceptionType: string = errorJson.exceptionType;
        //         let innerException: any = errorJson.innerException;
        //         let failures: any = errorJson.failures;
        //         let exceptionMessageLines: string[] = errorJson.exceptionMessage && errorJson.exceptionMessage.split("\n");
        //         let result: ServerError = {
        //             status: status,
        //             failures: failures,
        //             errorType: exceptionType,
        //             message: exceptionMessageLines,
        //             innerError: this.getServerError(status, innerException)
        //         };
        //         return result;
        //     }
        //     else {
        //         return errorJson;
        //     }
        // }
}