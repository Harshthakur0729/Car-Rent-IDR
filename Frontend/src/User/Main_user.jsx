import { Outlet } from 'react-router-dom';
import Header from './Template/Header';
import Footer from './Template/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';






const Main_user = () => {
    const API = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState([]);

    const dataget = async () => {
        try {
            const res = await axios.get(`${API}/dynamic/get/dynamic/data`);
            setData(res.data.data[0]);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { dataget(); }, [])

    return (
        <>
            <Header datas={data} />
            <Outlet />
            <Footer data={data} />

        </>
    );
};

export default Main_user;
