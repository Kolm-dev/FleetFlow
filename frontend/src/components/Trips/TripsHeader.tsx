import { NavLink } from "react-router";

type TripsHeaderProps = {
    currentPage: number;
    lastPage: number;
    total: number;
};

export const TripsHeader = ({ currentPage, lastPage, total }: TripsHeaderProps) => (
    <header className="page-header entity-list-header">
        <div>
            <h2>Trips</h2>
            <p>
                Page {currentPage} of {lastPage}. Total trips: {total}
            </p>
        </div>
        <NavLink
            className="create-link entity-action--create"
            to="/trips/create"
        >
            Create trip
        </NavLink>
    </header>
);
