import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Login from './login_logout/Login'
import Main_user from './User/Main_user'
import Profile from './User/Template/Profile'
import Signup from './login_logout/Signup'
import UserForgotPassword from './User/Pages/ForgotPassword'
import UserResetPassword from './User/Pages/ResetPassword'
import IsAuth from './Utils/IsAuth'
import IsGuest from './Utils/IsGuest'
import UserHome from './User/Pages/Home'
import About from './User/Pages/About'
import AvailableCar from './User/Pages/AvailableCar'
import Security from './User/Pages/Security'
import Help from './User/Pages/Help'
import Mybookings from './User/Pages/Mybookings'
import Main_admin from './Admin/Main_admin'
import AdminForgotPassword from './Admin/Pages/AdminForgotPassword'
import AdminResetPassword from './Admin/Pages/AdminResetPassword'
import AdminIsAuth from './Utils/AdminIsAuth'
import AdminProfile from './Admin/Template/AdminProfile'
import AdminFleet from './Admin/Car/AdminFleet'
import Users_manage from './Admin/Pages/User_manage'
import Dashboard from './Admin/Pages/Dashboard'
import CarBook from './Admin/Car/CarBook'
import Document from './User/Pages/Document'
import BookCar from './User/Pages/Booking'
import Analytics from './Admin/Pages/Analytics'
import DynamicManager from './Admin/Pages/Dynamic'
import VideoManager from './Admin/Pages/VideoManager'
import AdminManagement from './Admin/Pages/AdminManagement'
import AdminHelpCenter from './Admin/Pages/AdminHelpCenter'








const router = createBrowserRouter([
  { path: "/login", element: <IsGuest><Login /></IsGuest> },
  { path: "/sign-up", element: <IsGuest><Signup /></IsGuest> },
  { path: '/forgot-password', element: <UserForgotPassword /> },
  { path: '/reset-password', element: <UserResetPassword /> },
  { path: "/admin/forgot-password", element: <AdminForgotPassword /> },
  { path: "/admin/reset-password", element: <AdminResetPassword /> },
  {
    path: "/admin",
    element: (
      <AdminIsAuth>
        <Main_admin />
      </AdminIsAuth>
    ),
    children: [
      { path: "/admin/profile", element: <AdminProfile /> },
      { path: "/admin/car", element: <AdminFleet /> },
      { path: "/admin/user/manage", element: <Users_manage /> },
      { path: "/admin/Dashboard", element: <Dashboard /> },
      { path: "/admin/car-booking-manage", element: <CarBook /> },
      { path: "/admin/analytics", element: <Analytics /> },
      { path: "/admin/dynamic-manager", element: <DynamicManager /> },
      { path: "/admin/dynamic-manage-video", element: <VideoManager /> },
      { path: "/admin/admin-management", element: <AdminManagement /> },
      { path: "/admin/help-center", element: <AdminHelpCenter /> }
    ],
  },


  {
    path: "/", element: (<IsAuth><Main_user /></IsAuth>),
    children: [
      { path: "/", element: <UserHome /> },
      { path: "/about", element: <About /> },
      { path: "/customers", element: <AvailableCar /> },
      { path: "/security", element: <Security /> },
      { path: "/help", element: <Help /> },
      { path: '/my-bookings', element: <Mybookings /> },
      { path: "/profile", element: <Profile /> },
      { path: "/verify-document", element: <Document /> },
      { path: "/book-car", element: <BookCar /> },
    ]
  }
])

const App = () => {
  return (<RouterProvider router={router} />)
}
export default App