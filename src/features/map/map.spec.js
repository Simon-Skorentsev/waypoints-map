import { Map } from "./map";
import renderer from 'react-test-renderer';
import { Provider } from "react-redux";
import { store } from "../../app/store";

test("shoud render waypointsList and waypoints input", () => {
    const el = renderer.create(
        <Provider store={store}>
            <Map/>
        </Provider>
    );
    
    expect(el).toMatchSnapshot();
});