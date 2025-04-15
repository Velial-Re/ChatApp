import {Outlet} from "react-router-dom";
import {lazyImport} from "../../routes/lazy_import.jsx";

export default function MainPage() {
    return (
        <div className="main-page__container">
            <lazyImport.ChatDashboard/>
            <div className="content-area">
                <Outlet/>
            </div>
        </div>
    )
}
