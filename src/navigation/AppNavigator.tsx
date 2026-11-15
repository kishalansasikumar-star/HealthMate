import { useEffect, useState } from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHealth } from "../viewmodels/HealthContext";
import { Entry } from "../models/healthRecords";
import {
  ActionButton,
  color,
  Icon,
  TextButton,
  styles,
  AppText,
} from "../components/JournalUI";
import { Calendar } from "../screens/CalendarScreen";
import { RecordForm } from "../screens/RecordFormScreen";
import { Insights } from "../screens/InsightsScreen";
import { Settings } from "../screens/SettingsScreen";
import { Dashboard } from "../screens/DashboardScreen";
import { Details } from "../screens/DetailsScreen";
import { Records } from "../screens/RecordsScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { Welcome } from "../screens/WelcomeScreen";
import { Tab, TabBar } from "./TabBar";
import { isToast, SuccessToast } from "../components/SuccessToast";
import { DeleteConfirmation } from "../components/DeleteConfirmation";
type Routes = {
  splash: undefined;
  welcome: undefined;
  home: undefined;
  records: undefined;
  form: undefined;
  picker: undefined;
  filter: undefined;
  results: undefined;
  detail: { id: number };
  insights: undefined;
  settings: undefined;
  profile: undefined;
  goals: undefined;
  notifications: undefined;
  about: undefined;
};
const pages: (keyof Routes)[] = [
  "splash",
  "welcome",
  "home",
  "records",
  "form",
  "picker",
  "filter",
  "results",
  "detail",
  "insights",
  "settings",
  "profile",
  "goals",
  "notifications",
  "about",
];
const Stack = createNativeStackNavigator<Routes>();

type ScreenProps = NativeStackScreenProps<Routes, keyof Routes>;

