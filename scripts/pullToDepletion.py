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
TARGET_LIMITED = 9  # success threshold (e.g. "at least 9 limited")

# Results folder (always next to this script)
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

    limited = 0
    guarantee = False

    while pulls_left > 0:
        got, pity = pull_5star(pity)
        pulls_left -= 1

        if got:
            if guarantee:
                limited += 1
                guarantee = False
            else:
                if random.random() < 0.5:
                    limited += 1
                else:
                    guarantee = True

    return limited


# =========================
# Simulation
# =========================
def run_simulation():
    counts = defaultdict(int)

    next_progress = PROGRESS_STEP
    start_time = time.time()

    for i in range(1, TRIALS + 1):
        result = simulate_trial()
        counts[result] += 1

        # Progress output
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

    probs = {k: v / TRIALS for k, v in counts.items()}
    sorted_items = sorted(probs.items())

    expected = sum(k * p for k, p in probs.items())
    success_prob = sum(p for k, p in probs.items() if k >= TARGET_LIMITED)

    print("\n================ RESULTS ================")
    print(f"Expected limited characters: {expected:.3f}")
    print(f"P(X ≥ {TARGET_LIMITED}) = {success_prob:.4%}")
    print("=========================================\n")

    generate_plots(sorted_items, probs, expected, success_prob)


# =========================
# Plotting
# =========================
def generate_plots(sorted_items, probs, expected, success_prob):
    os.makedirs(RESULTS_DIR, exist_ok=True)

    xs = [k for k, _ in sorted_items]
    ys = [p for _, p in sorted_items]

    # -------- Histogram --------
    plt.figure(figsize=(10, 6))
    plt.bar(xs, ys, alpha=0.85)

    plt.axvline(expected, color="green", linestyle="--",
                label=f"Expected ≈ {expected:.2f}")

    plt.axvline(TARGET_LIMITED, color="red", linestyle="--",
                label=f"Target ≥ {TARGET_LIMITED}")

    plt.xlabel("Number of Limited Characters")
    plt.ylabel("Probability")
    plt.title(f"Distribution ({PULLS_AVAILABLE} pulls)")
    plt.legend()
    plt.grid(axis="y", linestyle="--", alpha=0.7)

    hist_path = os.path.join(RESULTS_DIR, "distribution.png")
    plt.savefig(hist_path)
    plt.close()

    # -------- CDF (PURE, no red lines) --------
    xs_sorted = sorted(probs.keys())
    cdf = []

    for k in xs_sorted:
        prob = sum(p for x, p in probs.items() if x >= k)
        cdf.append(prob)

    plt.figure(figsize=(10, 6))
    plt.plot(xs_sorted, cdf, marker="o")

    # sparse labels (avoid clutter)
    step = max(1, len(xs_sorted) // 10)
    for i, (x, y) in enumerate(zip(xs_sorted, cdf)):
        if i % step == 0:
            plt.text(x, y, f"{y:.1%}", fontsize=8, ha='center', va='bottom')

    plt.xlabel("k")
    plt.ylabel("P(X ≥ k)")
    plt.title(f"Cumulative Probability ({PULLS_AVAILABLE} pulls)")
    plt.grid(True, linestyle="--", alpha=0.7)

    cdf_path = os.path.join(RESULTS_DIR, "cdf.png")
    plt.savefig(cdf_path)
    plt.close()

    print("Saved plots:")
    print(f"- {os.path.abspath(hist_path)}")
    print(f"- {os.path.abspath(cdf_path)}")


# =========================
# Entry point
# =========================
if __name__ == "__main__":
    run_simulation()