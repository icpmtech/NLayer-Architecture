import * as React from 'react';
import * as Framework from '../classes';
import { Apis, Dtos } from '../adr';

interface Props {
    isGoalUser: boolean;
    isTrmUser: boolean;
    termsUrl: string;
    disclaimerUrl: string;
    privacyUrl: string;
    contactUrl: string;
    userText: string;
    userFullName: string;
};

interface State {
    userguide?: Framework.Pending<Dtos.StaticFileConentKey>;
};

export class Footer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            userguide: new Framework.Pending<Dtos.StaticFileConentKey>()
        };
    }

    private linkStyle = {
        color: "#ffffff"
    };

    componentDidMount() {
        Framework.connect(new Apis.StaticContentApi().getUserGuideType(), this.state.userguide, (userguide) => this.setState({ userguide: userguide }));
    }

    render() {
        return Framework.Loader.for(this.state.userguide, guide => {
            const showHelp = !this.props.isGoalUser && !this.props.isTrmUser;
            const linkClassName = showHelp && guide ? "col-md-2" : "col-md-3";

            return (
                <div className="row col-md-12 align-items-start">
                    <div className="col-md-3">
                        <img src={"/Content/Images/GG-FooterIconsNoAccredit.png"} alt="Certified ISO 9001 2008 ISO/IEC 27001" className="img-fluid" data-qa="NoAccreditImage"/>
                    </div>
                    <div className="row col-md-9 footer-middle">
                        {showHelp && guide && this.renderUserGuide(guide)}
                        <div className={linkClassName}>
                            <a href={this.props.termsUrl} id="footer-t-and-c" style={this.linkStyle} data-qa="TermsAndConditionsLink">Terms and Conditions</a>
                        </div>
                        <div className={linkClassName}>
                            <a href={this.props.disclaimerUrl} id="footer-disclaimer" style={this.linkStyle} data-qa="DisclaimerLink">Disclaimer</a>
                        </div>
                        <div className={linkClassName}>
                            <a href={this.props.privacyUrl} id="footer-privacy" style={this.linkStyle} data-qa="PrivacyPolicyLink">Privacy Policy</a>
                        </div>
                        <div className={linkClassName}>
                            <a id="footer-contact-us" href={this.props.contactUrl} style={this.linkStyle} data-qa="ContactUsLink">Contact Us</a>
                        </div>
                        <div className="col-md-10" data-qa="AllRightsReserved">
                            <span>This website (including its subpages) was created by Goal Group of Companies and is © 2022 by Goal Group of Companies. All rights reserved.</span>
                        </div>
                        <div className="offset-md-5 col-md-5">
                            <div className="float-end">
                                <span data-automation="signed-in-as">{this.props.userText} {this.props.userFullName}</span>
                            </div>
                        </div>
                    </div>

                </div>
            )
        });
    }

    private renderUserGuide(guide: Dtos.StaticFileConentKey) {
        if (guide) {
            let url = new Apis.StaticContentApi().downloadUrl(guide);
            return (<div className="col-md-2"><a href={url} id="footer-userguide" style={this.linkStyle} data-qa="downloadUserGuideLink">Download User Guide</a></div>);
        }

        return (<div className="col-md-2"></div>);
    }
}