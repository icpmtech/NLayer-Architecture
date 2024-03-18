import * as React from 'react';
import * as Framework from '../../classes';
import * as Components from '../../components'
import { Dtos } from '../../adr';
interface Props {
    event: Framework.Pending<Dtos.EventDto>;
    round: Framework.Pending<Dtos.RoundDto>;
    category: Framework.Pending<Dtos.RoundCategoryDto>;
    currentPage: string;
}

export class Trail extends React.Component<Props, {}> {
    render() {
        let event = this.props.event && this.props.event.isDone() && this.props.event.data;
        let round = this.props.round && this.props.round.isDone() && this.props.round.data;
        let category = this.props.category && this.props.category.isDone() && this.props.category.data;
        let items: React.ReactNode[] = [];
        if (event) {
            items.push(<span>{`${event.cusip} - ${event.issuer} - RD `}{<Components.Date date={event.adrRecordDate} isDateOnly={true} qa="TrailDate"/>}</span>);
            if (round) {
                items.push(`${round.name}`);
                if (category) {
                    items.push(`${category.description}`);
                }
            }
        }

        if (this.props.currentPage) {
            items.push(this.props.currentPage);
        }

        if (!items.length) return null;
        return (
            <ol className="breadcrumb" style={{ marginTop: "15px", marginBottom: "30px", width: "fit-content"}}>
                {items.map((x,i) => (
                    <li key={i} className="breadcrumb-item" data-qa="Breadcrumb">{x}</li>
                ))}
            </ol>
        );
        // return <div style={{ marginTop: "15px", marginBottom: "30px" }}>{items.map((x, i) => (<span key={"item" + i} className={"breadcrumb" + (i === (items.length - 1) ? " last" : "")} data-qa="Breadcrumb">{x}</span>))}</div>;
    }
}
