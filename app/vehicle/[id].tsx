import { View, Text, ScrollView, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Trash2, Plus, Wrench, Shield, ClipboardCheck, Link2,
  AlertCircle, Pencil, ArrowLeft,
} from "lucide-react-native";
import { useStore } from "../../lib/store";
import { confirmAction } from "../../lib/confirm";
import { goBackSafely } from "../../lib/navigation";
import { formatDate, formatMileage, formatMoney, statusFromDate } from "../../lib/utils";
import { Currency, Inspection, Insurance, Maintenance } from "../../types";

type Tab = "vt" | "assurance" | "entretien" | "chaine";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "vt", label: "Visite", icon: ClipboardCheck },
  { key: "assurance", label: "Assurance", icon: Shield },
  { key: "entretien", label: "Entretien", icon: Wrench },
  { key: "chaine", label: "Chaîne", icon: Link2 },
];

type ListActionProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

type CardActionProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("vt");

  const vehicles = useStore((s) => s.vehicles);
  const allMaintenances = useStore((s) => s.maintenances);
  const allInsurances = useStore((s) => s.insurances);
  const allInspections = useStore((s) => s.inspections);
  const removeVehicle = useStore((s) => s.removeVehicle);
  const removeMaintenance = useStore((s) => s.removeMaintenance);
  const removeInsurance = useStore((s) => s.removeInsurance);
  const removeInspection = useStore((s) => s.removeInspection);
  const currency = useStore((s) => s.currency);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id]);
  const maintenances = useMemo(
    () => allMaintenances.filter((m) => m.vehicleId === id),
    [allMaintenances, id]
  );
  const insurances = useMemo(
    () => allInsurances.filter((i) => i.vehicleId === id),
    [allInsurances, id]
  );
  const inspections = useMemo(
    () => allInspections.filter((i) => i.vehicleId === id),
    [allInspections, id]
  );

  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50">
        <Text className="text-zinc-500">Véhicule introuvable</Text>
      </View>
    );
  }

  const confirmDelete = (title: string, onConfirm: () => void) => {
    confirmAction(title, "Cette action est irréversible.", onConfirm);
  };

  const goToAdd = () => {
    if (tab === "vt") router.push(`/inspection/new?vehicleId=${id}`);
    else if (tab === "assurance") router.push(`/insurance/new?vehicleId=${id}`);
    else if (tab === "entretien" || tab === "chaine")
      router.push(`/maintenance/new?vehicleId=${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${vehicle.brand} ${vehicle.model}`,
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => goBackSafely()} className="ml-2">
              <ArrowLeft color="#3b82f6" size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row mr-3 gap-3">
              <Pressable onPress={() => router.push(`/vehicle/new?id=${vehicle.id}`)}>
                <Pencil color="#3b82f6" size={22} />
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDelete("Supprimer ce véhicule ?", () => {
                    removeVehicle(vehicle.id);
                    goBackSafely();
                  })
                }
              >
                <Trash2 color="#ef4444" size={22} />
              </Pressable>
            </View>
          ),
        }}
      />

      <View className="bg-white border-b border-zinc-200 px-4 py-3">
        <Text className="text-zinc-500 text-xs">
          {vehicle.plate} • {vehicle.year}
        </Text>
        <Text className="text-zinc-900 font-bold text-lg mt-1">
          {formatMileage(vehicle.mileage)}
        </Text>
      </View>

      <View className="bg-white border-b border-zinc-200 flex-row">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`flex-1 py-3 items-center border-b-2 ${
                active ? "border-blue-500" : "border-transparent"
              }`}
            >
              <Icon color={active ? "#3b82f6" : "#a1a1aa"} size={20} />
              <Text
                className={`text-xs mt-1 ${
                  active ? "text-blue-500 font-semibold" : "text-zinc-500"
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1 bg-zinc-50">
        <View className="p-4 gap-3">
          {tab === "vt" && (
            <VTList
              inspections={inspections}
              currency={currency}
              onEdit={(itemId) =>
                router.push(`/inspection/new?id=${itemId}&vehicleId=${vehicle.id}`)
              }
              onDelete={(itemId) =>
                confirmDelete("Supprimer cette visite ?", () => removeInspection(itemId))
              }
            />
          )}
          {tab === "assurance" && (
            <InsuranceList
              insurances={insurances}
              currency={currency}
              onEdit={(itemId) =>
                router.push(`/insurance/new?id=${itemId}&vehicleId=${vehicle.id}`)
              }
              onDelete={(itemId) =>
                confirmDelete("Supprimer cette assurance ?", () => removeInsurance(itemId))
              }
            />
          )}
          {tab === "entretien" && (
            <MaintenanceList
              items={maintenances.filter(
                (m) => m.type !== "chaine" && m.type !== "courroie"
              )}
              currency={currency}
              onEdit={(itemId) =>
                router.push(`/maintenance/new?id=${itemId}&vehicleId=${vehicle.id}`)
              }
              onDelete={(itemId) =>
                confirmDelete("Supprimer cet entretien ?", () => removeMaintenance(itemId))
              }
            />
          )}
          {tab === "chaine" && (
            <MaintenanceList
              items={maintenances.filter(
                (m) => m.type === "chaine" || m.type === "courroie"
              )}
              currency={currency}
              onEdit={(itemId) =>
                router.push(`/maintenance/new?id=${itemId}&vehicleId=${vehicle.id}`)
              }
              onDelete={(itemId) =>
                confirmDelete("Supprimer cet entretien ?", () => removeMaintenance(itemId))
              }
            />
          )}

          <Pressable
            onPress={goToAdd}
            className="bg-blue-500 rounded-xl py-4 mt-2 flex-row items-center justify-center gap-2 active:bg-blue-600"
          >
            <Plus color="#fff" size={20} />
            <Text className="text-white font-bold">Ajouter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function CardActions({ onEdit, onDelete }: CardActionProps) {
  return (
    <View className="flex-row gap-3 mt-3 pt-3 border-t border-zinc-100 justify-end">
      <Pressable onPress={onEdit}>
        <Pencil color="#3b82f6" size={18} />
      </Pressable>
      <Pressable onPress={onDelete}>
        <Trash2 color="#ef4444" size={18} />
      </Pressable>
    </View>
  );
}

function VTList({
  inspections, currency, onEdit, onDelete,
}: {
  inspections: Inspection[];
  currency: Currency;
} & ListActionProps) {
  if (inspections.length === 0)
    return <Empty label="Aucune visite technique enregistrée" />;
  const sorted = [...inspections].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const status = statusFromDate(latest.expiryDate);

  return (
    <>
      <View
        className={`rounded-2xl p-4 border ${
          status === "expired"
            ? "bg-red-50 border-red-200"
            : status === "soon"
            ? "bg-amber-50 border-amber-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <View className="flex-row items-center gap-2">
          <AlertCircle
            color={
              status === "expired"
                ? "#ef4444"
                : status === "soon"
                ? "#f59e0b"
                : "#10b981"
            }
            size={20}
          />
          <Text className="font-bold text-zinc-900">
            {status === "expired"
              ? "Expirée"
              : status === "soon"
              ? "Bientôt expirée"
              : "Valide"}
          </Text>
        </View>
        <Text className="text-zinc-700 text-sm mt-2">
          Expire le <Text className="font-bold">{formatDate(latest.expiryDate)}</Text>
        </Text>
      </View>

      {sorted.map((i) => (
        <Card key={i.id}>
          <Row label="Date" value={formatDate(i.date)} />
          <Row label="Expiration" value={formatDate(i.expiryDate)} />
          <Row
            label="Résultat"
            value={i.result === "pass" ? "✅ Favorable" : "❌ Défavorable"}
          />
          {i.cost > 0 && <Row label="Coût" value={formatMoney(i.cost, currency)} />}
          {i.center && <Row label="Centre" value={i.center} />}
          <CardActions
            onEdit={() => onEdit(i.id)}
            onDelete={() => onDelete(i.id)}
          />
        </Card>
      ))}
    </>
  );
}

