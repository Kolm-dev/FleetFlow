import {
    createVehicleService,
    deleteVehicleService,
    getVehicleServices,
    updateVehicleService,
} from "@/api/vehicleServices";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { VehicleServiceForm } from "@/components/VehicleServiceForm";
import { VEHICLE_SERVICE_TYPES } from "@/types/vehicleServicesTypes";
import type {
    CreateVehicleServiceData,
    UpdateVehicleServiceData,
    VehicleService,
    VehicleServiceSort,
    VehicleServiceType,
} from "@/types/vehicleServicesTypes";
import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

type VehicleServicesSectionProps = {
    vehicleId: number;
};

type SortField = "service_date" | "mileage" | "cost";
type SortDirection = "asc" | "desc";

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(`${value.slice(0, 10)}T00:00:00`));

const formatMileage = (value: number) =>
    `${new Intl.NumberFormat("en-US").format(value)} km`;

const formatCost = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);

const serviceTypeLabel = (type: VehicleServiceType) =>
    VEHICLE_SERVICE_TYPES.find((option) => option.value === type)?.label ?? type;

export const VehicleServicesSection = ({
    vehicleId,
}: VehicleServicesSectionProps) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [selectedTypes, setSelectedTypes] = useState<VehicleServiceType[]>([]);
    const [sortField, setSortField] = useState<SortField>("service_date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingService, setEditingService] = useState<VehicleService | null>(null);
    const [deletingService, setDeletingService] = useState<VehicleService | null>(null);

    const sort = `${sortDirection === "desc" ? "-" : ""}${sortField}` as VehicleServiceSort;
    const servicesQueryKey = [
        "vehicle-services",
        vehicleId,
        { page, types: selectedTypes, sort },
    ];

    const {
        data,
        error,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: servicesQueryKey,
        queryFn: () =>
            getVehicleServices(vehicleId, {
                page,
                types: selectedTypes,
                sort: [sort],
            }),
        placeholderData: keepPreviousData,
    });

    const invalidateServices = () =>
        queryClient.invalidateQueries({
            queryKey: ["vehicle-services", vehicleId],
        });

    const createMutation = useMutation({
        mutationFn: (formData: CreateVehicleServiceData) =>
            createVehicleService(vehicleId, formData),
        onSuccess: () => {
            setIsCreateOpen(false);
            setPage(1);
            invalidateServices();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            serviceId,
            formData,
        }: {
            serviceId: number;
            formData: UpdateVehicleServiceData;
        }) => updateVehicleService(vehicleId, serviceId, formData),
        onSuccess: () => {
            setEditingService(null);
            invalidateServices();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (serviceId: number) =>
            deleteVehicleService(vehicleId, serviceId),
        onSuccess: () => {
            setDeletingService(null);
            if (page > 1 && data?.data.length === 1) {
                setPage((current) => current - 1);
            }
            invalidateServices();
        },
    });

    const toggleType = (type: VehicleServiceType) => {
        setSelectedTypes((currentTypes) =>
            currentTypes.includes(type)
                ? currentTypes.filter((currentType) => currentType !== type)
                : [...currentTypes, type],
        );
        setPage(1);
    };

    const handleSortFieldChange = (field: SortField) => {
        setSortField(field);
        setPage(1);
    };

    const handleSortDirectionChange = (direction: SortDirection) => {
        setSortDirection(direction);
        setPage(1);
    };

    const mutationError =
        createMutation.error ?? updateMutation.error ?? deleteMutation.error;

    return (
        <section className="vehicle-services">
            <div className="vehicle-services__header">
                <div>
                    <h2>Service History</h2>
                    <p>{data ? `${data.total} service records` : "Maintenance and repair records"}</p>
                </div>
                <button
                    className="entity-action entity-action--create"
                    type="button"
                    onClick={() => {
                        setEditingService(null);
                        setIsCreateOpen((current) => !current);
                    }}
                >
                    {isCreateOpen ? "Close form" : "Add service"}
                </button>
            </div>

            {isCreateOpen && (
                <div className="vehicle-services__editor">
                    <h3>New service record</h3>
                    <VehicleServiceForm
                        isPending={createMutation.isPending}
                        submitText="Create service"
                        onCancel={() => setIsCreateOpen(false)}
                        onSubmit={(formData) => createMutation.mutate(formData)}
                    />
                </div>
            )}

            <div className="vehicle-services__toolbar">
                <fieldset className="vehicle-services__types">
                    <legend>Service types</legend>
                    <div className="vehicle-services__type-options">
                        {VEHICLE_SERVICE_TYPES.map((option) => (
                            <label key={option.value}>
                                <input
                                    checked={selectedTypes.includes(option.value)}
                                    type="checkbox"
                                    onChange={() => toggleType(option.value)}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="vehicle-services__sort">
                    <label>
                        Sort by
                        <select
                            value={sortField}
                            onChange={(event) =>
                                handleSortFieldChange(event.currentTarget.value as SortField)
                            }
                        >
                            <option value="service_date">Service date</option>
                            <option value="mileage">Mileage</option>
                            <option value="cost">Cost</option>
                        </select>
                    </label>
                    <div className="vehicle-services__direction" aria-label="Sort direction">
                        <button
                            aria-pressed={sortDirection === "asc"}
                            className={sortDirection === "asc" ? "is-active" : ""}
                            type="button"
                            onClick={() => handleSortDirectionChange("asc")}
                        >
                            Ascending
                        </button>
                        <button
                            aria-pressed={sortDirection === "desc"}
                            className={sortDirection === "desc" ? "is-active" : ""}
                            type="button"
                            onClick={() => handleSortDirectionChange("desc")}
                        >
                            Descending
                        </button>
                    </div>
                </div>
            </div>

            {error && <p className="error-message">{error.message}</p>}
            {mutationError && (
                <p className="error-message">{mutationError.message}</p>
            )}
            {isLoading && <Spinner />}
            {isFetching && !isLoading && (
                <p className="vehicle-services__updating">Updating service history...</p>
            )}

            {!isLoading && !error && data?.data.length === 0 && (
                <p className="empty-state">No service records match these filters.</p>
            )}

            {data && data.data.length > 0 && (
                <div className="vehicle-services__list">
                    {data.data.map((service) => (
                        <article className="vehicle-service" key={service.id}>
                            <div className="vehicle-service__summary">
                                <div>
                                    <span className="vehicle-service__type">
                                        {serviceTypeLabel(service.type)}
                                    </span>
                                    <strong>{formatDate(service.service_date)}</strong>
                                </div>
                                <div>
                                    <span>Mileage</span>
                                    <strong>{formatMileage(service.mileage)}</strong>
                                </div>
                                <div>
                                    <span>Cost</span>
                                    <strong>{formatCost(service.cost)}</strong>
                                </div>
                            </div>

                            <p className="vehicle-service__notes">
                                {service.notes || "No notes"}
                            </p>

                            <div className="vehicle-service__actions">
                                <button
                                    className="entity-action entity-action--edit"
                                    type="button"
                                    onClick={() => {
                                        setIsCreateOpen(false);
                                        setEditingService(
                                            editingService?.id === service.id ? null : service,
                                        );
                                    }}
                                >
                                    {editingService?.id === service.id ? "Close edit" : "Edit"}
                                </button>
                                <button
                                    className="entity-action entity-action--delete"
                                    type="button"
                                    onClick={() => setDeletingService(service)}
                                >
                                    Delete
                                </button>
                            </div>

                            {editingService?.id === service.id && (
                                <div className="vehicle-service__edit-form">
                                    <VehicleServiceForm
                                        key={service.id}
                                        service={service}
                                        isPending={updateMutation.isPending}
                                        submitText="Save changes"
                                        onCancel={() => setEditingService(null)}
                                        onSubmit={(formData) =>
                                            updateMutation.mutate({
                                                serviceId: service.id,
                                                formData,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {data && (
                <Pagination
                    page={data.current_page}
                    lastPage={data.last_page}
                    isFetching={isFetching}
                    onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
                    onNextPage={() =>
                        setPage((current) => Math.min(data.last_page, current + 1))
                    }
                />
            )}

            <ConfirmModal
                isOpen={deletingService !== null}
                title="Delete service record?"
                message={
                    deletingService
                        ? `${serviceTypeLabel(deletingService.type)} from ${formatDate(deletingService.service_date)} will be permanently deleted.`
                        : undefined
                }
                confirmText="Delete service"
                isConfirming={deleteMutation.isPending}
                onCancel={() => setDeletingService(null)}
                onConfirm={() => {
                    if (deletingService) {
                        deleteMutation.mutate(deletingService.id);
                    }
                }}
            />
        </section>
    );
};
