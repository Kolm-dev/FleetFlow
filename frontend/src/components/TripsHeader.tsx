import { NavLink } from "react-router";

type TripsHeaderProps = {
    currentPage: number;
    lastPage: number;
    total: number;
};

export const TripsHeader = ({ currentPage, lastPage, total }: TripsHeaderProps) => (
    <div className="page-header">
        <div>
            <h1>Trips</h1>
            <p>
                Page {currentPage} of {lastPage}. Total trips: {total}
            </p>
        </div>
        <NavLink
            className="create-link"
            to="/trips/create"
        >
            + Create trip
        </NavLink>
    </div>
);
