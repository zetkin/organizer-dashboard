import * as types from '../actions';
import {
    createList,
    createListItems,
    updateOrAddListItem
} from '../utils/store';


export default function calls(state = null, action) {
    let call;

    switch(action.type) {
        case types.RETRIEVE_CALLS + '_PENDING':
            return Object.assign({}, state, {
                callList: Object.assign({}, state.callList, {
                    isPending: true,
                    error: null,
                }),
            });

        case types.RETRIEVE_CALLS + '_FULFILLED':
            let items = state.callList.items;
            let page = action.meta.page;
            if (page > state.callList.lastPage) {
                items = items.concat(
                    createListItems(action.payload.data.data));
            }
            else {
                items = createListItems(action.payload.data.data);
            }

            return Object.assign({
                callList: {
                    isPending: false,
                    error: null,
                    lastPage: Math.max(state.callList.lastPage, page),
                    items: items,
                }
            });

        case types.RETRIEVE_CALL + '_PENDING':
            const messageIsPending = action.meta.retrieveMessage;

            return Object.assign({
                callList: updateOrAddListItem(state.callList,
                    action.meta.id, null, { isPending: !messageIsPending }),
            });

        case types.RETRIEVE_CALL + '_FULFILLED':
            call = action.payload.data.data;
            return Object.assign({
                callList: updateOrAddListItem(state.callList,
                    call.id, call, { isPending: false, error: null }),
            });

        case types.TOGGLE_CALL_ACTION_TAKEN + '_FULFILLED':
            call = action.payload.data.data;
            return Object.assign({
                callList: updateOrAddListItem(state.callList,
                    call.id, call, { isPending: false, error: null }),
            });

        default:
            return state || {
                callList: createList(),
            };
    }
}
