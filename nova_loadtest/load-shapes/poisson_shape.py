import random
import time
import numpy as np
import math
from locust import HttpUser, task, LoadTestShape

class PoissonArrivalShape(LoadTestShape):
    mean_arrival_rate = 2.0
    max_users = 100
    time_limit = 300
    def __init__(self):
        super().__init__()
        self.current_users = 0
        self.last_update_time = 0
        self.next_arrival_time = 0
        self.start_time = None

    def tick(self):
        """
        Returns:
            tuple: (user_count, spawn_rate) or None to stop the test
        """
        run_time = self.get_run_time()

        if self.start_time is None:
            self.start_time = time.time()
            self.next_arrival_time = 0

        # Stop test after time limit
        if run_time > self.time_limit:
            return None

        if run_time >= self.next_arrival_time and self.current_users < self.max_users:
            self.current_users += 1

            inter_arrival_time = np.random.exponential(1.0 / self.mean_arrival_rate)
            self.next_arrival_time = run_time + inter_arrival_time

            print(f"[Poisson Arrival] Time: {run_time:.2f}s - "
                  f"New user arrived! Total users: {self.current_users} - "
                  f"Next arrival in: {inter_arrival_time:.2f}s")
        # (spawn rate is less relevant here as we control arrivals manually)
        return (self.current_users, 1)

