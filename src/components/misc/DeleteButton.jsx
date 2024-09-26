import React from 'react';

import Button from './Button';

import { FormattedMessage as Msg } from 'react-intl';

export default class DeleteButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false,
        };
    }

    render() {
        if (!this.state.clicked) {
            return (
                <div className="DeleteButton">
                    <a
                        className="DeleteButton-delete"
                        onClick={() => this.setState({clicked: true})}
                    >
                        <Msg id="misc.deleteButton.label"/>
                    </a>
                </div>
            );
        } else {
            return (
                <div className="DeleteButton">
                    <Msg id="misc.deleteButton.confirmPrompt"/>
                    <Button className="DeleteButton-confirm"
                        labelMsg="misc.deleteButton.confirm"
                        onClick={this.props.onClick}
                    />
                    <a
                        className="DeleteButton-cancel"
                        onClick={() => this.setState({clicked: false})}
                    >
                        <Msg id="misc.deleteButton.cancel"/>
                    </a>
                </div>
            );
        }
    }
}
