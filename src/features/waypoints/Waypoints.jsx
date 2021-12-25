import { Delete } from "@mui/icons-material";
import { IconButton, List, ListItem, ListItemText, TextField } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { replaceWaypointsList } from "../map/mapSlice";
import styles from "./Waypoints.module.css";


export function Waypoints({ addMapWaypoint, deleteMapWaypoint, updatePolilyne, wpCollection }) {
    const dispatch = useDispatch();
    const { waypoints } = useSelector(state => state.mapSlice);
    const [waypointName, setWaypointName] = useState("");
    const [inHandWp, setInHandWp] = useState();
    const [touchCoords, setTouchCoords] = useState(null);

    const waypointsCopy = JSON.parse(JSON.stringify(waypoints));

    const changeColor = (e, color) => {
        const listItem = e.target.closest(`.${styles.waypointLI}`);
        listItem.style.background = color;
    };

    const handleEnterKeydown = (e) => {
        if (e.keyCode === 13) {
            addMapWaypoint(waypointName || undefined);  //если имя не задано, то при undefined присвоится номер
            setWaypointName("");
        };
    };

    const dragStartHandler = (e, waypoint) => {
        setInHandWp(waypoint);
        changeColor(e, "light");
    };

    const dragOverHandler = (e) => {
        e.preventDefault();
        changeColor(e, "lightgray");
    };

    const dragEndHandler = (e) => {
        changeColor(e, "white");
    };

    const dropHandler = (e, behindHandCursorWp) => {
        e.preventDefault();
        const inHandWpIndex = waypointsCopy.findIndex(wp => wp.id === inHandWp.id)
        const behindHandCursorWpIndex = waypointsCopy.findIndex(wp => wp.id === behindHandCursorWp.id)
        const [handPoint, BehindPoint] = [wpCollection.get(inHandWpIndex), wpCollection.get(behindHandCursorWpIndex)];

        (function () {  //меняем местами данные двух точек чтобы затем отправить их в стейт
            [waypointsCopy[inHandWpIndex], waypointsCopy[behindHandCursorWpIndex]] = [waypointsCopy[behindHandCursorWpIndex], waypointsCopy[inHandWpIndex]];
        }());

        changeColor(e, "white");

        dispatch(replaceWaypointsList(waypointsCopy));

        wpCollection.splice(inHandWpIndex, 0, BehindPoint);  //меняем местами точки внутри коллекции
        wpCollection.splice(behindHandCursorWpIndex, 0, handPoint);

        updatePolilyne(inHandWpIndex, behindHandCursorWp.coords);
        updatePolilyne(behindHandCursorWpIndex, inHandWp.coords);
        setTouchCoords(null);
    };

    //поддержка свапа с мобильного телефона
    const handleTouchMove = (e) => {
        setTouchCoords([e.targetTouches[0].clientX, e.targetTouches[0].clientY])
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        try {  //чтобы не было ошибки при клике мимо
            const onList = document.elementFromPoint(...touchCoords);
            const span = onList.closest(`span`);
            const wpName = span.textContent;

            const waypointsList = onList.closest(`.${styles.waypointsList}`)
            const sameNameSpansArr = [];
            waypointsList.querySelectorAll("span").forEach(li => {
                if (li.textContent === wpName) {
                    sameNameSpansArr.push(li);
                }
            });
            const order = sameNameSpansArr.indexOf(span);  //если имя wp не уникально, необходим порядок нужного li

            const sameNameWps = waypoints.filter(wp => wp.name.toString() === wpName);
            const behindHandCursorWp = sameNameWps[order];

            dropHandler(e, behindHandCursorWp);  //передаем нужный waypoint на который навелись последним
        } catch (e) { }
    };

    return (
        <div className={styles.waypoints}>
            <TextField className={styles.wpInput}
                label="Введите название метки"
                onKeyDown={(e) => handleEnterKeydown(e)}
                type="text"
                onChange={(e) => { setWaypointName(e.target.value); }}
                value={waypointName}
            />
            <List className={styles.waypointsList}>
                {waypoints.map(waypoint => (
                    <ListItem key={waypoint.id}
                        className={styles.waypointLI}
                        draggable={true}
                        onDragStart={(e) => { dragStartHandler(e, waypoint); console.log(waypoint) }}
                        onDragLeave={(e) => dragEndHandler(e)}
                        onDragEnd={(e) => dragEndHandler(e)}
                        onDragOver={(e) => dragOverHandler(e)}
                        onDrop={(e) => { dropHandler(e, waypoint); console.log(waypoint) }}

                        onTouchStart={(e) => { dragStartHandler(e, waypoint) }}
                        onTouchEnd={(e) => { handleTouchEnd(e, waypoint) }}
                        onTouchMove={(e) => { handleTouchMove(e) }}
                    >
                        <ListItemText primary={waypoint.name} />
                        <IconButton
                            onClick={() => deleteMapWaypoint(waypoint.id)}
                            onTouchEnd={() => deleteMapWaypoint(waypoint.id)}
                        >
                            <Delete />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
