"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import CenteredSpinner from "./CenteredSpinner";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/datatable";
import { ActionButton } from "@/components/ui/action-button";
import { DataCard } from "@/components/ui/datacard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SchoolSearchInput } from "@/components/ui/school-search-input";
import {
  ApplicationDetailsModal,
  DetailsModalState,
} from "@/components/ui/application-modal";

// --- Types ---

type Application = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  siret: string;
  city: string;
  country: string;
  address: string;
  postal: string;
  landlinePhone: string | null;
  createdAt: string;
  validatedAt: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectionReason?: string | null;
  approvedById?: string | null;
};

type PaginatedResponse = {
  items: Application[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --------------------------------------------------

export default function AdminPendingSchoolsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const DEFAULT_PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  const [isActionProcessing, setIsActionProcessing] = useState<string | null>(
    null
  );
  const [detailsModalState, setDetailsModalState] = useState<DetailsModalState>(
    {
      open: false,
      application: null,
      isLoading: false,
    }
  );

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    appId: string;
    action: "APPROVE" | "REJECT";
  }>({
    open: false,
    appId: "",
    action: "APPROVE",
  });

  // --- SWR URL ---
  const apiUrl = useMemo(() => {
    let url = `/api/superadmin/applications/?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}&status=pending`;
    if (debouncedSearch.length >= 3) {
      url += `&search=${encodeURIComponent(debouncedSearch)}`;
    }
    return url;
  }, [page, debouncedSearch]);

  // --- SWR ---
  const {
    data: swrData,
    isLoading: isSWRLoading,
    error: swrError,
    mutate,
  } = useSWR<PaginatedResponse>(apiUrl, fetcher);

  const adminId = session?.user?.id;
  const applications: Application[] = swrData?.items || [];
  const totalItems = swrData?.totalItems || 0;
  const totalPages = swrData?.totalPages || 1;

  // -----------------------------------------------------------------------
  // ✅ FIX: Move all useCallback definitions *before* conditional returns
  // -----------------------------------------------------------------------

  const fetchDetails = useCallback(async (appId: string) => {
    setDetailsModalState({ open: true, application: null, isLoading: true });

    try {
      const res = await fetch(`/api/superadmin/applications/${appId}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Erreur lors de la récupération des détails.`
        );
      }

      const details: Application = await res.json();
      setDetailsModalState({
        open: true,
        application: details,
        isLoading: false,
      });
    } catch (err: unknown) {
      // FIX: Use unknown instead of any
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue du serveur";
      toast.error(errorMessage);
      setDetailsModalState({
        open: false,
        application: null,
        isLoading: false,
      });
    }
  }, []);

  const executeAction = useCallback(
    async (
      appId: string,
      action: "APPROVE" | "REJECT",
      rejectionReason: string | null
    ) => {
      if (!adminId) {
        toast.error("Erreur: ID de l'administrateur introuvable.");
        return;
      }

      setIsActionProcessing(appId);

      try {
        const res = await fetch(`/api/superadmin/applications/${appId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            rejectionReason,
            adminId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Erreur lors de l'action.");
        }

        toast.success(
          `Demande ${
            action === "APPROVE" ? "approuvée" : "rejetée"
          } avec succès.`
        );

        mutate();
      } catch (err: unknown) {
        // FIX: Use unknown instead of any
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue du serveur";
        toast.error(errorMessage);
      } finally {
        setIsActionProcessing(null);
      }
    },
    [adminId, mutate]
  );

  const openActionDialog = useCallback(
    (appId: string, action: "APPROVE" | "REJECT") => {
      if (isActionProcessing) return;
      setDialogState({ open: true, appId, action });
    },
    [isActionProcessing]
  );

  const handleDialogConfirm = useCallback(
    (reason?: string) => {
      const { appId, action } = dialogState;
      setDialogState({ ...dialogState, open: false });

      const rejectionReason =
        action === "REJECT" ? reason?.trim() || null : null;

      executeAction(appId, action, rejectionReason);
    },
    [dialogState, executeAction]
  );

  // -----------------------------------------------------------------------
  // Conditional Returns (Must come after all Hook calls)
  // -----------------------------------------------------------------------

  if (sessionStatus === "loading") {
    return <CenteredSpinner label="Chargement..." />;
  }

  if (sessionStatus === "authenticated" && !adminId) {
    return (
      <div>Erreur d&apos;authentification: ID Administrateur manquant.</div>
    );
  }

  if (swrError) {
    return <div>Une erreur est survenue lors du chargement des écoles.</div>;
  }

  const isSearchActive = search.length >= 3;

  const isListEmpty = applications.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard Admin – Candidatures en Attente
      </h1>

      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onConfirm={handleDialogConfirm}
        title={
          dialogState.action === "REJECT"
            ? "Confirmer le Rejet"
            : "Confirmer l'Approbation"
        }
        description={
          dialogState.action === "REJECT"
            ? "Êtes-vous sûr de vouloir rejeter cette demande ?"
            : "Êtes-vous sûr de vouloir approuver cette demande ?"
        }
        showTextarea={dialogState.action === "REJECT"}
        required={dialogState.action === "REJECT"}
        textareaPlaceholder="Motif de rejet (obligatoire)"
        isProcessing={isActionProcessing !== null}
      />

      <ApplicationDetailsModal
        detailsModalState={detailsModalState}
        setDetailsModalState={setDetailsModalState}
      />

      {/* SEARCH BAR */}
      <SchoolSearchInput
        search={search}
        setSearch={setSearch}
        setPage={setPage}
      />

      {isSWRLoading && (
        <div className="py-10">
          <CenteredSpinner
            label="Chargement des écoles en attente..."
            fullScreen={false}
          />
        </div>
      )}

      {!isSWRLoading && (
        <>
          {isListEmpty && (
            <div className="text-gray-500 p-4 border rounded-lg bg-white">
              {isSearchActive
                ? `Aucun résultat pour cette recherche.`
                : `Aucune école à afficher.`}
            </div>
          )}

          {/* -------------- DESKTOP TABLE -------------- */}
          {applications.length > 0 && (
            <>
              <DataTable
                data={applications}
                columns={[
                  {
                    header: "Nom de l’école",
                    accessor: "name",
                    className: "font-medium",
                  },
                  {
                    header: "Numéro de l’école",
                    accessor: "siret",
                  },
                  {
                    header: "Nom du responsable",
                    accessor: "lastName",
                  },
                  {
                    header: "Prénom du responsable",
                    accessor: "firstName",
                  },
                  {
                    header: "Actions",
                    className: "text-center",
                    render: (app) => {
                      const isCurrentAppProcessing =
                        isActionProcessing === app.id;
                      const isDisabled =
                        isCurrentAppProcessing || app.status !== "PENDING";

                      return (
                        <div className="flex justify-center space-x-2">
                          <ActionButton
                            onClick={() => fetchDetails(app.id)}
                            disabled={isCurrentAppProcessing}
                            title="Voir les détails"
                            icon={
                              <Eye className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                            }
                          />

                          <ActionButton
                            onClick={() => openActionDialog(app.id, "APPROVE")}
                            disabled={isDisabled}
                            loading={isCurrentAppProcessing}
                            className="text-green-600 hover:text-green-800"
                            title="Approuver"
                            icon={<CheckCircle className="w-5 h-5" />}
                          />

                          <ActionButton
                            onClick={() => openActionDialog(app.id, "REJECT")}
                            disabled={isDisabled}
                            loading={isCurrentAppProcessing}
                            className="text-red-600 hover:text-red-800"
                            title="Rejeter"
                            icon={<XCircle className="w-5 h-5" />}
                          />
                        </div>
                      );
                    },
                  },
                ]}
              />
            </>
          )}

          {/* -------------- MOBILE CARDS -------------- */}
          {applications.length > 0 && (
            <DataCard
              data={applications}
              fields={[
                { key: "name", label: "Nom de l’école" },
                { key: "siret", label: "Numéro de l’école" },
                { key: "lastName", label: "Nom du responsable" },
                { key: "firstName", label: "Prénom du responsable" },
                {
                  key: "createdAt",
                  label: "Créé le",
                  render: (app) =>
                    format(new Date(app.createdAt), "dd/MM/yyyy", {
                      locale: fr,
                    }),
                },
                {
                  key: "actions",
                  render: (app) => {
                    const isProcessing = isActionProcessing === app.id;
                    const isDisabled = isProcessing || app.status !== "PENDING";

                    return (
                      <div className="flex justify-end space-x-3 mt-2">
                        <ActionButton
                          onClick={() => fetchDetails(app.id)}
                          disabled={isProcessing}
                          icon={<Eye className="w-6 h-6" />}
                        />

                        {app.status === "PENDING" && (
                          <>
                            <ActionButton
                              onClick={() =>
                                openActionDialog(app.id, "APPROVE")
                              }
                              disabled={isDisabled}
                              loading={isProcessing}
                              className="text-green-600 hover:text-green-800"
                              icon={<CheckCircle className="w-6 h-6" />}
                            />

                            <ActionButton
                              onClick={() => openActionDialog(app.id, "REJECT")}
                              disabled={isDisabled}
                              loading={isProcessing}
                              className="text-red-600 hover:text-red-800"
                              icon={<XCircle className="w-6 h-6" />}
                            />
                          </>
                        )}
                      </div>
                    );
                  },
                },
              ]}
            />
          )}
        </>
      )}
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        labels={{
          previous: "Précédent",
          next: "Suivant",
          pageIndicator: (current, total) => `Page ${current} sur ${total}`,
        }}
      />
    </div>
  );
}
