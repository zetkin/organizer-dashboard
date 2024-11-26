import * as types from '.';


export function retrieveCalls(page = 0, filters = {}) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;

        let filterStrings = [];

        switch (filters.oa) {
            case 'needed':
                filterStrings.push(['organizer_action_needed', '==', 1])
                break;
            case 'taken':
                filterStrings.push(['organizer_action_taken', '==', 1])
                break;
            case 'notTaken':
                filterStrings.push(['organizer_action_needed', '==', 1])
                filterStrings.push(['organizer_action_taken', '!=', 1])
                break;
        }

        dispatch({
            type: types.RETRIEVE_CALLS,
            meta: { page },
            payload: {
                promise: z.resource('orgs', orgId, 'calls')
                    .get(page, 100, filterStrings),
            }
        });
    };
}

export function retrieveCall(id, retrieveMessage = false) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;

        dispatch({
            type: types.RETRIEVE_CALL,
            meta: { id, retrieveMessage },
            payload: {
                promise: z.resource('orgs', orgId, 'calls', id).get()
            }
        });
    };
}

export function toggleCallActionTaken(id, actionTaken) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        let data = { organizer_action_taken: !!actionTaken };

        dispatch({
            type: types.TOGGLE_CALL_ACTION_TAKEN,
            meta: { id },
            payload: {
                promise: z.resource('orgs', orgId, 'calls', id).patch(data),
            }
        });
    }
}
