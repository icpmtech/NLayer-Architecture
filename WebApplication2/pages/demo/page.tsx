import * as React from 'react';
import { Apis, Dtos } from '../../adr';
import {
    connect,











    DetailsBuilder, IGridBuilderChangeArgs, Loader,








    PageableGridBuilder, PageCache, PagedDataState, Pending,
    PopupBuilder,




    SimpleGridBuilder
} from "../../classes";
import * as Form from './../../components';
import { ClaimSteppedTracker, step } from './../../components/claimSteppedTracker';
import * as PageComponents from "./../claims/batchClaimDetails/index";

interface DemoState {
    benOwnersData?: PagedDataState<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    benOwnersData2?: PagedDataState<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    claims?: Pending<Dtos.BeneficialOwnerClaimTrailDto[]>;
    claimDetails?: Pending<Dtos.ClaimDetailsDto>;
    participants?: Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>;
    statuses?: Pending<Dtos.BenownerClaimStatusDto[]>;
    commentAdded?: boolean;
    chosenDate?: Date;
};


export class ReactDemo extends React.Component<{}, DemoState> {
    private beneficialOwnerApi1: Apis.BeneficialOwnerApi;
    private beneficialOwnerApi2: Apis.BeneficialOwnerApi;
    private benOwnersStore1: PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    private benOwnersStore2: PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>;
    private claimId: number = 1;


    constructor() {
        super();
        this.state = {
            claims: new Pending<Dtos.BeneficialOwnerClaimTrailDto[]>(),
            commentAdded: false,
            participants: new Pending<Dtos.PagedResultDto<Dtos.ParticipantListSummaryDto>>(),
            statuses: new Pending<Dtos.BenownerClaimStatusDto[]>(),
            chosenDate: new Date()
        };
    }

    componentDidMount() {
        connect(new Apis.ParticipantsApi().search(null, 1, 10000), this.state.participants, participants => this.setState({ participants }));
        connect(new Apis.ClaimTrailApi().getById(this.claimId), this.state.claims, claims => this.setState({ claims }));
        connect(new Apis.BeneficialOwnerClaimStatusesApi().getAll(), this.state.statuses, statuses => this.setState({ statuses }));
        connect(new Apis.BatchClaimApi().getById(this.claimId), this.state.claimDetails, claimDetails => this.setState({ claimDetails }));
    }

    private renderSimpleGridWithButton() {
        return Loader.for(this.state.claims, claims => {
            return SimpleGridBuilder.For(claims)
                .addString("Users", x => x.user, null, "GridUsers")
                .addString("Action", x => x.action, null, "GridAction")
                .addString("Comments", x => x.comments, null, "GridComments")
                .addDateTime("ADR Record Date", m => m.timeOfStatusChange, null, "GridAdrRecordDate")
                .addButton("Add Comment", () => alert('Grid button clicked'), { dataQA: "GridAddCommentButton", pushRemainingRight: true})
                .render();
        });
    }

    private renderPageableGrid1() {
        let gridPageSize = 20;
        this.beneficialOwnerApi1 = new Apis.BeneficialOwnerApi();
        this.benOwnersStore1 = new PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>(
            (query, page, pageSize) => this.beneficialOwnerApi1.getAllByClaimId(query, page, pageSize),
            () => this.state.benOwnersData,
            (benOwnersData) => this.setState({ benOwnersData })
        );
        return (
            <Form.FormGroup qa="BatchClaimOwnersGrid">
                <PageComponents.BatchClaimOwnersGrid
                    benOwners={this.benOwnersStore1.getCurrentData()}
                    query={this.benOwnersStore1.getCurrentFilter()}
                    onChange={(query, page, pageSize) => this.benOwnersStore1.setCurrent(Object.assign(query, { id: this.claimId }), page, pageSize, false)}
                    onSelected={x => alert(`Navigate to ${x.id}`)}
                    isIrishCommonStockEvent={false}
                    disableExcelExport={false}
                   
                />
            </Form.FormGroup>
        );
    }

    private handleChangeForPageableGrid2(options: IGridBuilderChangeArgs<Dtos.BeneficialOwnerSortField>) {
        var query = Object.assign({}, this.benOwnersStore2.getCurrentFilter());
        query.sort = options.sort;
        query.uiFilters = options.filters;
        this.benOwnersStore2.setCurrent(Object.assign(query, { id: this.claimId }), options.page, options.pageSize, false);
    }

