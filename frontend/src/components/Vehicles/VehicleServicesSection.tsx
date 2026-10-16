import {
    createVehicleService,
    deleteVehicleService,
    getVehicleServices,
    updateVehicleService,
} from "@/api/vehicleServices";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner/Spinner";
import { VehicleServiceForm } from "@/components/Vehicles/VehicleServiceForm";
import VehicleServiceAttachment from "@/components/Vehicles/VehicleServiceAttachment";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBackendErrorMessage } from "@/libs/errors";
import { formatCurrency, formatDateOnly, formatMileage } from "@/libs/utils";
import { VEHICLE_SERVICE_TYPES } from "@/types/vehicleServicesTypes";
import type {
    CreateVehicleServiceData,
    UpdateVehicleServiceData,
    VehicleService,
    VehicleServiceStatistics,
    VehicleServiceSort,
    VehicleServiceType,
} from "@/types/vehicleServicesTypes";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type VehicleServicesSectionProps = {
    vehicleId: number;
    statistics: VehicleServiceStatistics;
};

type SortField = "service_date" | "mileage" | "cost";
type SortDirection = "asc" | "desc";

const serviceTypeLabel = (type: VehicleServiceType) =>
    VEHICLE_SERVICE_TYPES.find(option => option.value === type)?.label ?? type;

