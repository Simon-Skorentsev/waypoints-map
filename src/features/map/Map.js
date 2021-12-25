import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Map.module.css';
import { addWaypoint, deleteWaypoint, dragWaypoint } from './mapSlice';
import { v4 as uuid } from 'uuid';
import { store } from '../../app/store';
import { Waypoints } from '../waypoints/Waypoints';

export function Map() {
  const dispatch = useDispatch();
  const { waypoints } = useSelector(state => state.mapSlice);
  const [map, setMap] = useState();
  const [polyline, setPolyline] = useState();
  const [waypointNumber, setWaypointNumber] = useState(1);
  const [wpCollection, setWpCollection] = useState();
  const ymaps = window.ymaps;
  
  const getWaypoints = () => store.getState().mapSlice.waypoints;
  
  const updatePolilyne = (numInState, actualCoords) => {
    const newAllCoords = polyline.geometry.getCoordinates().map((oldCoords, i) => {
      return i === numInState ? actualCoords : oldCoords
    })
    polyline.geometry.setCoordinates(newAllCoords);
  }

  const createMap = (containerId = "map", settings = { center: [55.76, 37.64], zoom: 10 }) => {
    const { center, zoom } = settings;

    const myMap = new ymaps.Map(containerId, {
      center,
      zoom
    });

    const polyline = new ymaps.Polyline([]);  //маршрут между точками на карте
    const wpCollection = new ymaps.GeoObjectCollection();  //необходимо для удаления меток с карты

    myMap.geoObjects.add(polyline);
    myMap.geoObjects.add(wpCollection);

    setMap(myMap);
    setPolyline(polyline);
    setWpCollection(wpCollection);
  };

  //создание метки в центре карты
  const addMapWaypoint = (name = waypointNumber) => {
    const center = map.getCenter(),
      id = uuid();
    const placemark = new ymaps.Placemark([...center], {}, {
      balloonPanelMaxMapArea: 0,
      draggable: "true",
      preset: "islands#blueStretchyIcon",
      openEmptyBalloon: true
    });

    placemark.properties.set("balloonContentHeader", name);

    wpCollection.add(placemark);
    dispatch(addWaypoint(({ "coords": [...center], id, name })));
    
    placemark.events.add(
      "drag", () => {
        const actualCoords = placemark.geometry.getCoordinates(),
          actualWaypoints = getWaypoints();

        const numInState = actualWaypoints.findIndex(waypoint => (
          waypoint.id === id
        ));

        dispatch(dragWaypoint({"coords": [...actualCoords], id}));
        
        updatePolilyne(numInState, actualCoords);
      }
    );

    placemark.events.add(  //показ адреса при клике на балун
      "click", () => {
        placemark.properties.set("balloonContent", "поиск...");

        ymaps.geocode(placemark.geometry.getCoordinates()).then(function (res) {
          const firstGeoObject = res.geoObjects.get(0);

          placemark.properties.set({
            // Формируем строку с данными об объекте.
            iconCaption: [
              // Название населенного пункта или вышестоящее административно-территориальное образование.
              firstGeoObject.getLocalities().length
                ? firstGeoObject.getLocalities()
                : firstGeoObject.getAdministrativeAreas(),
              // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
              firstGeoObject.getThoroughfare() || firstGeoObject.getPremise(),
            ]
              .filter(Boolean)
              .join(", "),
            // В качестве контента балуна задаем строку с адресом объекта.
            balloonContent: firstGeoObject.getAddressLine(),
          });
        })
      }
    )

    polyline.geometry.setCoordinates([...polyline.geometry.getCoordinates(), center,]);  //встаиваем точку в маршрут
    setWaypointNumber(waypointNumber + 1);
  };

  const deleteMapWaypoint = (id) => {
    const numInState = waypoints.findIndex(waypoint => (
      waypoint.id === id
    ));

    polyline.geometry.remove(numInState);
    wpCollection.splice(numInState, 1);
    dispatch(deleteWaypoint(numInState));
  }

  useEffect(() => {
    createMap();
  }, [])

  return (
    <>
      <div id="map" className={styles.map} />
      <Waypoints addMapWaypoint={addMapWaypoint} 
      deleteMapWaypoint={deleteMapWaypoint} 
      updatePolilyne={updatePolilyne}
      wpCollection={wpCollection}
      />
    </>
  );
};