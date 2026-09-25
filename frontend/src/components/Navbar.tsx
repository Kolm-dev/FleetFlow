import { NavLink } from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar" aria-label="Primary navigation">
            <NavLink className="navbar__brand" to="/" aria-label="FleetFlow home">
                <img
                    className="navbar__brand-icon"
                    src="/favicon"
                    alt=""
                    aria-hidden="true"
                />
                FleetFlow
            </NavLink>

            <div className="navbar__links">
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
            </div>
        </nav>
    );
};

export default Navbar;