    private renderPageableGrid2() {
        let gridPageSize = 20;
        this.beneficialOwnerApi2 = new Apis.BeneficialOwnerApi();
        this.benOwnersStore2 = new PageCache<Dtos.BeneficialOwnerDetailsDto, Dtos.GetBatchClaimBenOwnersQuery>(
            (query, page, pageSize) => this.beneficialOwnerApi2.getAllByClaimId(query, page, pageSize),
            () => this.state.benOwnersData2,
            (benOwnersData2) => this.setState({ benOwnersData2 })
        );
        return Loader.for(this.state.statuses, statuses => {
            return PageableGridBuilder
                .ForPendingPage<Dtos.BeneficialOwnerDetailsDto, Dtos.BeneficialOwnerSortField>(gridPageSize, this.benOwnersStore2.getCurrentData(), (options) => this.handleChangeForPageableGrid2(options))
                .isSortable()
                .isFilterable()
                .addStrings("Beneficial Owner", " ", x => [x.givenNames, x.familyName], Dtos.BeneficialOwnerSortField.DisplayName, "GridBeneficialOwner")
                .addString("BO ID", x => x.benownerClaimReference, Dtos.BeneficialOwnerSortField.BeneficialOwnerClaimId, "GridBeneficialOwnerClaimID")
                .addString("Country of Residence", x => x.countryOfResidence.countryName, Dtos.BeneficialOwnerSortField.CountryOfResidence, "GridCountryOfResidence")
                .addString("Entity Type", x => x.entityType.description, Dtos.BeneficialOwnerSortField.EntityTypeDescription, "GridEntityType")
                .addString("Category", x => x.category.description, Dtos.BeneficialOwnerSortField.Category, "GridCategory")
                .addNumber("# of ADRs", x => x.adrPosition, Dtos.BeneficialOwnerSortField.NumAdrs, "GridNumberOfADRs")
                .addString("Status", x => x.benOwnerClaimStatusName, Dtos.BeneficialOwnerSortField.BenificalOwnerStatus, "GridStatus", null, { filterItems: this.state.statuses.data.map(x => x.name) })
                .setRowChangeHandler(x => window.location.href = '/claims/viewbodetails/' + x.id)
                .addExcelButton(() => new Apis.BeneficialOwnerApi().exportByClaimIdUrl(this.benOwnersStore2.getCurrentFilter(), Dtos.BeneficialOwnersExportType.Normal), "ExcelButton", "BeneficialOwnersExportExcelButton")
                .addCustomExcelButton("Export all details to Excel", () => new Apis.BeneficialOwnerApi().exportByClaimIdUrl(this.benOwnersStore1.getCurrentFilter(), Dtos.BeneficialOwnersExportType.Full), "ExportAllDetailsToExcelButton")
                .render();
        });
    }

    private renderSimpleGrid() {
        return Loader.for(this.state.participants.map(x => x.items), participants => {
            return SimpleGridBuilder.For(participants, 5)
                .isFilterable()
                .isSortable()
                .addString("DTC Code", x => x.dtcCode, null, "GridDtcCode")
                .addNumber("ID", x => x.id, null, "GridId")
                .addString("Name", x => x.name, null, "GridName")
                .addCustomColumn("Status", x => x.id + " " + x.dtcCode, () => null, null, null, "GridStatus",{ filterable: false, sortable: false })
                .setRowChangeHandler(x => console.log(x))
                .withQA("SimpleGrid")
                .render();
        });
    }

    private renderParticipantDropdown = () => (
        <div>
            <label className="col-md-4">
                Choose a participant:<br />
                {Loader.for(this.state.participants.map(x => x.items), participants => {
                    const TypedAutoComplete = Form.AutoComplete as Newable<Form.AutoComplete<Dtos.ParticipantListSummaryDto>>;
                    return <TypedAutoComplete
                        options={participants}
                        onChange={value => {
                            if (!!value) {
                                $('#react-demo-participant-chosen').html(`<ul><li>${value.name}</li><li>${value.dtcCode}</li><li>${value.id}</li></ul>`);
                            }
                            else {
                                $('#react-demo-participant-chosen').html(`Please select from the list on the left`);
                            }
                        }}
                        map={m => m.dtcCode + " - " + m.name}
                        qa="TypedAutoComplete"
                    //value={participants.find(p => p.id === this.props.filter.participantId)}
                    />
                })}
            </label>
            <div style={{ display: 'table-row' }} id="react-demo-participant-chosen"></div>
        </div>
    )

    private renderDatePicker = () => (
        <div>
            <label className="col-md-4">
                Choose a date:<br />
                <Form.DateInput value={this.state.chosenDate} onChange={value => this.setState({ chosenDate: value })} qa="DateInput"/>
            </label>
            <Form.Date qa="DatePicker" date={this.state.chosenDate}/><br /><br />
            <Form.DateTime qa="DateTimePicker" date={this.state.chosenDate}/>
        </div>
    )

