import * as types from '../actions';
import {
    createList,
    createListItems,
} from '../utils/store';


export default function smsDistributions(state = null, action) {
    switch (action.type) {
        case types.RETRIEVE_SMS_DISTRIBUTIONS + '_PENDING':
            return Object.assign({}, state, {
                distributionList: Object.assign({}, state.distributionList, {
                    isPending: true,
                    error: null,
                })
            });

        case types.RETRIEVE_SMS_DISTRIBUTIONS + '_FULFILLED':
            return Object.assign({}, state, {
                distributionList: {
                    isPending: false,
                    error: null,
                    items: createListItems(action.payload.data.data)
                }
            });

        default:
            return state || {
                distributionList: createList(),
            };
    }
};
