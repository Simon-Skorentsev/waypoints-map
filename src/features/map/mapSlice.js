import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  waypoints: [],  //[{"coords": [0, 0], "id": 0, "name": "first"}]
};

export const mapSlice = createSlice({
  name: 'Map',
  initialState,
  reducers: {
    addWaypoint(state, action) {
      state.waypoints.push(action.payload);
    },

    deleteWaypoint(state, action) {
      state.waypoints.splice(action.payload, 1);
    },

    dragWaypoint(state, action) {
      state.waypoints.forEach(waypoint => {
        if (waypoint.id === action.payload.id) {
          waypoint.coords = action.payload.coords;
        };
      });
    },

    replaceWaypointsList(state, action) {
      state.waypoints = action.payload;
    }
  }
});

export const { initMap, addWaypoint, dragWaypoint, deleteWaypoint, replaceWaypointsList } = mapSlice.actions;

export default mapSlice.reducer;
