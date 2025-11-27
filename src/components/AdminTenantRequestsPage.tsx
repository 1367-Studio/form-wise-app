"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import CenteredSpinner from "./CenteredSpinner";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/datatable";
import { ActionButton } from "@/components/ui/action-button";
import { DataCard } from "@/components/ui/datacard";

// --- Types and Support Functions (With additional fields for details) ---

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
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectionReason?: string | null;
  approvedById?: string | null;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getStatusBadge(status: Application["status"]) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          En attente
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Acceptée
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejetée
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-400 text-white hover:bg-gray-400">N/A</Badge>
      );
  }
}

// --------------------------------------------------

export default function AdminTenantRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const {
    data,
    isLoading: isSWRLoading,
    mutate,
  } = useSWR("/api/superadmin/applications", fetcher);

  const [isActionProcessing, setIsActionProcessing] = useState<string | null>(
    null
  );

  // --- STATE FOR THE DETAILS MODAL ---
  const [detailsModalState, setDetailsModalState] = useState<{
    open: boolean;
    application: Application | null;
    isLoading: boolean;
  }>({
    open: false,
    application: null,
    isLoading: false,
  });

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    appId: string;
    action: "APPROVE" | "REJECT";
  }>({
    open: false,
    appId: "",
    action: "APPROVE",
  });

  const isLoading = isSWRLoading || sessionStatus === "loading";

  const adminId = session?.user?.id;

  // --- FUNCTION TO FETCH DETAILS ---
  const fetchDetails = useCallback(async (appId: string) => {
    setDetailsModalState({ open: true, application: null, isLoading: true });

    try {
      const res = await fetch(`/api/superadmin/applications/${appId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Erreur lors de la récupération des détails.`
        );
      }

      const appDetails: Application = await res.json();
      setDetailsModalState({
        open: true,
        application: appDetails,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Erreur lors de la récupération des détails:", err);
      toast.error(`Erreur: ${err.message || "Erreur de serveur"}`);
      setDetailsModalState({
        open: false,
        application: null,
        isLoading: false,
      }); // Close on error
    }
  }, []);

  // Centralized function to execute the API action after confirmation (unchanged)
  const executeAction = useCallback(
    async (
      appId: string,
      action: "APPROVE" | "REJECT",
      rejectionReason: string | null
    ) => {
      if (!adminId) {
        toast.error("Erreur: ID de l'administrateur de session introuvable.");
        return;
      }

      setIsActionProcessing(appId);

      try {
        const res = await fetch(`/api/superadmin/applications/${appId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: action,
            rejectionReason: rejectionReason,
            adminId: adminId,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || `Erreur lors de l'action ${action}.`
          );
        }

        toast.success(
          `Demande ${
            action === "APPROVE" ? "approuvée" : "rejetée"
          } avec succès.`
        );

        mutate();
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Erreur na ação:", err);
        toast.error(`Erreur: ${err.message || "Erreur de serveur"}`);
      } finally {
        setIsActionProcessing(null);
      }
    },
    [adminId, mutate]
  );

  // Function to open the dialog (maintained)
  const openActionDialog = useCallback(
    (appId: string, action: "APPROVE" | "REJECT") => {
      if (isActionProcessing) return;

      setDialogState({
        open: true,
        appId,
        action,
      });
    },
    [isActionProcessing]
  );

  // Function to handle dialog confirmation (maintained)
  const handleDialogConfirm = useCallback(
    (reason?: string) => {
      const { appId, action } = dialogState;
      setDialogState({ ...dialogState, open: false });

      let rejectionReason = null;

      if (action === "REJECT") {
        rejectionReason = reason ? reason.trim() : null;
      }

      executeAction(appId, action, rejectionReason);
    },
    [dialogState, executeAction]
  );

  // --- Modal Details Component (Inner Component) ---

  const ApplicationDetailsModal = () => {
    const { open, application, isLoading } = detailsModalState;

    if (!open) return null;

    return (
      <Dialog
        open={open}
        onOpenChange={(open) =>
          setDetailsModalState({
            ...detailsModalState,
            open,
            application: !open ? null : detailsModalState.application, // Clears the application when closing
          })
        }
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Détails de la Candidature</DialogTitle>
            <DialogDescription>
              Informations complètes sur ld&apos;établissement et le directeur.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <CenteredSpinner label="Chargement des détails..." />
            </div>
          ) : application ? (
            <div className="space-y-4 pt-4 text-sm">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-base mb-1">Établissement</h3>
                <p>
                  <span className="font-medium">Nom:</span> {application.name}
                </p>
                <p>
                  <span className="font-medium">SIRET:</span>{" "}
                  {application.siret}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span>{" "}
                  {application.address}, {application.postal} {application.city}
                  , {application.country}
                </p>
                <p>
                  <span className="font-medium">Téléphone Fixe:</span>{" "}
                  {application.landlinePhone || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{" "}
                  {getStatusBadge(application.status)}
                </p>
              </div>

              <div className="pb-2">
                <h3 className="font-semibold text-base mb-1">Directeur</h3>
                <p>
                  <span className="font-medium">Nom:</span>{" "}
                  {application.firstName} {application.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {application.email}
                </p>
                <p>
                  <span className="font-medium">Téléphone Portable:</span>{" "}
                  {application.phone}
                </p>
                <p>
                  <span className="font-medium">Demandé le:</span>{" "}
                  {format(
                    new Date(application.createdAt),
                    "dd MMMM yyyy à HH:mm",
                    { locale: fr }
                  )}
                </p>
                {application.status === "REJECTED" && (
                  <p className="mt-2 p-2 bg-red-50 rounded-md">
                    <span className="font-medium text-red-700">
                      Motif de Rejet:
                    </span>{" "}
                    {application.rejectionReason || "Non spécifié."}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 py-10">
              Impossible de charger les détails de la candidature.
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // --- Principal Rendering ---

  if (isLoading)
    return <CenteredSpinner label="Chargement des applications..." />;

  if (sessionStatus === "authenticated" && !adminId) {
    return (
      <div>Erreur d&apos;authentification: ID Administrateur manquant.</div>
    );
  }

  if (!data?.applications) return <div>Erreur lors du chargement.</div>;

  const applications: Application[] = data.applications;

  const isRejection = dialogState.action === "REJECT";
  const dialogTitle = isRejection
    ? "Confirmer le Rejet"
    : "Confirmer l'Approbation";
  const dialogDescription = isRejection
    ? "Êtes-vous sûr de vouloir rejeter cette demande? Veuillez entrer un motif."
    : "Êtes-vous sûr de vouloir approuver cette demande?";

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard Admin – Candidatures
      </h1>

      {/* Action Confirmation Modal */}
      <ConfirmDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        onConfirm={handleDialogConfirm}
        title={dialogTitle}
        description={dialogDescription}
        showTextarea={isRejection}
        required={isRejection}
        textareaPlaceholder="Motif de rejet (obligatoire)"
        isProcessing={isActionProcessing !== null}
      />

      {/* Application Details Modal */}
      <ApplicationDetailsModal />

      {applications.length === 0 && (
        <div className="text-gray-500 p-4 border rounded-lg bg-white">
          Aucune demande trouvée.
        </div>
      )}

      {applications.length > 0 && (
        <>
          {/* -------- DESKTOP TABLE -------- */}
          <DataTable
            data={applications}
            columns={[
              {
                header: "Nom",
                render: (app) => (
                  <div>
                    {app.firstName} {app.lastName}
                    <br />
                    <span className="text-xs text-gray-500">{app.name}</span>
                  </div>
                ),
              },

              { header: "Email", accessor: "email" },
              { header: "Téléphone", accessor: "phone" },
              { header: "SIRET", accessor: "siret" },

              {
                header: "Statut",
                render: (app) => getStatusBadge(app.status),
              },

              {
                header: "Créé le",
                render: (app) =>
                  format(new Date(app.createdAt), "dd/MM/yyyy", { locale: fr }),
              },

              {
                header: "Actions",
                className: "text-center",
                render: (app) => {
                  const isCurrentAppProcessing = isActionProcessing === app.id;

                  return (
                    <div className="flex justify-center space-x-2">
                      <ActionButton
                        onClick={() => fetchDetails(app.id)}
                        disabled={isCurrentAppProcessing}
                        loading={false}
                        title="Voir les détails"
                        icon={
                          <Eye className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                        }
                      />

                      {app.status === "PENDING" ? (
                        <>
                          <ActionButton
                            onClick={() => openActionDialog(app.id, "APPROVE")}
                            disabled={isCurrentAppProcessing}
                            loading={isCurrentAppProcessing}
                            title="Approuver la demande"
                            className="text-green-600 hover:text-green-800"
                            icon={<CheckCircle className="w-5 h-5" />}
                          />

                          <ActionButton
                            onClick={() => openActionDialog(app.id, "REJECT")}
                            disabled={isCurrentAppProcessing}
                            loading={isCurrentAppProcessing}
                            title="Rejeter la demande"
                            className="text-red-600 hover:text-red-800"
                            icon={<XCircle className="w-5 h-5" />}
                          />
                        </>
                      ) : (
                        <div className="w-5" />
                      )}
                    </div>
                  );
                },
              },
            ]}
          />

          {/* -------- MOBILE CARDS -------- */}
          <DataCard
            data={applications}
            fields={[
              {
                key: "name",
                render: (app) => (
                  <div className="text-lg font-bold">
                    {app.firstName} {app.lastName}
                    <div className="text-sm text-gray-500">{app.name}</div>
                  </div>
                ),
              },
              { key: "email", label: "Email" },
              { key: "phone", label: "Téléphone" },
              { key: "siret", label: "SIRET" },
              {
                key: "status",
                label: "Statut",
                render: (app) => getStatusBadge(app.status),
              },
              {
                key: "createdAt",
                label: "Créé le",
                render: (app) =>
                  format(new Date(app.createdAt), "dd/MM/yyyy", { locale: fr }),
              },
              {
                key: "actions",
                render: (app) => {
                  const isProcessing = isActionProcessing === app.id;

                  return (
                    <div className="flex justify-end space-x-3 mt-2">
                      <ActionButton
                        onClick={() => fetchDetails(app.id)}
                        disabled={isProcessing}
                        title="Voir les détails"
                        icon={<Eye className="w-6 h-6" />}
                      />

                      {app.status === "PENDING" && (
                        <>
                          <ActionButton
                            onClick={() => openActionDialog(app.id, "APPROVE")}
                            disabled={isProcessing}
                            loading={isProcessing}
                            className="text-green-600 hover:text-green-800"
                            title="Approuver"
                            icon={<CheckCircle className="w-6 h-6" />}
                          />
                          <ActionButton
                            onClick={() => openActionDialog(app.id, "REJECT")}
                            disabled={isProcessing}
                            loading={isProcessing}
                            className="text-red-600 hover:text-red-800"
                            title="Rejeter"
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
        </>
      )}
    </div>
  );
}
