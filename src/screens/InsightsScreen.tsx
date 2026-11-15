import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, color, Header, Icon, IconButton, styles } from "../components/JournalUI";
import { labels, localDate, metrics, pretty, units, type Amounts, type Entry } from "../models/healthRecords";
import {
  calendarPeriod, insightFilters, rangeLabel, summarizeInsights, type InsightFilter, type Period,
} from "../models/insights";
import { Calendar } from "./CalendarScreen";

export function Insights({ rows, goals }: { rows: Entry[]; goals: Amounts }) {
  const today = localDate();
  const [filter, setFilter] = useState<InsightFilter>("Weekly");
  const [offset, setOffset] = useState(0);
  const [custom, setCustom] = useState<Period | null>(null);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState("");
  const { width, fontScale } = useWindowDimensions();

  const period = useMemo(() => filter === "Custom Range" && custom
    ? custom
    : calendarPeriod(filter === "Custom Range" ? "Weekly" : filter, today, offset),
  [filter, custom, today, offset]);
  const { totals, days, averages, best, buckets, grouping } = useMemo(
    () => summarizeInsights(rows, filter, period), [rows, filter, period],
  );
  const dates = useMemo(() => rows.map(row => row.date), [rows]);
  const maxSteps = Math.max(1, ...buckets.map(bucket => bucket.steps));
  const active = buckets.find(bucket => bucket.start === selected)
    ?? buckets.find(bucket => best && bucket.start <= best.date && best.date <= bucket.end)
    ?? buckets[0];
  const activeDay = days.find(day => day.date === active.start);
  const unit = { Weekly: "week", Monthly: "month", Yearly: "year", "Custom Range": "range" }[filter];
  const periodTitle = filter === "Yearly" ? period.start.slice(0, 4)
    : filter === "Monthly" ? pretty(period.start, { month: "long", year: "numeric" })
    : rangeLabel(period);
  const initialRange = custom ?? { start: period.start, end: period.end > today ? today : period.end };
  const compact = width / fontScale < 380;

  function choose(next: InsightFilter) {
    if (next === "Custom Range") {
      setPicking(true);
    } else if (next !== filter) {
      setFilter(next);
      setOffset(0);
      setSelected("");
    }
  }
  function move(delta: number) {
    setOffset(current => Math.min(0, current + delta));
    setSelected("");
  }

  return (
    <>
      <Header title="Your Insights" sub="Simple totals. Meaningful progress." />
      <Card>
        <View style={layout.selector}>
          {insightFilters.map(option => (
            <Pressable key={option} accessibilityRole="button"
              accessibilityState={{ selected: option === filter }}
              onPress={() => choose(option)}
              style={[layout.option, compact && { flexBasis: "48%" }, option === filter && layout.chosen]}>
              <AppText bold size={12} style={layout.centerText} tint={option === filter ? "white" : color.green}>
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>
        {filter === "Custom Range" ? (
          <Pressable accessibilityRole="button" accessibilityLabel={"Change date range, " + periodTitle}
            style={layout.rangeButton} onPress={() => setPicking(true)}>
            <Icon name="calendar" size={19} tint={color.green} />
            <AppText bold size={14} style={layout.periodTitle}>{periodTitle}</AppText>
            <Icon name="edit" size={17} tint={color.green} />
          </Pressable>
        ) : (
          <View style={styles.between}>
            <IconButton name="back" label={"Previous " + unit} onPress={() => move(-1)} />
            <AppText bold size={14} style={layout.periodTitle}>{periodTitle}</AppText>
            <IconButton name="chevron" label={"Next " + unit} disabled={offset === 0} onPress={() => move(1)} />
          </View>
        )}
      </Card>
      {days.length === 0 ? (
        <Card style={styles.center}>
          <Icon name="insights" size={28} tint={color.green} />
          <AppText bold>No records for this period</AppText>
          <AppText size={14} tint={color.muted} style={layout.centerText}>
            Choose another period or add a health record for these dates.
          </AppText>
        </Card>
      ) : (
        <>
          <Card>
            <AppText bold>Steps for this {unit}</AppText>
            <View style={[styles.between, layout.wrap]}>
              <AppText size={32} bold>{totals.steps.toLocaleString()}</AppText>
              <AppText size={12}>{days.length} recorded {days.length === 1 ? "day" : "days"}</AppText>
            </View>
            <ScrollView key={filter + period.start + period.end} horizontal nestedScrollEnabled
              contentContainerStyle={layout.chart}>
              {buckets.map(bucket => (
                <Pressable key={bucket.start} accessibilityRole="button"
                  accessibilityState={{ selected: active.start === bucket.start }}
                  accessibilityLabel={rangeLabel(bucket) + ", " + (bucket.days ? bucket.steps + " steps" : "no records")}
                  onPress={() => setSelected(bucket.start)}
                  style={[layout.column, { minWidth: (grouping === "day" ? 29 : 39) * fontScale }]}>
                  {bucket.days ? (
                    <View style={{
                      height: Math.max(2, 100 * bucket.steps / maxSteps), width: 23, borderRadius: 6,
                      backgroundColor: active.start === bucket.start ? "#9079EC" : "#C8BFFE",
                    }} />
                  ) : <AppText tint={color.muted}>–</AppText>}
                  <AppText size={12}>{bucket.label}</AppText>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
          <View style={[styles.row, width / fontScale < 350 && layout.stacked]}>
            {(["calories", "water"] as const).map(metric => (
              <Card key={metric} style={{ flex: 1 }}>
                <Icon name={metric} size={22} />
                <AppText bold size={22}>{totals[metric].toLocaleString()} {units[metric]}</AppText>
                <AppText size={12}>{metric === "water" ? "Water" : "Calories"} for this {unit}</AppText>
              </Card>
            ))}
          </View>
          <Card>
            <AppText bold>Average per recorded day</AppText>
            {metrics.map(metric => (
              <View key={metric} style={[styles.between, layout.wrap]}>
                <View style={styles.row}>
                  <Icon name={metric} tint={color[metric]} size={18} />
                  <AppText size={14}>{labels[metric]}</AppText>
                </View>
                <AppText bold>{averages[metric].toLocaleString()} {units[metric]}</AppText>
              </View>
            ))}
          </Card>
          <Card>
            <View style={styles.row}>
              <Icon name="trophy" size={20} tint={color.green} />
              <AppText bold>{filter === "Custom Range" ? "Range" : filter} highlights</AppText>
            </View>
            {best && <AppText size={14}>
              {pretty(best.date)} was your most active day with {best.steps.toLocaleString()} steps.
            </AppText>}
            {metrics.map(metric => (
              <View key={metric} style={[styles.between, layout.wrap]}>
                <AppText size={13}>{labels[metric]} goal reached</AppText>
                <AppText size={13} bold>{days.filter(day => day[metric] >= goals[metric]).length} of {days.length} days</AppText>
              </View>
            ))}
          </Card>
          <Card style={{ backgroundColor: color.pale }}>
            <AppText bold tint={color.green}>{rangeLabel(active)}</AppText>
            {grouping === "day" && activeDay && (
              <AppText size={14}>{activeDay.steps.toLocaleString()} steps</AppText>
            )}
            <AppText size={13}>
              {active.days === 0 ? "No records for these dates."
                : grouping === "day" && activeDay
                  ? metrics.map(key => Math.round(100 * activeDay[key] / goals[key]) + "% " + key).join("     ")
                  : active.steps.toLocaleString() + " steps across " + active.days + (active.days === 1 ? " recorded day." : " recorded days.")}
            </AppText>
          </Card>
        
        </>
      )}
      {picking && (
        <Modal visible animationType="slide" onRequestClose={() => setPicking(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }}>
            <ScrollView contentContainerStyle={layout.picker}>
              <Calendar insightsRange rangeMode editing={false} search="" dates={dates}
                initial={[initialRange.start, initialRange.end]} back={() => setPicking(false)}
                apply={(start, end) => {
                  setCustom({ start, end });
                  setFilter("Custom Range");
                  setSelected("");
                  setPicking(false);
                }} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
}

const layout = StyleSheet.create({
  selector: { flexDirection: "row", flexWrap: "wrap", gap: 3, backgroundColor: color.pale, borderRadius: 14, padding: 4 },
  option: { flexGrow: 1, flexBasis: 0, alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: 2, borderRadius: 11 },
  chosen: { backgroundColor: color.green },
  centerText: { textAlign: "center" },
  periodTitle: { flex: 1, textAlign: "center" },
  rangeButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, minHeight: 44 },
  wrap: { flexWrap: "wrap" },
  stacked: { flexDirection: "column", alignItems: "stretch" },
  chart: { flexGrow: 1, alignItems: "stretch", paddingTop: 12, paddingBottom: 6 },
  column: { flexGrow: 1, alignItems: "center", justifyContent: "flex-end", gap: 7, minHeight: 130 },
  picker: { gap: 13, paddingHorizontal: 24, paddingVertical: 20 },
});
