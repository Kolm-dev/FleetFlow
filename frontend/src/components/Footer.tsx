import { NavLink } from "react-router";

export const Footer = () => {
    return (
        <footer className="footer">
            <NavLink
                className="footer__brand"
                to="/"
                aria-label="FleetFlow home"
            >
                <small>FleetFlow</small>
                <small>2026</small>
            </NavLink>
            <a
                className="footer__link"
                href="https://github.com/Kolm-dev"
                target="_blank"
                rel="noreferrer"
            >
                <small>GitHub</small>
            </a>
        </footer>
    );
};
