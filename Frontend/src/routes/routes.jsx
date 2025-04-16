import {Navigate, Route, Routes} from "react-router-dom";
import {ROUTE_PATHS} from "./route_paths";
import {ROUTE_ELEMENTS} from "./route_elements";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path={ROUTE_PATHS.AUTH} element={ROUTE_ELEMENTS.AUTH}>
                <Route path="login" element={ROUTE_ELEMENTS.LOGIN_FORM}/>
                <Route path="registration" element={ROUTE_ELEMENTS.REGISTRATION_FORM}/>
                <Route index element={<Navigate to="login" replace/>}/>
            </Route>

            <Route path={ROUTE_PATHS.ROOT} element={ROUTE_ELEMENTS.PROTECTED_MAIN}>
                <Route index element={ROUTE_ELEMENTS.WELCOME}/>
                <Route path={ROUTE_PATHS.CHAT} element={ROUTE_ELEMENTS.CHAT_PAGE}/>
            </Route>

            <Route path={ROUTE_PATHS.LOGIN} element={<Navigate to={`${ROUTE_PATHS.AUTH}/login`} replace/>}/>
            <Route path={ROUTE_PATHS.REGISTER} element={<Navigate to={`${ROUTE_PATHS.AUTH}/registration`} replace/>}/>
            <Route path={ROUTE_PATHS.WILDCARD} element={<Navigate to={ROUTE_PATHS.ROOT} replace/>}/>
        </Routes>
    );
};