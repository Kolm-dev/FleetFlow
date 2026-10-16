import { CreateEntityButton } from "@/components/shared/CreateEntityButton";

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
        <CreateEntityButton entity="trip" to="/trips/create" />
    </header>
);
