import { NavLink } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <NavLink className="navbar__link" to="/" end>
                Home
            </NavLink>
            <NavLink className="navbar__link" to="/trips">
                Trips
            </NavLink>

            <NavLink className="navbar__link" to="/drivers">
                Drivers
            </NavLink>

            <NavLink className="navbar__link" to="/vehicles">
                Vehicles
            </NavLink>
        </nav>
    );
};

export default Navbar;
