import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useMemo, useState } from "react";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Trash2, Plus, Wrench, Shield, ClipboardCheck, Link2,
  AlertCircle, Pencil, ArrowLeft, Fuel as FuelIcon, FileText, History, Download,
} from "lucide-react-native";
import { useStore } from "../../lib/store";
import { confirmAction } from "../../lib/confirm";
import { goBackSafely } from "../../lib/navigation";
import { formatDate, formatMileage, formatMoney, statusFromDate, currencySymbol } from "../../lib/utils";
import { Currency, Inspection, Insurance, Maintenance } from "../../types";
import { useTranslation } from "../../lib/useTranslation";
import { exportVehicleToPdf } from "../../lib/exportPdf";

type Tab = "vt" | "assurance" | "entretien" | "chaine" | "carburant" | "documents" | "historique";

type ListActionProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

type CardActionProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function VehicleDetailScreen() {
  const { t, lang } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("vt");

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "vt", label: t("tabInspection"), icon: ClipboardCheck },
    { key: "assurance", label: t("tabInsurance"), icon: Shield },
    { key: "entretien", label: t("tabMaintenance"), icon: Wrench },
    { key: "chaine", label: t("tabChain"), icon: Link2 },
    { key: "carburant", label: t("tabFuel"), icon: FuelIcon },
    { key: "documents", label: t("tabDocuments"), icon: FileText },
    { key: "historique", label: t("tabHistory"), icon: History },
  ];

  const vehicles = useStore((s) => s.vehicles);
  const allMaintenances = useStore((s) => s.maintenances);
  const allInsurances = useStore((s) => s.insurances);
  const allInspections = useStore((s) => s.inspections);
  const allFuels = useStore((s) => s.fuels);
  const allDocuments = useStore((s) => s.documents);
  const removeVehicle = useStore((s) => s.removeVehicle);
  const removeMaintenance = useStore((s) => s.removeMaintenance);
  const removeInsurance = useStore((s) => s.removeInsurance);
  const removeInspection = useStore((s) => s.removeInspection);
  const removeFuel = useStore((s) => s.removeFuel);
  const removeDocument = useStore((s) => s.removeDocument);
  const currency = useStore((s) => s.currency);

  const vehicle = useMemo(() => vehicles.find((v) => v.id === id), [vehicles, id]);
  const maintenances = useMemo(() => allMaintenances.filter((m) => m.vehicleId === id), [allMaintenances, id]);
  const insurances = useMemo(() => allInsurances.filter((i) => i.vehicleId === id), [allInsurances, id]);
  const inspections = useMemo(() => allInspections.filter((i) => i.vehicleId === id), [allInspections, id]);
  const fuels = useMemo(() => allFuels.filter((f) => f.vehicleId === id), [allFuels, id]);


  const documents = useMemo(
    () => allDocuments.filter((d) => d.vehicleId === id),
    [allDocuments, id]
  );
  if (!vehicle) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Text className="text-slate-500">{t("none")}</Text>
      </View>
    );
  }

  const handleExportPdf = async () => {
    try {
      await exportVehicleToPdf({
        vehicle,
        maintenances,
        insurances,
        inspections,
        fuels,
        documents,
        currency,
        language: lang,
      });
    } catch (e: any) {
      Alert.alert("Erreur", e?.message || "");
    }
  };

  const confirmDelete = (title: string, onConfirm: () => void) => {
    confirmAction(title, t("irreversibleAction"), onConfirm);
  };

  const goToAdd = () => {
    if (tab === "vt") router.push(`/inspection/new?vehicleId=${id}`);
    else if (tab === "assurance") router.push(`/insurance/new?vehicleId=${id}`);
    else if (tab === "entretien" || tab === "chaine") router.push(`/maintenance/new?vehicleId=${id}`);
    else if (tab === "carburant") router.push(`/fuel/new?vehicleId=${id}`);
    else if (tab === "documents") router.push(`/document/new?vehicleId=${id}`);
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
              <Pressable onPress={handleExportPdf}>
                <Download color="#10b981" size={22} />
              </Pressable>
              <Pressable onPress={() => router.push(`/vehicle/new?id=${vehicle.id}`)}>
                <Pencil color="#3b82f6" size={22} />
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDelete(t("deleteVehicleConfirm"), () => {
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

      {vehicle.photoUri && (
        <Image
          source={{ uri: vehicle.photoUri }}
          style={{ width: "100%", height: 200, backgroundColor: "#e2e8f0" }}
          contentFit="cover"
          transition={300}
        />
      )}

      <View className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <Text className="text-slate-500 dark:text-slate-400 text-xs" style={{ writingDirection: "ltr" }}>
          {vehicle.plate} • {vehicle.year}
        </Text>
        <Text className="text-slate-900 dark:text-white font-bold text-lg mt-1">
          {formatMileage(vehicle.mileage)}
        </Text>
      </View>

      <View className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-row">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const active = tab === tb.key;
          return (
            <Pressable
              key={tb.key}
              onPress={() => setTab(tb.key)}
              className={`flex-1 py-3 items-center border-b-2 ${active ? "border-blue-500" : "border-transparent"}`}
            >
              <Icon color={active ? "#3b82f6" : "#a1a1aa"} size={20} />
              <Text className={`text-xs mt-1 ${active ? "text-blue-500 font-semibold" : "text-slate-500 dark:text-slate-400"}`}>
                {tb.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="p-4 gap-3">
          {tab === "vt" && (
            <VTList
              inspections={inspections}
              currency={currency}
              onEdit={(itemId) => router.push(`/inspection/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeInspection(itemId))}
            />
          )}
          {tab === "assurance" && (
            <InsuranceList
              insurances={insurances}
              currency={currency}
              onEdit={(itemId) => router.push(`/insurance/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeInsurance(itemId))}
            />
          )}
          {tab === "entretien" && (
            <MaintenanceList
              items={maintenances.filter((m) => m.type !== "chaine" && m.type !== "courroie")}
              currency={currency}
              onEdit={(itemId) => router.push(`/maintenance/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeMaintenance(itemId))}
            />
          )}
          {tab === "chaine" && (
            <MaintenanceList
              items={maintenances.filter((m) => m.type === "chaine" || m.type === "courroie")}
              currency={currency}
              onEdit={(itemId) => router.push(`/maintenance/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeMaintenance(itemId))}
            />
          )}
          {tab === "carburant" && (
            <FuelList
              fuels={fuels}
              currency={currency}
              onEdit={(itemId) => router.push(`/fuel/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeFuel(itemId))}
            />
          )}

          {tab === "documents" && (
            <DocumentsList
              documents={documents}
              onEdit={(itemId) => router.push(`/document/new?id=${itemId}&vehicleId=${vehicle.id}`)}
              onDelete={(itemId) => confirmDelete(t("delete"), () => removeDocument(itemId))}
            />
          )}

          {tab === "historique" && (
            <HistoryList
              vehicle={vehicle}
              maintenances={maintenances}
              insurances={insurances}
              inspections={inspections}
              fuels={fuels}
              documents={documents}
              currency={currency}
            />
          )}

          <Pressable
            onPress={goToAdd}
            className="bg-blue-600 rounded-xl py-4 mt-2 flex-row items-center justify-center gap-2 active:bg-blue-700"
          >
            <Plus color="#fff" size={20} />
            <Text className="text-white font-bold">{t("add")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function CardActions({ onEdit, onDelete }: CardActionProps) {
  return (
    <View className="flex-row gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 justify-end">
      <Pressable onPress={onEdit}>
        <Pencil color="#3b82f6" size={18} />
      </Pressable>
      <Pressable onPress={onDelete}>
        <Trash2 color="#ef4444" size={18} />
      </Pressable>
    </View>
  );
}

function VTList({ inspections, currency, onEdit, onDelete }: { inspections: Inspection[]; currency: Currency } & ListActionProps) {
  const { t } = useTranslation();
  if (inspections.length === 0) return <Empty label={t("noInspection")} />;
  const sorted = [...inspections].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const status = statusFromDate(latest.expiryDate);

  return (
    <>
      <View className={`rounded-2xl p-4 border ${
        status === "expired" ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
        : status === "soon" ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
        : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
      }`}>
        <View className="flex-row items-center gap-2">
          <AlertCircle color={status === "expired" ? "#ef4444" : status === "soon" ? "#f59e0b" : "#10b981"} size={20} />
          <Text className="font-bold text-slate-900 dark:text-white">
            {status === "expired" ? t("expired") : status === "soon" ? t("soonExpired") : t("valid")}
          </Text>
        </View>
        <Text className="text-slate-700 dark:text-slate-300 text-sm mt-2">
          {t("expiresOn")} <Text className="font-bold">{formatDate(latest.expiryDate)}</Text>
        </Text>
      </View>

      {sorted.map((i) => (
        <Card key={i.id}>
          <Row label={t("date")} value={formatDate(i.date)} />
          <Row label={t("expirationDate")} value={formatDate(i.expiryDate)} />
          <Row label={t("result")} value={i.result === "pass" ? t("favorable") : t("unfavorable")} />
          {i.cost > 0 && <Row label={t("cost")} value={formatMoney(i.cost, currency)} />}
          {i.center && <Row label={t("center")} value={i.center} />}
          <CardActions onEdit={() => onEdit(i.id)} onDelete={() => onDelete(i.id)} />
        </Card>
      ))}
    </>
  );
}

function InsuranceList({ insurances, currency, onEdit, onDelete }: { insurances: Insurance[]; currency: Currency } & ListActionProps) {
  const { t } = useTranslation();
  if (insurances.length === 0) return <Empty label={t("noInsurance")} />;
  const sorted = [...insurances].sort((a, b) => b.endDate.localeCompare(a.endDate));

  return (
    <>
      {sorted.map((ins) => {
        const status = statusFromDate(ins.endDate);
        const bgColor = status === "expired" ? "bg-red-100 dark:bg-red-900" : status === "soon" ? "bg-amber-100 dark:bg-amber-900" : "bg-green-100 dark:bg-green-900";
        const textColor = status === "expired" ? "text-red-700 dark:text-red-200" : status === "soon" ? "text-amber-700 dark:text-amber-200" : "text-green-700 dark:text-green-200";
        const statusLabel = status === "expired" ? t("expired") : status === "soon" ? t("soon") : t("active");

        const cleanCompany = String(ins.company || "").replace(/[.\s]+$/g, "").replace(/^[.\s]+/g, "").trim();
        const cleanType = String(ins.type || "").replace("_", " ").replace(/[.]+/g, "").trim();
        const cleanEndDate = String(formatDate(ins.endDate) || "").replace(/[.]+/g, "").trim();
        const cleanCost = ins.cost > 0 ? String(formatMoney(ins.cost, currency) || "").replace(/[.]+$/g, "").trim() : "";
        const cleanPolicy = String(ins.policyNumber || "").replace(/[.\s]+$/g, "").replace(/^[.\s]+/g, "").trim();

        return (
          <Card key={ins.id}>
            <View className="flex-row justify-between items-start">
              <Text className="font-bold text-slate-900 dark:text-white text-base">{cleanCompany || "-"}</Text>
              <View className={`rounded-lg px-2 py-1 ${bgColor}`}>
                <Text className={`text-xs font-bold uppercase ${textColor}`}>{statusLabel}</Text>
              </View>
            </View>
            {cleanType ? <Row label={t("contractType")} value={cleanType} /> : null}
            {cleanEndDate ? <Row label={t("endDate")} value={cleanEndDate} /> : null}
            {cleanCost ? <Row label={t("cost")} value={cleanCost} /> : null}
            {cleanPolicy ? <Row label={t("policyNumber")} value={cleanPolicy} /> : null}
            <CardActions onEdit={() => onEdit(ins.id)} onDelete={() => onDelete(ins.id)} />
          </Card>
        );
      })}
    </>
  );
}

function MaintenanceList({ items, currency, onEdit, onDelete }: { items: Maintenance[]; currency: Currency } & ListActionProps) {
  const { t } = useTranslation();
  if (items.length === 0) return <Empty label={t("noMaintenance")} />;
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {sorted.map((m) => (
        <Card key={m.id}>
          <View className="flex-row justify-between items-start">
            <Text className="font-bold text-slate-900 dark:text-white capitalize">{m.type.replace("_", " ")}</Text>
            {m.cost > 0 && <Text className="font-bold text-blue-600 dark:text-blue-400">{formatMoney(m.cost, currency)}</Text>}
          </View>
          <Row label={t("date")} value={formatDate(m.date)} />
          <Row label={t("mileage")} value={formatMileage(m.mileage)} />
          {m.garage && <Row label={t("garage")} value={m.garage} />}
          {m.nextDueDate && <Row label={t("nextReminder")} value={formatDate(m.nextDueDate)} />}
          {m.nextDueMileage && <Row label={t("orMileage")} value={formatMileage(m.nextDueMileage)} />}
          {m.notes && <Text className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic">{m.notes}</Text>}
          <CardActions onEdit={() => onEdit(m.id)} onDelete={() => onDelete(m.id)} />
        </Card>
      ))}
    </>
  );
}

function FuelList({ fuels, currency, onEdit, onDelete }: { fuels: any[]; currency: Currency } & ListActionProps) {
  const { t } = useTranslation();
  if (fuels.length === 0) return <Empty label={t("noFuel")} />;
  const sorted = [...fuels].sort((a, b) => b.date.localeCompare(a.date));

  const sortedAsc = [...fuels].sort((a, b) => a.mileage - b.mileage);
  let totalLiters = 0;
  let totalKm = 0;
  for (let i = 1; i < sortedAsc.length; i++) {
    const km = sortedAsc[i].mileage - sortedAsc[i - 1].mileage;
    if (km > 0 && sortedAsc[i].fullTank) {
      totalKm += km;
      totalLiters += sortedAsc[i].liters;
    }
  }
  const avgConsumption = totalKm > 0 ? (totalLiters / totalKm) * 100 : 0;
  const totalSpent = fuels.reduce((sum, f) => sum + f.totalCost, 0);

  return (
    <>
      <View className="flex-row gap-3">
        <View className="flex-1 bg-blue-50 dark:bg-blue-950 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-700 dark:text-blue-300 text-xs uppercase font-semibold">{t("consumption")}</Text>
          <Text className="text-blue-900 dark:text-white text-2xl font-bold mt-1">
            {avgConsumption.toFixed(1)} L/100
          </Text>
        </View>
        <View className="flex-1 bg-emerald-50 dark:bg-emerald-950 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
          <Text className="text-emerald-700 dark:text-emerald-300 text-xs uppercase font-semibold">{t("totalSpent")}</Text>
          <Text className="text-emerald-900 dark:text-white text-2xl font-bold mt-1">
            {formatMoney(totalSpent, currency)}
          </Text>
        </View>
      </View>

      {sorted.map((f) => (
        <Card key={f.id}>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-bold text-slate-900 dark:text-white text-base">
                {f.liters} L × {f.pricePerLiter} {currencySymbol(currency)}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(f.date)}</Text>
            </View>
            <Text className="font-bold text-blue-600 dark:text-blue-400 text-base">{formatMoney(f.totalCost, currency)}</Text>
          </View>
          <Row label={t("mileage")} value={formatMileage(f.mileage)} />
          {f.station && <Row label={t("station")} value={f.station} />}
          {!f.fullTank && <Row label={t("total")} value={t("partial")} />}
          {f.notes && <Text className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic">{f.notes}</Text>}
          <CardActions onEdit={() => onEdit(f.id)} onDelete={() => onDelete(f.id)} />
        </Card>
      ))}
    </>
  );
}

function DocumentsList({ documents, onEdit, onDelete }: { documents: any[]; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  if (documents.length === 0) return <Empty label={t("noDocument")} />;
  const sorted = [...documents].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {sorted.map((doc) => {
        const status = doc.expiryDate ? statusFromDate(doc.expiryDate) : null;
        const statusLabel = status === "expired" ? t("expiredDoc") : status === "soon" ? t("soon") : null;
        const statusBg = status === "expired" ? "bg-red-100 dark:bg-red-900" : status === "soon" ? "bg-amber-100 dark:bg-amber-900" : "";
        const statusText = status === "expired" ? "text-red-700 dark:text-red-200" : status === "soon" ? "text-amber-700 dark:text-amber-200" : "";

        return (
          <Card key={doc.id}>
            <View className="flex-row items-start gap-3">
              {doc.fileType === "image" ? (
                <Image source={{ uri: doc.fileUrl }} style={{ width: 60, height: 60, borderRadius: 8 }} contentFit="cover" />
              ) : (
                <View className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900 items-center justify-center">
                  <FileText color="#2563eb" size={28} />
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>{doc.title}</Text>
                  {statusLabel && (
                    <View className={`rounded-lg px-2 py-0.5 ${statusBg}`}>
                      <Text className={`text-xs font-bold uppercase ${statusText}`}>{statusLabel}</Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1" style={{ writingDirection: "ltr" }}>{formatDate(doc.date)}</Text>
                {doc.expiryDate && (
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" style={{ writingDirection: "ltr" }}>
                    {t("expiresOn")} {formatDate(doc.expiryDate)}
                  </Text>
                )}
              </View>
            </View>
            {doc.notes && <Text className="text-slate-500 dark:text-slate-400 text-xs mt-2 italic">{doc.notes}</Text>}
            <CardActions onEdit={() => onEdit(doc.id)} onDelete={() => onDelete(doc.id)} />
          </Card>
        );
      })}
    </>
  );
}

function HistoryList({
  vehicle, maintenances, insurances, inspections, fuels, documents, currency,
}: {
  vehicle: any;
  maintenances: any[];
  insurances: any[];
  inspections: any[];
  fuels: any[];
  documents: any[];
  currency: Currency;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("all");

  // Fusionner tous les événements
  type Event = {
    id: string;
    date: string;
    type: "maintenance" | "insurance" | "inspection" | "fuel" | "document";
    title: string;
    subtitle: string;
    amount?: number;
    icon: any;
    color: string;
  };

  const events: Event[] = [];

  for (const m of maintenances) {
    events.push({
      id: `m-${m.id}`,
      date: m.date,
      type: "maintenance",
      title: m.type.replace("_", " "),
      subtitle: `${formatMileage(m.mileage)}${m.garage ? " • " + m.garage : ""}`,
      amount: m.cost,
      icon: Wrench,
      color: "#8b5cf6",
    });
  }
  for (const i of insurances) {
    events.push({
      id: `i-${i.id}`,
      date: i.startDate,
      type: "insurance",
      title: i.company,
      subtitle: `${t("endDate")}: ${formatDate(i.endDate)}`,
      amount: i.cost,
      icon: Shield,
      color: "#3b82f6",
    });
  }
  for (const v of inspections) {
    events.push({
      id: `v-${v.id}`,
      date: v.date,
      type: "inspection",
      title: t("inspectionTitle"),
      subtitle: v.result === "pass" ? t("favorable") : t("unfavorable"),
      amount: v.cost,
      icon: ClipboardCheck,
      color: v.result === "pass" ? "#10b981" : "#ef4444",
    });
  }
  for (const f of fuels) {
    events.push({
      id: `f-${f.id}`,
      date: f.date,
      type: "fuel",
      title: `${f.liters} L × ${f.pricePerLiter}`,
      subtitle: formatMileage(f.mileage),
      amount: f.totalCost,
      icon: FuelIcon,
      color: "#f59e0b",
    });
  }
  for (const d of documents) {
    events.push({
      id: `d-${d.id}`,
      date: d.date,
      type: "document",
      title: d.title,
      subtitle: d.category.replace("_", " "),
      icon: FileText,
      color: "#64748b",
    });
  }

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const sorted = filtered.sort((a, b) => b.date.localeCompare(a.date));

  // Total dépensé
  const total = events.reduce((s, e) => s + (e.amount || 0), 0);

  const FILTERS = [
    { key: "all", label: t("filterAll") },
    { key: "maintenance", label: t("tabMaintenance") },
    { key: "insurance", label: t("tabInsurance") },
    { key: "inspection", label: t("tabInspection") },
    { key: "fuel", label: t("tabFuel") },
    { key: "document", label: t("tabDocuments") },
  ];

  return (
    <>
      {/* Total */}
      <View className="bg-blue-600 rounded-2xl p-4 mb-3">
        <Text className="text-blue-100 text-xs uppercase font-semibold">{t("totalCost")}</Text>
        <Text className="text-white text-2xl font-bold mt-1">{formatMoney(total, currency)}</Text>
        <Text className="text-blue-100 text-xs mt-1">{events.length} {t("search").toLowerCase()}</Text>
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-full border ${
                filter === f.key ? "bg-blue-600 border-blue-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            >
              <Text className={`text-xs font-semibold ${filter === f.key ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {sorted.length === 0 ? (
        <Empty label={t("noReminders")} />
      ) : (
        <View className="gap-2">
          {sorted.map((e) => {
            const Icon = e.icon;
            return (
              <View
                key={e.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex-row items-start gap-3"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: e.color + "20" }}
                >
                  <Icon color={e.color} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-900 dark:text-white capitalize" numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>
                    {e.subtitle}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">{formatDate(e.date)}</Text>
                </View>
                {e.amount !== undefined && e.amount > 0 && (
                  <Text className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {formatMoney(e.amount, currency)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">{children}</View>;
}

function Row({ label, value }: { label: string; value: string }) {
  const safeLabel = String(label || "").trim();
  const safeValue = String(value || "").trim();
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-slate-500 dark:text-slate-400 text-sm">{safeLabel}</Text>
      <Text className="text-slate-900 dark:text-white text-sm font-semibold capitalize">{safeValue}</Text>
    </View>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
      <Text className="text-slate-400 text-center">{label}</Text>
    </View>
  );
}
