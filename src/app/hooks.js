import { useState } from "react";

export const useWpName = (initialState) => {
    let name = initialState;
    const setName = (newName) => {
        name = newName;
    }
    return [name, setName];
}