function InsuranceList({
  insurances, currency, onEdit, onDelete,
}: {
  insurances: Insurance[];
  currency: Currency;
} & ListActionProps) {
  if (insurances.length === 0)
    return <Empty label="Aucune assurance enregistrée" />;
  const sorted = [...insurances].sort((a, b) => b.endDate.localeCompare(a.endDate));
  return (
    <>
      {sorted.map((ins) => {
        const status = statusFromDate(ins.endDate);
        return (
          <Card key={ins.id}>
            <View className="flex-row justify-between items-start">
              <Text className="font-bold text-zinc-900 text-base">{ins.company}</Text>
              <View
                className={`rounded-lg px-2 py-1 ${
                  status === "expired"
                    ? "bg-red-100"
                    : status === "soon"
                    ? "bg-amber-100"
                    : "bg-green-100"
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${
                    status === "expired"
                      ? "text-red-700"
                      : status === "soon"
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}
                >
                  {status === "expired"
                    ? "Expirée"
                    : status === "soon"
                    ? "Bientôt"
                    : "Active"}
                </Text>
              </View>
            </View>
            <Row label="Type" value={ins.type.replace("_", " ")} />
            <Row label="Fin" value={formatDate(ins.endDate)} />
            {ins.cost > 0 && (
              <Row label="Coût" value={formatMoney(ins.cost, currency)} />
            )}
            {ins.policyNumber && <Row label="N° police" value={ins.policyNumber} />}
            <CardActions
              onEdit={() => onEdit(ins.id)}
              onDelete={() => onDelete(ins.id)}
            />
          </Card>
        );
      })}
    </>
  );
}

function MaintenanceList({
  items, currency, onEdit, onDelete,
}: {
  items: Maintenance[];
  currency: Currency;
} & ListActionProps) {
  if (items.length === 0) return <Empty label="Aucun entretien enregistré" />;
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      {sorted.map((m) => (
        <Card key={m.id}>
          <View className="flex-row justify-between items-start">
            <Text className="font-bold text-zinc-900 capitalize">
              {m.type.replace("_", " ")}
            </Text>
            {m.cost > 0 && (
              <Text className="font-bold text-blue-600">
                {formatMoney(m.cost, currency)}
              </Text>
            )}
          </View>
          <Row label="Date" value={formatDate(m.date)} />
          <Row label="Km" value={formatMileage(m.mileage)} />
          {m.garage && <Row label="Garage" value={m.garage} />}
          {m.nextDueDate && <Row label="Prochain" value={formatDate(m.nextDueDate)} />}
          {m.nextDueMileage && (
            <Row label="Ou à" value={formatMileage(m.nextDueMileage)} />
          )}
          {m.notes && (
            <Text className="text-zinc-500 text-xs mt-2 italic">{m.notes}</Text>
          )}
          <CardActions
            onEdit={() => onEdit(m.id)}
            onDelete={() => onDelete(m.id)}
          />
        </Card>
      ))}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-zinc-200">
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-zinc-500 text-sm">{label}</Text>
      <Text className="text-zinc-900 text-sm font-semibold capitalize">{value}</Text>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <View className="bg-white rounded-2xl p-8 border border-zinc-200">
      <Text className="text-zinc-400 text-center">{label}</Text>
    </View>
  );
}
