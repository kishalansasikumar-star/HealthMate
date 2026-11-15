import {
  ActionButton,
  Card,
  color,
  Header,
  Icon,
  TextButton,
  MetricCard,
  AppText,
} from "../components/JournalUI";
import { Entry, metrics, pretty } from "../models/healthRecords";
import { useHealth } from "../viewmodels/HealthContext";
import { completion } from "../models/healthRecords";
export function Details({
  row,
  back,
  edit,
  remove,
  records,
}: {
  row: Entry;
  back: () => void;
  edit: () => void;
  remove: () => void;
  records: () => void;
}) {
  const vm = useHealth();
  return (
    <>
      <Header
        title="Record Details"
        sub="A clearer picture of your day."
        back={back}
        circularBack
      />
      <Card>
        <Icon name="calendar" />
        <AppText size={23} bold>
          {pretty(row.date)}
        </AppText>
        <AppText>
          {pretty(row.date, { weekday: "long" })} · Record #
          {String(row.id).padStart(3, "0")}
        </AppText>
      </Card>
      {metrics.map((k) => (
        <MetricCard key={k} k={k} amount={row} goals={vm.goals} />
      ))}
      <Card style={{ backgroundColor: color.pale }}>
        <AppText bold>Your daily summary</AppText>
        <AppText>{completion(row, vm.goals)}% average goal completion</AppText>
      </Card>
      <ActionButton label="Edit Record" onPress={edit} />
      <ActionButton outline danger label="Delete Record" onPress={remove} />
      <TextButton label="Back to Records" onPress={records} centered />
    </>
  );
}
