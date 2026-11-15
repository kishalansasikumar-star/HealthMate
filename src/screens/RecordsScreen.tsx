import { Pressable, TextInput, View } from "react-native";
import {
  ActionButton,
  color,
  Header,
  Icon,
  TextButton,
  RecordCard,
  styles,
  AppText,
} from "../components/JournalUI";
import { Entry } from "../models/healthRecords";
import { useHealth } from "../viewmodels/HealthContext";
export function Records({
  form,
  details,
  remove,
  filter,
  clear,
  results,
}: {
  form: (r?: Entry) => void;
  details: (r: Entry) => void;
  remove: (r: Entry) => void;
  filter: () => void;
  clear: () => void;
  results: boolean;
}) {
  const vm = useHealth();
  return (
    <>
      <Header
        title={
          results
            ? vm.filtered.length
              ? "Search & Filter"
              : "Search Records"
            : "Health Records"
        }
        back={results ? clear : undefined}
        sub={
          results
            ? "Choose a day or a date range."
            : vm.rows.length
              ? "Your everyday progress, all in one place."
              : "A fresh start for healthier habits."
        }
      />
      {vm.rows.length > 0 && (
        <>
          <View style={styles.field}>
            <Icon name="search" />
            <TextInput
              accessibilityLabel="Search by date"
              placeholder="Search by date · e.g. 18 Aug 2026"
              placeholderTextColor={color.muted}
              style={styles.input}
              value={vm.query}
              onChangeText={vm.setQuery}
            />
          </View>
          <View style={styles.between}>
            <Pressable
              style={[
                styles.row,
                {
                  backgroundColor: color.pale,
                  borderRadius: 24,
                  padding: 10,
                },
              ]}
              onPress={filter}
            >
              <Icon name="calendar" size={18} />
              <AppText size={12} bold tint={color.green}>
                {vm.range[0]
                  ? vm.range[0] +
                    (vm.range[1] !== vm.range[0] ? " – " + vm.range[1] : "")
                  : "All dates"}
              </AppText>
            </Pressable>
            <TextButton label="Clear filters" onPress={clear} />
          </View>
          <AppText size={14}>
            {results
              ? vm.filtered.length +
                (vm.filtered.length === 1
                  ? " matching record"
                  : " matching records")
              : "Saved records  " + String(vm.filtered.length).padStart(2, "0")}
          </AppText>
        </>
      )}
      {vm.filtered.map((r) => (
        <RecordCard
          key={r.id}
          r={r}
          detail={() => details(r)}
          edit={() => form(r)}
          remove={() => remove(r)}
        />
      ))}
      {results && vm.filtered.length > 0 && (
        <ActionButton outline label="Change filters" onPress={filter} />
      )}
      {!vm.filtered.length && (
        <View
          style={[styles.center, { flex: 1, paddingVertical: 46, gap: 20 }]}
        >
          <View
            style={[
              styles.center,
              {
                width: 112,
                height: 112,
                borderRadius: 28,
                backgroundColor: color.pale,
              },
            ]}
          >
            <Icon name={vm.rows.length ? "search" : "records"} size={46} />
          </View>
          <AppText bold size={21}>
            {vm.rows.length ? "No Records Found" : "No Health Records Yet"}
          </AppText>
          <AppText tint={color.muted}>
            {vm.rows.length
              ? "Try another date or clear your filters."
              : "Start tracking your daily health activities."}
          </AppText>
          <View style={{ alignSelf: "stretch", marginTop: 24 }}>
            <ActionButton
              label={vm.rows.length ? "Clear filters" : "Add Your First Record"}
              onPress={vm.rows.length ? clear : () => form()}
            />
          </View>
        </View>
      )}
    </>
  );
}
