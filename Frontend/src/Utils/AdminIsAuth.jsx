import { Navigate } from "react-router-dom";

const AdminIsAuth = ({ children }) => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminIsAuth;
