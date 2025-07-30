import {Link} from "react-router-dom"
// import HomePage from "./HomePage"

const Navbar = () => {

    return(
        <div>
            <div className="navbar-block">
                <Link to={{pathname: "/"}} className="link">Home</Link>
                <Link to={{pathname: "/hotels"}} className="link"> Hotels </Link>
                
            </div>
        </div>
    )
}

export default Navbar;