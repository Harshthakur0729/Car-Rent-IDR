import { Navigate } from "react-router-dom";


const IsGuest = ({ children }) => {
    const userToken = localStorage.getItem("userToken");
    const adminToken = localStorage.getItem("adminToken");

    if (userToken) {
        return <Navigate to="/" replace />;
    }

    if (adminToken) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default IsGuest;
