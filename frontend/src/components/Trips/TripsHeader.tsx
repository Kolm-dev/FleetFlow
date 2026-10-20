import { CreateEntityButton } from "@/components/shared/CreateEntityButton";

type TripsHeaderProps = {
    currentPage: number;
    lastPage: number;
    total: number;
};

export const TripsHeader = ({ currentPage, lastPage, total }: TripsHeaderProps) => (
    <header className="page-header entity-list-header">
        <div>
            <h2 className="m-0 text-xl font-semibold tracking-tight text-foreground">Trips</h2>
            <p className="m-0 mt-1 text-sm text-muted-foreground">
                Page {currentPage} of {lastPage}. Total trips: {total}
            </p>
        </div>
        <CreateEntityButton entity="trip" to="/trips/create" />
    </header>
);
