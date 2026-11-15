import { TextInput, Pressable, View } from "react-native";
import { Health } from "../viewmodels/useHealthViewModel";
import { labels, metrics, pretty, units } from "../models/healthRecords";
import {
  ActionButton,
  Card,
  color,
  Header,
  Icon,
  TextButton,
  styles,
  AppText,
} from "../components/JournalUI";
export function RecordForm({
  vm,
  back,
  pick,
  done,
  editExisting,
}: {
  vm: Health;
  back: () => void;
  pick: () => void;
  done: (id: number) => void;
  editExisting: () => void;
}) {
  const editing = vm.editId !== undefined;
  const hasErrors = Object.keys(vm.errors).length > 0;
  const existing = vm.rows.find((row) => row.id === vm.editId);
  return (
    <>
      <Header
        title={editing ? "Edit Health Record" : "Add Health Record"}
        sub={
          existing
            ? "Record #" +
              String(existing.id).padStart(3, "0") +
              " · saved " +
              pretty(existing.date)
            : "A daily check-in, just for you."
        }
        back={back}
        circularBack
      />
      <AppText bold>Date</AppText>
      <Pressable
        accessibilityRole="button"
        onPress={pick}
        style={[
          styles.field,
          styles.between,
          vm.errors.date ? { borderColor: color.red } : null,
        ]}
      >
        <AppText>{pretty(vm.draft.date)}</AppText>
        <Icon name="calendar" />
      </Pressable>
      <AppText size={12} tint={vm.errors.date ? color.red : color.muted}>
        {vm.errors.date || "One record per day · no future dates"}
      </AppText>
      {vm.errors.date?.includes("already") && (
        <TextButton label="Edit existing record" onPress={editExisting} />
      )}
      {metrics.map((k) => (
        <View key={k} style={{ gap: 8, marginBottom: 8 }}>
          <AppText bold>{labels[k]}</AppText>
          <View
            style={[
              styles.field,
              vm.errors[k] ? { borderColor: color.red } : null,
            ]}
          >
            <TextInput
              accessibilityLabel={labels[k]}
              value={vm.draft[k]}
              onChangeText={(v) => vm.setDraft({ ...vm.draft, [k]: v })}
              keyboardType="number-pad"
              placeholder={
                "Enter " +
                {
                  steps: "steps walked",
                  calories: "calories burned",
                  water: "water intake",
                }[k]
              }
              placeholderTextColor={color.muted}
              style={styles.input}
            />
            {k !== "steps" && <AppText size={12}>{units[k]}</AppText>}
            <Icon name={k} />
          </View>
          {vm.errors[k] && (
            <AppText size={12} tint={color.red}>
              {vm.errors[k]}
            </AppText>
          )}
        </View>
      ))}
      {hasErrors ? (
        <Card style={{ backgroundColor: "#FFF0ED", borderWidth: 0 }}>
          <AppText bold tint={color.red}>
            {vm.errors.date?.includes("already")
              ? "One daily record, no duplicates."
              : "Let’s check those details."}
          </AppText>
          <AppText size={12}>Review the highlighted fields above.</AppText>
        </Card>
      ) : vm.valid ? (
        <Card
          style={[styles.row, { backgroundColor: color.pale, borderWidth: 0 }]}
        >
          <Icon name="check" size={20} tint={color.green} />
          <AppText bold tint={color.green}>
            All fields valid · ready to {editing ? "update" : "save"}
          </AppText>
        </Card>
      ) : (
        <AppText size={12} tint={color.muted}>
          {
            "Whole numbers only. Steps ≤ 100,000.\nCalories ≤ 20,000 kcal · Water ≤ 20,000 ml."
          }
        </AppText>
      )}
      <View style={{ flex: 1, minHeight: 8 }} />
      <ActionButton
        disabled={vm.busy}
        label={editing ? "Update Record" : "Save Record"}
        onPress={() => void vm.save(done)}
      />
      <ActionButton outline label="Cancel" onPress={back} />
    </>
  );
}
