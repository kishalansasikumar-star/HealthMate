import { Modal, View } from "react-native";
import { ActionButton, Card, color, Icon, styles, AppText } from "./JournalUI";
import { Entry, pretty } from "../models/healthRecords";
export function DeleteConfirmation({
  deleting,
  busy,
  cancel,
  confirm,
}: {
  deleting: Entry;
  busy: boolean;
  cancel: () => void;
  confirm: () => void;
}) {
  return (
    <Modal transparent visible animationType="fade" onRequestClose={cancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#16261D77",
          justifyContent: "center",
          padding: 26,
        }}
      >
        <Card style={{ padding: 24, gap: 16 }}>
          <Icon name="trash" size={32} tint={color.red} />
          <AppText size={23} bold>
            Delete Health Record?
          </AppText>
          <AppText>
            Are you sure you want to delete this health record? This action
            cannot be undone.
          </AppText>
          {deleting && <AppText bold>{pretty(deleting.date)}</AppText>}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <ActionButton outline label="Cancel" onPress={cancel} />
            </View>
            <View style={{ flex: 1 }}>
              <ActionButton
                danger
                disabled={busy}
                label="Delete Record"
                onPress={confirm}
              />
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}
