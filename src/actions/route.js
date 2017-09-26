import * as types from '.';

const ROUTE_GEN_DEFAULTS = {
    routeSize: 100,
    draftPrefix: 'Draft route', // TODO: Localize
};


if (typeof window !== 'undefined') {
    var RouteGenWorker = require('worker-loader?inline!../workers/routegen.js');
    let worker = new RouteGenWorker();
}


export function generateRoutes(addressIds, config = {}) {
    config = Object.assign({}, ROUTE_GEN_DEFAULTS, config);

    return ({ dispatch, getState }) => {
        let addresses = addressIds
            .map(id => getState().addresses.addressById[id]);

        let worker = new RouteGenWorker();

        worker.postMessage({ msg: 'start', config, addresses });
        worker.onmessage = ev => {
            if (ev.data.msg == 'pending') {
                let info = ev.data.info;

                dispatch({
                    type: types.GENERATE_ROUTES + '_PENDING',
                    meta: { config, info },
                });
            }
            else if (ev.data.msg == 'fulfilled') {
                let info = ev.data.info;
                let routes = ev.data.routes;

                dispatch({
                    type: types.GENERATE_ROUTES + '_FULFILLED',
                    meta: { config, info },
                    data: { routes },
                });
            }
        };
    };
}

export function discardRouteDrafts() {
    return {
        type: types.DISCARD_ROUTE_DRAFTS,
    };
}

export function commitRouteDrafts() {
    return ({ dispatch, getState }) => {
        // TODO: Don't map real data
        let routes = getState().routes.draftList.items
            .map((i, idx) => Object.assign({}, i.data, {
                id: 'Route ' + (idx+1),
            }));

        dispatch({
            type: types.COMMIT_ROUTE_DRAFTS,
            payload: {
                data: routes,
            }
        });
    };
}