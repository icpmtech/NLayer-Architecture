export class Qa {

    public IsReady = QaLoadingStatus.NotSet;

    private loadingCount = 0;
    private loadingTimeoutId: number;
    private errorCount = 0;
    private log = false;

    public Initalise() {
        if (this.IsReady === QaLoadingStatus.NotSet) {
            this.IsReady = QaLoadingStatus.Ready;
        }
    }

    public IncrementLoadingCount() {
        this.loadingCount++;
        if (this.loadingTimeoutId) {
            clearTimeout(this.loadingTimeoutId);
        }
        if (this.IsReady !== QaLoadingStatus.Error) {
            this.IsReady = QaLoadingStatus.Loading;
        }
        this.log && console.log("IncrementLoadingCount", this.loadingCount, this.IsReady);
    }


    public DecrementLoadingCount() {
        this.loadingCount--;
        this.log && console.log("DecrementLoadingCount", this.loadingCount, this.IsReady);
        if (this.loadingCount === 0) {
            //Add a delay as something else might jump in and start loading. 
            this.loadingTimeoutId = window.setTimeout(() => {
                //If nothing else has started loading then set flag to false
                if (this.loadingCount === 0 && this.IsReady !== QaLoadingStatus.Error) {
                    this.IsReady = QaLoadingStatus.Ready;
                    this.log && console.log("Finised DecrementLoadingCount", this.loadingCount, this.IsReady);
                }
            }, 400);
        }
    }

    private _lastErrorMessage;
    public IncrementErrorCount(errorMessage: string) {
        this._lastErrorMessage = errorMessage;
        this.errorCount++;
        this.IsReady = QaLoadingStatus.Error;
        this.log && console.log("IncrementErrorCount", this.errorCount, this.IsReady);
    }

    public LastError():string {
        return this._lastErrorMessage;
    }

    public DecrementErrorCount() {
        this.errorCount--;
        if (this.errorCount === 0) {
            this.IsReady = this.loadingCount ? QaLoadingStatus.Loading : QaLoadingStatus.Ready;
        }
        this.log && console.log("DecrementErrorCount", this.errorCount, this.IsReady);
    }


    public NavigateToUrl(url: string) {
        //if single page app makes sense for the ui test code to navigate without full page reload
        //if so impliment it here as ui test code will call in here
        //don't foget to clear errors etc
        alert(url);
    }

}

export enum QaLoadingStatus {
    NotSet = 1,
    Loading = 2,
    Ready = 3,
    Error = 4
}

export var QAIndicator = new Qa();
