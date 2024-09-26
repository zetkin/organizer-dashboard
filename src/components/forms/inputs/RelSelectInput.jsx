import { injectIntl, FormattedMessage as Msg } from 'react-intl';
import ReactDOM from 'react-dom';
import React from 'react';
import cx from 'classnames';

import InputBase from './InputBase';


@injectIntl
export default class RelSelectInput extends InputBase {
    constructor(props) {
        super(props);

        this.state = {
            inputFocused: false,
            focusedIndex: undefined,
            inputValue: undefined
        };
    }

    componentWillReceiveProps(newProps) {
        if ('value' in newProps) {
            this.setState({
                focusedIndex: undefined,
                inputValue: undefined
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.state.inputFocused && !prevState.inputFocused && this.selectedRef) {
            // Scroll the selected element into view if the input is newly focused
            this.selectedRef.scrollIntoView();
        }
    }

    componentDidMount() {
        const listDOMNode = ReactDOM.findDOMNode(this.refs.objectList);
        listDOMNode.addEventListener('mousewheel', onWheelStopPropagation);
    }

    componentWillUnmount() {
        const listDOMNode = ReactDOM.findDOMNode(this.refs.objectList);
        listDOMNode.removeEventListener('mousewheel', onWheelStopPropagation);
    }

    renderInput() {
        const value = this.props.value;
        let objects = this.props.objects;
        const showEditLink = this.props.showEditLink;
        const valueField = this.props.valueField;
        const selected = (value && objects)?
            objects.find(o => o[valueField] == value) : null;
        const hidden = this.props.hidden || false;
        const disableFiltering = this.props.disableFiltering;

        var inputValue = this.state.inputValue;
        if (inputValue === undefined) {
            inputValue = (selected? this.getLabel(selected) : '');
        }

        const classes = cx({
            'RelSelectInput': true,
            'focused': this.state.inputFocused,
            'hidden': hidden
        });

        if (!disableFiltering) {
            objects = this.getFilteredObjects()
        };

        this.values = objects.map(o => o[valueField]);

        var createOption = null;
        if (this.props.showCreateOption) {
            const createOptionClasses = cx({
                'RelSelectInput-create': true,
                'focused': (this.state.focusedIndex == this.values.length)
            });

            let value = (
                <em>{ this.state.inputValue }</em>
            );

            createOption = (
                <li key="create" className={ createOptionClasses }
                    onMouseDown={ this.onClickCreate.bind(this) }>
                    <label className="RelSelectInput-itemLabel">
                        <Msg id="forms.relSelectInput.addLabel"
                            values={{ value }}/>
                    </label>
                </li>
            );

            this.values.push('+');
        }

        var nullOption = null;
        if (this.props.allowNull) {
            const nullOptionClasses = cx({
                'RelSelectInput-null': true,
                'focused': (this.state.focusedIndex == this.values.length)
            });

            nullOption = (
                <li key="null" className={ nullOptionClasses }
                    onMouseDown={ this.onClickNull.bind(this) }>
                    <label className="RelSelectInput-itemLabel">
                        { this.props.nullLabel }
                    </label>
                </li>
            );

            this.values.push('-');
        }

        let placeholder = this.props.intl.formatMessage(
            { id: 'misc.relSelectInput.placeholder' });

        return (
            <div className={ classes }>
                <input type="text" ref="input" value={ inputValue }
                    placeholder={ placeholder }
                    onChange={ this.onInputChange.bind(this) }
                    onFocus={ this.onFocus.bind(this) }
                    onKeyDown={ this.onKeyDown.bind(this) }
                    onBlur={ this.onBlur.bind(this) }/>
                <ul ref="objectList">
                {objects.map(function(obj, idx) {
                    const value = obj[valueField];
                    const classes = cx({
                        'selected': (obj == selected),
                        'focused': (idx === this.state.focusedIndex)
                    });

                    var editLink = null;
                    if (showEditLink && !obj.noEdit) {
                        editLink = <a className="RelSelectInput-editLink"
                            onClick={ this.onClickEdit.bind(this, obj) }/>;
                    }

                    return (
                        <li key={ value } className={ classes }
                            ref={ ref => {
                                    if(obj == selected) {
                                        this.selectedRef = ref;
                                    }
                                }
                            }>
                            <label className="RelSelectInput-itemLabel"
                                onMouseDown={ this.onClickOption.bind(this, obj) }>
                                { this.getLabel(obj) }
                            </label>
                            { editLink }
                        </li>
                    );
                }, this)}
                    { nullOption }
                    { createOption }
                </ul>
            </div>
        );
    }

    getLabel(obj) {
        if (this.props.labelFunc) {
            return this.props.labelFunc(obj);
        }
        else if (this.props.labelField) {
            return obj[this.props.labelField];
        }
        else {
            return obj.title || obj[this.props.valueField];
        }
    };

    getFilteredObjects() {
        let filter = this.state.inputValue;
        let filterLen = filter? filter.length : 0;
        let minLen = this.props.minFilterLength || 0;

        // Return an empty array if the filter is not long enough
        if (filterLen < minLen) {
            return [];
        }

        // Filter objects based on input value, unless it's undefined or
        // an empty string in which case all objects should be displayed.
        return this.props.objects.filter(o =>
            (!filter || this.getLabel(o).toLowerCase()
                .indexOf(filter.toLowerCase()) >= 0));
    }

    onInputChange(ev) {
        this.setState({
            focusedIndex: undefined,
            inputValue: ev.target.value
        });

        const listDOMNode = ReactDOM.findDOMNode(this.refs.objectList);
        listDOMNode.scrollTop = 0;
        if (this.props.onQueryChange) {
            this.props.onQueryChange(ev.target.value);
        }
    }

    onKeyDown(ev) {
        ev.stopPropagation();
        const focusedIndex = this.state.focusedIndex;
        const objects = this.getFilteredObjects();
        const valueCount = this.values.length;
        const maxIndex = valueCount - 1;
        const listDOMNode = ReactDOM.findDOMNode(this.refs.objectList);

        if (ev.keyCode == 40) {
            // User pressed down, increment or set to zero if undefined
            this.setState({
                focusedIndex: Math.min(maxIndex,
                    (focusedIndex === undefined)? 0 : focusedIndex + 1)
            });

            // Scroll the list
            const newFocusedIndex = this.state.focusedIndex;
            if(newFocusedIndex !== undefined && newFocusedIndex != 0) {
                const element = listDOMNode.children[newFocusedIndex];
                listDOMNode.scrollTop = Math.min(listDOMNode.scrollHeight, 
                    listDOMNode.scrollTop + element.offsetHeight);
            }


            ev.preventDefault();
        }
        else if (ev.keyCode == 38) {
            // User pressed up, decrement or set to last if undefined
            this.setState({
                focusedIndex: Math.max(0, (focusedIndex === undefined)?
                    maxIndex : focusedIndex - 1)
            });

            // Scroll the list
            // When scrolling up, the scrollIntoView() function doesn't work properly
            const newFocusedIndex = this.state.focusedIndex;
            if(newFocusedIndex !== undefined && newFocusedIndex != maxIndex) {
                const element = listDOMNode.children[newFocusedIndex];
                listDOMNode.scrollTop = Math.max(0, 
                    listDOMNode.scrollTop - element.offsetHeight);
            }

            ev.preventDefault();
        }
        else if (ev.keyCode == 13) {
            if (focusedIndex >= 0 && focusedIndex < valueCount) {
                const value = this.values[focusedIndex];
                if (value == '+') {
                    // User pressed enter on the "create option"
                    this.createObject();
                }
                else if (value == '-') {
                    this.selectNull();
                }
                else {
                    this.selectValue(value);
                }
            }

            // Blur field and prevent form from being submitted
            ReactDOM.findDOMNode(this.refs.input).blur();
            ev.preventDefault();
        }
        else if (ev.keyCode == 27) {
            const inputDOMNode = ReactDOM.findDOMNode(this.refs.input);
            inputDOMNode.blur();
        }
    }

    onClickOption(obj) {
        const valueField = this.props.valueField;
        this.selectValue(obj[valueField]);
    }

    onClickEdit(obj) {
        if (this.props.onEdit) {
            this.props.onEdit(obj);
        }
    }

    onClickCreate() {
        this.createObject();
    }

    onClickNull() {
        this.selectNull();
    }

    onFocus(ev) {
        if(this.props.onFocus){
            this.props.onFocus();
        }
        this.setState({
            inputValue: undefined,
            inputFocused: true
        });
    }

    onBlur(ev) {
        if(this.props.onBlur){
            this.props.onBlur();
        }
        // TODO: This is a smelly solution to the onClick/onMouseDown problem
        //       The blur event fires on mouse down, so the click event never
        //       fires if blurring hides the menu.
        setTimeout(() => {
            const listDOMNode = ReactDOM.findDOMNode(this.refs.objectList);
            if (listDOMNode) {
                listDOMNode.scrollTop = 0;

                this.setState({
                    inputValue: undefined,
                    inputFocused: false
                });
            }
        }, 200);
    }

    createObject() {
        if (this.props.onCreate) {
            this.props.onCreate(this.state.inputValue);
        }
    }

    selectValue(value) {
        if (this.props.onValueChange) {
            const name = this.props.name;

            this.props.onValueChange(name, value);
        }
    }

    selectNull() {
        if (this.props.onValueChange) {
            this.props.onValueChange(name, null);
        }
    }
}

RelSelectInput.propTypes = {
    objects: React.PropTypes.array.isRequired,
    valueField: React.PropTypes.string,
    labelField: React.PropTypes.string,
    labelFunc: React.PropTypes.func,
    minFilterLength: React.PropTypes.number,
    nullLabel: React.PropTypes.string,
    showCreateOption: React.PropTypes.bool,
    showEditLink: React.PropTypes.bool,
    allowNull: React.PropTypes.bool,
    onValueChange: React.PropTypes.func,
    onCreate: React.PropTypes.func,
    onEdit: React.PropTypes.func
};

RelSelectInput.defaultProps = {
    showCreateOption: true,
    showEditLink: false,
    valueField: 'id',
    nullLabel: 'None'
};


function onWheelStopPropagation(ev) {
    ev.stopPropagation();
}
