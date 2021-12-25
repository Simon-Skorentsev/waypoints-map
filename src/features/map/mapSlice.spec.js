import mapSlice, { addWaypoint, deleteWaypoint, dragWaypoint, replaceWaypointsList } from "./mapSlice";

const initialState = {
    "waypoints": []
}

describe("currency and transfers", () => {

    it("addWaypoint test", () => {
        const result = {"id": 0, "name": "firstWp", "coords": [1, 2]};
        const state = mapSlice(initialState, addWaypoint(result));

        expect(state.waypoints).toEqual([result]);
    });

    it("deleteWaypoint test", () => {
        let state = mapSlice(initialState, addWaypoint({"id": 0}));
        state = mapSlice(state, addWaypoint({"id": 1}));
        state = mapSlice(state, addWaypoint({"id": 2}));

        state = mapSlice(state, deleteWaypoint(1));

        expect(state.waypoints).toEqual([{"id": 0}, {"id": 2}]);
    });

    it("dragWaypoint test", () => {
        let state = mapSlice(initialState, addWaypoint({"coords": [0, 0]}));
        state = mapSlice(state, dragWaypoint({"coords": [99, 98]}));

        expect(state.waypoints[0].coords).toEqual([99, 98]);
    });

    it("replaceWaypoints test", () => {
        const wp = mapSlice(initialState, addWaypoint({"name": "old"}));
        const newWp = mapSlice(wp, replaceWaypointsList([{"name": "new"}]));

        expect(newWp.waypoints[0].name).toEqual("new");
    });
});