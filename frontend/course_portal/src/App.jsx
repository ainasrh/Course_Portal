import { Routes, Route } from "react-router-dom";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Home from "./components/main/Home";
import CourseDetails from "./components/main/CourseDetails";
import Cart from "./components/main/Cart";
import Orders from "./components/main/Order";

function App() {

  return (
    <>
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path="/Login" element={<Login/>} />
      <Route path="/" element={<Home/>} />
      <Route path="/course/:id" element={<CourseDetails/>} />
      <Route path="/cart" element={<Cart/>} />
      
      <Route path="/orders" element={<Orders/>} />


    </Routes>
      
    </>
  )
}

export default App
