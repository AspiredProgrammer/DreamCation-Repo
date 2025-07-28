// // Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// // Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Styles/MainStyling.css";
import "./App.css";
import Navbar from "./Components/Navbar";
import HomePage from "./Components/HomePage";
import HotelPage from "./Components/HotelPage";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer";

function App() {
  return (
    // <HotelPage />
    <div>
      <Navbar/>
      <HomePage />
      <Footer/>
      {/* <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/hotels" element={<HotelPage/>}/>
        </Routes>
        <Footer/>
      </BrowserRouter> */}
    </div>
  );
}

export default App;
