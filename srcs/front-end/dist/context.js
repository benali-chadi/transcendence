import { createContext } from "react";
var initialState = {
    user: null,
    setUser: function () { },
    isMobile: false
};
export var userContext = createContext(initialState);
