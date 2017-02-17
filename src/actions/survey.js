import * as types from '.';


export function retrieveSurveys() {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        dispatch({
            type: types.RETRIEVE_SURVEYS,
            payload: {
                promise: z.resource('orgs', orgId, 'surveys').get(),
            }
        });
    };
}

export function retrieveSurvey(id) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        dispatch({
            type: types.RETRIEVE_SURVEY,
            meta: { id },
            payload: {
                promise: z.resource('orgs', orgId, 'surveys', id).get(),
            }
        });
    };
}