import { Pending } from "../classes/pending";
import { JsonServiceHelper } from "../classes/jsonServiceHelper";
import { UrlHelpers } from "../classes/urlHelpers";

export module Dtos {

    ///************* Enums *****************

    export enum AnnouncementKey {
        General = 1,
    }

    export enum CounterpartyType {
        Custodian = 1,
        WorkingSupply = 2,
        OutOfProof = 3,
        PreRelease = 4,
    }

    export enum BeneficialOwnerSortField {
        Id = 0,
        FirstName = 1,
        LastName = 2,
        DisplayName = 3,
        BatchClaimReference = 4,
        BeneficialOwnerClaimId = 5,
        Category = 6,
        CountryOfResidence = 7,
        EntityTypeDescription = 8,
        NumAdrs = 9,
        FilingMethodRound = 10,
        EventTypeName = 11,
        AdrRecordDate = 12,
        PossibleDuplicate = 13,
        BenificalOwnerStatus = 14,
        RoundLocked = 15,
        CountryOfIssuance = 16,
        Issuer = 17,
        Cusip = 18,
        BNum = 19,
        DtcCode = 20,
        ParticipantName = 21,
        DSName = 22,
        DSDtcCode = 23,
        CategoryDisplayName = 24,
        NameOfQi = 25,
        ContactInformation = 26,
        V2orV3 = 27,
        UnderlyingHolders = 28,
        SharePercentage = 29,
    }

    export enum FilterType {
        Equals = 1,
        NotEquals = 2,
        StartsWith = 3,
        EndsWith = 4,
        Contains = 5,
        DoesNotContain = 6,
        IsNull = 7,
        IsNotNull = 8,
        IsEmpty = 9,
        IsNotEmpty = 10,
        GreaterThan = 11,
        GreaterThanOrEqual = 12,
        LessThan = 13,
        LessThanOrEqual = 14,
    }

    export enum BeneficialOwnersExportType {
        Normal = 1,
        Full = 2,
        Preview = 3,
    }

    export enum BeneficialOwnerClaimStatus {
        Canceled = 1,
        InPreparation = 2,
        New = 10,
        AwaitingDocuments = 20,
        ToReview = 30,
        ScannedDocsAccepted = 40,
        PhysicalDocsAccepted = 50,
        Filed = 60,
        Paid = 70,
        OnHold = 80,
        OnHoldOFAC = 90,
        Rejected = 100,
        RejectedOFAC = 110,
    }

    export enum FilingMethod {
        ReliefAtSource = 1,
        QuickRefund = 2,
        LongForm = 3,
    }

    export enum BulkClaimStatus {
        New = 1,
        Processing = 2,
        FailedToProcess = 3,
        Review = 4,
        Submitting = 5,
        Submitted = 6,
        Canceled = 7,
    }

    export enum DocumentAppliesLevel {
        BeneficialOwner = 1,
        BatchClaim = 2,
        EntityGroup = 3,
    }

    export enum CategorySortField {
        Id = 0,
        CountryOfIssuance = 1,
        FilingMethod = 2,
        Description = 3,
        ReclaimRate = 4,
        CountriesOfResidence = 5,
        EntityTypes = 6,
        WhtRate = 7,
    }

    export enum EventStatusLookup_Status {
        Draft = 1,
        Live = 2,
        Unavailable = 3,
        Canceled = 4,
        Closed = 5,
    }

    export enum DocumentStaticDataStatus {
        Enabled = 1,
        Disabled = 2,
    }

    export enum DocumentStaticDataSortField {
        Id = 0,
        Title = 1,
        PhysicalRequired = 2,
        CountryOfIssuance = 3,
        AppliesTo = 4,
        SystemGeneratedForm = 5,
    }

    export enum SecurityType {
        ADR = 0,
        GDR = 1,
        NYRS = 2,
        CommonStock = 3,
    }

    export enum GetAllBatchClaimsQuery_SortField {
        ClaimId = 1,
        DtcCode = 2,
        ParticipantName = 3,
        ClaimReference = 4,
        CountryOfIssuance = 5,
        Issuer = 6,
        CUSIP = 7,
        EventType = 8,
        FilingMethod = 9,
        AdrRecordDate = 10,
        NumberOfBOs = 11,
        NumberOfAdrs = 12,
        Status = 13,
        Depositories = 14,
        DSName = 15,
        DSDtcCode = 16,
        RoundClosingDate = 17,
    }

    export enum GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField {
        ClaimId = 1,
        FilingMethod = 2,
        BatchClaimNumber = 3,
        AdrClaimed = 4,
        CountOfBeneficalOwners = 5,
        CreatedBy = 6,
        SubmitedAt = 7,
        Status = 8,
    }

    export enum GetEventRoundReconciliationReportQuery_ReconciliationSortField {
        ParticipantName = 1,
        ParticipantCode = 2,
        CategoryName = 3,
        CategoryRate = 4,
        AdrTotal = 5,
        DtcTotal = 6,
        Decision = 7,
    }

    export enum GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField {
        Id = 1,
        LineNumber = 2,
        ErrorMessage = 3,
    }

    export enum GetListBulkClaimsQuery_BulkClaimSortField {
        Id = 0,
        DtcCode = 1,
        ParticipantName = 2,
        Reference = 3,
        CountryOfIssuance = 4,
        Date = 5,
        RoundType = 6,
        Status = 7,
    }

    export enum GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField {
        Id = 1,
        EventId = 2,
        EventCusip = 3,
        LineNumber = 4,
        ErrorMessage = 5,
    }

    export enum GetListEventRoundsQuery_SortField {
        RoundStartDate = 1,
        RoundEndDate = 2,
        RoundAvailability = 3,
        Cusip = 4,
        CountryOfIssuance = 5,
        AdrRecordDate = 6,
    }

    export enum GetListStatutesQuery_StatutesSortField {
        Id = 0,
        ReclaimMarket = 1,
        EffectiveDate = 2,
        StatuteOfLimitationMonths = 3,
        QualifierType = 4,
        HasExceptions = 5,
        IsCurrentStatute = 6,
        Status = 7,
        StatuteOfLimitationDays = 8,
    }

    export enum GetListTaxCreditsQuery_TaxCreditsSortField {
        Id = 0,
        CountryOfResidence = 1,
        ReclaimMarket = 2,
        EffectiveDate = 3,
        StandardDividendRate = 4,
        StandardInterestRate = 5,
        HasExceptions = 6,
        IsCurrentTaxCredit = 7,
        Status = 8,
    }

    export enum GetListTreatiesQuery_TreatiesSortField {
        Id = 0,
        CountryOfResidence = 1,
        ReclaimMarket = 2,
        EffectiveDate = 3,
        StandardDividendRate = 4,
        StandardInterestRate = 5,
        HasExceptions = 6,
        IsCurrentTreaty = 7,
        Status = 8,
    }

    export enum GetNewsList_SortField {
        Id = 1,
        EffectiveDate = 2,
        ReclaimMarket = 3,
        Title = 4,
        Category = 5,
        SummaryText = 6,
        Status = 7,
    }

    export enum GetWhtRateList_SortField {
        Id = 1,
        EffectiveDate = 2,
        ReclaimMarket = 3,
        DividendRate = 4,
        InterestRate = 5,
        HasExceptions = 6,
        IsCurrentWhtRate = 7,
        Status = 8,
    }

    export enum GroupType {
        GoalAdroit = 1,
        Participant = 2,
        DownstreamSubscriber = 3,
        Client = 4,
        GoalTrm = 5,
    }

    export enum GroupsEnum {
        GoalAdroitAdmin = 1,
        GoalAdroitStandard = 2,
        GoalAdroitManager = 3,
        ParticipantAdmin = 4,
        ParticipantStandard = 5,
        ParticipantManager = 6,
        DownstreamSubscriberAdmin = 7,
        DownstreamSubscriberStandard = 8,
        DownstreamSubscriberManager = 9,
        GoalTrmAdmin = 10,
        GoalTrmUser = 11,
        TrmReadOnlyUser = 12,
    }

    export enum ListEntitiesAwaitingVerificationQuery_ListAwaitingVerificationSortField {
        Id = 0,
        EntityType = 1,
        ReclaimMarket = 2,
        EffectiveDate = 3,
        CountryOfResidence = 4,
        ChangedBy = 5,
    }

    export enum ListEventsQuery_SortField {
        Id = 1,
        Cusip = 2,
        CountryOfIssuance = 3,
        Issuer = 4,
        EventType = 5,
        BNum = 6,
        AdrRecordDate = 7,
        FinalAdrPayDate = 8,
        EventStatus = 9,
        RoundFilingType = 10,
    }

    export enum ListPendingUserRegistrationsQuery_SortField {
        PtcDtcCode = 1,
        PtcName = 2,
        DsCode = 3,
        DsName = 4,
        Email = 5,
        UserRegsStatus = 6,
        UserRegsStatusSince = 7,
        Expires = 8,
        HasExpired = 9,
    }

    export enum TrmEntityStatus {
        Draft = 1,
        AwaitingVerification = 2,
        Published = 3,
    }

    export enum ParticipantPositionsForEventQuery_SortField {
        Code = 1,
        Name = 2,
        Postion = 3,
    }

    export enum ParticipantSortField {
        Id = 0,
        Name = 1,
        DtcCode = 2,
        CountryLookup = 3,
        ParentName = 4,
        ParentCode = 5,
        ParentId = 6,
    }

    export enum ReconciliationDecision {
        Adroit = 1,
        Dtcc = 2,
    }

    export enum EventType {
        CashOption = 0,
        StockOption = 1,
        CashAndStockOption = 2,
    }

    export enum SearchReportsQuery_SortField {
        ReportId = 1,
        ReportType = 2,
        Description = 3,
        RequestedOn = 4,
        ExpiryDate = 5,
        ReportStatus = 6,
    }

    export enum GetUserPermissionsQuery_GroupType {
        Goal = 1,
        Participant = 2,
        DownstreamSubscriber = 3,
        Trm = 4,
    }

    export enum WhtRateExceptionType {
        Treaty = 1,
        Exempt = 2,
        Reclaim = 3,
    }

    export enum IncomeType {
        Dividend = 1,
        Interest = 2,
    }

    export enum StaticFileConentKey {
        UserGuide = 1,
        DSUserGuide = 2,
    }

    export enum TreatyType {
        DoubleTaxation = 1,
        Protocol = 2,
    }

    export enum TreatyExceptionType {
        Standard = 1,
        Exemption = 2,
        Attestation = 3,
    }

    export enum StatuteQualifierType {
        FromPayDate = 1,
        FromDateAfterPayDate = 2,
    }

    export enum ReportStatus {
        Pending = 1,
        Complete = 2,
    }

    export enum UserRegStatus {
        PendingRegistration = 1,
        PendingEmailConfirmation = 2,
        PendingParticipantVerification = 3,
        PendingGoalVerification = 4,
        Completed = 5,
        PendingDownstreamSubscriberVerification = 6,
    }

    export enum EventAuditQuery_ChangeType {
        Creation = 1,
        Update = 2,
        Deletion = 3,
    }

    export enum EventAuditQuery_ChangeArea {
        GeneralInfo = 1,
        RoundsAndCategories = 2,
    }

    export enum BatchClaimStatus {
        InPreparation = 1,
        Submitting = 2,
        Submitted = 3,
        Canceled = 4,
        Rejected = 5,
        InProcess = 6,
        Filed = 7,
        Failed = 8
    }

    export enum BatchClaimDocumentStatus {
        NoDocsRequired = 1,
        DocsGenerationInProgress = 2,
        DocsImportInProgress = 3,
        DocsImported = 4,
        Error = 5,
        AnalysingDocReqs = 6,
    }

    export enum BatchClaimEntrystage {
        Creation = 10,
        CategoryElection = 20,
        AddBeneficialOwnersManualEntry = 30,
        AddBeneficialOwnersUpload = 40,
        UploadInProgress = 44,
        UploadFailed = 45,
        Preview = 50,
        Submission = 60,
        Completed = 70,
    }

    export enum BatchClaimDocumentErrorType {
        UnknownError = 0,
        TemplateNotFound = 1,
        TemplateNotGiven = 2,
        TemplateInvalid = 3,
        InvalidAccessKey = 4,
        NetworkError = 5,
        InvalidJson = 6,
        UnexpectedAdroitError = 7,
        QueueTimeout = 8,
        QueueFull = 9,
    }

    export enum StaticContentKey {
        BatchClaimTerms = 1,
        BatchClaimTerms_DepositoryBnym = 2,
        BatchClaimTerms_DepositoryCb = 3,
        BatchClaimTerms_DepositoryDb = 4,
        BatchClaimTerms_DepositoryJpm = 5,
        Disclaimer = 6,
        PrivacyPolicy = 7,
        SdnUploadDescription = 8,
        TermsAndConditions = 9,
    }

    export enum UsersQuery_SortField {
        Id = 1,
        Email = 2,
        FirstName = 3,
        LastName = 4,
        HasGoalAccess = 5,
        Active = 6,
        ChangeEmailRequestPending = 7,
        LastLoginDate = 8,
    }


    ///************* Dtos *****************

    export interface AnnouncementDto {
        content: string;
    }

    export interface BalanceSheetDto {
        eventId: number;
        announcementName: string;
        announcementSender: string;
        announcementDate: Date;
        announcementIdentifier: number;
        uniqueUniversalEventIdentifier: string;
        ratioAdr: number;
        ratioOrd: number;
        adrTotal: number;
        ordTotal: number;
        counterparties: BalanceSheetCounterpartyDto[];
    }

