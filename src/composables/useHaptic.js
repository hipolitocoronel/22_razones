const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator

export function useHaptic() {
  function light() {
    if (canVibrate) navigator.vibrate(10)
  }
  function medium() {
    if (canVibrate) navigator.vibrate(25)
  }
  function success() {
    if (canVibrate) navigator.vibrate([10, 30, 10])
  }
  function error() {
    if (canVibrate) navigator.vibrate([40, 60, 40])
  }
  return { light, medium, success, error }
}
