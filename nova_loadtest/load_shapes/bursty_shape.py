from locust import LoadTestShape

class BurstyArrivalShape(LoadTestShape):
    """
    bursts: list of (start_time_seconds, target_users, ramp_duration_seconds).
    At time T, move from the previous target to target_users over ramp_duration.
    """
    bursts = [
        (0,    2000, 60),   # to 2000 in 60s
        (300,   100, 60),   # to 100 in 60s
        (600,  2000, 60),   # to 2000 in 60s
        (900,   100, 60),   # to 100 in 60s
        (1200, 2000, 60),   # to 2000 in 60s
        (1800,  100, 60),   # to 100 in 60s
    ]
    time_limit = 2200

    def tick(self):
        run_time = self.get_run_time()
        if run_time > self.time_limit:
            return None

        # Before the first burst starts
        if run_time < self.bursts[0][0]:
            return (0, 1)

        # Find the active phase (the last burst whose start_time <= run_time)
        active_idx = 0
        for i, (t, _, _) in enumerate(self.bursts):
            if run_time >= t:
                active_idx = i
            else:
                break

        # Current phase target and duration
        t_start, target_users, duration = self.bursts[active_idx]

        # Previous phase target (0 before the first burst)
        prev_target = self.bursts[active_idx - 1][1] if active_idx > 0 else 0

        # Spawn rate needed to reach target from previous target within this phase's duration
        delta = abs(target_users - prev_target)
        spawn_rate = max(1, delta / max(1, duration))  # users per second

        # Hold last target after the final phase
        return (int(target_users), spawn_rate)