    export interface BalanceSheetCounterpartyDto {
        id: number;
        name: string;
        typeName: string;
        type: CounterpartyType;
        adrs: number;
        ords: number;
    }

    export interface BeneficialOwnerCommentDto {
        comment: string;
    }

    export interface BeneficialOwnerDocumentsDto {
        id: number;
        documentStaticId: number;
        documentName: string;
        systemGeneratedForm: boolean;
        physicalRequired: boolean;
        comments: string;
    }

    export interface BeneficialOwnerIsPossibleDuplicateDto {
        isPossibleDuplicate: boolean;
    }

    export interface BeneficialOwnerSearchQuery {
        sort: SortExpression<BeneficialOwnerSortField>;
        uiFilters: FilterExpression<BeneficialOwnerSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface FilterValue {
        type: FilterType;
        options: string[];
        isOr: boolean;
    }

    export interface BenownerCreateDto {
        batchClaimId: number;
        familyName: string;
        givenNames: string;
        taxIdNumber: string;
        foreignTaxId: string;
        underlyingHolders: string;
        sharePercentage: number;
        dateOfBirth: Date;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        city: string;
        stateProvince: string;
        zip: string;
        countryOfResidence: CountrySummaryDto;
        entityType: EntityTypeSummaryDto;
        category: EventRoundCategorySummaryDto;
        adrPosition: number;
        custodyAccountNumber: string;
        participantUniqueId: string;
        nameOfQi: string;
        contactInformation: string;
        v2orV3: string;
    }

    export interface CountrySummaryDto {
        id: number;
        countryName: string;
        countryCode: string;
    }

    export interface EntityTypeSummaryDto {
        id: number;
        description: string;
        name: string;
    }

    export interface EventRoundCategorySummaryDto {
        id: number;
        description: string;
        displayName: string;
    }

    export interface BenownerUpdateDto {
        id: number;
        batchClaimId: number;
        familyName: string;
        givenNames: string;
        taxIdNumber: string;
        foreignTaxId: string;
        underlyingHolders: string;
        sharePercentage: number;
        dateOfBirth: Date;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        city: string;
        stateProvince: string;
        zip: string;
        countryOfResidence: CountrySummaryDto;
        entityType: EntityTypeSummaryDto;
        category: EventRoundCategorySummaryDto;
        adrPosition: number;
        custodyAccountNumber: string;
        participantUniqueId: string;
        nameOfQi: string;
        contactInformation: string;
        v2orV3: string;
    }

    export interface BenownerUpdateStatusByIdsDto {
        benownerIds: number[];
        benownerClaimStatusId: BeneficialOwnerClaimStatus;
        benownerClaimStatusComment: string;
    }

    export interface BenownerUpdateStatusInClaimDto {
        claimId: number;
        fromStatusIds: BeneficialOwnerClaimStatus[];
        toStatusId: BeneficialOwnerClaimStatus;
        benownerClaimStatusComment: string;
    }

    export interface BulkClaimDto {
        numberOfEvents: number;
        createdBy: number;
        id: number;
        dtcCode: string;
        participantName: string;
        participantId: number;
        reference: string;
        countryOfIssuance: CountrySummaryDto;
        date: Date;
        roundType: FilingMethod;
        status: BulkClaimStatus;
        roundTypeName: string;
        bulkClaimStatusName: string;
    }

    export interface CategoryDto {
        notes: string;
        rules: DocumentRuleDto[];
        createdBy: string;
        createdOn: Date;
        lastUpdatedBy: string;
        lastUpdatedOn: Date;
        id: number;
        countryOfIssuance: CountrySummaryDto;
        filingMethod: FilingMethodDto;
        description: string;
        reclaimRate: number;
        whtRate: number;
    }

    export interface DocumentRuleDto {
        id: number;
        countries: CountrySummaryDto[];
        entities: EntityTypeSummaryDto[];
        documents: DocumentSummaryDto[];
    }

    export interface DocumentSummaryDto {
        id: number;
        documentName: string;
        documentAppliesToId: DocumentAppliesLevel;
        systemGeneratedForm: boolean;
    }

    export interface FilingMethodDto {
        id: number;
        name: string;
    }

    export interface CategoryPositionDto {
        categoryId: number;
        categoryName: string;
        adrPosition: number;
        beneficialOwnerCount: number;
        hasCategoryAdrs: boolean;
        electionStatus: BeneficialOwnerClaimStatus;
        electionStatusName: string;
    }

    export interface CategorySearchQuery {
        sort: SortExpression<CategorySortField>;
        uiFilters: FilterExpression<CategorySortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface ChangeEventStatusDto {
        comment: string;
        eventStatus: EventStatusLookup_Status;
    }

    export interface ChangePasswordDto {
        currentPassword: string;
        newPassword: string;
        newPasswordCheck: string;
    }

    export interface CheckOutstandingEditsQuery {
        checkWht: boolean;
        checkTreaty: boolean;
        checkTaxCredit: boolean;
        checkStatute: boolean;
        checkNews: boolean;
        includeDraft: boolean;
        includeAwaitingVerification: boolean;
        reclaimMarketId: number;
        countryOfResidenceId: number;
    }

    export interface CreateClaimDto {
        eventId: number;
        roundId: number;
        participantId: number;
    }

    export interface CreateEmailChangeRequestDto {
        userId: number;
        newEmail: string;
    }

    export interface DeleteParticipantPositionsDto {
        eventId: number;
        participantId: number;
        changeReason: string;
        changeAuthoriser: string;
    }

    export interface DocumentStaticDataDto {
        documentTemplate: DocumentTemplateDto;
        isUsed: boolean;
        canEditAllFields: boolean;
        lastUpdatedBy: string;
        lastUpdatedOn: Date;
        id: number;
        documentTitle: string;
        status: DocumentStaticDataStatus;
        statusName: string;
        physicalRequired: boolean;
        countryOfIssuance: CountrySummaryDto;
        appliesTo: DocumentAppliesLevel;
        appliesToName: string;
        systemGeneratedForm: boolean;
        createdOn: Date;
        createdBy: string;
    }

    export interface DocumentTemplateDto {
        name: string;
    }

    export interface DocumentStaticDataSearchQuery {
        status: DocumentStaticDataStatus;
        countryOfIssuanceId: number;
        sort: SortExpression<DocumentStaticDataSortField>;
        uiFilters: FilterExpression<DocumentStaticDataSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface EmailChangeRequestDto {
        id: number;
        userId: number;
        requestedBy: string;
        requestedOn: Date;
        newEmail: string;
        approved: boolean;
        verifiedBy: string;
        verifiedOn: Date;
        reason: string;
    }

    export interface EventDto {
        sponsored: boolean;
        issuerAddressLine1: string;
        issuerAddressLine2: string;
        issuerAddressLine3: string;
        issuerAddressLine4: string;
        custodian: string;
        statutoryWhtRate: number;
        ordRecordDate: Date;
        approxOrdPayDate: Date;
        finalOrdPayDate: Date;
        approxAdrGrossDivRate: number;
        approxOrdGrossDivRate: number;
        approxOrdGrossDivCurr: CurrencySummaryDto;
        finalAdrGrossDivRate: number;
        finalOrdGrossDivRate: number;
        finalOrdGrossDivCurr: CurrencySummaryDto;
        approxFxRate: number;
        finalFxRate: number;
        publicationDate: Date;
        importantNoticeLastUploaded: Date;
        importantNoticeLastByName: string;
        isin: string;
        exDate: Date;
        madeLiveOn: Date;
        madeLiveBy: string;
        createdBy: string;
        createdOn: Date;
        hasRounds: boolean;
        balanceSheetUploaded: boolean;
        approxAdrPayDate: Date;
        finalAdrPayDate: Date;
        ratioAdr: number;
        ratioOrd: number;
        depositoryDb: boolean;
        depositoryCb: boolean;
        depositoryBnym: boolean;
        depositoryJpm: boolean;
        id: number;
        countryofIssuance: CountrySummaryDto;
        cusip: string;
        issuer: string;
        eventType: EventTypeDto;
        bNum: string;
        adrRecordDate: Date;
        status: EventStatusLookup_Status;
        statusName: string;
        hasImportantNotice: boolean;
        securityType: SecurityType;
        securityTypeName: string;
    }

    export interface CurrencySummaryDto {
        id: number;
        name: string;
        code: string;
    }

    export interface EventTypeDto {
        id: number;
        name: string;
        code: string;
    }

