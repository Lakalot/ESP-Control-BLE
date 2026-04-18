import * as Haptics from 'expo-haptics';

function fire(task: Promise<void>) {
  task.catch(() => undefined);
}

export function triggerSelectionHaptic() {
  fire(Haptics.selectionAsync());
}

export function triggerSoftImpactHaptic() {
  fire(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
}

export function triggerSuccessHaptic() {
  fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function triggerWarningHaptic() {
  fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function triggerErrorHaptic() {
  fire(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
