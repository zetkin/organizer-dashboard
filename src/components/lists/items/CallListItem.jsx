import { connect } from 'react-redux';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage as Msg } from 'react-intl';
import { retrieveCall } from '../../../actions/call';

import Avatar from '../../misc/Avatar';

@connect()
export default class CallListItem extends React.Component {
    static propTypes = {
        onItemClick: React.PropTypes.func.isRequired,
        data: React.PropTypes.object,
    };

    componentDidUpdate(prevProps) {
        const call = this.props.data;

        if (this.props.inView && !prevProps.inView) {
            if (!call || call.message_to_organizer !== undefined) {
                return;
            }
            else if (call.organizer_action_needed) {
                this.props.dispatch(retrieveCall(call.id, true));
            }
        }
    }

    render() {
        let call = this.props.data;
        if (!call) return null;

        let timestamp = Date.create(call.allocation_time);
        let stateClass = "CallListItem-state";
        let stateLabel = null;
        let actionStatus = null;
        let organizerMessage = null;

        switch (call.state) {
            case 0:
                stateLabel = "lists.callList.item.status.allocated";
                stateClass += "Allocated";
                break;
            case 1:
                stateLabel = "lists.callList.item.status.reached";
                stateClass += "Success";
                break;
            default:
                stateLabel = "lists.callList.item.status.notReached";
                stateClass += "Failed";
        }

        if (call.organizer_action_taken) {
            actionStatus = "taken";
        }
        else if (call.organizer_action_needed) {
            actionStatus = "needed";
        }

        if (actionStatus) {
            const messageClassNames = cx('CallListItem-organizerMsg', {
                loading: call.message_to_organizer === undefined,
                empty: call.message_to_organizer === null,
            });

            let messageContent = null;

            if (call.message_to_organizer === null) {
                messageContent = (
                    <Msg tagName="span"
                        id="lists.callList.item.organizerMsg.noMessage"/>
                );
            }
            else if (call.message_to_organizer && call.message_to_organizer.length > 180) {
                messageContent = call.message_to_organizer.substr(0, 180) + '...';
            }
            else {
                messageContent = call.message_to_organizer;
            }

            organizerMessage = (
                <span className={ messageClassNames }>
                    { messageContent }</span>
            );
        }

        let actionClassNames  = cx('CallListItem-action', actionStatus );

        return (
            <div className="CallListItem"
                onClick={ this.props.onItemClick.bind(this, call) }>
                <div className="ListItem-date">
                    <span className="date">
                        { timestamp.format('{d}/{M}, {yyyy}') }</span>
                    <span className="time">
                        { timestamp.format('{HH}:{mm}') }</span>
                </div>
                <div className="CallListItem-content">
                    <div className="CallListItem-target">
                        <Avatar className="CallListItem-targetAvatar"
                            person={ call.target }/>
                        <span className="CallListItem-targetName">
                            { call.target.name }</span>
                    </div>
                    <div className="CallListItem-callInfo">
                        <span className={ "CallListItem-callStatus "
                            + stateClass }>
                            <Msg id={ stateLabel.toString() }/>
                        </span>
                        <span className="CallListItem-caller">
                            { call.caller.name }</span>
                        { organizerMessage }
                    </div>
                    <div className="CallListItem-callStatuses"/>
                    <div className="CallListItem-organizerStatuses"/>
                </div>
                <div className={ actionClassNames }></div>
            </div>
        );
    }
}
