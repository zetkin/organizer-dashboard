import { injectIntl } from 'react-intl';
import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Link from '../misc/Link';
import PaneManager from '../../utils/PaneManager';
import { resolvePane } from '../panes';
import { componentClassNames } from '../';
import { SECTIONS } from '.';
import {
    openPane,
    closePane,
    replacePane,
    pushPane,
    gotoSection,
} from '../../actions/view';


@injectIntl
export default class Section extends React.Component {
    static propTypes = {
        panes: React.PropTypes.array.isRequired,
        dispatch: React.PropTypes.func.isRequired,
    };

    runPaneManager() {
        const panes = Object.keys(this.refs)
            .filter(key => (key.indexOf('pane') == 0 && key != 'paneContainer'))
            .sort((k0, k1) => parseInt(k0.slice(4)) - parseInt(k1.slice(4)))
            .map(function(key) {
                var paneDOMNode = ReactDOM.findDOMNode(this.refs[key]);
                return paneDOMNode;
            }, this);

        const containerDOMNode = ReactDOM.findDOMNode(this.refs.paneContainer);
        PaneManager.run(panes, containerDOMNode);
    }

    componentDidMount() {
        this.runPaneManager();
        window.addEventListener('keydown', this.onKeyDown.bind(this))
    }

    componentWillUnmount() {
        PaneManager.stop();
        window.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    componentDidUpdate(prevProps) {
        if (this.props.panes != prevProps.panes) {
            this.runPaneManager();
        }
    }

    render() {
        let section = SECTIONS[this.props.section];
        var subSections = section.subSections;
        var panes = [];
        var curSubSectionIndex;

        if (this.props.panes.length == 0) {
            curSubSectionIndex = 0;
            let Pane = subSections[0].startPane;
            panes.push(
                <Pane ref="pane0" key={ subSections[0].path }
                    onOpenPane={ this.onOpenPane.bind(this, 0) }
                    onPushPane={ this.onPushPane.bind(this) }
                    onReplace={ this.onReplacePane.bind(this, 0) }
                    />
            );
        }
        else {
            var subRefIndex = 1;
            var subStartIndex = 1;

            for (let i = 0; i < subSections.length; i++) {
                let sub = subSections[i];
                if (sub.path == this.props.panes[0].type) {
                    curSubSectionIndex = i;

                    let Pane = sub.startPane;
                    panes.push(
                        <Pane ref="pane0" key={ sub.path }
                            onOpenPane={ this.onOpenPane.bind(this, 0) }
                            onPushPane={ this.onPushPane.bind(this) }
                            onReplace={ this.onReplacePane.bind(this, 0) }
                            paneData={ this.props.panes[0] }
                            />
                    );
                    break;
                }
            }

            // No base pane could be found. For most sub-sections, the first
            // URL segment after the section references the sub-section. But
            // for the start sub-section this might not be defined, e.g. the
            // sub-section at /people/list can also be found at /people. Since
            // no sub-section could be found, the segment at 0 probably really
            // references the next pane, so we should fall back to use the
            // default/home pane of this sub-section first.
            if (panes.length == 0) {
                curSubSectionIndex = 0;
                let sub = subSections[0];
                let Pane = sub.startPane;
                panes.push(
                    <Pane ref="pane0" key={ sub.path }
                        onOpenPane={ this.onOpenPane.bind(this, 0) }
                        onPushPane={ this.onPushPane.bind(this) }/>
                );

                subStartIndex = 0;
            }

            for (let i = subStartIndex; i < this.props.panes.length; i++) {
                let paneData = this.props.panes[i];
                let Pane = resolvePane(paneData.type);

                panes.push(
                    <Pane ref={ 'pane' + subRefIndex } key={ paneData.id }
                        onClose={ this.onClosePane.bind(this, i) }
                        onReplace={ this.onReplacePane.bind(this, i) }
                        onOpenPane={ this.onOpenPane.bind(this, i) }
                        onPushPane={ this.onPushPane.bind(this) }
                        paneData={ paneData }/>
                );

                subRefIndex++;
            }
        }

        const formatMessage = this.props.intl.formatMessage;
        const sectionType = this.props.section;
        const helpUrl = formatMessage({ id: 'sections.menu.helpLink.href' });
        const infoUrl = formatMessage({ id: 'sections.menu.infoLink.href' });
        const classes = cx(componentClassNames(this), 'Section-' + sectionType);

        let subMenuItems = subSections.map((subData, idx) => {
            let label = formatMessage({
                id: 'sections.subSections.'
                    + this.props.section
                    + '.' + subData.path,
            });

            let classes = cx('Section-navItem',
                'Section-navItem-' + subData.path, {
                    'selected': (idx === curSubSectionIndex)
                });

            return (
                <li key={ subData.path } className={ classes }>
                    <a onClick={ this.onClickSub.bind(this, subData) }>
                        { label }</a>
                </li>
            );
        });

        const backLabel = formatMessage({ id: 'sections.menu.backToDashboard' });

        return (
            <div className={ classes }>
                <nav className="Section-nav">
                    <ul>
                        { subMenuItems }
                        <li key="back"
                            className='Section-navItem Section-navBack'>
                            <a onClick={ this.onClickBack.bind(this) }>
                                { backLabel }</a></li>
                    </ul>
                    <div className="Section-navMisc">
                        <Link target="_blank" href={ infoUrl }
                            msgId="sections.menu.infoLink.text"/>
                        <Link target="_blank" href={ helpUrl }
                            msgId="sections.menu.helpLink.text"/>
                    </div>
                </nav>
                <div className="Section-container" ref="paneContainer">
                    { panes }
                </div>
            </div>
        );
    }

    onClickSub(subData) {
        this.props.dispatch(gotoSection(this.props.section, subData.path));
    }

    getSubSections() {
        return [];
    }

    renderSectionContent() {
        throw "renderSectionContent() not implemented";
    }

    onClickBack(index) {
        this.props.dispatch(gotoSection(null));
    }

    onClosePane(index) {
        this.props.dispatch(closePane(index));
    }

    onReplacePane(index, paneType, params) {
        this.props.dispatch(replacePane(index, paneType, params));
    }

    onOpenPane(index, paneType, params) {
        this.props.dispatch(openPane(index, paneType, params));
    }

    onPushPane(paneType, params) {
        this.props.dispatch(pushPane(paneType, params));
    }

    onKeyDown(ev) {
        if (ev.keyCode === 27 && this.props.panes.length !== 0) {
            const tagName = ev.target.tagName.toLowerCase();

            if (tagName === 'input'
                || tagName === 'textarea'
                || tagName === 'select'
                || ev.target.contentEditable === 'true') {
                return;
            }
            else {
                this.onClosePane(this.props.panes.length - 1);
            }
        }
    }
}
