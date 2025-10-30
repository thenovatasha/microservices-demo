from locust import HttpUser, task, LoadTestShape
class BurstyArrivalShape(LoadTestShape):

    # burst schedule: (time_seconds, user_count, duration)
    # Format: At time T, ramp to N users over D seconds

    bursts = [
        (0, 2000, 60),      # Ramp to 2000 users in 1 minute (start)
        (300, 150, 60),     # Drop to ~150 users after 5 minutes
        (600, 2000, 60),    # Ramp up again after 10 minutes
        (900, 150, 60),     # Drop again after 15 minutes
        (1200, 2000, 60),   # Final ramp up after 20 minutes
        (1800, 150, 60),    # Final ramp down after 20 minutes
    ]
    time_limit = 2200

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
