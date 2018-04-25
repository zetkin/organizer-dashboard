import * as types from './';


export function retrieveGroup(id) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        dispatch({
            type: types.RETRIEVE_GROUP,
            meta: { id },
            payload: {
                promise: z.resource('orgs', orgId, 'groups', id)
                    .get(),
            }
        });
    };
}

export function retrieveGroups() {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        dispatch({
            type: types.RETRIEVE_GROUPS,
            payload: {
                promise: z.resource('orgs', orgId, 'groups')
                    .get(),
            }
        });
    };
}

export function retrieveGroupMembers(id) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        dispatch({
            type: types.RETRIEVE_GROUP_MEMBERS,
            meta: { id },
            payload: {
                promise: z.resource('orgs', orgId, 'groups', id, 'members')
                    .get(),
            }
        });
    };
}

export function promoteGroupManager(groupId, personId) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        let data = { role: 'manager' };

        dispatch({
            type: types.PROMOTE_GROUP_MANAGER,
            meta: { groupId, personId },
            payload: {
                promise: z.resource('orgs', orgId,
                    'groups', groupId, 'members', personId).put(data),
            }
        });
    }
}

export function demoteGroupManager(groupId, personId) {
    return ({ dispatch, getState, z }) => {
        let orgId = getState().org.activeId;
        let data = { role: null };

        dispatch({
            type: types.DEMOTE_GROUP_MANAGER,
            meta: { groupId, personId },
            payload: {
                promise: z.resource('orgs', orgId,
                    'groups', groupId, 'members', personId).put(data),
            }
        });
    }
}