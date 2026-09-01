using System;
using System.Collections.Concurrent;

namespace Vigitemp_Serveur
{
    internal readonly struct AlarmEvaluation
    {
        public bool IsActive { get; }
        public bool TransitionToActive { get; }
        public bool TransitionToInactive { get; }

        public AlarmEvaluation(bool isActive, bool transitionToActive, bool transitionToInactive)
        {
            IsActive = isActive;
            TransitionToActive = transitionToActive;
            TransitionToInactive = transitionToInactive;
        }
    }

    internal static class AlarmStateEvaluator
    {
        private sealed class RuntimeState
        {
            public bool IsActive;
            public DateTime? OutOfRangeSinceUtc;
        }

        private static readonly ConcurrentDictionary<string, RuntimeState> _stateByKey =
            new ConcurrentDictionary<string, RuntimeState>();

        public static void ResetState(string channel, int idLieu)
        {
            if (idLieu <= 0) return;
            if (channel == null) channel = "alarm";
            var key = channel + ":" + idLieu;
            if (!_stateByKey.TryGetValue(key, out var state)) return;

            lock (state)
            {
                state.IsActive = false;
                state.OutOfRangeSinceUtc = null;
            }
        }

        public static void ForceActive(string channel, int idLieu)
        {
            if (idLieu <= 0) return;
            if (channel == null) channel = "alarm";
            var key = channel + ":" + idLieu;
            var state = _stateByKey.GetOrAdd(key, _ => new RuntimeState());
            lock (state)
            {
                state.IsActive = true;
                state.OutOfRangeSinceUtc = null;
            }
        }

        public static void SeedOutOfRangeSinceIfEmpty(string channel, int idLieu, DateTime outOfRangeSinceUtc)
        {
            if (idLieu <= 0) return;
            if (outOfRangeSinceUtc == default(DateTime)) return;
            if (channel == null) channel = "alarm";

            var key = channel + ":" + idLieu;
            var state = _stateByKey.GetOrAdd(key, _ => new RuntimeState());
            lock (state)
            {
                if (state.IsActive || state.OutOfRangeSinceUtc.HasValue) return;
                state.OutOfRangeSinceUtc = outOfRangeSinceUtc;
            }
        }

        public static AlarmEvaluation Evaluate(
            string channel,
            int idLieu,
            double value,
            double low,
            double high,
            bool eligible,
            int debounceSeconds,
            bool ignorePolicyDebounce,
            DateTime nowUtc)
        {
            if (idLieu <= 0) return new AlarmEvaluation(false, false, false);
            if (double.IsNaN(value) || double.IsInfinity(value)) return new AlarmEvaluation(false, false, false);
            if (double.IsNaN(low) || double.IsInfinity(low)) return new AlarmEvaluation(false, false, false);
            if (double.IsNaN(high) || double.IsInfinity(high)) return new AlarmEvaluation(false, false, false);

            if (low > high)
            {
                var tmp = low;
                low = high;
                high = tmp;
            }

            if (channel == null) channel = "alarm";
            var key = channel + ":" + idLieu;
            var state = _stateByKey.GetOrAdd(key, _ => new RuntimeState());

            lock (state)
            {
                var prevActive = state.IsActive;
            var policy = AlarmPolicy.Current;
            var effectiveDebounceSeconds = debounceSeconds;
            if (effectiveDebounceSeconds < 0) effectiveDebounceSeconds = 0;
            if (!ignorePolicyDebounce && policy.DebounceSeconds > effectiveDebounceSeconds)
            {
                effectiveDebounceSeconds = policy.DebounceSeconds;
            }

                var nextActive = ComputeNextActive(
                    state,
                    value,
                    low,
                    high,
                    eligible,
                    nowUtc,
                    policy,
                    effectiveDebounceSeconds);

                state.IsActive = nextActive;

                return new AlarmEvaluation(
                    nextActive,
                    transitionToActive: !prevActive && nextActive,
                    transitionToInactive: prevActive && !nextActive);
            }
        }

        private static bool ComputeNextActive(
            RuntimeState state,
            double value,
            double low,
            double high,
            bool eligible,
            DateTime nowUtc,
            AlarmPolicy policy,
            int effectiveDebounceSeconds)
        {
            if (!eligible)
            {
                state.OutOfRangeSinceUtc = null;
                return false;
            }

            var activationOutOfRange = value < low || value > high;

            if (state.IsActive)
            {
                var delta = policy.HysteresisDelta;
                if (delta < 0) delta = 0;

                var clearLow = low + delta;
                var clearHigh = high - delta;

                if (clearLow > clearHigh)
                {
                    // Hysteresis delta too large vs band: fall back to no hysteresis.
                    clearLow = low;
                    clearHigh = high;
                }

                var stillOutOfRange = value < clearLow || value > clearHigh;
                if (!stillOutOfRange)
                {
                    state.OutOfRangeSinceUtc = null;
                    return false;
                }

                return true;
            }

            // Inactive -> maybe activate
            if (!activationOutOfRange)
            {
                state.OutOfRangeSinceUtc = null;
                return false;
            }

            if (effectiveDebounceSeconds <= 0)
            {
                state.OutOfRangeSinceUtc = null;
                return true;
            }

            if (state.OutOfRangeSinceUtc == null)
            {
                state.OutOfRangeSinceUtc = nowUtc;
                return false;
            }

            var elapsed = nowUtc - state.OutOfRangeSinceUtc.Value;
            if (elapsed.TotalSeconds >= effectiveDebounceSeconds)
            {
                state.OutOfRangeSinceUtc = null;
                return true;
            }

            return false;
        }
    }
}