    private renderDateTimePicker = () => (
        <div>
            <Form.DateTimeInput qa="DateTimeInput" value={this.state.chosenDate} onChange={value => {
                this.setState({ chosenDate: value });
                console.log(value)
            }
            }/>
        </div>
    )

    private renderRadioButtons() {
        return <Form.BooleanInput
            name={"radio-group-1"}
            value={true}
            disabled={false}
            onChange={(v) => console.log(v)}
            qa="BooleanInput"
        />
    }

    private renderBatchClaimDetails() {
        let builder = DetailsBuilder.ForPending(this.state.claimDetails);
        builder.addHeading(x => <span>{`Issuer: `}{x.event.issuer}</span>);
        builder.addHeading(x =>
            <span>
                {`ADR Record Date: `}
                <Form.Date date={x.event.adrRecordDate} qa="AdrRecordDate"/>
            </span>
        );

        let col1 = builder.addColumn("Batch claim #", x => x.batchClaimReference, 40, "BatchClaimDetailsColumnOne", 45, 55);
        col1.addString("DTC Participant Number", x => x.participant.dtcCode, "DtcParticipantNumber");
        col1.addString("DTC Participant Name", x => x.participant.name, "DtcParticipantName");
        col1.addDateTime("Submision Date", x => x.submissionDate, "SubmissionDate");
        col1.addString("Submitted by", x => x.submittedByName, "SubmittedBy");
        col1.addString("Filing Method Type/Round", x => x.round.name, "FilingMethodTypeRound");

        let col2 = builder.addColumn("Status", x => x.statusName, 30, "BatchClaimDetailsColumnTwo", 58, 42);
        col2.addDate("ADR Pay Date", x => x.event.approxAdrPayDate, "AdrPayDate");
        col2.addCustom("ADR:ORD Ratio", x => `${x.event.ratioAdr}:${x.event.ratioOrd}`, "AdrOrdRatio");
        col2.addNumber("Claimed ADR Position", x => x.claimedADRPosition, "ClaimedAdrPosition");
        col2.addNumber("Claimed ORD Position", x => x.claimedORDPosition, "ClaimedOrdPosition");
        col2.addNumber("# Beneficial Owners Included", x => x.beneficialOwnerCount, "NumberBeneficialOwnersIncluded");

        let col3 = builder.addColumn("", x => "", 30, "BatchClaimDetailsColumnThree", 55, 44);
        col3.addString("B#", x => x.event.bNum, "BatchNumber");
        col3.addString("CUSIP", x => x.event.cusip, "Cusip");
        col3.addString("Country of Issuance", x => x.event.countryofIssuance.countryName, "CountryOfIssuance");
        col3.addString("Event Type", x => x.event.eventType.name, "EventType");
        col3.addCustom("Depositary", x => <Form.Depository {...x.event} />, "Depositary");

        return builder.render();
    }

    private renderUploadButton() {
        return <button className="btn btn-primary col-md-3" onClick={this.renderUploadPopup}>Upload Completed Documents</button>
    }

    private renderUploadPopup = () => {
        const uploadPopup = new PopupBuilder();
        uploadPopup.setContent(
            <PageComponents.BatchClaimDocUploader
                dataId={this.claimId.toString()}
                onClosePopup={() => uploadPopup.close()}
                fileUploaded={() => console.log('File uploaded')}
                saveUrl={"/api/batchclaimfileupload/files"}
               
            />
        );
        uploadPopup.setTitle("Upload Completed Documents");
        uploadPopup.render();
    }

    private renderPopupButton = () => {
        return <button className="btn btn-primary" onClick={() => this.renderSimplePopup()}>show popup window</button>
    }

