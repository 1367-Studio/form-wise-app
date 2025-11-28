"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import CenteredSpinner from "./CenteredSpinner";
import { Eye } from "lucide-react";
import { useCallback, useState, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { DataTable } from "@/components/ui/datatable";
import { ActionButton } from "@/components/ui/action-button";
import { DataCard } from "@/components/ui/datacard";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SchoolSearchInput } from "@/components/ui/school-search-input";
import {
  ApplicationDetailsModal,
  DetailsModalState,
} from "@/components/ui/application-modal";

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

type PaginatedResponse = {
  items: Application[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --------------------------------------------------

export default function AdminAcceptedSchoolsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const DEFAULT_PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  const [detailsModalState, setDetailsModalState] = useState<DetailsModalState>(
    {
      open: false,
      application: null,
      isLoading: false,
    }
  );

  const apiStatusFilter = "accepted";

  const apiUrl = useMemo(() => {
    let url = `/api/superadmin/applications/?page=${page}&pageSize=${DEFAULT_PAGE_SIZE}&status=${apiStatusFilter}`;

    if (debouncedSearch.length >= 3) {
      url += `&search=${encodeURIComponent(debouncedSearch)}`;
    }
    return url;
  }, [page, debouncedSearch]);

  const {
    data: swrData,
    isLoading: isSWRLoading,
    error: swrError,
  } = useSWR<PaginatedResponse>(apiUrl, fetcher);

  const adminId = session?.user?.id;
  const applications: Application[] = swrData?.items || [];
  const totalItems = swrData?.totalItems || 0;
  const totalPages = swrData?.totalPages || 1;

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

      const appDetails: Application = await res.json();
      setDetailsModalState({
        open: true,
        application: appDetails,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(`Erreur: ${err.message || "Erreur de serveur"}`);
      setDetailsModalState({
        open: false,
        application: null,
        isLoading: false,
      });
    }
  }, []);

  // --- Global loading only for session load ---
  if (sessionStatus === "loading") {
    return <CenteredSpinner label="Chargement des écoles acceptées..." />;
  }

  if (sessionStatus === "authenticated" && !adminId) {
    return (
      <div>Erreur d&apos;authentification: ID Administrateur manquant.</div>
    );
  }

  if (swrError) {
    return (
      <div>
        Une erreur est survenue lors du chargement des écoles acceptées.
      </div>
    );
  }

  const isSearchActive = search.length >= 3;
  const isListEmpty = !isSWRLoading && applications.length === 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard Admin – Écoles Acceptées
      </h1>

      <ApplicationDetailsModal
        detailsModalState={detailsModalState}
        setDetailsModalState={setDetailsModalState}
      />

      <SchoolSearchInput
        search={search}
        setSearch={setSearch}
        setPage={setPage}
      />

      {/* Empty list messages */}
      {isListEmpty && (
        <div className="text-gray-500 p-4 border rounded-lg bg-white">
          {isSearchActive
            ? `Aucun résultat pour cette recherche.`
            : `Aucune école acceptée à afficher.`}
        </div>
      )}

      {/* -------- DESKTOP TABLE -------- */}
      <div className="hidden md:block mt-4">
        {isSWRLoading ? (
          <div className="py-10">
            <CenteredSpinner label="Chargement des écoles acceptées..." />
          </div>
        ) : applications.length > 0 ? (
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
                  render: (app) => (
                    <div className="flex justify-center space-x-2">
                      <ActionButton
                        onClick={() => fetchDetails(app.id)}
                        disabled={false}
                        loading={false}
                        title="Voir les détails"
                        icon={
                          <Eye className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                        }
                      />
                    </div>
                  ),
                },
              ]}
            />

            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={DEFAULT_PAGE_SIZE}
              labels={{
                previous: "Précédent",
                next: "Suivant",
                pageIndicator: (c, t) => `Page ${c} sur ${t}`,
              }}
            />
          </>
        ) : null}
      </div>

      {/* -------- MOBILE CARDS -------- */}
      <div className="md:hidden mt-4">
        {isSWRLoading ? (
          <div className="py-6">
            <CenteredSpinner label="Chargement des écoles acceptées..." />
          </div>
        ) : applications.length > 0 ? (
          <DataCard
            data={applications}
            fields={[
              { key: "name", label: "Nom de l’école" },
              { key: "siret", label: "Numéro de l’école" },
              { key: "lastName", label: "Nom du responsable" },
              { key: "firstName", label: "Prénom du responsable" },
              {
                key: "createdAt",
                label: "Date d'Acceptation",
                render: (app) =>
                  format(new Date(app.createdAt), "dd/MM/yyyy", { locale: fr }),
              },
              {
                key: "actions",
                render: (app) => (
                  <div className="flex justify-end space-x-3 mt-2">
                    <ActionButton
                      onClick={() => fetchDetails(app.id)}
                      disabled={false}
                      title="Voir les détails"
                      icon={<Eye className="w-6 h-6" />}
                    />
                  </div>
                ),
              },
            ]}
          />
        ) : null}
      </div>
    </div>
  );
}
