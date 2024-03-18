import * as Validation from "./common"
import { Dtos } from "../adr";

export class EventDtoValidator extends Validation.Results<Dtos.EventDto>{

    public depository: Validation.Result;

    constructor(model: Dtos.EventDto, showValidationErrors: boolean, makeLive?: boolean) {
        super(model, showValidationErrors);

        let depositories = [];
        this.model.depositoryBnym === true && depositories.push('BNYM');
        this.model.depositoryCb === true && depositories.push('CB');
        this.model.depositoryDb === true && depositories.push('DB');
        this.model.depositoryJpm === true && depositories.push('JPM');
        this.depository = model.securityType == Dtos.SecurityType.CommonStock ? Validation.valid(this) : Validation.required(this, depositories, "Depository is required");

        if (makeLive === true) {
            this.adrRecordDate = Validation.required(this, this.model.adrRecordDate, "ADR Record Date is required to make an event live");
            this.eventType = Validation.required(this, this.model.eventType, "Event Type is required to make an event live");
            this.statutoryWhtRate = Validation.nonZeroNumber(this, this.model.statutoryWhtRate, "Statutory WHT Rate is required to make an event live");
        }
        else {
           this.statutoryWhtRate = Validation.valid(this);
           this.adrRecordDate = Validation.valid(this);
           this.eventType = Validation.valid(this);
        }
    }

    public cusip = Validation.all(this,
        () => Validation.required(this, this.model.cusip, "CUSIP Code required"),
        () => Validation.exactLength(this, this.model.cusip, 9, "CUSIP must be 9 characters in length")
    );

    public countryofIssuance = Validation.required(this, this.model.countryofIssuance && this.model.countryofIssuance.id, "Country of Issuance required");
    public issuer = Validation.all(this,
        () => Validation.required(this, this.model.issuer, "Issuer required"),
        () => Validation.maxLength(this, this.model.issuer, 100, "Issuer must be no more than 100 characters in length")
    );
    public issuerAddressLine1 = this.model.securityType === Dtos.SecurityType.CommonStock ?
        Validation.all(this,
            () => Validation.required(this, this.model.issuerAddressLine1, "Issuer Address Line 1 required"),
            () => Validation.maxLength(this, this.model.issuerAddressLine1, 35, "Issuer Address Line 1 must be no more than 35 characters in length"))
        : Validation.valid(this)
    ;
    public issuerAddressLine2 = this.model.securityType === Dtos.SecurityType.CommonStock ?
        Validation.all(this,
            () => Validation.required(this, this.model.issuerAddressLine2, "Issuer Address Line 2 required"),
            () => Validation.maxLength(this, this.model.issuerAddressLine2, 35, "Issuer Address Line 2 must be no more than 35 characters in length"))
        : Validation.valid(this)
    ;
    public issuerAddressLine3 = this.model.securityType === Dtos.SecurityType.CommonStock ?
        Validation.maxLength(this, this.model.issuerAddressLine3, 35, "Issuer Address Line 3 must be no more than 35 characters in length")
        : Validation.valid(this)
    ;
    public issuerAddressLine4 = this.model.securityType === Dtos.SecurityType.CommonStock ?
        Validation.maxLength(this, this.model.issuerAddressLine4, 35, "Issuer Address Line 4 must be no more than 35 characters in length")
        : Validation.valid(this)
    ;
    public custodian = Validation.maxLength(this, this.model.custodian, 100, "Custodian must be no more than 100 characters in length");
    public sponsored = Validation.required(this, this.model.sponsored, "Sponsored is required");

    public isin = Validation.all(this,
        () => Validation.required(this, this.model.isin, "ISIN required"),
        () => Validation.exactLength(this, this.model.isin, 12, "ISIN must be 12 characters in length"),
        () => Validation.alphanumeric(this, this.model.isin, "ISIN can only be alphanumeric")
    );

    public ratioOrdAdr = Validation.all(this,
        () => Validation.required(this, this.model.ratioAdr, "Both parts of ADR/ORD Ratio are required"), // Needs a way to handle both errors
        () => Validation.required(this, this.model.ratioOrd, "Both parts of ADR/ORD Ratio are required") // Needs a way to handle both errors
    );

    public securityType = Validation.required(this, this.model.securityType, "Security Type required");
    public finalAdrPayDate = Validation.isFalse(this, this.model.finalAdrPayDate && this.model.adrRecordDate && this.model.adrRecordDate >= this.model.finalAdrPayDate, "Final ADR Pay Date must be later than ADR Record Date");
    public finalOrdPayDate = Validation.isFalse(this, this.model.finalOrdPayDate && this.model.ordRecordDate && this.model.ordRecordDate >= this.model.finalOrdPayDate, "Final ORD Pay Date must be later than ORD Record Date");

    public statutoryWhtRate: Validation.Result;
    public ordRecordDate = Validation.valid(this);
    public approxOrdPayDate = Validation.valid(this);
    public approxAdrGrossDivRate = Validation.valid(this);
    public approxOrdGrossDivRate = Validation.valid(this);
    public approxOrdGrossDivCurr = Validation.valid(this);
    public finalAdrGrossDivRate = Validation.valid(this);
    public finalOrdGrossDivRate = Validation.valid(this);
    public finalOrdGrossDivCurr = Validation.valid(this);
    public approxFxRate = Validation.valid(this);
    public finalFxRate = Validation.valid(this);
    public publicationDate = Validation.valid(this);
    public importantNoticeLastUploaded = Validation.valid(this);
    public importantNoticeLastByName = Validation.valid(this);
    public exDate = Validation.valid(this);
    public madeLiveOn = Validation.valid(this);
    public madeLiveBy = Validation.valid(this);
    public createdBy = Validation.valid(this);
    public createdOn = Validation.valid(this);
    public approxAdrPayDate = Validation.valid(this);
    public ratioAdr = Validation.valid(this);
    public ratioOrd = Validation.valid(this);
    public depositoryDb = Validation.valid(this);
    public depositoryCb = Validation.valid(this);
    public depositoryBnym = Validation.valid(this);
    public depositoryJpm = Validation.valid(this);
    public id = Validation.valid(this);
    public eventType: Validation.Result;
    public bNum = Validation.valid(this);
    public adrRecordDate: Validation.Result;
}
