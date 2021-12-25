import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import mapSlice, { addWaypoint } from '../map/mapSlice';
import { Waypoints } from './Waypoints';

test("shoud render waypointsList and waypoints input", () => {
  const store = configureStore({
      reducer: {
        mapSlice
      }
    });

  store.dispatch(addWaypoint(({ "coords": [1, 2], "id": 1, "name": "name" })))

  const { getByText, getAllByText } = render(
      <Provider store={store}>
          <Waypoints/>
      </Provider>
  )

  const waypoint = getByText(/name/);
  const input = getAllByText(/Введите название метки/);

  expect(waypoint).toBeInTheDocument();
  expect(input[0]).toBeInTheDocument();
});