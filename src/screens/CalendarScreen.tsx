import { useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import { dayAt, localDate, pretty } from "../models/healthRecords";
import {
  ActionButton,
  Card,
  color,
  Header,
  Icon,
  TextButton,
  styles,
  AppText,
  IconButton,
} from "../components/JournalUI";
export function Calendar({
  initial,
  rangeMode,
  apply,
  back,
  dates,
  search,
  editing,
  insightsRange = false,
}: {
  initial: [string, string];
  rangeMode: boolean;
  apply: (a: string, b: string, query: string) => void;
  back: () => void;
  dates: string[];
  search: string;
  editing: boolean;
  insightsRange?: boolean;
}) {
  const [text, setText] = useState(search);
  const today = localDate();
  const [from, setFrom] = useState(initial[0] || (rangeMode ? "" : today)),
    [to, setTo] = useState(
      initial[1] || initial[0] || (rangeMode ? "" : today),
    );
  const [end, setEnd] = useState(false);
  const [month, setMonth] = useState(() =>
    dayAt((initial[0] || today).slice(0, 7) + "-01"),
  );
  function move(n: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1, 12));
  }
  function pick(d: string) {
    if (!rangeMode || !end || !from) {
      setFrom(d);
      setTo(insightsRange && to > d ? to : d);
      setEnd(rangeMode);
    } else {
      setFrom(d < from ? d : from);
      setTo(d < from ? from : d);
      setEnd(false);
    }
  }
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  return (
    <>
      <Header
        title={
          insightsRange ? "Custom Range" : rangeMode
            ? "Search & Filter"
            : editing
              ? "Change Record Date"
              : "Choose a Date"
        }
        sub={
          insightsRange ? "Choose the first and last day to include." : rangeMode
            ? "Choose a day or a date range."
            : editing
              ? "Choose a date without an existing record."
              : "Daily records are unique to each date."
        }
        back={back}
      />
      {rangeMode && !insightsRange && (
        <View style={styles.field}>
          <Icon name="search" size={20} />
          <TextInput
            accessibilityLabel="Search by date"
            placeholder="Search by date"
            style={styles.input}
            value={text}
            onChangeText={setText}
          />
        </View>
      )}
      <Card>
        <View style={styles.between}>
          <IconButton
            name="back"
            label="Previous month"
            onPress={() => move(-1)}
          />
          <AppText bold>
            {pretty(localDate(month), { month: "long", year: "numeric" })}
          </AppText>
          <IconButton
            name="chevron"
            label="Next month"
            disabled={insightsRange && localDate(month).slice(0, 7) >= today.slice(0, 7)}
            onPress={() => move(1)}
          />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((x, i) => (
            <View
              key={i}
              style={{
                width: "14.28%",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <AppText bold size={12}>
                {x}
              </AppText>
            </View>
          ))}
          {Array.from({ length: offset + days }, (_, i) => {
            const num = i - offset + 1;
            const d = localDate(
              new Date(month.getFullYear(), month.getMonth(), num, 12),
            );
            const selected = d >= from && d <= to;
            const insideRange = insightsRange && selected && d !== from && d !== to;
            const future = insightsRange && d > today;
            return (
              <Pressable
                key={i + 7}
                disabled={num < 1 || future}
                accessibilityRole="button"
                accessibilityState={{ disabled: num < 1 || future, selected }}
                accessibilityLabel={d}
                onPress={() => pick(d)}
                style={{
                  width: "14.28%",
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  borderWidth: insightsRange && num > 0 && !selected && dates.includes(d) ? 1 : 0,
                  borderColor: color.line,
                  backgroundColor:
                    num > 0 && selected
                      ? (insideRange ? color.pale : color.green)
                      : num > 0 && dates.includes(d) && !insightsRange
                        ? color.pale
                        : "transparent",
                }}
              >
                <AppText tint={future ? color.line : insideRange ? color.green : selected ? "white" : color.ink}>
                  {num > 0 ? num : ""}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>
      {rangeMode ? (
        <Card>
          <View style={[styles.between, insightsRange && { flexWrap: "wrap", rowGap: 12 }]}>
            <TextButton
              label={"Start date · " + from}
              onPress={() => setEnd(false)}
            />
            <TextButton
              label={"End date · " + to}
              onPress={() => setEnd(true)}
            />
          </View>
          <AppText size={12} tint={color.muted}>
            {end ? "Select the end date" : "Select the start date"} ·{" "}
            {
              dates.filter((d) => (!from || d >= from) && (!to || d <= to))
                .length
            }{" "}
            matching records
          </AppText>
        </Card>
      ) : (
        <Card>
          <AppText bold>{pretty(from)}</AppText>
          <AppText tint={color.muted}>
            {from > today
              ? "Future date"
              : dates.includes(from)
                ? "A record exists for this date."
                : "No record yet · ready for a new check-in"}
          </AppText>
        </Card>
      )}
      <ActionButton
        label={
          insightsRange ? "Apply Range" : rangeMode
            ? "Apply Filter"
            : editing
              ? "Apply edited date"
              : "Use selected date"
        }
        onPress={() => apply(from, to, text)}
        disabled={insightsRange && (!from || !to || to > today)}
      />
      <ActionButton
        outline
        label={
          insightsRange ? "Cancel" : rangeMode ? "Reset Filter" : editing ? "Cancel date edit" : "Cancel"
        }
        onPress={() => (rangeMode && !insightsRange ? apply("", "", "") : back())}
      />
    </>
  );
}