    export interface GetAllBatchClaimsQuery {
        uISort: SortExpression<GetAllBatchClaimsQuery_SortField>;
        uiFilters: FilterExpression<GetAllBatchClaimsQuery_SortField>[];
        getParticipantDownstreamSubscribers: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery {
        eventId: number;
        participantId: number;
        uISort: SortExpression<GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField>;
        uiFilters: FilterExpression<GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetAllEventRoundCategoriesForRoundQuery {
        roundId: number;
    }

    export interface GetAvailableEventDatesForCountryQuery {
        countryId: number;
        filingMethod: FilingMethod;
    }

    export interface GetAvailableEventsListQuery {
        countryOfIssuanceId: number;
        eventAdrDate: Date;
        filingMethod: FilingMethod;
    }

    export interface GetBatchClaimBenOwnersQuery {
        id: number;
        sort: SortExpression<BeneficialOwnerSortField>;
        uiFilters: FilterExpression<BeneficialOwnerSortField>[];
    }

    export interface GetBulkRatesForCountriesPublicQuery {
        bulkRates: BulkRate[];
    }

    export interface BulkRate {
        correlationId: number;
        success: boolean;
        reclaimMarket: string;
        countryOfResidence: string;
        date: string;
        entityType: string;
        stockType: string;
    }

    export interface GetClaimedAdrPositionSummaryQuery {
        eventId: number;
        participantId: number;
        includeInPrepClaim: number;
        includeInPreparationClaims: boolean;
    }

    export interface GetEventCountriesForAdrRecordDateQuery {
        date: Date;
        depositoryJpm: boolean;
        depositoryBnym: boolean;
        depositoryCB: boolean;
        depositoryDB: boolean;
    }

    export interface GetEventDtcElectionsForParticipantQuery {
        eventId: number;
        dSId: number;
    }

    export interface GetEventRoundReconciliationReportQuery {
        eventRoundId: number;
        showUnmatchedParticipants: boolean;
        sort: SortExpression<GetEventRoundReconciliationReportQuery_ReconciliationSortField>;
        uiFilters: FilterExpression<GetEventRoundReconciliationReportQuery_ReconciliationSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListBatchClaimValidationErrorsQuery {
        batchClaimId: number;
        sort: SortExpression<GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField>;
        uiFilters: FilterExpression<GetListBatchClaimValidationErrorsQuery_BatchClaimValidationErrorSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListBulkClaimsQuery {
        sort: SortExpression<GetListBulkClaimsQuery_BulkClaimSortField>;
        uiFilters: FilterExpression<GetListBulkClaimsQuery_BulkClaimSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListBulkClaimValidationErrorsQuery {
        bulkClaimId: number;
        sort: SortExpression<GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField>;
        uiFilters: FilterExpression<GetListBulkClaimValidationErrorsQuery_BulkClaimValidationErrorSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListEventRoundsQuery {
        sort: SortExpression<GetListEventRoundsQuery_SortField>;
        uiFilters: FilterExpression<GetListEventRoundsQuery_SortField>[];
        filingMethod: FilingMethod;
        eventId: number;
        liveEventsOnly: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListStatutesQuery {
        sort: SortExpression<GetListStatutesQuery_StatutesSortField>;
        uiFilters: FilterExpression<GetListStatutesQuery_StatutesSortField>[];
        showLiveRecords: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListTaxCreditsQuery {
        sort: SortExpression<GetListTaxCreditsQuery_TaxCreditsSortField>;
        uiFilters: FilterExpression<GetListTaxCreditsQuery_TaxCreditsSortField>[];
        showLive: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetListTreatiesQuery {
        sort: SortExpression<GetListTreatiesQuery_TreatiesSortField>;
        uiFilters: FilterExpression<GetListTreatiesQuery_TreatiesSortField>[];
        showLiveRecords: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetNewsList {
        sort: SortExpression<GetNewsList_SortField>;
        uiFilters: FilterExpression<GetNewsList_SortField>[];
        showLiveNews: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GetRatesForCountriesPublicQuery {
        reclaimMarket: string;
        countryOfResidence: string;
        date: string;
        entityType: string;
        stockType: string;
    }

    export interface GetRatesForCountriesQuery {
        reclaimMarketId: number;
        countryOfResidenceId: number;
        date: Date;
        entityTypes: number[];
        stockTypes: number[];
    }

    export interface GetWhtRateList {
        sort: SortExpression<GetWhtRateList_SortField>;
        uiFilters: FilterExpression<GetWhtRateList_SortField>[];
        showLiveWhtRates: boolean;
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface GoalUserInvitationsDto {
        groupType: GroupType;
        emails: string[];
        requestedGoalGroup: GroupsEnum;
    }

    export interface ListEntitiesAwaitingVerificationQuery {
        sort: SortExpression<ListEntitiesAwaitingVerificationQuery_ListAwaitingVerificationSortField>;
        uiFilters: FilterExpression<ListEntitiesAwaitingVerificationQuery_ListAwaitingVerificationSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface ListEventsQuery {
        statusFilters: EventStatusLookup_Status[];
        sort: SortExpression<ListEventsQuery_SortField>;
        uiFilters: FilterExpression<ListEventsQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface ListPendingUserRegistrationsQuery {
        sort: SortExpression<ListPendingUserRegistrationsQuery_SortField>;
        uiFilters: FilterExpression<ListPendingUserRegistrationsQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface NewsDto {
        sources: NewsSourceDto[];
        newsContent: string;
        currentPublishedVersionId: number;
        currentAwaitingVerificationVersionId: number;
        id: number;
        effectiveDate: Date;
        reclaimMarket: CountrySummaryDto;
        title: string;
        category: string;
        summaryText: string;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface NewsSourceDto {
        id: number;
        name: string;
        date: Date;
        source: string;
    }

    export interface ParticipantDto {
        parent: ParticipantSummaryDto;
        address1: string;
        address2: string;
        address3: string;
        city: string;
        state: string;
        postCode: string;
        country: CountrySummaryDto;
        contactName: string;
        contactEmail: string;
        telephoneNumber: string;
        userSupplied: boolean;
        notificationGroup: string[];
        parentNotificationGroup: string[];
        createdBy: string;
        createdOn: Date;
        lastUpdatedBy: string;
        lastUpdatedOn: Date;
        hasUsers: boolean;
        hasBatchClaims: boolean;
        hasPositions: boolean;
        canViewDetails: boolean;
        canManageClaims: boolean;
        canCancelClaims: boolean;
        isRegisteredShareholder: boolean;
        hasDownstreamSubscribers: boolean;
        id: number;
        dtcCode: string;
        name: string;
    }

    export interface ParticipantSummaryDto {
        id: number;
        dtcCode: string;
        name: string;
    }

    export interface ParticipantPositionsClaimedApprovedForEventQuery {
        eventId: number;
        showDS: boolean;
    }

    export interface ParticipantPositionsForEventQuery {
        eventId: number;
        participantId: number;
        sort: SortExpression<ParticipantPositionsForEventQuery_SortField>;
        uiFilters: FilterExpression<ParticipantPositionsForEventQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface ParticipantsListQuery {
        includeParticipants: boolean;
        includeDownstreamSubscribers: boolean;
        sort: SortExpression<ParticipantSortField>;
        uiFilters: FilterExpression<ParticipantSortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface PrepareInviteDto {
        contactNumber: string;
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        securityQuestion: SecurityQuestionDto;
        securityAnswer: string;
    }

    export interface SecurityQuestionDto {
        id: number;
        questionText: string;
    }

    export interface QueueBnymElectionBreakdownDto {
        adrRecordDate: Date;
        countryOfIssuance: CountrySummaryDto;
    }

    export interface QueueBnymFinalOfacReportCommand {
        roundId: number;
    }

    export interface QueueBnymYearlyReclaimReportCommand {
        year: number;
    }

    export interface QueueBOExportCommand {
        batchClaimId: number;
    }

    export interface QueueClientMatrixExportDto {
        startDate: Date;
    }

    export interface QueueDWTReportCommand {
        eventId: number;
    }

    export interface QueueJpmDrwinReportCommand {
    }

    export interface QueueLatestNewsExportCommand {
        startDate: Date;
    }

    export interface QueueRpaChangeReportCommand {
        eventRoundId: number;
    }

    export interface QueueRpaReportDto {
        roundId: number;
    }

    export interface ReconciliationRecordDto {
        id: number;
        participantName: string;
        participantCode: string;
        categoryName: string;
        dtccQuantity: number;
        adroitQuantity: number;
        decision: ReconciliationDecision;
        decisionName: string;
    }

    export interface ResetClaimFilingMethodDto {
        claimId: number;
        roundId: number;
        skipSettingToNextState: boolean;
    }

    export interface RoundCategoryDto {
        id: number;
        categoryType: EventType;
        description: string;
        reclaimRatePercentage: number;
        whtRatePercentage: number;
        hasCategoryAdrs: boolean;
        includeInAdrLimit: boolean;
        eventRoundId: number;
        documentRules: DocumentRuleDto[];
        reclaimFee: number;
        depositaryBankPercent: number;
        taxReliefFeeRate: number;
    }

    export interface RoundDto {
        dtccSupported: boolean;
        payingAgent: string;
        paymentMethod: PaymentMethodDto;
        minimumCharge: number;
        expectedPaymentPeriod: number;
        hasCategories: boolean;
        reconciliationRun: boolean;
        reconciliationRunDate: Date;
        hasReconciliationItems: boolean;
        reconciliationComplete: boolean;
        ofacExportedAt: Date;
        adrOrdRatioRounding: boolean;
        ofacExportedBy: string;
        fxRate: number;
        custodialFeeAmountCurrency: number;
        taxReliefFeeRate: number;
        id: number;
        roundType: EventType;
        eventId: number;
        name: string;
        filingMethod: FilingMethodDto;
        start: Date;
        caWebDeadline: Date;
        claimSubmissionDeadline: Date;
        isAvailiable: boolean;
        isLocked: boolean;
    }

    export interface PaymentMethodDto {
        id: number;
        name: string;
    }

    export interface SdnDto {
        uploadedOn: Date;
        uploadedByName: string;
        uploadedFileName: string;
        publishDate: string;
        recordCount: string;
    }

    export interface SearchReportsQuery {
        uISort: SortExpression<SearchReportsQuery_SortField>;
        uiFilters: FilterExpression<SearchReportsQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface SetSecurityQuestionDto {
        question: SecurityQuestionDto;
        answer: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface DocumentStaticDataSummaryDto {
        id: number;
        documentTitle: string;
        status: DocumentStaticDataStatus;
        statusName: string;
        physicalRequired: boolean;
        countryOfIssuance: CountrySummaryDto;
        appliesTo: DocumentAppliesLevel;
        appliesToName: string;
        systemGeneratedForm: boolean;
        createdOn: Date;
        createdBy: string;
    }

    export interface DocumentCategorySummaryDto {
        id: number;
        description: string;
    }

    export interface ParticipantEventInfoDto {
        countryOfIssuance: CountrySummaryDto;
        details: EventInfoDto[];
    }

    export interface EventInfoDto {
        cusip: string;
        issuer: string;
    }

    export interface UserPermissionsDto {
        groupId: number;
        groupName: string;
        groupCode: string;
        groupFullTitle: string;
        roles: GroupsEnum[];
        groupType: GetUserPermissionsQuery_GroupType;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface UserSummaryDto {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        hasGoalAccess: boolean;
        active: boolean;
        changeEmailRequestPending: boolean;
        lastLoginDate: Date;
    }

    export interface UserDetailsDto {
        telephoneNumber: string;
        locked: boolean;
        statusChangedDate: Date;
        isFederated: boolean;
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        hasGoalAccess: boolean;
        active: boolean;
        changeEmailRequestPending: boolean;
        lastLoginDate: Date;
    }

    export interface UserBySSOKeyQuery_Result {
        id: number;
        email: string;
        roles: GroupsEnum[];
        groupTypes: UserBySSOKeyQuery_ResultGroup[];
        permissions: string[];
        firstName: string;
        lastName: string;
        contactNumber: string;
        isFederated: boolean;
    }

    export interface UserBySSOKeyQuery_ResultGroup {
        id: number;
        type: GroupType;
        participantId: number;
        trmCountryId: number;
        participantName: string;
        participantDTCCode: string;
        dSId: number;
        dsName: string;
        dSCode: string;
        isCurrent: boolean;
    }

    export interface WhtRateDto {
        narative: string;
        exceptions: WhtRateExceptionDto[];
        currentPublishedVersionId: number;
        currentAwaitingVerificationVersionId: number;
        id: number;
        effectiveDate: Date;
        reclaimMarket: CountrySummaryDto;
        dividendRate: number;
        interestRate: number;
        hasExceptions: boolean;
        isCurrentWhtRate: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface WhtRateExceptionDto {
        id: number;
        rate: number;
        reclaimRate: number;
        narative: string;
        exceptionType: WhtRateExceptionType;
        exceptionTypeName: string;
        countries: CountrySummaryDto[];
        entityTypes: EntityTypeSummaryDto[];
        stockTypes: StockTypeDto[];
    }

    export interface StockTypeDto {
        id: number;
        reference: string;
        name: string;
        incomeType: IncomeType;
        incomeTypeName: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface WhtRateSummaryDto {
        id: number;
        effectiveDate: Date;
        reclaimMarket: CountrySummaryDto;
        dividendRate: number;
        interestRate: number;
        hasExceptions: boolean;
        isCurrentWhtRate: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface WhtRateAuditDto {
        changeById: number;
        changeByName: string;
        changedOn: Date;
    }

    export interface StaticFileContentDto {
        key: StaticFileConentKey;
        name: string;
        contentType: string;
        lastUploaded: Date;
        lastUploadedBy: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface ParticipantListSummaryDto {
        countryName: string;
        parent: ParticipantSummaryDto;
        id: number;
        dtcCode: string;
        name: string;
    }

    export interface CountriesBulkRatesDto {
        rates: CountriesBulkRateDto[];
    }

    export interface CountriesBulkRateDto {
        correlationId: number;
        result: string;
        withholdingRate: number;
        treatyRate: number;
        reclaimableRate: number;
        reclaimMarketUsesNetRate: boolean;
        reclaimExpirationDate: Date;
        attestationTreatyRate: number;
        attestationReclaimableRate: number;
        exemptionTreatyRate: number;
        exemptionReclaimableRate: number;
    }

    export interface CountriesRateDto {
        effectiveDate: Date;
        reclaimMarket: string;
        reclaimMarketCode: string;
        countryOfResidence: string;
        countryOfResidenceCode: string;
        entityType: string;
        stockType: string;
        taxCredit: number;
        withholdingRate: number;
        treatyRate: number;
        reclaimableRate: number;
        reclaimMarketUsesNetRate: boolean;
        reclaimStartDate: Date;
        reclaimExpirationDate: Date;
        attestationTreatyRate: number;
        attestationReclaimableRate: number;
        exemptionTreatyRate: number;
        exemptionReclaimableRate: number;
        exemptionWithholdingRate: number;
    }

    export interface AwaitingVerificationDto {
        id: number;
        entityType: string;
        reclaimMarket: CountrySummaryDto;
        effectiveDate: Date;
        countryOfResidence: CountrySummaryDto;
        changedBy: number;
        changedByName: string;
    }

    export interface TrmRateDto {
        effectiveDate: Date;
        reclaimMarket: CountrySummaryDto;
        countryOfResidence: CountrySummaryDto;
        entityTypeName: string;
        stockTypeName: string;
        stockTypeAdroitCode: string;
        taxCredit: number;
        withholdingRate: number;
        treatyRate: number;
        reclaimableRate: number;
        isAttestation: boolean;
        isExemption: boolean;
    }

    export interface TaxCreditDto {
        standardDividendRateNarrative: string;
        standardInterestRateNarrative: string;
        exceptions: TaxCreditExceptionDto[];
        currentPublishedVersionId: number;
        currentAwaitingVerificationVersionId: number;
        id: number;
        reclaimMarket: CountrySummaryDto;
        countryOfResidence: CountrySummaryDto;
        effectiveDate: Date;
        standardDividendRate: number;
        standardInterestRate: number;
        hasExceptions: boolean;
        status: TrmEntityStatus;
        statusName: string;
        isCurrentTaxCredit: boolean;
    }

    export interface TaxCreditExceptionDto {
        id: number;
        entityType: EntityTypeSummaryDto;
        stockType: StockTypeDto;
        rate: number;
        narrative: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface TaxCreditSummaryDto {
        id: number;
        reclaimMarket: CountrySummaryDto;
        countryOfResidence: CountrySummaryDto;
        effectiveDate: Date;
        standardDividendRate: number;
        standardInterestRate: number;
        hasExceptions: boolean;
        status: TrmEntityStatus;
        statusName: string;
        isCurrentTaxCredit: boolean;
    }

    export interface TaxCreditAuditDto {
        changeById: number;
        changeByName: string;
        changedOn: Date;
    }

    export interface TreatyDto {
        treatyType: TreatyType;
        treatyTypeName: string;
        signedDate: Date;
        approvedDate: Date;
        ratifiedDate: Date;
        inForceDate: Date;
        standardDividendRateNarrative: string;
        standardInterestRateNarrative: string;
        exceptions: TreatyExceptionDto[];
        currentPublishedVersionId: number;
        currentAwaitingVerificationVersionId: number;
        id: number;
        reclaimMarket: CountrySummaryDto;
        countryOfResidence: CountrySummaryDto;
        effectiveDate: Date;
        standardDividendRate: number;
        standardInterestRate: number;
        hasExceptions: boolean;
        isCurrentTreaty: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface TreatyExceptionDto {
        id: number;
        entityType: EntityTypeSummaryDto;
        stockType: StockTypeDto;
        exceptionType: TreatyExceptionType;
        exceptionTypeName: string;
        rate: number;
        narrative: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface TreatySummaryDto {
        id: number;
        reclaimMarket: CountrySummaryDto;
        countryOfResidence: CountrySummaryDto;
        effectiveDate: Date;
        standardDividendRate: number;
        standardInterestRate: number;
        hasExceptions: boolean;
        isCurrentTreaty: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface TreatyAuditDto {
        changeById: number;
        changeByName: string;
        changedOn: Date;
    }

    export interface StatuteDto {
        qualifierMonth: number;
        qualifierDay: number;
        exceptions: StatuteExceptionDto[];
        currentPublishedVersionId: number;
        currentAwaitingVerificationVersionId: number;
        id: number;
        reclaimMarket: CountrySummaryDto;
        effectiveDate: Date;
        statuteOfLimitationsMonths: number;
        statuteOfLimitationsDays: number;
        qualifierType: StatuteQualifierType;
        qualifierTypeName: string;
        hasExceptions: boolean;
        isCurrentStatute: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface StatuteExceptionDto {
        id: number;
        countryOfResidence: CountrySummaryDto;
        statuteOfLimitationsMonths: number;
        statuteOfLimitationsDays: number;
        qualifierType: StatuteQualifierType;
        qualifierTypeName: string;
        qualifierMonth: number;
        qualifierDay: number;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface StatuteSummaryDto {
        id: number;
        reclaimMarket: CountrySummaryDto;
        effectiveDate: Date;
        statuteOfLimitationsMonths: number;
        statuteOfLimitationsDays: number;
        qualifierType: StatuteQualifierType;
        qualifierTypeName: string;
        hasExceptions: boolean;
        isCurrentStatute: boolean;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface StatuteAuditDto {
        changeById: number;
        changeByName: string;
        changedOn: Date;
    }

    export interface SecurityTypeDto {
        id: number;
        name: string;
        code: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface ReportDto {
        id: number;
        description: string;
        type: string;
        statusId: ReportStatus;
        status: string;
        requestedBy: string;
        requestedOn: Date;
        expires: Date;
        generatedFiles: GeneratedFileDto[];
    }

    export interface GeneratedFileDto {
        id: number;
        name: string;
        displayName: string;
    }

    export interface EnumDisplayDto {
        value: number;
        label: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface RoundSummaryDto {
        id: number;
        roundType: EventType;
        eventId: number;
        name: string;
        filingMethod: FilingMethodDto;
        start: Date;
        caWebDeadline: Date;
        claimSubmissionDeadline: Date;
        isAvailiable: boolean;
        isLocked: boolean;
    }

    export interface EventRoundBalanceInformationDto {
        adroitAdrTotal: number;
        adroitOrdTotal: number;
        custodianAdrTotal: number;
        custodianOrdTotal: number;
    }

    export interface EventRoundLastClaimCreatedDto {
        lastCreatedDate: Date;
    }

    export interface RoundCategorySummaryDto {
        id: number;
        categoryType: EventType;
        description: string;
        reclaimRatePercentage: number;
        whtRatePercentage: number;
        hasCategoryAdrs: boolean;
        includeInAdrLimit: boolean;
        hasGeneratedBatchClaimDocs: boolean;
        hasGeneratedEntityGroupDocs: boolean;
        reclaimFee: number;
        depositaryBankPercent: number;
        taxReliefFeeRate: number;
    }

    export interface RoundCategoryPermissionsDto {
        canEditCategory: boolean;
        canEditCategoryRules: boolean;
        canEditCategoryRates: boolean;
        canDeleteCategory: boolean;
    }

    export interface MatchingSameRateCategoriesDto {
        adroitMatchingRateCategories: AdroitCategoryDescriptionDto[];
        dtcRateCategories: DtcCategoryDescriptionDto[];
    }

    export interface AdroitCategoryDescriptionDto {
        id: number;
        whtRate: number;
        description: string;
        dtcDescription: string;
    }

    export interface DtcCategoryDescriptionDto {
        whtRate: number;
        dtcDescription: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface ParticipantPositionDto {
        id: number;
        participantId: number;
        dtcCode: string;
        name: string;
        adrPosition: number;
    }

    export interface ParticipantClaimedApprovedPositionsDto {
        id: number;
        claimedPosition: number;
        approvedPosition: number;
        allocatedPosition: number;
        totalPosition: number;
    }

    export interface ParticipantAuditDto {
        lastChangedByUser: string;
        lastUpdatedOn: Date;
        updateReason: string;
        updateAuthoriser: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface NewsSummaryDto {
        id: number;
        effectiveDate: Date;
        reclaimMarket: CountrySummaryDto;
        title: string;
        category: string;
        summaryText: string;
        status: TrmEntityStatus;
        statusName: string;
    }

    export interface NewsAuditDto {
        changeById: number;
        changeByName: string;
        changedOn: Date;
    }

    export interface JpmElectionSheetSummaryDto {
        roundId: number;
        downloaded: boolean;
        sent: boolean;
        downloadedAt: Date;
        downloadedBy: string;
        sentAt: Date;
        sentBy: string;
        lastUpdatedBy: string;
        lastUpdatedAt: Date;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface UserRegistrationSummaryDto {
        id: number;
        ptcDtcCode: string;
        ptcName: string;
        dsCode: string;
        dsName: string;
        email: string;
        userRegStatus: UserRegStatus;
        userRegStatusName: string;
        userRegStatusSince: Date;
        expires: Date;
        hasExpired: boolean;
    }

    export interface UserRegistrationDetailsDto {
        isValidLink: boolean;
        isExistingUser: boolean;
        isFederatedUser: boolean;
        isExpiredLink: boolean;
        email: string;
        termsAndConditions: boolean;
        privacyAndLegalInformation: boolean;
        firstName: string;
        surname: string;
        contactNumber: string;
        password: string;
        passwordCheck: string;
        uniqueIdentifier: string;
        requestedParticipantId: number;
        participant: ParticipantSummaryDto;
        downstreamSubscriber: DownstreamSubscriberSummaryDto;
        currentStatus: UserRegStatus;
        currentStatusName: string;
    }

    export interface DownstreamSubscriberSummaryDto {
        countryName: string;
        parent: ParticipantSummaryDto;
        id: number;
        dtcCode: string;
        name: string;
    }

    export interface UserVerificationDetailsDto {
        id: number;
        invitedUser: UserVerificationDetailsUserDto;
        emailInvited: string;
        invitedById: number;
        invitedByName: string;
        ptcVerifiedById: number;
        ptcVerifiedByName: string;
        goalVerifiedById: number;
        goalVerifiedByName: string;
        participant: ParticipantSummaryDto;
        downstreamSubscriber: DownstreamSubscriberSummaryDto;
        invitedOn: Date;
        ptcVerifiedOn: Date;
        goalVerifiedOn: Date;
        currentStatus: UserRegStatus;
        currentStatusName: string;
        lastUpdated: Date;
        expiresOn: Date;
        requestedGroupType: GroupsEnum;
    }

    export interface UserVerificationDetailsUserDto {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        telephoneNumber: string;
    }

    export interface HealthCheckDto {
        isSuccessful: boolean;
        canConnectToOktaApi: boolean;
        canConnectToDocmosis: boolean;
        canReadDocumentGenerationStorage: boolean;
        canConnectToDatabase: boolean;
        canReadSftpFileStorage: boolean;
        canReadTemporaryFileStorage: boolean;
        canReadPermanentFileStorage: boolean;
    }

    export interface IFeatureFlags {
        automaticallyPushBulkClaimTemplates: boolean;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface EventWithRoundDetailsDto {
        eventRoundId: number;
        eventId: number;
        countryOfIssuance: CountrySummaryDto;
        cusip: string;
        roundStartDate: Date;
        roundEndDate: Date;
        adrRecordDate: Date;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface EventSummaryDto {
        id: number;
        countryofIssuance: CountrySummaryDto;
        cusip: string;
        issuer: string;
        eventType: EventTypeDto;
        bNum: string;
        adrRecordDate: Date;
        status: EventStatusLookup_Status;
        statusName: string;
        hasImportantNotice: boolean;
        securityType: SecurityType;
        securityTypeName: string;
    }

    export interface EventChangeDto {
        changedBy: string;
        changedAt: Date;
        changeType: EventAuditQuery_ChangeType;
        changedTypeName: string;
        changeArea: EventAuditQuery_ChangeArea;
        changeAreaName: string;
        roundName: string;
        changes: FieldChange[];
    }

    export interface FieldChange {
        name: string;
        oldValue: string;
        newValue: string;
    }

    export interface EventStatusDto {
        id: number;
        name: string;
    }

    export interface DtccReportSummaryDto {
        roundId: number;
        reportUploaded: boolean;
        uploadedBy: string;
        uploadedAt: Date;
    }

    export interface BatchClaimStatusDto {
        id: number;
        name: string;
    }

    export interface BatchClaimExportSummaryDto {
        issuer: string;
        bNumber: string;
        countryOfIssuance: string;
        cusipNumber: string;
        eventType: string;
        adrRecordDate: Date;
        adrPayDate: Date;
        batchClaimNumber: string;
        participantDTCNumber: string;
        participantName: string;
    }

    export interface ClaimBeneficialOwnerSummaryDto {
        claimId: number;
        status: ClaimBeneficialOwnerStatusSummaryDto[];
    }

    export interface ClaimBeneficialOwnerStatusSummaryDto {
        status: BeneficialOwnerClaimStatus;
        statusName: string;
        count: number;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface ListBatchClaimsDto {
        claimId: number;
        participantDtcCode: string;
        participantName: string;
        claimReference: string;
        countryOfIssuance: string;
        issuer: string;
        cusip: string;
        depositoryBnym: boolean;
        depositoryDb: boolean;
        depositoryCb: boolean;
        depositoryJpm: boolean;
        eventType: string;
        filingMethod: string;
        adrRecordDate: Date;
        numberOfBOs: number;
        numberOfAdrs: number;
        statusName: string;
        statusId: BatchClaimStatus;
        dsName: string;
        dsDtcCode: string;
        roundClosingDate: Date;
        canViewDetails: boolean;
        createdBy: number;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface ParticipantEventClaimSummaryDto {
        claimId: number;
        filingMethod: string;
        batchClaimNumber: string;
        adrClaimed: number;
        countOfBeneficalOwners: number;
        createdBy: string;
        status: string;
        statusId: BatchClaimStatus;
        submitedOn: Date;
        userCanCancel: boolean;
        userCanContinue: boolean;
        userCanViewDetails: boolean;
    }

    export interface ParticipantClaimedAdrPositionSummaryForEventDto {
        eventId: number;
        sprHasBeenDefined: boolean;
        sprRequired: boolean;
        maxPositions: number;
        unallocatedClaimed: number;
        allocatedClaimed: number;
        totalOpenPosition: number;
        claimedDSPosition: number;
        openDSPosition: number;
        hasUnallocatedCategories: boolean;
    }

    export interface FlattenedAllEventRoundCategoryInfoDto {
        categories: EventRoundCategorySummaryDto[];
        countries: CountrySummaryDto[];
        entityTypes: EntityTypeSummaryDto[];
    }

    export interface BatchClaimDocumentDto {
        id: number;
        fileName: string;
        systemGenerated: boolean;
        lastDownloadedAt: Date;
        lastDownloadedBy: string;
        uploadedAt: Date;
        uploadedBy: string;
    }

    export interface BatchClaimFileResultDto {
        fileName: string;
    }

    export interface ClaimDetailsDto {
        id: number;
        batchClaimReference: string;
        statusId: BatchClaimStatus;
        statusName: string;
        documentStatusId: BatchClaimDocumentStatus;
        documentStatusName: string;
        submittedById: number;
        submittedByName: string;
        submissionDate: Date;
        createdById: number;
        createdByName: string;
        beneficialOwnerCount: number;
        claimedADRPosition: number;
        claimedORDPosition: number;
        round: RoundSummaryDto;
        event: EventClaimSummaryDto;
        participant: ParticipantListSummaryDto;
        downstreamSubscriber: DownstreamSubscriberSummaryDto;
        includesDocumentGeneration: boolean;
        currentStage: BatchClaimEntrystage;
        categoryElectionsAvailable: boolean;
        beneficialOwnersAvailable: boolean;
        benOwnerEnteredInViaStep: BatchClaimEntrystage;
        canContinueClaim: boolean;
        canCancelClaim: boolean;
        canDeleteClaim: boolean;
    }

    export interface EventClaimSummaryDto {
        approxAdrPayDate: Date;
        finalAdrPayDate: Date;
        ratioAdr: number;
        ratioOrd: number;
        depositoryDb: boolean;
        depositoryCb: boolean;
        depositoryBnym: boolean;
        depositoryJpm: boolean;
        id: number;
        countryofIssuance: CountrySummaryDto;
        cusip: string;
        issuer: string;
        eventType: EventTypeDto;
        bNum: string;
        adrRecordDate: Date;
        status: EventStatusLookup_Status;
        statusName: string;
        hasImportantNotice: boolean;
        securityType: SecurityType;
        securityTypeName: string;
    }

    export interface BatchClaimSummaryDto {
        dtcDSName: string;
        dtcDSNumber: string;
        dtcParticipantName: string;
        dtcParticipantNumber: string;
        totalAdrPosition: number;
        totalOrdPosition: number;
        numberBoIncluded: number;
        changeByName: string;
    }

    export interface BatchClaimDocumentErrorDto {
        errorType: BatchClaimDocumentErrorType;
        failureId: string;
    }

    export interface BatchClaimDocumentTemplateErrorDto {
        errorType: BatchClaimDocumentErrorType;
        templatePath: string;
        templateField: string;
        documentTitle: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface BatchClaimValidationFailureDto {
        id: number;
        lineNumber: number;
        errorMessage: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface BeneficialOwnerSearchResultDto {
        id: number;
        firstNames: string;
        lastName: string;
        batchClaimReference: string;
        beneficialOwnerClaimId: string;
        category: string;
        categoryDisplayName: string;
        countryOfResidence: string;
        countryOfResidenceId: number;
        entityTypeId: number;
        entityTypeDescription: string;
        numAdrs: number;
        roundName: string;
        eventTypeId: number;
        eventTypeName: string;
        adrRecordDate: Date;
        possibleDuplicate: boolean;
        benificalOwnerStatusName: string;
        benificalOwnerStatusId: BeneficialOwnerClaimStatus;
        roundLocked: boolean;
        countryOfIssuance: string;
        countryOfIssuanceId: number;
        issuer: string;
        cusip: string;
        bNum: string;
        dtcCode: string;
        participantName: string;
        eventStatus: string;
        eventStatusId: EventStatusLookup_Status;
        dsName: string;
        dsDtcCode: string;
    }

    export interface BeneficialOwnerClaimTrailDto {
        user: string;
        action: string;
        comments: string;
        timeOfStatusChange: Date;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface CategorySummaryDto {
        countriesOfResidence: string;
        entityTypes: string;
        id: number;
        countryOfIssuance: CountrySummaryDto;
        filingMethod: FilingMethodDto;
        description: string;
        reclaimRate: number;
        whtRate: number;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface BulkClaimSummaryDto {
        id: number;
        dtcCode: string;
        participantName: string;
        participantId: number;
        reference: string;
        countryOfIssuance: CountrySummaryDto;
        date: Date;
        roundType: FilingMethod;
        status: BulkClaimStatus;
        roundTypeName: string;
        bulkClaimStatusName: string;
    }

    export interface BulkClaimUploadSummaryDto {
        batchClaimId: number;
        bNumber: string;
        cusip: string;
        numberOfAdrs: number;
        numberOfBeneficialOwners: number;
        batchClaimReferenceNumber: string;
        batchClaimStatus: BatchClaimStatus;
        batchClaimStatusName: string;
    }

    export interface BulkClaimUploadDetailsDto {
        eventId: number;
        bNumber: string;
        issuer: string;
        cusip: string;
        categories: BulkClaimUploadCategoryBreakdownDto[];
    }

    export interface BulkClaimUploadCategoryBreakdownDto {
        categoryName: string;
        numberOfAdrs: number;
        numberOfBeneficialOwners: number;
    }

    export interface BulkClaimDisclaimerDto {
        title: string;
        key: string;
        disclaimerContent: string;
        sortOrder: number;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface BulkClaimValidationFailureDto {
        id: number;
        eventId: number;
        eventCusip: string;
        lineNumber: number;
        errorMessage: string;
    }

    export interface BeneficialOwnerDetailsDto {
        id: number;
        batchClaimId: number;
        eventId: number;
        batchClaimNumber: string;
        benownerClaimReference: string;
        benOwnerClaimStatusId: BeneficialOwnerClaimStatus;
        benOwnerClaimStatusName: string;
        familyName: string;
        givenNames: string;
        dateOfBirth: Date;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        city: string;
        stateProvince: string;
        zip: string;
        taxIdNumber: string;
        foreignTaxId: string;
        underlyingHolders: string;
        sharePercentage: number;
        custodyAccountNumber: string;
        participantUniqueId: string;
        reclaimRate: number;
        adrPosition: number;
        countryOfResidence: CountrySummaryDto;
        eventAdrRecordDate: Date;
        eventIssuer: string;
        isPossibleDuplicate: boolean;
        roundLocked: boolean;
        entityType: EntityTypeSummaryDto;
        category: EventRoundCategorySummaryDto;
        nameOfQi: string;
        contactInformation: string;
        v2orV3: string;
    }

    export interface PagedResultDto<T> {
        pageSize: number;
        page: number;
        totalPages: number;
        count: number;
        totalCount: number;
        items: T[];
    }

    export interface BenownerClaimStatusDto {
        id: number;
        name: string;
    }

    export interface UpdateClaimDto {
        claimId: number;
        workflowStep: BatchClaimEntrystage;
    }

    export interface UpdateMatchingCategoriesDto {
        adroitMatchingRateCategories: AdroitCategoryDescriptionDto[];
    }

    export interface UpdateParticipantPositionsDto {
        eventId: number;
        participantId: number;
        changeReason: string;
        changeAuthoriser: string;
        positions: ParticipantPositionDto[];
    }

    export interface UserInvitationsDto {
        groupType: GroupType;
        participantId: number;
        emails: string[];
    }

    export interface UsersQuery {
        participantId: number;
        sort: SortExpression<UsersQuery_SortField>;
        uiFilters: FilterExpression<UsersQuery_SortField>[];
    }

    export interface SortExpression<T> {
        field: T;
        asscending: boolean;
    }

    export interface FilterExpression<T> {
        field: T;
        values: FilterValue[];
    }

    export interface ValidateCategoryRuleDto {
        countryIds: number[];
        entityIds: number[];
        countryOfIssuanceId: number;
        filingMethodId: number;
        currentCategoryId: number;
    }

    export interface ValidateRoundCategoryDto {
        countryIds: number[];
        entityIds: number[];
        eventCategoryId: number;
        eventRoundId: number;
    }

    export interface VerifyUserDto {
        reason: string;
        groupId: GroupsEnum;
    }

}

export module Apis {

    ///************* Apis *****************

    export class DocumentStaticDataApi {

        public search(query: Dtos.DocumentStaticDataSearchQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.DocumentStaticDataSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.DocumentStaticDataSummaryDto>>();

            var urlParts = ["documentstaticdata"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public get(id: number, returnNulls?: boolean): JQueryPromise<Dtos.DocumentStaticDataDto> {
            var helper = new JsonServiceHelper<Dtos.DocumentStaticDataDto>();

            var urlParts = ["documentstaticdata", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getCategories(id: number, returnNulls?: boolean): JQueryPromise<Dtos.DocumentCategorySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.DocumentCategorySummaryDto[]>();

            var urlParts = ["documentstaticdata", id, "categories"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(item: Dtos.DocumentStaticDataDto, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["documentstaticdata"];
            var queryArgs = null;
            var dataArgs = item;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.DocumentStaticDataDto, returnNulls?: boolean): JQueryPromise<Dtos.DocumentStaticDataDto> {
            var helper = new JsonServiceHelper<Dtos.DocumentStaticDataDto>();

            var urlParts = ["documentstaticdata", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["documentstaticdata", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public exportUrl(query: Dtos.DocumentStaticDataSearchQuery): string {
			var urlParts = ["documentstaticdata", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class ParticipantEventInfoApi {

        public getEventList(participantId: number, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantEventInfoDto[]> {
            var helper = new JsonServiceHelper<Dtos.ParticipantEventInfoDto[]>();

            var urlParts = ["participanteventinfo"];
            var queryArgs = { participantId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class UserPermissionsApi {

        public getPermissionsById(userId: number, returnNulls?: boolean): JQueryPromise<Dtos.UserPermissionsDto[]> {
            var helper = new JsonServiceHelper<Dtos.UserPermissionsDto[]>();

            var urlParts = ["userpermissions", userId];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public update(userId: number, permissions: Dtos.UserPermissionsDto[], returnNulls?: boolean): JQueryPromise<Dtos.UserPermissionsDto[]> {
            var helper = new JsonServiceHelper<Dtos.UserPermissionsDto[]>();

            var urlParts = ["userpermissions", userId];
            var queryArgs = null;
            var dataArgs = permissions;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public removeAccess(userId: number, participantId: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["userpermissions", "remove", userId];
            var queryArgs = Object.assign({}, { userId }, { participantId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }
    }

    export class UsersApi {

        public search(query: Dtos.UsersQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.UserSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.UserSummaryDto>>();

            var urlParts = ["users"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.UserDetailsDto, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getCurrent(returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", "current"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public updateCurrent(dto: Dtos.UserDetailsDto, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", "current"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getBySSO(key: string, groupTypeId: number, returnNulls?: boolean): JQueryPromise<Dtos.UserBySSOKeyQuery_Result> {
            var helper = new JsonServiceHelper<Dtos.UserBySSOKeyQuery_Result>();

            var urlParts = ["users", "sso", key];
            var queryArgs = { groupTypeId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public enable(id: number, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", id, "enable"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public disable(id: number, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", id, "disable"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public expirePassword(id: number, returnNulls?: boolean): JQueryPromise<Dtos.UserDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserDetailsDto>();

            var urlParts = ["users", id, "expirePassword"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public changePassword(passwordInfo: Dtos.ChangePasswordDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["users", "changePassword"];
            var queryArgs = null;
            var dataArgs = passwordInfo;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public setSecurityQuestion(questionInfo: Dtos.SetSecurityQuestionDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["users", "setSecurityQuestion"];
            var queryArgs = null;
            var dataArgs = questionInfo;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getUsersExportUrl(query: Dtos.UsersQuery): string {
			var urlParts = ["users", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class WhtRateApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateDto> {
            var helper = new JsonServiceHelper<Dtos.WhtRateDto>();

            var urlParts = ["whtrates", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getCurrentWhtRateByCoi(countryOfIssuanceId: number, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateDto> {
            var helper = new JsonServiceHelper<Dtos.WhtRateDto>();

            var urlParts = ["whtrates", "current", countryOfIssuanceId];
            var queryArgs = { countryOfIssuanceId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public search(query: Dtos.GetWhtRateList, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.WhtRateSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.WhtRateSummaryDto>>();

            var urlParts = ["whtrates"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.WhtRateDto, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateDto> {
            var helper = new JsonServiceHelper<Dtos.WhtRateDto>();

            var urlParts = ["whtrates"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public editPublishedRecord(dto: Dtos.WhtRateDto, id: number, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateDto> {
            var helper = new JsonServiceHelper<Dtos.WhtRateDto>();

            var urlParts = ["whtrates", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.WhtRateDto, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateDto> {
            var helper = new JsonServiceHelper<Dtos.WhtRateDto>();

            var urlParts = ["whtrates", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getAuditById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateAuditDto[]> {
            var helper = new JsonServiceHelper<Dtos.WhtRateAuditDto[]>();

            var urlParts = ["whtrates", id, "audit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteWhtRate(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["whtrates", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public reject(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["whtrates", id, "reject"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public approve(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["whtrates", id, "approve"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getExceptions(id: number, corId: number, returnNulls?: boolean): JQueryPromise<Dtos.WhtRateExceptionDto[]> {
            var helper = new JsonServiceHelper<Dtos.WhtRateExceptionDto[]>();

            var urlParts = ["whtrates", id, "exceptions"];
            var queryArgs = Object.assign({}, { id }, { corId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class StaticContentApi {

        public getContent(key: Dtos.StaticContentKey, returnNulls?: boolean): JQueryPromise<string> {
            var helper = new JsonServiceHelper<string>();

            var urlParts = ["staticcontent", key];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getLocalContent(key: Dtos.StaticContentKey, countryId: number, returnNulls?: boolean): JQueryPromise<string> {
            var helper = new JsonServiceHelper<string>();

            var urlParts = ["staticcontent", key, countryId];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getStaticFiles(returnNulls?: boolean): JQueryPromise<Dtos.StaticFileContentDto[]> {
            var helper = new JsonServiceHelper<Dtos.StaticFileContentDto[]>();

            var urlParts = ["staticcontent", "files"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getStaticFileByKey(key: Dtos.StaticFileConentKey, returnNulls?: boolean): JQueryPromise<Dtos.StaticFileContentDto> {
            var helper = new JsonServiceHelper<Dtos.StaticFileContentDto>();

            var urlParts = ["staticcontent", "files", key];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public upload(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["staticcontent", "file"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getUserGuideType(returnNulls?: boolean): JQueryPromise<Dtos.StaticFileConentKey> {
            var helper = new JsonServiceHelper<Dtos.StaticFileConentKey>();

            var urlParts = ["staticcontent", "userguidetype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public downloadUrl(key: Dtos.StaticFileConentKey): string {
			var urlParts = ["staticcontent", "files", key, "download"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class ParticipantsApi {

        public search(query: Dtos.ParticipantsListQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>();

            var urlParts = ["participants"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantDto> {
            var helper = new JsonServiceHelper<Dtos.ParticipantDto>();

            var urlParts = ["participants", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(participant: Dtos.ParticipantDto, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantDto> {
            var helper = new JsonServiceHelper<Dtos.ParticipantDto>();

            var urlParts = ["participants"];
            var queryArgs = null;
            var dataArgs = participant;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["participants", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public update(id: number, participant: Dtos.ParticipantDto, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantDto> {
            var helper = new JsonServiceHelper<Dtos.ParticipantDto>();

            var urlParts = ["participants", id];
            var queryArgs = null;
            var dataArgs = participant;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public exportUrl(query: Dtos.ParticipantsListQuery): string {
			var urlParts = ["participants", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class CountryBulkRatesApi {

        public getBulkRatesForCountries(query: Dtos.GetBulkRatesForCountriesPublicQuery, returnNulls?: boolean): JQueryPromise<Dtos.CountriesBulkRatesDto> {
            var helper = new JsonServiceHelper<Dtos.CountriesBulkRatesDto>();

            var urlParts = ["v{version:apiVersion}", "countrybulkrates", "countrybulkrates"];
            var queryArgs = null;
            var dataArgs = query;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class CountryRatesApi {

        public getRateForCountries(query: Dtos.GetRatesForCountriesPublicQuery, returnNulls?: boolean): JQueryPromise<Dtos.CountriesRateDto> {
            var helper = new JsonServiceHelper<Dtos.CountriesRateDto>();

            var urlParts = ["v{version:apiVersion}", "countryrates", "countryrates"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class TrmApi {

        public getList(query: Dtos.ListEntitiesAwaitingVerificationQuery, returnNulls?: boolean): JQueryPromise<Dtos.AwaitingVerificationDto[]> {
            var helper = new JsonServiceHelper<Dtos.AwaitingVerificationDto[]>();

            var urlParts = ["trm"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public hasOutstandingEdits(query: Dtos.CheckOutstandingEditsQuery, returnNulls?: boolean): JQueryPromise<boolean> {
            var helper = new JsonServiceHelper<boolean>();

            var urlParts = ["trm", "outstandingedits"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class TrmRatesApi {

        public getRateForCountries(query: Dtos.GetRatesForCountriesQuery, returnNulls?: boolean): JQueryPromise<Dtos.TrmRateDto[]> {
            var helper = new JsonServiceHelper<Dtos.TrmRateDto[]>();

            var urlParts = ["trmrates"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class TaxCreditApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditDto> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditDto>();

            var urlParts = ["taxcredits", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getCurrentTaxCreditByCoiAndCor(countryOfIssuanceId: number, countryOfResidenceId: number, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditDto> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditDto>();

            var urlParts = ["taxcredits", "current", countryOfIssuanceId, countryOfResidenceId];
            var queryArgs = Object.assign({}, { countryOfIssuanceId }, { countryOfResidenceId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public search(query: Dtos.GetListTaxCreditsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.TaxCreditSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.TaxCreditSummaryDto>>();

            var urlParts = ["taxcredits"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.TaxCreditDto, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditDto> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditDto>();

            var urlParts = ["taxcredits"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public editPublishedRecord(dto: Dtos.TaxCreditDto, id: number, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditDto> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditDto>();

            var urlParts = ["taxcredits", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.TaxCreditDto, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditDto> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditDto>();

            var urlParts = ["taxcredits", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getAuditById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.TaxCreditAuditDto[]> {
            var helper = new JsonServiceHelper<Dtos.TaxCreditAuditDto[]>();

            var urlParts = ["taxcredits", id, "audit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteTaxCredit(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["taxcredits", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public reject(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["taxcredits", id, "reject"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public approve(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["taxcredits", id, "approve"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }
    }

    export class TreatyApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.TreatyDto> {
            var helper = new JsonServiceHelper<Dtos.TreatyDto>();

            var urlParts = ["treaties", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getCurrentTreatyByCoiAndCor(countryOfIssuanceId: number, countryOfResidenceId: number, returnNulls?: boolean): JQueryPromise<Dtos.TreatyDto> {
            var helper = new JsonServiceHelper<Dtos.TreatyDto>();

            var urlParts = ["treaties", "current", countryOfIssuanceId, countryOfResidenceId];
            var queryArgs = Object.assign({}, { countryOfIssuanceId }, { countryOfResidenceId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteTreaty(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["treaties", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public search(query: Dtos.GetListTreatiesQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.TreatySummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.TreatySummaryDto>>();

            var urlParts = ["treaties"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.TreatyDto, returnNulls?: boolean): JQueryPromise<Dtos.TreatyDto> {
            var helper = new JsonServiceHelper<Dtos.TreatyDto>();

            var urlParts = ["treaties"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public editPublishedRecord(dto: Dtos.TreatyDto, id: number, returnNulls?: boolean): JQueryPromise<Dtos.TreatyDto> {
            var helper = new JsonServiceHelper<Dtos.TreatyDto>();

            var urlParts = ["treaties", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.TreatyDto, returnNulls?: boolean): JQueryPromise<Dtos.TreatyDto> {
            var helper = new JsonServiceHelper<Dtos.TreatyDto>();

            var urlParts = ["treaties", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getAuditById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.TreatyAuditDto[]> {
            var helper = new JsonServiceHelper<Dtos.TreatyAuditDto[]>();

            var urlParts = ["treaties", id, "audit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public reject(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["treaties", id, "reject"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public approve(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["treaties", id, "approve"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getExceptions(corId: number, rmId: number, returnNulls?: boolean): JQueryPromise<Dtos.TreatyExceptionDto[]> {
            var helper = new JsonServiceHelper<Dtos.TreatyExceptionDto[]>();

            var urlParts = ["treaties", "exceptions"];
            var queryArgs = Object.assign({}, { corId }, { rmId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class StockTypeApi {

        public search(returnNulls?: boolean): JQueryPromise<Dtos.StockTypeDto[]> {
            var helper = new JsonServiceHelper<Dtos.StockTypeDto[]>();

            var urlParts = ["stocktype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class StatutesApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.StatuteDto> {
            var helper = new JsonServiceHelper<Dtos.StatuteDto>();

            var urlParts = ["statutes", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getCurrentStatuteByCoi(countryOfIssuanceId: number, returnNulls?: boolean): JQueryPromise<Dtos.StatuteDto> {
            var helper = new JsonServiceHelper<Dtos.StatuteDto>();

            var urlParts = ["statutes", "current", countryOfIssuanceId];
            var queryArgs = { countryOfIssuanceId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteStatute(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["statutes", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public search(query: Dtos.GetListStatutesQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.StatuteSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.StatuteSummaryDto>>();

            var urlParts = ["statutes"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.StatuteDto, returnNulls?: boolean): JQueryPromise<Dtos.StatuteDto> {
            var helper = new JsonServiceHelper<Dtos.StatuteDto>();

            var urlParts = ["statutes"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public editPublishedRecord(dto: Dtos.StatuteDto, id: number, returnNulls?: boolean): JQueryPromise<Dtos.StatuteDto> {
            var helper = new JsonServiceHelper<Dtos.StatuteDto>();

            var urlParts = ["statutes", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.StatuteDto, returnNulls?: boolean): JQueryPromise<Dtos.StatuteDto> {
            var helper = new JsonServiceHelper<Dtos.StatuteDto>();

            var urlParts = ["statutes", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getAuditById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.StatuteAuditDto[]> {
            var helper = new JsonServiceHelper<Dtos.StatuteAuditDto[]>();

            var urlParts = ["statutes", id, "audit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public reject(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["statutes", id, "reject"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public approve(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["statutes", id, "approve"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }
    }

    export class SecuritiesApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.SecurityTypeDto[]> {
            var helper = new JsonServiceHelper<Dtos.SecurityTypeDto[]>();

            var urlParts = ["securities"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class ReportsApi {

        public getAllForCurrentUser(query: Dtos.SearchReportsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ReportDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ReportDto>>();

            var urlParts = ["report"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public queueRpaReport(dto: Dtos.QueueRpaReportDto, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "rpa"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueGtrsReport(selectedReclaimMarketId: number, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "gtrs"];
            var queryArgs = { selectedReclaimMarketId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueGtrsBinarisedReport(selectedReclaimMarketId: number, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "gtrs_exp"];
            var queryArgs = { selectedReclaimMarketId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueStatuteExportReport(returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueClientMatrixExport(dto: Dtos.QueueClientMatrixExportDto, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "client_matrix"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueLatestNewsExport(dto: Dtos.QueueLatestNewsExportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "news_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueJpmDrwinReport(dto: Dtos.QueueJpmDrwinReportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "jpm_drwin_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueBnymElectionReport(dto: Dtos.QueueBnymElectionBreakdownDto, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "bnym_election_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueBnymYearlyReclaimReport(dto: Dtos.QueueBnymYearlyReclaimReportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "bnym_yearly_reclaim_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueRpaChangeReport(dto: Dtos.QueueRpaChangeReportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "rpa_change_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueCommonStockDwtReport(dto: Dtos.QueueDWTReportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "common_stock_dwt_report"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueBnymFinalOfacReport(dto: Dtos.QueueBnymFinalOfacReportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "Bnym_final_ofac"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public queueBODownload(dto: Dtos.QueueBOExportCommand, returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["report", "bo_export"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getGeneratedFileContentUrl(id: number): string {
			var urlParts = ["report", id, "download"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class EnumApi {

        public reportStatus(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "reportstatus"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public reportType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "reporttype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public groups(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "groups"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public userRegistrationStatus(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "userregistrationstatus"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public treatyType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "treatytype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public treatyExceptionType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "treatyexceptiontype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public whtRateExceptionType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "whtrateexceptiontype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public eventTypes(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "eventtype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public statuteQualifierType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "statuteQualifierTypes"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public trmStatusType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "trmstatusoptions"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public filingMethods(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "filingmethods"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public bulkClaimStatusOptions(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "bulkclaimstatusoptions"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public counterpartyType(returnNulls?: boolean): JQueryPromise<Dtos.EnumDisplayDto[]> {
            var helper = new JsonServiceHelper<Dtos.EnumDisplayDto[]>();

            var urlParts = ["enum", "counterpartytype"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class SdnApi {

        public update(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["sdn", "update"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public upload(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["sdn", "upload"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public reapply(dto: Dtos.SdnDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["sdn", "reapply"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public search(page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.SdnDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.SdnDto>>();

            var urlParts = ["sdn"];
            var queryArgs = Object.assign({}, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class RoundApi {

        public search(eventId: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.RoundSummaryDto[]>();

            var urlParts = ["rounds"];
            var queryArgs = { eventId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAvailable(eventId: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.RoundSummaryDto[]>();

            var urlParts = ["rounds", "available"];
            var queryArgs = { eventId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAllUnlocked(eventId: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.RoundSummaryDto[]>();

            var urlParts = ["rounds", "all"];
            var queryArgs = { eventId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public get(id: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundDto> {
            var helper = new JsonServiceHelper<Dtos.RoundDto>();

            var urlParts = ["rounds", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(round: Dtos.RoundDto, returnNulls?: boolean): JQueryPromise<Dtos.RoundDto> {
            var helper = new JsonServiceHelper<Dtos.RoundDto>();

            var urlParts = ["rounds"];
            var queryArgs = null;
            var dataArgs = round;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, round: Dtos.RoundDto, returnNulls?: boolean): JQueryPromise<Dtos.RoundDto> {
            var helper = new JsonServiceHelper<Dtos.RoundDto>();

            var urlParts = ["rounds", id];
            var queryArgs = null;
            var dataArgs = round;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["rounds", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public getBalanceInformation(id: number, returnNulls?: boolean): JQueryPromise<Dtos.EventRoundBalanceInformationDto> {
            var helper = new JsonServiceHelper<Dtos.EventRoundBalanceInformationDto>();

            var urlParts = ["rounds", id, "balanceInformation"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getLastClaimCreatedDate(id: number, returnNulls?: boolean): JQueryPromise<Dtos.EventRoundLastClaimCreatedDto> {
            var helper = new JsonServiceHelper<Dtos.EventRoundLastClaimCreatedDto>();

            var urlParts = ["rounds", id, "lastClaimCreated"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class RoundCategoriesApi {

        public search(roundId: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundCategorySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.RoundCategorySummaryDto[]>();

            var urlParts = ["roundcategories"];
            var queryArgs = { roundId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public get(id: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundCategoryDto> {
            var helper = new JsonServiceHelper<Dtos.RoundCategoryDto>();

            var urlParts = ["roundcategories", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(category: Dtos.RoundCategoryDto, returnNulls?: boolean): JQueryPromise<Dtos.RoundCategoryDto> {
            var helper = new JsonServiceHelper<Dtos.RoundCategoryDto>();

            var urlParts = ["roundcategories"];
            var queryArgs = null;
            var dataArgs = category;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, category: Dtos.RoundCategoryDto, returnNulls?: boolean): JQueryPromise<Dtos.RoundCategoryDto> {
            var helper = new JsonServiceHelper<Dtos.RoundCategoryDto>();

            var urlParts = ["roundcategories", id];
            var queryArgs = null;
            var dataArgs = category;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["roundcategories", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public validateRule(dto: Dtos.ValidateRoundCategoryDto, returnNulls?: boolean): JQueryPromise<string[]> {
            var helper = new JsonServiceHelper<string[]>();

            var urlParts = ["roundcategories", "validate"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public permissions(id: number, returnNulls?: boolean): JQueryPromise<Dtos.RoundCategoryPermissionsDto> {
            var helper = new JsonServiceHelper<Dtos.RoundCategoryPermissionsDto>();

            var urlParts = ["roundcategories", id, "permissions"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class RoundReconciliationApi {

        public getMatchingSameRateCategories(id: number, returnNulls?: boolean): JQueryPromise<Dtos.MatchingSameRateCategoriesDto> {
            var helper = new JsonServiceHelper<Dtos.MatchingSameRateCategoriesDto>();

            var urlParts = ["roundReconciliation", id, "getDuplicateRateCategories"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public updateMatchingSameRateCategories(id: number, dto: Dtos.UpdateMatchingCategoriesDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["roundReconciliation", id, "updateDuplicateRateCategories"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public runReconciliation(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["roundReconciliation", id, "runReconciliation"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getRecords(query: Dtos.GetEventRoundReconciliationReportQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ReconciliationRecordDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ReconciliationRecordDto>>();

            var urlParts = ["roundReconciliation", "reconciliation"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public reconcile(decision: Dtos.ReconciliationRecordDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["roundReconciliation", "reconcile"];
            var queryArgs = null;
            var dataArgs = decision;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class PaymentMethodsApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.PaymentMethodDto[]> {
            var helper = new JsonServiceHelper<Dtos.PaymentMethodDto[]>();

            var urlParts = ["paymentmethods"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class ParticipantPositionsApi {

        public getAll(query: Dtos.ParticipantPositionsForEventQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ParticipantPositionDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ParticipantPositionDto>>();

            var urlParts = ["participantpositions"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getClaimedApproved(query: Dtos.ParticipantPositionsClaimedApprovedForEventQuery, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantClaimedApprovedPositionsDto[]> {
            var helper = new JsonServiceHelper<Dtos.ParticipantClaimedApprovedPositionsDto[]>();

            var urlParts = ["participantpositions", "claimed"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getPositionsHasBeenSet(eventId: number): JQueryPromise<boolean>;
        public getPositionsHasBeenSet(eventId: number, participantId: number): JQueryPromise<boolean>;

        public getPositionsHasBeenSet(eventId: number, participantId?: number, returnNulls?: boolean): JQueryPromise<boolean> {
            var helper = new JsonServiceHelper<boolean>();

            var urlParts = ["participantpositions", "hasBeenSet", eventId, participantId];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public delete(command: Dtos.DeleteParticipantPositionsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["participantpositions", "delete"];
            var queryArgs = null;
            var dataArgs = command;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(command: Dtos.UpdateParticipantPositionsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["participantpositions", "update"];
            var queryArgs = null;
            var dataArgs = command;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public upload(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["participantpositions", "upload"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public audit(eventId: number): JQueryPromise<Dtos.ParticipantAuditDto>;
        public audit(eventId: number, participantId: number): JQueryPromise<Dtos.ParticipantAuditDto>;

        public audit(eventId: number, participantId?: number, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantAuditDto> {
            var helper = new JsonServiceHelper<Dtos.ParticipantAuditDto>();

            var urlParts = ["participantpositions", "audit"];
            var queryArgs = Object.assign({}, { eventId }, { participantId });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public downloadUrl(eventId: number, participantId: number): string {
			var urlParts = ["participantpositions", "download"];
			var queryArgs = Object.assign({}, { eventId }, { participantId });

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class NewsApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.NewsDto> {
            var helper = new JsonServiceHelper<Dtos.NewsDto>();

            var urlParts = ["news", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public search(query: Dtos.GetNewsList, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.NewsSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.NewsSummaryDto>>();

            var urlParts = ["news"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.NewsDto, returnNulls?: boolean): JQueryPromise<Dtos.NewsDto> {
            var helper = new JsonServiceHelper<Dtos.NewsDto>();

            var urlParts = ["news"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public editPublishedRecord(dto: Dtos.NewsDto, id: number, returnNulls?: boolean): JQueryPromise<Dtos.NewsDto> {
            var helper = new JsonServiceHelper<Dtos.NewsDto>();

            var urlParts = ["news", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.NewsDto, returnNulls?: boolean): JQueryPromise<Dtos.NewsDto> {
            var helper = new JsonServiceHelper<Dtos.NewsDto>();

            var urlParts = ["news", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getCategories(returnNulls?: boolean): JQueryPromise<string[]> {
            var helper = new JsonServiceHelper<string[]>();

            var urlParts = ["news", "categories"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAuditById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.NewsAuditDto[]> {
            var helper = new JsonServiceHelper<Dtos.NewsAuditDto[]>();

            var urlParts = ["news", id, "audit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteNews(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["news", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public reject(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["news", id, "reject"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public approve(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["news", id, "approve"];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }
    }

    export class JpmReportingApi {

        public electionSheetSummary(id: number, returnNulls?: boolean): JQueryPromise<Dtos.JpmElectionSheetSummaryDto> {
            var helper = new JsonServiceHelper<Dtos.JpmElectionSheetSummaryDto>();

            var urlParts = ["jpmreporting", "electionsheet", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public uploadFileAsync(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["jpmreporting", "upload"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public electionSheetDownloadUrl(id: number): string {
			var urlParts = ["jpmreporting", "electionsheet", id, "download"];
			var queryArgs = { id };

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class InvitationsApi {

        public inviteUsers(userInvitationsDto: Dtos.UserInvitationsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "inviteusers"];
            var queryArgs = null;
            var dataArgs = userInvitationsDto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public search(query: Dtos.ListPendingUserRegistrationsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.UserRegistrationSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.UserRegistrationSummaryDto>>();

            var urlParts = ["invitations"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public inviteGoalUsers(goalUserInvitationsDto: Dtos.GoalUserInvitationsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "invitegoalusers"];
            var queryArgs = null;
            var dataArgs = goalUserInvitationsDto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getInvitationDetails(uniqueIdentifier: string, returnNulls?: boolean): JQueryPromise<Dtos.UserRegistrationDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserRegistrationDetailsDto>();

            var urlParts = ["invitations", "getinvitationdetails"];
            var queryArgs = { uniqueIdentifier };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getSecurityQuestionSelection(returnNulls?: boolean): JQueryPromise<Dtos.SecurityQuestionDto[]> {
            var helper = new JsonServiceHelper<Dtos.SecurityQuestionDto[]>();

            var urlParts = ["invitations", "securityquestions"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public registerUser(registration: Dtos.UserRegistrationDetailsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "registeruser"];
            var queryArgs = null;
            var dataArgs = registration;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public reinviteUsers(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "reinviteusers", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public prepareInvitation(uniqueIdentifier: string, prepareDto: Dtos.PrepareInviteDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "prepare"];
            var queryArgs = { uniqueIdentifier };
            var dataArgs = prepareDto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public acceptInvitation(uniqueIdentifier: string, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["invitations", "accept"];
            var queryArgs = { uniqueIdentifier };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class VerificationsApi {

        public approveUser(id: number, dto: Dtos.VerifyUserDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["verifications", id, "approveuser"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public rejectUser(id: number, dto: Dtos.VerifyUserDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["verifications", id, "rejectuser"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.UserVerificationDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.UserVerificationDetailsDto>();

            var urlParts = ["verifications", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class HealthCheckApi {

        public runHealthCheckQuery(returnNulls?: boolean): JQueryPromise<Dtos.HealthCheckDto> {
            var helper = new JsonServiceHelper<Dtos.HealthCheckDto>();

            var urlParts = ["healthcheck"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public featureConfig(returnNulls?: boolean): JQueryPromise<Dtos.IFeatureFlags> {
            var helper = new JsonServiceHelper<Dtos.IFeatureFlags>();

            var urlParts = ["healthcheck", "features"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class EventBalanceSheetApi {

        public getBalanceSheet(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BalanceSheetDto> {
            var helper = new JsonServiceHelper<Dtos.BalanceSheetDto>();

            var urlParts = ["eventbalancesheet", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.BalanceSheetDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["eventbalancesheet", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public attachBalanceSheet(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["eventbalancesheet", "attachBalanceSheet"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class EventRoundsApi {

        public search(query: Dtos.GetListEventRoundsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.EventWithRoundDetailsDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.EventWithRoundDetailsDto>>();

            var urlParts = ["eventsrounds"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class EventsApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.EventDto> {
            var helper = new JsonServiceHelper<Dtos.EventDto>();

            var urlParts = ["events", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(evnt: Dtos.EventDto, returnNulls?: boolean): JQueryPromise<Dtos.EventDto> {
            var helper = new JsonServiceHelper<Dtos.EventDto>();

            var urlParts = ["events"];
            var queryArgs = null;
            var dataArgs = evnt;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, evnt: Dtos.EventDto, returnNulls?: boolean): JQueryPromise<Dtos.EventDto> {
            var helper = new JsonServiceHelper<Dtos.EventDto>();

            var urlParts = ["events", id];
            var queryArgs = null;
            var dataArgs = evnt;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public search(query: Dtos.ListEventsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.EventSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.EventSummaryDto>>();

            var urlParts = ["events"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["events", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public uploadImportantNotice(returnNulls?: boolean): JQueryPromise<number> {
            var helper = new JsonServiceHelper<number>();

            var urlParts = ["events", "importantnotice"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public deleteImportantNotice(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["events", id, "importantnotice"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public changeStatus(id: number, dto: Dtos.ChangeEventStatusDto, returnNulls?: boolean): JQueryPromise<Dtos.EventDto> {
            var helper = new JsonServiceHelper<Dtos.EventDto>();

            var urlParts = ["events", id, "changestatus"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public makeLive(id: number, returnNulls?: boolean): JQueryPromise<Dtos.EventDto> {
            var helper = new JsonServiceHelper<Dtos.EventDto>();

            var urlParts = ["events", id, "makelive"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public closeWarning(id: number, returnNulls?: boolean): JQueryPromise<boolean> {
            var helper = new JsonServiceHelper<boolean>();

            var urlParts = ["events", id, "closewarning"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public countriesForDate(query: Dtos.GetEventCountriesForAdrRecordDateQuery, returnNulls?: boolean): JQueryPromise<Dtos.CountrySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.CountrySummaryDto[]>();

            var urlParts = ["events", "countriesForDate"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public downloadUrl(query: Dtos.ListEventsQuery): string {
			var urlParts = ["events", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }

        public downloadImportantNoticeUrl(id: number): string {
			var urlParts = ["events", id, "importantnotice", "download"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class EventAuditApi {

        public getAudit(eventId: number, returnNulls?: boolean): JQueryPromise<Dtos.EventChangeDto[]> {
            var helper = new JsonServiceHelper<Dtos.EventChangeDto[]>();

            var urlParts = ["eventaudit", eventId];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAuditLatest(eventId: number, returnNulls?: boolean): JQueryPromise<Dtos.EventChangeDto> {
            var helper = new JsonServiceHelper<Dtos.EventChangeDto>();

            var urlParts = ["eventaudit", eventId, "latest"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public downloadUrl(eventId: number): string {
			var urlParts = ["eventaudit", eventId, "download"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class EventStatusApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.EventStatusDto[]> {
            var helper = new JsonServiceHelper<Dtos.EventStatusDto[]>();

            var urlParts = ["eventstatuses"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class EventTypeApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.EventTypeDto[]> {
            var helper = new JsonServiceHelper<Dtos.EventTypeDto[]>();

            var urlParts = ["eventtypes"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class FilingMethodsApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.FilingMethodDto[]> {
            var helper = new JsonServiceHelper<Dtos.FilingMethodDto[]>();

            var urlParts = ["filingmethods"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class EntityTypesApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.EntityTypeSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.EntityTypeSummaryDto[]>();

            var urlParts = ["entitytypes"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAllTrm(returnNulls?: boolean): JQueryPromise<Dtos.EntityTypeSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.EntityTypeSummaryDto[]>();

            var urlParts = ["entitytypes", "trm"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class EmailChangeRequestApi {

        public create(request: Dtos.CreateEmailChangeRequestDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["emailchangerequest"];
            var queryArgs = null;
            var dataArgs = request;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getCurrent(userId: number, returnNulls?: boolean): JQueryPromise<Dtos.EmailChangeRequestDto> {
            var helper = new JsonServiceHelper<Dtos.EmailChangeRequestDto>();

            var urlParts = ["emailchangerequest", "current"];
            var queryArgs = { userId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public review(id: number, request: Dtos.EmailChangeRequestDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["emailchangerequest", id];
            var queryArgs = null;
            var dataArgs = request;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }
    }

    export class DtccReportApi {

        public getReportSummary(id: number, returnNulls?: boolean): JQueryPromise<Dtos.DtccReportSummaryDto> {
            var helper = new JsonServiceHelper<Dtos.DtccReportSummaryDto>();

            var urlParts = ["dtccreport", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteReport(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["dtccreport", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public uploadFileAsync(returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["dtccreport", "upload"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class DocumentTemplatesApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.DocumentTemplateDto[]> {
            var helper = new JsonServiceHelper<Dtos.DocumentTemplateDto[]>();

            var urlParts = ["documentlist"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class CurrencyApi {

        public getAll(includeAll: boolean, includeUSD: boolean, returnNulls?: boolean): JQueryPromise<Dtos.CurrencySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.CurrencySummaryDto[]>();

            var urlParts = ["currencies"];
            var queryArgs = Object.assign({}, { includeAll }, { includeUSD });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class CountriesApi {

        public getAll(includeAll: boolean, returnNulls?: boolean): JQueryPromise<Dtos.CountrySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.CountrySummaryDto[]>();

            var urlParts = ["countrylist"];
            var queryArgs = { includeAll };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAllGtrs(includeAll: boolean, returnNulls?: boolean): JQueryPromise<Dtos.CountrySummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.CountrySummaryDto[]>();

            var urlParts = ["countrylist", "gtrs"];
            var queryArgs = { includeAll };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class BatchClaimStatusesApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimStatusDto[]> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimStatusDto[]>();

            var urlParts = ["batchclaimstatuses"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class BatchClaimWorkflowApi {

        public getEventSummaryData(claimId: number, returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimExportSummaryDto> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimExportSummaryDto>();

            var urlParts = ["batchclaimworkflow", "benowners", "exportsummary"];
            var queryArgs = { claimId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class CategoryElectionsApi {

        public updateCategoryPositions(id: number, categoryPositions: Dtos.CategoryPositionDto[], returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["categoryelections", id];
            var queryArgs = null;
            var dataArgs = categoryPositions;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public getCategoryPositions(id: number, includeBeneficialOwnerCategories: boolean, returnNulls?: boolean): JQueryPromise<Dtos.CategoryPositionDto[]> {
            var helper = new JsonServiceHelper<Dtos.CategoryPositionDto[]>();

            var urlParts = ["categoryelections", id];
            var queryArgs = { includeBeneficialOwnerCategories };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class ClaimBeneficialOwnerSummaryApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.ClaimBeneficialOwnerSummaryDto> {
            var helper = new JsonServiceHelper<Dtos.ClaimBeneficialOwnerSummaryDto>();

            var urlParts = ["claimbeneficialownersummary", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class ClaimsApi {

        public getClaims(query: Dtos.GetAllBatchClaimsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ListBatchClaimsDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ListBatchClaimsDto>>();

            var urlParts = ["claims"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getClaimsExportUrl(query: Dtos.GetAllBatchClaimsQuery): string {
			var urlParts = ["claims", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class ParticipantEventClaimApi {

        public getParticipantClaimsForEventId(query: Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.ParticipantEventClaimSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.ParticipantEventClaimSummaryDto>>();

            var urlParts = ["participanteventclaim"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public exportUrl(query: Dtos.GetAllBatchClaimsSummaryForEventAndCurrentLoggedinParticipantQuery): string {
			var urlParts = ["participanteventclaim", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }

        public exportDtcElectionsUrl(query: Dtos.GetEventDtcElectionsForParticipantQuery): string {
			var urlParts = ["participanteventclaim", "exportdtcelections"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class ParticipantClaimSummaryApi {

        public getClaimedAdrPositionSummaryForEventId(query: Dtos.GetClaimedAdrPositionSummaryQuery, returnNulls?: boolean): JQueryPromise<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto> {
            var helper = new JsonServiceHelper<Dtos.ParticipantClaimedAdrPositionSummaryForEventDto>();

            var urlParts = ["participantclaimsummary"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class BatchClaimWorkflowRoundInfoApi {

        public getCategoriesForEventRound(query: Dtos.GetAllEventRoundCategoriesForRoundQuery, returnNulls?: boolean): JQueryPromise<Dtos.FlattenedAllEventRoundCategoryInfoDto> {
            var helper = new JsonServiceHelper<Dtos.FlattenedAllEventRoundCategoryInfoDto>();

            var urlParts = ["batchclaimroundinfo"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class BatchClaimDocumentsApi {

        public getDocuments(batchClaimId: number, systemGenerated: boolean, returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimDocumentDto[]> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimDocumentDto[]>();

            var urlParts = ["batchclaimdocuments"];
            var queryArgs = Object.assign({}, { batchClaimId }, { systemGenerated });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteDocument(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaimdocuments", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public getDocumentContentUrl(id: number): string {
			var urlParts = ["batchclaimdocuments", id, "content"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class BatchClaimFileUploadApi {

        public uploadFiles(returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimFileResultDto> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimFileResultDto>();

            var urlParts = ["batchclaimfileupload", "files"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

    export class BatchClaimApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.ClaimDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.ClaimDetailsDto>();

            var urlParts = ["batchclaim", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.CreateClaimDto, returnNulls?: boolean): JQueryPromise<Dtos.ClaimDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.ClaimDetailsDto>();

            var urlParts = ["batchclaim"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.UpdateClaimDto, returnNulls?: boolean): JQueryPromise<Dtos.ClaimDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.ClaimDetailsDto>();

            var urlParts = ["batchclaim", id];
            var queryArgs = { id };
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public submit(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaim", id, "submit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public cancel(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaim", id, "cancel"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public reset(id: number, dto: Dtos.ResetClaimFilingMethodDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaim", id, "reset"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getSummaryById(claimId: number, returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimSummaryDto> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimSummaryDto>();

            var urlParts = ["batchclaim", "summary"];
            var queryArgs = { claimId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public deleteBatchClaim(claimId: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaim", "delete"];
            var queryArgs = { claimId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public getDocumentGenerationErrors(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimDocumentErrorDto[]> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimDocumentErrorDto[]>();

            var urlParts = ["batchclaim", id, "documentgenerationerrors"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getDocumentGenerationTemplateErrors(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimDocumentTemplateErrorDto[]> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimDocumentTemplateErrorDto[]>();

            var urlParts = ["batchclaim", id, "documentgenerationtemplateerrors"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public regenerateDocuments(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["batchclaim", id, "regeneratedocuments"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getValidationFailures(query: Dtos.GetListBatchClaimValidationErrorsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.BatchClaimValidationFailureDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.BatchClaimValidationFailureDto>>();

            var urlParts = ["batchclaim", "failures"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getTemplateUrl(id: number): string {
			var urlParts = ["batchclaim", id, "template"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class BeneficialOwnersApi {

        public search(query: Dtos.BeneficialOwnerSearchQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.BeneficialOwnerSearchResultDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.BeneficialOwnerSearchResultDto>>();

            var urlParts = ["beneficialowners"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public exportUrl(query: Dtos.BeneficialOwnerSearchQuery, exportType: Dtos.BeneficialOwnersExportType): string {
			var urlParts = ["beneficialowners", "export"];
			var queryArgs = Object.assign({}, query, { exportType });

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class ClaimTrailApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BeneficialOwnerClaimTrailDto[]> {
            var helper = new JsonServiceHelper<Dtos.BeneficialOwnerClaimTrailDto[]>();

            var urlParts = ["claimtrail", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class CategoriesApi {

        public search(query: Dtos.CategorySearchQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.CategorySummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.CategorySummaryDto>>();

            var urlParts = ["categories"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public get(id: number, returnNulls?: boolean): JQueryPromise<Dtos.CategoryDto> {
            var helper = new JsonServiceHelper<Dtos.CategoryDto>();

            var urlParts = ["categories", id];
            var queryArgs = { id };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.CategoryDto, returnNulls?: boolean): JQueryPromise<Dtos.CategoryDto> {
            var helper = new JsonServiceHelper<Dtos.CategoryDto>();

            var urlParts = ["categories"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.CategoryDto, returnNulls?: boolean): JQueryPromise<Dtos.CategoryDto> {
            var helper = new JsonServiceHelper<Dtos.CategoryDto>();

            var urlParts = ["categories", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["categories", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public validateRule(dto: Dtos.ValidateCategoryRuleDto, returnNulls?: boolean): JQueryPromise<string[]> {
            var helper = new JsonServiceHelper<string[]>();

            var urlParts = ["categories", "validate"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public exportUrl(query: Dtos.CategorySearchQuery): string {
			var urlParts = ["categories", "export"];
			var queryArgs = query;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class BulkClaimApi {

        public getList(query: Dtos.GetListBulkClaimsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.BulkClaimSummaryDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.BulkClaimSummaryDto>>();

            var urlParts = ["bulkclaims"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BulkClaimDto> {
            var helper = new JsonServiceHelper<Dtos.BulkClaimDto>();

            var urlParts = ["bulkclaims", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getSummary(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BulkClaimUploadSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.BulkClaimUploadSummaryDto[]>();

            var urlParts = ["bulkclaims", id, "summary"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getUploadDetails(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BulkClaimUploadDetailsDto[]> {
            var helper = new JsonServiceHelper<Dtos.BulkClaimUploadDetailsDto[]>();

            var urlParts = ["bulkclaims", id, "details"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getBulkClaimDisclaimers(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BulkClaimDisclaimerDto[]> {
            var helper = new JsonServiceHelper<Dtos.BulkClaimDisclaimerDto[]>();

            var urlParts = ["bulkclaims", id, "disclaimers"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getEventsForClaim(query: Dtos.GetAvailableEventsListQuery, returnNulls?: boolean): JQueryPromise<Dtos.EventSummaryDto[]> {
            var helper = new JsonServiceHelper<Dtos.EventSummaryDto[]>();

            var urlParts = ["bulkclaims", "events"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public uploadFiles(returnNulls?: boolean): JQueryPromise<Dtos.BatchClaimFileResultDto> {
            var helper = new JsonServiceHelper<Dtos.BatchClaimFileResultDto>();

            var urlParts = ["bulkclaims", "files"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public create(dto: Dtos.BulkClaimDto, returnNulls?: boolean): JQueryPromise<Dtos.BulkClaimDto> {
            var helper = new JsonServiceHelper<Dtos.BulkClaimDto>();

            var urlParts = ["bulkclaims"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getDates(query: Dtos.GetAvailableEventDatesForCountryQuery, returnNulls?: boolean): JQueryPromise<Date[]> {
            var helper = new JsonServiceHelper<Date[]>();

            var urlParts = ["bulkclaims", "dates"];
            var queryArgs = query;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getValidationFailures(query: Dtos.GetListBulkClaimValidationErrorsQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.BulkClaimValidationFailureDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.BulkClaimValidationFailureDto>>();

            var urlParts = ["bulkclaims", "failures"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public submitClaim(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["bulkclaims", id, "submit"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public cancelClaim(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["bulkclaims", id, "cancel"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public getTemplateUrl(id: number): string {
			var urlParts = ["bulkclaims", id, "template"];
			var queryArgs = null;

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class BeneficialOwnerApi {

        public getById(id: number, returnNulls?: boolean): JQueryPromise<Dtos.BeneficialOwnerDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.BeneficialOwnerDetailsDto>();

            var urlParts = ["beneficialowner", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public getAllByClaimId(query: Dtos.GetBatchClaimBenOwnersQuery, page: number, pageSize: number, returnNulls?: boolean): JQueryPromise<Dtos.PagedResultDto<Dtos.BeneficialOwnerDetailsDto>> {
            var helper = new JsonServiceHelper<Dtos.PagedResultDto<Dtos.BeneficialOwnerDetailsDto>>();

            var urlParts = ["beneficialowner"];
            var queryArgs = Object.assign({}, query, { page }, { pageSize });
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public create(dto: Dtos.BenownerCreateDto, returnNulls?: boolean): JQueryPromise<Dtos.BeneficialOwnerDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.BeneficialOwnerDetailsDto>();

            var urlParts = ["beneficialowner"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public update(id: number, dto: Dtos.BenownerUpdateDto, returnNulls?: boolean): JQueryPromise<Dtos.BeneficialOwnerDetailsDto> {
            var helper = new JsonServiceHelper<Dtos.BeneficialOwnerDetailsDto>();

            var urlParts = ["beneficialowner", id];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }

        public delete(id: number, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialowner", id];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public updateStatusByIds(data: Dtos.BenownerUpdateStatusByIdsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialowner", "updatestatusbyid"];
            var queryArgs = null;
            var dataArgs = data;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public updateStatusByClaimId(data: Dtos.BenownerUpdateStatusInClaimDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialowner", "updatestatusinclaim"];
            var queryArgs = null;
            var dataArgs = data;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public addComment(id: number, dto: Dtos.BeneficialOwnerCommentDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialowner", id, "comment"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public updateIsPossibleDuplicate(id: number, dto: Dtos.BeneficialOwnerIsPossibleDuplicateDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialowner", id, "ispossibleduplicate"];
            var queryArgs = null;
            var dataArgs = dto;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public exportByClaimIdUrl(query: Dtos.GetBatchClaimBenOwnersQuery, exportType: Dtos.BeneficialOwnersExportType): string {
			var urlParts = ["beneficialowner", "export"];
			var queryArgs = Object.assign({}, query, { exportType });

			return UrlHelpers.buildUrl(urlParts, queryArgs);
        }
    }

    export class BeneficialOwnerClaimStatusesApi {

        public getAll(returnNulls?: boolean): JQueryPromise<Dtos.BenownerClaimStatusDto[]> {
            var helper = new JsonServiceHelper<Dtos.BenownerClaimStatusDto[]>();

            var urlParts = ["beneficialownerclaimstatuses"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }
    }

    export class BeneficialOwnerDocumentsApi {

        public getAllByBeneficialId(beneficialOwnerId: number, returnNulls?: boolean): JQueryPromise<Dtos.BeneficialOwnerDocumentsDto[]> {
            var helper = new JsonServiceHelper<Dtos.BeneficialOwnerDocumentsDto[]>();

            var urlParts = ["beneficialownerdocuments"];
            var queryArgs = { beneficialOwnerId };
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public addDocumentComment(documentDetails: Dtos.BeneficialOwnerDocumentsDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["beneficialownerdocuments", "comments"];
            var queryArgs = null;
            var dataArgs = documentDetails;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "PUT", dataArgs, returnNulls);
        }
    }

    export class AnnouncementsApi {

        public getAnnouncement(key: Dtos.AnnouncementKey, returnNulls?: boolean): JQueryPromise<Dtos.AnnouncementDto> {
            var helper = new JsonServiceHelper<Dtos.AnnouncementDto>();

            var urlParts = ["announcements", key];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public setAnnouncement(key: Dtos.AnnouncementKey, announcement: Dtos.AnnouncementDto, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["announcements", key];
            var queryArgs = null;
            var dataArgs = announcement;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }

        public removeAnnouncement(key: Dtos.AnnouncementKey, returnNulls?: boolean): JQueryPromise<void> {
            var helper = new JsonServiceHelper<void>();

            var urlParts = ["announcements", key];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "DELETE", dataArgs, returnNulls);
        }

        public showAnnoucement(returnNulls?: boolean): JQueryPromise<boolean> {
            var helper = new JsonServiceHelper<boolean>();

            var urlParts = ["announcements", "show"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "GET", dataArgs, returnNulls);
        }

        public cancelAnnouncement(returnNulls?: boolean): JQueryPromise<boolean> {
            var helper = new JsonServiceHelper<boolean>();

            var urlParts = ["announcements", "cancel"];
            var queryArgs = null;
            var dataArgs = null;

            var fullUrl = UrlHelpers.buildUrl(urlParts, queryArgs);
            return helper.sendRequestForItem(fullUrl, "POST", dataArgs, returnNulls);
        }
    }

}