export const VehicleServicesSection = ({ vehicleId, statistics }: VehicleServicesSectionProps) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [selectedTypes, setSelectedTypes] = useState<VehicleServiceType[]>([]);
    const [sortField, setSortField] = useState<SortField>("service_date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingService, setEditingService] = useState<VehicleService | null>(null);
    const [deletingService, setDeletingService] = useState<VehicleService | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isServicesVisible, setIsServicesVisible] = useState(true);

    const sort = `${sortDirection === "desc" ? "-" : ""}${sortField}` as VehicleServiceSort;
    const servicesQueryKey = ["vehicle-services", vehicleId, { page, types: selectedTypes, sort }];

    const { data, error, isLoading, isFetching } = useQuery({
        queryKey: servicesQueryKey,
        queryFn: () =>
            getVehicleServices(vehicleId, {
                page,
                types: selectedTypes,
                sort: [sort],
            }),
        placeholderData: keepPreviousData,
    });

    const invalidateServices = (refetchServices = true) =>
        Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["vehicle-services", vehicleId],
                refetchType: refetchServices ? "active" : "none",
            }),
            queryClient.invalidateQueries({
                queryKey: ["vehicles", vehicleId],
            }),
        ]);

    const createMutation = useMutation({
        mutationFn: (formData: CreateVehicleServiceData) => createVehicleService(vehicleId, formData),
        onMutate: () => setSuccessMessage(null),
        onSuccess: () => {
            setSuccessMessage("Service record created successfully.");
            setIsCreateOpen(false);
            const isChangingPage = page !== 1;
            setPage(1);

            return invalidateServices(!isChangingPage);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ serviceId, formData }: { serviceId: number; formData: UpdateVehicleServiceData }) =>
            updateVehicleService(vehicleId, serviceId, formData),
        onMutate: () => setSuccessMessage(null),
        onSuccess: () => {
            setSuccessMessage("Service record updated successfully.");
            setEditingService(null);
            return invalidateServices();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (serviceId: number) => deleteVehicleService(vehicleId, serviceId),
        onMutate: () => setSuccessMessage(null),
        onSuccess: () => {
            setSuccessMessage("Service record deleted successfully.");
            setDeletingService(null);
            const isChangingPage = page > 1 && data?.data.length === 1;

            if (isChangingPage) {
                setPage(current => current - 1);
            }

            return invalidateServices(!isChangingPage);
        },
    });

    const toggleType = (type: VehicleServiceType) => {
        setSelectedTypes(currentTypes =>
            currentTypes.includes(type)
                ? currentTypes.filter(currentType => currentType !== type)
                : [...currentTypes, type]
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

    const mutationError = createMutation.error ?? updateMutation.error ?? deleteMutation.error;
    const mutationErrorMessage = mutationError
        ? getBackendErrorMessage(mutationError, "Could not save service record.")
        : null;

    return (
        <section className="grid min-w-0 gap-5">
            {successMessage && (
                <SuccessMessage
                    tag="vehicle"
                    successText={successMessage}
                    onComplete={() => setSuccessMessage(null)}
                />
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Service history</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {data ? `${data.total} service records` : "Maintenance and repair records"}
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        aria-expanded={isServicesVisible}
                        aria-controls={`vehicle-services-list-${vehicleId}`}
                        onClick={() => setIsServicesVisible(current => !current)}
                    >
                        {isServicesVisible ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                        {isServicesVisible ? "Hide services" : `Show services${data ? ` (${data.total})` : ""}`}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingService(null);
                            setIsCreateOpen(current => !current);
                        }}
                    >
                        <Plus aria-hidden="true" />
                        {isCreateOpen ? "Close form" : "Add service"}
                    </Button>
                </div>
            </div>

            {statistics.total_services > 0 ? (
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border p-3">
                        <dt className="text-xs font-medium text-muted-foreground">Total services</dt>
                        <dd className="mt-1 text-lg font-semibold">{statistics.total_services}</dd>
                    </div>
                    <div className="rounded-lg border p-3">
                        <dt className="text-xs font-medium text-muted-foreground">Total cost</dt>
                        <dd className="mt-1 text-lg font-semibold">{formatCurrency(statistics.total_service_cost)}</dd>
                    </div>
                    <div className="rounded-lg border p-3">
                        <dt className="text-xs font-medium text-muted-foreground">Average cost</dt>
                        <dd className="mt-1 text-lg font-semibold">
                            {statistics.average_service_cost !== null
                                ? formatCurrency(statistics.average_service_cost)
                                : "Not available"}
                        </dd>
                    </div>
                    <div className="min-w-0 rounded-lg border p-3">
                        <dt className="text-xs font-medium text-muted-foreground">Last service</dt>
                        <dd className="mt-1 wrap-break-word text-sm font-semibold">
                            {statistics.last_service_date
                                ? formatDateOnly(statistics.last_service_date)
                                : "Not available"}
                        </dd>
                        {statistics.last_service_cost !== null && (
                            <span className="mt-1 block text-xs text-muted-foreground">{formatCurrency(statistics.last_service_cost)}</span>
                        )}
                        {statistics.last_service_mileage !== null && (
                            <span className="mt-1 block text-xs text-muted-foreground">{formatMileage(statistics.last_service_mileage)}</span>
                        )}
                    </div>
                </dl>
            ) : (
                <p className="m-0 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                    Service statistics will appear after the first service record.
                </p>
            )}

            {isCreateOpen && (
                <Card>
                    <CardContent className="grid gap-4 p-4 sm:p-5">
                    <h3 className="font-semibold">New service record</h3>
                    <VehicleServiceForm
                        isPending={createMutation.isPending}
                        submitText="Create service"
                        onCancel={() => setIsCreateOpen(false)}
                        onSubmit={formData => createMutation.mutate(formData)}
                    />
                    </CardContent>
                </Card>
            )}

            <div
                id={`vehicle-services-list-${vehicleId}`}
                className={`grid min-w-0 gap-4 ${isServicesVisible ? "" : "hidden"}`}
            >
            <div className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
                <fieldset className="grid gap-2">
                        <legend className="mb-2 text-sm font-medium">Filter by service type</legend>
                        <p className="text-xs text-muted-foreground">
                            Multiple selections are available. Click the service types you’re interested in.
                        </p>

                    <div className="flex flex-wrap gap-2">
                        {VEHICLE_SERVICE_TYPES.map(option => {
                            const selected = selectedTypes.includes(option.value);

                            return (
                                <label
                                    key={option.value}
                                    className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                                >
                                    <input
                                        className="sr-only"
                                        checked={selected}
                                        type="checkbox"
                                        onChange={() => toggleType(option.value)}
                                    />
                                    {option.label}
                                </label>
                            );
                        })}
                    </div>
                </fieldset>

                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:min-w-64">
                    <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                        Sort by
                        <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            value={sortField}
                            onChange={event => handleSortFieldChange(event.currentTarget.value as SortField)}
                        >
                            <option value="service_date">Service date</option>
                            <option value="mileage">Mileage</option>
                            <option value="cost">Cost</option>
                        </select>
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                        Direction
                        <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            value={sortDirection}
                            onChange={event => handleSortDirectionChange(event.currentTarget.value as SortDirection)}
                        >
                            <option value="desc">Newest first</option>
                            <option value="asc">Oldest first</option>
                        </select>
                    </label>
                </div>
            </div>

            {error && <ErrorMessage messages={error.message} fallbackMessage="Could not load service history." />}
            {mutationErrorMessage && <ErrorMessage messages={mutationErrorMessage} />}
            {isLoading && <Spinner />}
            {isFetching && !isLoading && (
                <p className="text-sm text-muted-foreground" role="status">Updating service history...</p>
            )}

            {!isLoading && !error && data?.data.length === 0 && (
                <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No service records match these filters.
                </p>
            )}

            {data && data.data.length > 0 && (
                <div className="grid min-w-0 gap-3">
                    {data.data.map(service => (
                        <article
                            className="grid min-w-0 gap-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5"
                            key={service.id}
                        >
                            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                                <div className="min-w-0">
                                    <p className="m-0 text-sm font-medium text-muted-foreground">{serviceTypeLabel(service.type)}</p>
                                    <p className="mt-1 wrap-break-word text-base font-semibold">{formatDateOnly(service.service_date)}</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="m-0 text-sm font-medium text-muted-foreground">Mileage</p>
                                    <p className="mt-1 wrap-break-word text-base font-semibold">{formatMileage(service.mileage)}</p>
                                </div>
                                <div className="min-w-0">
                                    <p className="m-0 text-sm font-medium text-muted-foreground">Cost</p>
                                    <p className="mt-1 wrap-break-word text-base font-semibold">{formatCurrency(service.cost)}</p>
                                </div>
                            </div>

                            <p className="m-0 wrap-break-word text-sm text-muted-foreground">
                                {service.notes || "No notes"}
                            </p>

                            <VehicleServiceAttachment vehicleId={vehicleId} serviceId={service.id} />

                            <div className="grid grid-cols-2 gap-2 border-t pt-3 sm:flex sm:justify-end">
                                <Button
                                    className="w-full min-w-0 px-2 sm:w-40"
                                    variant="outline"
                                    type="button"
                                    onClick={() => {
                                        setIsCreateOpen(false);
                                        setEditingService(editingService?.id === service.id ? null : service);
                                    }}
                                >
                                    <Pencil aria-hidden="true" />
                                    {editingService?.id === service.id ? "Close edit" : "Edit"}
                                </Button>
                                <Button
                                    className="w-full min-w-0 px-2 sm:w-40"
                                    variant="destructive"
                                    type="button"
                                    onClick={() => setDeletingService(service)}
                                >
                                    <Trash2 aria-hidden="true" />
                                    Delete
                                </Button>
                            </div>

                            {editingService?.id === service.id && (
                                <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
                                    <VehicleServiceForm
                                        key={service.id}
                                        service={service}
                                        isPending={updateMutation.isPending}
                                        submitText="Save changes"
                                        onCancel={() => setEditingService(null)}
                                        onSubmit={formData =>
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
                    onPreviousPage={() => setPage(current => Math.max(1, current - 1))}
                    onNextPage={() => setPage(current => Math.min(data.last_page, current + 1))}
                />
            )}
            </div>

            <ConfirmModal
                isOpen={deletingService !== null}
                title="Delete service record?"
                message={
                    deletingService
                        ? `${serviceTypeLabel(deletingService.type)} from ${formatDateOnly(deletingService.service_date)} will be permanently deleted.`
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
