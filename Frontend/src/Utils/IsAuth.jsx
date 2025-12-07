import { Navigate } from "react-router-dom";

const IsAuth = ({ children }) => {
    const token = localStorage.getItem("userToken");
    console.log("token", token);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default IsAuth;