    private renderSimplePopup = () => {
        const simplePopup = new PopupBuilder().setTitle("This is a simple popup");
        simplePopup.setContent(
            <div className="popup-content">
                <div className="mb-3">
                    Hello world - I'm just demonstrating my imagination here...
                    </div>
                <div className="text-end">
                    <button className="btn btn-outline-secondary" onClick={() => simplePopup.close()}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => alert('Confirmed')}>Confirm</button>
                </div>
            </div>
        );
        simplePopup.render();
    }

    private renderMessages() {
        return (
            <div>
                <Form.Message type="alert" hide={false} message={"Unable to delete file"} qa="UnableToDeleteFileMessage"/>
                <Form.Message type="success" hide={false} message={"File uploaded"} qa="FileUploadedMessage"/>
                <Form.Message type="info" hide={false} message={"Hello visitor"} qa="HelloVisitorMessage"/>
            </div>
        );
    }

    private renderTextArea() {
        return <Form.TextArea value={"Just a text area - see console for changes while typing"} onChange={(v) => console.log("Textarea changed: ", v)} qa="TextArea"/>
    }

    private renderTextInput() {
        return <Form.TextInput value={"See console for changes"} onChange={(v) => console.log("Textinput changed: ", v)} qa="TextInput"/>
    }

    private renderTabs() {
        let tabsToRender = ["First Tab", "Second Tab", "Third Tab"];

        return (
            <Form.FormGroup qa="Tabs">
                <Form.TabComponent tabs={tabsToRender} selectedTab={1} onSelectedTabChange={i => console.log("Selected tab is now:", i)} qa="TabComponent">
                    <div>This is the content of the 1st tab</div>
                    <div>This is the content of the 2nd tab</div>
                    <div>This is the content of the 3rd tab</div>
                </Form.TabComponent>
            </Form.FormGroup>
        );
    }

    private renderTracker(steps: step[]){
    return (
        <div>
            <ClaimSteppedTracker steps={steps}/>
        </div>
    )}

    private renderAccordion = () => {
        const accStyle = {
            titleStyle: { backgroundColor: '#888888', color: 'white', borderRadius: '8px', padding: '5px' },
            contentStyle: { marginBottom: '3px', marginTop: '3px' }
        }

        var step1: step = { value: 10, name: 'early', state: 'complete'}
        var step2: step = { value: 20, name: 'earlyish', state: 'disabled'}
        var step3: step = { value: 30, name: 'mid', state: 'complete'}
        var step4: step = { value: 40, name: 'lateish', state: 'disabled' }
        var step5: step = { value: 50, name: 'late', state: 'active'}



        return (
            <Form.Accordion>

                    {this.renderTracker([step1,step2,step3,step4,step5])}

                <Form.AccordionSection title="1. Simple grid with button for popup. No paging, no sorting and no filtering" onClick={value => console.log(value)} qa="1">
                    {this.renderSimpleGridWithButton()}
                </Form.AccordionSection>
                <Form.AccordionSection title="2. Simple grid, no server-side paging/sorting/filtering, but with client-side paging/sorting/filtering" onClick={value => console.log(value)} qa="2">
                    {this.renderSimpleGrid()}
                </Form.AccordionSection>
                <Form.AccordionSection title="3. Pageable grid, server-side paging, sorting &amp; filtering. Used through another component (with props)" onClick={value => console.log(value)} qa="3">
                    {this.renderPageableGrid1()}
                </Form.AccordionSection>
                <Form.AccordionSection title="4. Pageable grid, server-side paging, sorting &amp; filtering. Used directly." onClick={value => console.log(value)} qa="4">
                    {this.renderPageableGrid2()}
                </Form.AccordionSection>
                <Form.AccordionSection title="5. Autocomplete dropdown" onClick={value => console.log(value)} qa="5">
                    {this.renderParticipantDropdown()}
                </Form.AccordionSection>
                <Form.AccordionSection title="6. Date picker" onClick={value => console.log(value)} qa="6">
                    {this.renderDatePicker()}
                </Form.AccordionSection>
                <Form.AccordionSection title="7. Date &amp; Time picker" onClick={value => console.log(value)} qa="7">
                    {this.renderDateTimePicker()}
                </Form.AccordionSection>
                <Form.AccordionSection title="8. Custom Boolean input - Yes/No radio buttons (Kendo did not play well with react, so had to create custom component)" onClick={value => console.log(value)} qa="8">
                    {this.renderRadioButtons()}
                </Form.AccordionSection>
                <Form.AccordionSection title="9. Detailsbuilder" onClick={value => console.log(value)} qa="9">
                    {this.renderBatchClaimDetails()}
                </Form.AccordionSection>
                <Form.AccordionSection title="10. File uploader" onClick={value => console.log(value)} qa="10">
                    {this.renderUploadButton()}
                </Form.AccordionSection>
                <Form.AccordionSection title="11. Simple popup" onClick={value => console.log(value)} qa="11">
                    {this.renderPopupButton()}
                </Form.AccordionSection>
                <Form.AccordionSection title="12. Messages" onClick={value => console.log(value)} qa="12">
                    {this.renderMessages()}
                </Form.AccordionSection>
                <Form.AccordionSection title="13. Textarea" onClick={value => console.log(value)} qa="13">
                    {this.renderTextArea()}
                </Form.AccordionSection>
                <Form.AccordionSection title="14. Textinput" onClick={value => console.log(value)} qa="14">
                    {this.renderTextInput()}
                </Form.AccordionSection>
                <Form.AccordionSection title="15. Tab component" onClick={value => console.log(value)} qa="15">
                    {this.renderTabs()}
                </Form.AccordionSection>
            </Form.Accordion>
        );
    }

    render() {
        return this.renderAccordion();
    }
};