from locust import HttpUser, task, LoadTestShape
class BurstyArrivalShape(LoadTestShape):

    # burst schedule: (time_seconds, user_count, duration)
    # Format: At time T, ramp to N users over D seconds
    bursts = [
        (10, 20, 5),    # At 10s: burst to 20 users in 5 seconds
        (40, 50, 10),
        (80, 100, 15),
        (120, 30, 5),
        (150, 80, 8),
        (200, 10, 5),
    ]
    time_limit = 250

    def tick(self):
        run_time = self.get_run_time()

        if run_time > self.time_limit:
            return None

        # Find the current burst phase
        current_users = 0
        spawn_rate = 1

        for i, (burst_time, burst_users, burst_duration) in enumerate(self.bursts):
            if run_time >= burst_time:
                if i + 1 < len(self.bursts):
                    next_burst_time = self.bursts[i + 1][0]
                    if run_time < next_burst_time:
                        # We're in this burst
                        current_users = burst_users
                        spawn_rate = max(1, burst_users / burst_duration)
                        break
                else:
                    # Last burst
                    current_users = burst_users
                    spawn_rate = max(1, burst_users / burst_duration)

        return (int(current_users), spawn_rate)
