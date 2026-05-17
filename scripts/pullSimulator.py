import random
import time
import os
from collections import defaultdict

import matplotlib.pyplot as plt

# =========================
# Parameters
# =========================
PULLS_AVAILABLE = 850
PITY = 80
BASE_RATE = 0.00984
TRIALS = 200_000

PROGRESS_STEP = 10  # % updates

TARGET_CHARS = 7
TARGET_WEAPONS = 3


# =========================
# Paths
# =========================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(SCRIPT_DIR, "results")


# =========================
# Core mechanics
# =========================
def pull_5star(pity_counter):
    if pity_counter >= PITY - 1:
        return True, 0
    if random.random() < BASE_RATE:
        return True, 0
    return False, pity_counter + 1


def simulate_trial():
    pulls_left = PULLS_AVAILABLE

    pity = 0
    limited_chars = 0
    guarantee = False

    pulls_used_for_chars = 0

    while pulls_left > 0 and limited_chars < TARGET_CHARS:
        got, pity = pull_5star(pity)
        pulls_left -= 1
        pulls_used_for_chars += 1

        if got:
            if guarantee:
                limited_chars += 1
                guarantee = False
            else:
                if random.random() < 0.5:
                    limited_chars += 1
                else:
                    guarantee = True

    if limited_chars < TARGET_CHARS:
        return False, False, pulls_used_for_chars

    # Weapons
    weap_pity = 0
    limited_weapons = 0

    while pulls_left > 0 and limited_weapons < TARGET_WEAPONS:
        got, weap_pity = pull_5star(weap_pity)
        pulls_left -= 1

        if got:
            limited_weapons += 1

    full_success = limited_weapons >= TARGET_WEAPONS
    partial_success = limited_weapons >= 1

    return full_success, partial_success, pulls_used_for_chars


# =========================
# Simulation
# =========================
def run_simulation():
    full = 0
    partial = 0
    total_char_pulls = 0

    char_pull_samples = []

    next_progress = PROGRESS_STEP
    start_time = time.time()

    for i in range(1, TRIALS + 1):
        f, p, char_pulls = simulate_trial()

        char_pull_samples.append(char_pulls)
        total_char_pulls += char_pulls

        if f:
            full += 1
        if p:
            partial += 1

        # Progress
        percent_done = (i / TRIALS) * 100
        if percent_done >= next_progress:
            elapsed = time.time() - start_time
            rate = i / elapsed if elapsed > 0 else 0
            eta = (TRIALS - i) / rate if rate > 0 else 0

            print(
                f"{int(percent_done):3d}% | "
                f"{i:,}/{TRIALS:,} | "
                f"{rate:,.0f}/s | ETA: {eta:,.1f}s"
            )
            next_progress += PROGRESS_STEP

    avg_char_pulls = total_char_pulls / TRIALS

    full_rate = full / TRIALS
    partial_rate = partial / TRIALS

    print("\n" + "=" * 50)
    print("RESULTS")
    print("=" * 50)

    print(f"Trials: {TRIALS:,}")
    print(f"Full success ({TARGET_CHARS} chars + {TARGET_WEAPONS} weapons): {full_rate:.4%}")
    print(f"Partial success ({TARGET_CHARS} chars + >=1 weapon): {partial_rate:.4%}")

    print("\n--- Extra Stats ---")
    print(f"Average pulls for {TARGET_CHARS} limited characters: {avg_char_pulls:.2f}")

    generate_plots(char_pull_samples, full_rate, partial_rate)


# =========================
# Plotting
# =========================
def generate_plots(char_pull_samples, full_rate, partial_rate):
    os.makedirs(RESULTS_DIR, exist_ok=True)

    mean = sum(char_pull_samples) / len(char_pull_samples)

    # =========================
    # 1. Distribution
    # =========================
    plt.figure(figsize=(10, 6))
    plt.hist(char_pull_samples, bins=40, alpha=0.85, color="steelblue")
    plt.axvline(mean, color="green", linestyle="--", label=f"Mean ≈ {mean:.1f}")
    plt.title(f"Pull Distribution for {TARGET_CHARS} Limited Characters")
    plt.xlabel("Pulls Used")
    plt.ylabel("Frequency")
    plt.grid(axis="y", linestyle="--", alpha=0.6)
    plt.legend()

    plt.savefig(os.path.join(RESULTS_DIR, "char_pull_distribution.png"))
    plt.close()

    # =========================
    # 2. Budget sensitivity
    # =========================
    budgets = list(range(500, PULLS_AVAILABLE + 201, 50))
    success_rates = []

    for b in budgets:
        success = sum(1 for x in char_pull_samples if x <= b)
        success_rates.append(success / len(char_pull_samples))

    plt.figure(figsize=(10, 6))
    plt.plot(budgets, success_rates, marker="o")

    plt.axvline(PULLS_AVAILABLE, color="red", linestyle="--", label="Current Budget")

    plt.title("Success Rate vs Pull Budget (Characters Only)")
    plt.xlabel("Pull Budget")
    plt.ylabel("Success Rate")
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.legend()

    plt.savefig(os.path.join(RESULTS_DIR, "budget_sensitivity.png"))
    plt.close()

    print("\nSaved plots:")
    print(f"- {os.path.abspath(os.path.join(RESULTS_DIR, 'char_pull_distribution.png'))}")
    print(f"- {os.path.abspath(os.path.join(RESULTS_DIR, 'budget_sensitivity.png'))}")


# =========================
# Entry point
# =========================
if __name__ == "__main__":
    run_simulation()