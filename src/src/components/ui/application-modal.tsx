import React, { Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building,
  MapPin,
  User,
  Mail,
  Phone,
  Hash,
  CheckCircle,
  Calendar,
  CalendarCheck,
} from "lucide-react";

// Assuming you have these UI components defined
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CenteredSpinner from "../../../../src/components/CenteredSpinner";
// Importing the new generic StatusBadge component
import { StatusBadge } from "./status-badge";

// --- REQUIRED TYPES ---
export type Application = {
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
  validatedAt?: string | null;
};

export type DetailsModalState = {
  open: boolean;
  application: Application | null;
  isLoading: boolean;
};

interface ApplicationDetailsModalProps {
  detailsModalState: DetailsModalState;
  setDetailsModalState: Dispatch<SetStateAction<DetailsModalState>>;
}

// The statusMap was moved inside StatusBadge

/**
 * Helper component to display a detail item with an icon, label, and value.
 */
const DetailItem = ({
  icon,
  label,
  value,
  renderValue,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
  renderValue?: () => React.ReactNode;
}) => (
  <div className="flex items-start space-x-2">
    <div className="mt-1 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase">{label}</p>
      {renderValue ? (
        renderValue()
      ) : (
        <p className="text-gray-900 font-semibold break-words">
          {value || "N/A"}
        </p>
      )}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const ApplicationDetailsModal = ({
  detailsModalState,
  setDetailsModalState,
}: ApplicationDetailsModalProps) => {
  const { open, application, isLoading } = detailsModalState;

  // The previous useEffect was removed.

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setDetailsModalState({
          ...detailsModalState,
          open,
          // Clear the application *only* when closing.
          // This ensures old content stays in state while the animation runs.
          application: !open ? null : detailsModalState.application,
          // Ensures loading state resets when closing.
          isLoading: !open ? false : detailsModalState.isLoading,
        });
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Détails de l&apos;école</DialogTitle>
          <DialogDescription>
            Informations complètes sur l&apos;établissement et le directeur.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <CenteredSpinner label="Chargement des detalhes..." />
          </div>
        ) : application ? (
          <div className="space-y-6 pt-4 text-sm">
            {/* Section 1: School Information - Grid Layout */}
            <div className="rounded-lg border p-4 shadow-sm">
              <h3 className="flex items-center text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                <Building className="w-5 h-5 mr-2 text-indigo-600" />
                Coordonnées de l&apos;École
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem
                  icon={<Building className="w-4 h-4 text-gray-500" />}
                  label="Nom de l’école"
                  value={application.name}
                />
                <DetailItem
                  icon={<Hash className="w-4 h-4 text-gray-500" />}
                  label="Numéro SIRET"
                  value={application.siret}
                />
                <DetailItem
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                  label="Téléphone Fixe"
                  value={application.landlinePhone}
                />
                <DetailItem
                  icon={<CheckCircle className="w-4 h-4 text-gray-500" />}
                  label="Statut"
                  renderValue={() => (
                    <StatusBadge status={application.status} />
                  )}
                />
                <div className="sm:col-span-2">
                  <DetailItem
                    icon={<MapPin className="w-4 h-4 text-gray-500" />}
                    label="Adresse Complète"
                    value={`${application.address}, ${application.postal} ${application.city}, ${application.country}`}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Director and Dates - Grid Layout */}
            <div className="rounded-lg border p-4 shadow-sm">
              <h3 className="flex items-center text-base font-semibold text-gray-700 mb-4 border-b pb-2">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Directeur et Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem
                  icon={<User className="w-4 h-4 text-gray-500" />}
                  label="Nom du directeur"
                  value={`${application.firstName} ${application.lastName}`}
                />
                <DetailItem
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                  label="Téléphone Portable"
                  value={application.phone}
                />
                <div className="sm:col-span-2">
                  <DetailItem
                    icon={<Mail className="w-4 h-4 text-gray-500" />}
                    label="Email"
                    value={application.email}
                  />
                </div>

                <DetailItem
                  icon={<Calendar className="w-4 h-4 text-gray-500" />}
                  label="Date d'inscription"
                  value={format(
                    new Date(application.createdAt),
                    "dd MMMM yyyy à HH:mm",
                    { locale: fr }
                  )}
                />

                <DetailItem
                  icon={<CalendarCheck className="w-4 h-4 text-gray-500" />}
                  label="Date de validation"
                  value={
                    application.validatedAt
                      ? format(
                          new Date(application.validatedAt),
                          "dd MMMM yyyy à HH:mm",
                          { locale: fr }
                        )
                      : "Non défini"
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          // Added the 'open' check so the error message only appears if the modal is open (and application is null)
          open && (
            <div className="text-center text-red-500 py-10">
              Impossible de charger les détails de la candidature.
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