function JournalScreen({ navigation, route }: ScreenProps) {
  const vm = useHealth();
  const page = route.name;
  const [deleting, setDeleting] = useState<Entry>();
  useEffect(() => {
    if (page !== "splash" || !vm.ready) return;
    const timer = setTimeout(() => navigation.replace("welcome"), 850);
    return () => clearTimeout(timer);
  }, [vm.ready, navigation, page]);
  function openTab(tab: Exclude<Tab, "add">) {
    navigation.reset({
      index: tab === "home" ? 0 : 1,
      routes:
        tab === "home" ? [{ name: "home" }] : [{ name: "home" }, { name: tab }],
    });
  }
  function form(entry?: Entry) {
    vm.startForm(entry);
    navigation.navigate("form");
  }
  function clear() {
    vm.setRange(["", ""]);
    vm.setQuery("");
  }
  const back = () => navigation.goBack();
  const details = (entry: Entry) =>
    navigation.navigate("detail", { id: entry.id });
  function content() {
    switch (route.name) {
      case "splash":
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <View style={[styles.center, { flex: 3 }]}>
              <Icon name="brand" size={88} />
              <AppText bold size={36}>
                HealthMate
              </AppText>
              <AppText tint={color.muted}>Your Health, Your Journey.</AppText>
            </View>
            <View style={[styles.center, { flex: 1 }]}>
              <View
                style={{ width: 88, height: 4, backgroundColor: color.line }}
              >
                <View
                  style={{ width: 46, height: 4, backgroundColor: "#65BA73" }}
                />
              </View>
              <AppText tint={color.muted} size={13}>
                A little healthier, every day.
              </AppText>
            </View>
          </View>
        );
      case "welcome":
        return <Welcome start={() => openTab("home")} />;
      case "home":
        return (
          <Dashboard
            details={details}
            settings={() => openTab("settings")}
            records={() => {
              clear();
              openTab("records");
            }}
            add={() => form()}
          />
        );
      case "records":
      case "results":
        return (
          <Records
            results={page === "results" || !!vm.query.trim() || !!vm.range[0]}
            details={details}
            form={form}
            remove={setDeleting}
            clear={() => {
              clear();
              if (page === "results") openTab("records");
            }}
            filter={() => navigation.navigate("filter")}
          />
        );
      case "detail": {
        const row = vm.rows.find((entry) => entry.id === route.params?.id);
        if (!row)
          return (
            <ActionButton
              label="Back to Records"
              onPress={() => openTab("records")}
            />
          );
        return (
          <Details
            row={row}
            edit={() => form(row)}
            remove={() => setDeleting(row)}
            back={back}
            records={() => openTab("records")}
          />
        );
      }
      case "form":
        return (
          <RecordForm
            vm={vm}
            back={back}
            pick={() => navigation.navigate("picker")}
            editExisting={() =>
              vm.startForm(vm.rows.find((r) => r.date === vm.draft.date))
            }
            done={(id) => {
              if (vm.editId !== undefined) {
                navigation.reset({
                  index: 2,
                  routes: [
                    { name: "home" },
                    { name: "records" },
                    { name: "detail", params: { id } },
                  ],
                });
                vm.setNotice("Record updated");
              } else {
                openTab("home");
                vm.setNotice("Record saved");
              }
            }}
          />
        );
      case "picker":
      case "filter":
        return (
          <Calendar
            rangeMode={page === "filter"}
            editing={vm.editId !== undefined}
            initial={
              page === "filter" ? vm.range : [vm.draft.date, vm.draft.date]
            }
            dates={vm.rows.map((row) => row.date)}
            search={vm.query}
            back={back}
            apply={(from, to, query) => {
              if (page === "filter") {
                vm.setRange([from, to]);
                vm.setQuery(query);
                if (from || query)
                  navigation.reset({
                    index: 2,
                    routes: [
                      { name: "home" },
                      { name: "records" },
                      { name: "results" },
                    ],
                  });
                else openTab("records");
              } else {
                vm.setDraft({ ...vm.draft, date: from });
                back();
              }
            }}
          />
        );
      case "profile":
        return <EditProfileScreen back={back} />;
      case "insights":
        return <Insights rows={vm.rows} goals={vm.goals} />;
      default:
        return (
          <Settings
            vm={vm}
            page={route.name}
            go={(target) =>
              target === "settings" ? back() : navigation.navigate(target)
            }
            saved={() => {
              back();
              vm.setNotice("Goals saved");
            }}
          />
        );
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.bg }}>
      <StatusBar barStyle="dark-content" />
      {!!vm.error && (
        <View
          accessibilityLiveRegion="polite"
          style={{ padding: 12, backgroundColor: "#FFEAE7" }}
        >
          <AppText tint={color.red}>{vm.error}</AppText>
          <TextButton
            label={vm.ready ? "Dismiss" : "Retry"}
            onPress={() => {
              vm.setError("");
              if (!vm.ready) void vm.load();
            }}
          />
        </View>
      )}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          gap: 13,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        {content()}
      </ScrollView>
      {!!vm.notice && !isToast(vm.notice) && (
        <View
          accessibilityLiveRegion="polite"
          style={{ padding: 12, backgroundColor: color.pale }}
        >
          <AppText bold tint={color.green}>
            {vm.notice}
          </AppText>
        </View>
      )}
      {(["home", "records", "insights", "settings"] as string[]).includes(
        page,
      ) && (
        <TabBar
          page={page}
          change={(tab) => {
            if (tab === "add") form();
            else if (tab !== page) openTab(tab);
          }}
        />
      )}
      {deleting && (
        <DeleteConfirmation
          deleting={deleting}
          busy={vm.busy}
          cancel={() => setDeleting(undefined)}
          confirm={() => {
            void vm.remove(deleting.id, () => {
              setDeleting(undefined);
              openTab("records");
              vm.setNotice("Record deleted");
            });
          }}
        />
      )}
    </SafeAreaView>
  );
}

export function Navigation() {
  const vm = useHealth();
  return (
    <View style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.bg },
        }}
      >
        {pages.map((name) => (
          <Stack.Screen key={name} name={name} component={JournalScreen} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
    {isToast(vm.notice) && <SuccessToast key={vm.noticeId} title={vm.notice} />}
    </View>
  );
}
