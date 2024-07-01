import { createContext,  useState  } from "react";
import { vehicle_list } from "../assets/assets";
// import axios from 'axios';
export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const url ="http://localhost:3005"
    const [token,setToken] = useState("");

    const contextValue = {
        vehicle_list,
        url,
        token,
        setToken
    }
    return(
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider