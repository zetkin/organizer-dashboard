import React from 'react';
import { connect } from 'react-redux';
import {
    FormattedMessage as Msg,
    FormattedRelative,
    injectIntl
} from 'react-intl';

import PaneBase from './PaneBase';
import Form from '../forms/Form';
import TextArea from '../forms/inputs/TextArea';
import Avatar from '../misc/Avatar';
import Button from '../misc/Button';
import Person from '../misc/elements/Person';
import Action from '../misc/elements/Action';
import { retrieveAction, sendActionReminders } from '../../actions/action';
import { retrieveActionParticipants } from '../../actions/participant';
import { getListItemById } from '../../utils/store';


@connect(state => state)
@injectIntl
export default class ActionReminderPane extends PaneBase {
    getPaneTitle() {
        return this.props.intl.formatMessage(
            { id: 'panes.actionReminder.title' });
    }

    componentDidMount() {
        let actionId = this.getParam(0);
        this.props.dispatch(retrieveActionParticipants(actionId));
        this.props.dispatch(retrieveAction(actionId));
    }

    getRenderData() {
        let aid = this.getParam(0);
        let participantStore = this.props.participants;
        let participants = participantStore.byAction[aid] || [];

        return {
            actionItem: getListItemById(this.props.actions.actionList, aid),
            remindedParticipants: participants.filter(p => p.reminder_sent),
            newParticipants: participants.filter(p => !p.reminder_sent)
        };
    }

    renderPaneContent(data) {
        let reminderContent = null;

        const editableListItems = [
            'activity',
            'campaign',
            'location'
        ];

        if (data.actionItem && !data.actionItem.isPending) {
            reminderContent = [
                <Msg key="h" tagName="p"
                    id="panes.actionReminder.content.h"/>,
                <ul key="reminderContent" className="ActionReminderPane-reminderContent">
                    <Msg key="infoAction" tagName="li"
                        id="panes.actionReminder.content.infoAction"/>
                    { editableListItems.map(item => {
                        return (
                            <li key={ item }
                                onClick={ this.onEditReminderContent.bind(this, item, data.actionItem.data[item].id)}
                                className="ActionReminderPane-editableItem">
                                { this.props.intl.formatMessage({ id: 'panes.actionReminder.content.li' }, {
                                    content: data.actionItem.data[item].title,
                                }) }
                                <Msg key="clickToEdit" tagName="span"
                                    id="panes.actionReminder.content.clickToEdit"/>
                            </li>
                        )
                    })}
                    <Msg key="infoZetkin" tagName="li"
                        id="panes.actionReminder.content.infoZetkin"/>
                </ul>,
            ];
        }

        var reminderForm = null;
        if (data.newParticipants.length) {
            reminderForm = [
                <Msg key="h" tagName="h3"
                    id="panes.actionReminder.toBeReminded.h"/>,
                <ul key="newParticipantsList"
                    className="ActionReminderPane-newParticipants">
                {data.newParticipants.map(function(participant) {
                    return (
                        <li key={ participant.id }>
                            <Avatar person={ participant }/>
                        </li>
                    );
                })}
                </ul>,
            ];
        }

        var remindedList = null;
        if (data.remindedParticipants.length) {
            let remindedParticipants = data.remindedParticipants
                .concat()
                .sort((a, b) => {
                    if (a.reminder_sent < b.reminder_sent) {
                        return 1;
                    }
                    else if (a.reminder_sent == b.reminder_sent) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                });

            remindedList = [
                <Msg key="h" tagName="h3"
                    id="panes.actionReminder.alreadyReminded.h"/>,
                <ul key="remindedList" className="ActionReminderPane-reminded">
                {remindedParticipants.map(function(participant) {
                    const onClick = this.onPersonClick.bind(this, participant);

                    let date = Date.create(participant.reminder_sent);
                    let now = new Date();
                    if (date > now) {
                        date = now;
                    }

                    return (
                        <li key={ participant.id }>
                            <Avatar person={ participant }/>
                            <div className="ActionReminderPane-remindedInfo">
                                <Person person={ participant }
                                    onClick={ onClick }/>
                                <div className="ActionReminderPane-timestamp">
                                    <FormattedRelative value={ date }/>
                                </div>
                            </div>
                        </li>
                    );
                }, this)}
                </ul>
            ];
        }

        return [
            reminderContent,
            reminderForm,
            remindedList
        ];
    }

    renderPaneFooter(data) {
        if (data.actionItem) {
            return (
                <Button className="ActionReminderPane-saveButton"
                    isPending={ data.actionItem.isReminderPending }
                    labelMsg="panes.actionReminder.saveButton"
                    onClick={ this.onRemindersSubmit.bind(this) }/>
            );
        }
        else {
            return null;
        }
    }

    onRemindersSubmit(ev) {
        ev.preventDefault();
        let actionId = this.getParam(0);
        this.props.dispatch(sendActionReminders(actionId));
    }

    onPersonClick(person) {
        this.openPane('person', person.id);
    }

    onEditReminderContent(field, id) {
        this.openPane('edit' + field, id);
    }
}
