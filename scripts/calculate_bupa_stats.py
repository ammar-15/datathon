from __future__ import annotations

"""
Run with:
  python3 scripts/calculate_bupa_stats.py

Re-run after importing new records or editing public.bupa_liver_records so
public.bupa_liver_statistics stays current.
"""

from collections import Counter
from decimal import Decimal
import os
import statistics

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

SOURCE_TABLE = "bupa_liver_records"
STATS_TABLE = "bupa_liver_statistics"
NUMERIC_COLUMNS = ["mcv", "alp", "alt", "ast", "ggt", "drinks", "selector"]
PAGE_SIZE = 1000


def to_float(value: object) -> float:
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def fetch_all_records() -> list[dict]:
    print(f"Fetching records from {SOURCE_TABLE}...")
    all_rows: list[dict] = []
    start = 0

    while True:
        end = start + PAGE_SIZE - 1
        response = (
            supabase.table(SOURCE_TABLE)
            .select(",".join(NUMERIC_COLUMNS))
            .range(start, end)
            .execute()
        )
        batch = response.data or []
        all_rows.extend(batch)
        print(f"Fetched {len(batch)} rows from range {start}-{end}.")

        if len(batch) < PAGE_SIZE:
            break

        start += PAGE_SIZE

    print(f"Fetched {len(all_rows)} total records.")
    return all_rows


def safe_mode(values: list[float]) -> float:
    counts = Counter(values)
    highest_frequency = max(counts.values())
    most_common_values = sorted(value for value, count in counts.items() if count == highest_frequency)

    if len(most_common_values) > 1:
        print(
            f"Multiple modes found for dataset: {most_common_values}. "
            f"Using the smallest value {most_common_values[0]}."
        )

    return most_common_values[0]


def safe_stdev(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0

    return statistics.stdev(values)


def round_stat(value: float) -> float:
    return round(value, 4)


def calculate_statistics(records: list[dict]) -> list[dict]:
    statistics_rows: list[dict] = []

    for column_name in NUMERIC_COLUMNS:
        values = [to_float(row[column_name]) for row in records if row.get(column_name) is not None]

        if not values:
            print(f"Skipping {column_name}: no values found.")
            continue

        stats_row = {
            "column_name": column_name,
            "mean": round_stat(statistics.mean(values)),
            "median": round_stat(statistics.median(values)),
            "mode": round_stat(safe_mode(values)),
            "std_dev": round_stat(safe_stdev(values)),
            "min_value": round_stat(min(values)),
            "max_value": round_stat(max(values)),
            "record_count": len(values),
        }

        print(f"Calculated stats for {column_name}: {stats_row}")
        statistics_rows.append(stats_row)

    return statistics_rows


def upsert_statistics(rows: list[dict]) -> None:
    if not rows:
        print("No statistics rows to upsert.")
        return

    print(f"Upserting {len(rows)} rows into {STATS_TABLE}...")
    (
        supabase.table(STATS_TABLE)
        .upsert(rows, on_conflict="column_name")
        .execute()
    )
    print("Statistics upsert complete.")


def main() -> None:
    print("Starting BUPA statistics calculation.")
    print(
        "Run this script after importing or updating records in public.bupa_liver_records "
        "to refresh public.bupa_liver_statistics."
    )

    records = fetch_all_records()

    if not records:
        print(f"No records found in {SOURCE_TABLE}. Nothing to calculate.")
        return

    rows = calculate_statistics(records)
    upsert_statistics(rows)
    print("Finished calculating and saving BUPA descriptive statistics.")


if __name__ == "__main__":
    main()
