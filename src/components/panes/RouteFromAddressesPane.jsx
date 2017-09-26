import React from 'react';
import { FormattedMessage as Msg, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import Button from '../misc/Button';
import PaneBase from './PaneBase';
import RelSelectInput from '../forms/inputs/RelSelectInput';
import { getListItemById } from '../../utils/store';
import { finishSelection } from '../../actions/selection';


const mapStateToProps = (state, props) => {
    let selectionId = props.paneData.params[0];
    let selectionList = state.selections.selectionList;

    return {
        routeList: state.routes.routeList,
        selectionItem: getListItemById(selectionList, selectionId),
    };
};


@connect(mapStateToProps)
@injectIntl
export default class RouteFromAddressesPane extends PaneBase {
    componentDidMount() {
        super.componentDidMount();
    }

    getPaneTitle(data) {
        return this.props.intl.formatMessage(
            { id: 'panes.routeFromSelection.title' },
            { count: this.props.selectionItem.data.selectedIds.length });
    }

    renderPaneContent(data) {
        let routes = this.props.routeList.items.map(i => i.data);

        let content = [
            <div key="create">
                <Msg tagName="h3" id="panes.routeFromSelection.create.h"/>
                <Msg tagName="p" id="panes.routeFromSelection.create.desc"/>
                <Button
                    labelMsg="panes.routeFromSelection.create.createButton"
                       />
            </div>,
        ];

        if (routes.length) {
            let addButton = null;
            if (this.state.routeId) {
                addButton = (
                    <Button
                        labelMsg="panes.routeFromSelection.extend.addButton"
                           />
                );
            }

            content.push(
                <div key="extend">
                    <Msg tagName="h3" id="panes.routeFromSelection.extend.h"/>
                    <Msg tagName="p" id="panes.routeFromSelection.extend.desc"/>
                    <RelSelectInput name="route"
                        objects={ routes } value={ this.state.routeId }
                        onValueChange={ this.onRouteChange.bind(this) }
                        />
                    { addButton }
                </div>
            );
        }
        else {
            content.push(
                <div key="extend">
                    <Msg tagName="h3" id="panes.routeFromSelection.extend.h"/>
                    <Msg tagName="p" id="panes.routeFromSelection.extend.empty"/>
                </div>
            );
        }

        return content;
    }

    onRouteChange(name, value) {
        this.setState({
            routeId: value,
        });
    }
}